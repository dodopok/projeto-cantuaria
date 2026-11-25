import { defineEventHandler, readBody, createError } from 'h3'
import { extractText } from 'unpdf'
import { callClaude, extractPdfPages, countPdfPages } from '../lib/transcription-core.mjs'

const DOCUMENT_TYPES = ['Livro', 'LOC', 'Artigo', 'Revista', 'Foto', 'Documento']

const METADATA_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    authors: { type: 'array', items: { type: 'string' } },
    category: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    publication_year: { type: ['integer', 'null'] },
    language: { type: 'string' },
    type: { type: 'string', enum: DOCUMENT_TYPES }
  },
  required: ['title', 'authors', 'category', 'tags', 'summary', 'publication_year', 'language', 'type']
}

/**
 * Sugere metadados (título, autores, categoria, tags, resumo, ano, idioma, tipo)
 * a partir da transcrição já salva, do texto do PDF ou, em último caso, das
 * primeiras páginas do PDF. Não grava nada: só preenche o formulário do painel.
 */
export default defineEventHandler(async (event) => {
  const { documentId, filename, ocrText } = (await readBody(event)) ?? {}
  if (!documentId) throw createError({ statusCode: 400, statusMessage: 'documentId é obrigatório.' })

  const supabase = useAdminSupabase()
  const claude = useClaudeConfig()

  const { data: doc } = await supabase
    .from('documents')
    .select('title, content_markdown, file_url')
    .eq('id', documentId)
    .maybeSingle()
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Documento não encontrado.' })

  // 1. Texto de entrada: OCR recém-feito > transcrição salva > camada de texto do PDF
  let text: string = (typeof ocrText === 'string' && ocrText) || doc.content_markdown || ''
  let pdfPart: Uint8Array | null = null
  const isPdf = !!doc.file_url && doc.file_url.toLowerCase().split('?')[0].endsWith('.pdf')

  if (text.length < 500 && isPdf) {
    const fileUrl = await getDocumentFileUrl(supabase, documentId)
    const bytes = await downloadDocumentPdf(fileUrl)
    try {
      const result = await extractText(bytes.slice(), { mergePages: true })
      text = String(result.text || '')
    } catch {}
    if (text.replace(/\s+/g, '').length < 500) {
      // PDF escaneado sem camada de texto: envia as primeiras páginas como documento
      const pages = await countPdfPages(bytes)
      pdfPart = await extractPdfPages(bytes, 1, Math.min(pages, 4))
    }
  }

  // 2. Vocabulário existente, para reaproveitar categorias e tags em vez de criar variações
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from('categories').select('name').order('name'),
    supabase.from('tags').select('name, document_tags(count)').limit(1000)
  ])
  const categoryNames = (categories || []).map(c => c.name)
  const popularTags = (tags || [])
    .map((t: any) => ({ name: t.name, n: t.document_tags?.[0]?.count ?? 0 }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 150)
    .map(t => t.name)

  // Início e fim do texto costumam ter folha de rosto, sumário, colofão e assinatura
  const excerpt = text.length > 40000 ? `${text.slice(0, 30000)}\n\n[...]\n\n${text.slice(-8000)}` : text

  const instructions = `Você cataloga obras para a Biblioteca Digital Anglicana "Projeto Cantuária" (produção litúrgica, teológica e histórica anglicana em língua portuguesa).

Nome do arquivo / título provisório: "${filename || doc.title || ''}"

Extraia os metadados usando SOMENTE o conteúdo fornecido. Não invente: se um dado não aparece, deixe vazio (null).

Regras:
- title: título exato da obra como aparece na folha de rosto/cabeçalho (grafia original). Em periódicos, inclua número/mês/ano (ex.: "O Estandarte Christão, n. 7, julho de 1896").
- authors: nomes completos de autores/organizadores; para documentos oficiais, a instituição (ex.: "Igreja Episcopal Anglicana do Brasil"). Lista vazia se não houver.
- category: escolha UMA da lista de categorias existentes sempre que alguma servir. Só proponha uma nova se nenhuma servir de forma alguma.
- tags: 3 a 8 assuntos. Prefira tags da lista de tags existentes; use substantivos, sem repetir a categoria.
- summary: 2 a 3 parágrafos objetivos em português, dizendo o que é a obra, contexto histórico/eclesial e principais temas. Sem elogios e sem frases como "este documento".
- publication_year: ano da publicação original (número) ou null.
- language: idioma principal (ex.: "Português", "Inglês", "Latim", "Espanhol").
- type: um de ${DOCUMENT_TYPES.join(', ')} (LOC = Livro de Oração Comum e seus ofícios).

Categorias existentes: ${categoryNames.join(' | ') || '(nenhuma)'}

Tags mais usadas: ${popularTags.join(' | ') || '(nenhuma)'}`

  const content: any[] = []
  if (pdfPart) {
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: Buffer.from(pdfPart).toString('base64') } })
  } else {
    content.push({ type: 'text', text: `CONTEÚDO DA OBRA:\n<conteudo>\n${excerpt || '(sem texto extraível)'}\n</conteudo>` })
  }
  content.push({ type: 'text', text: instructions })

  try {
    const msg = await callClaude({
      apiKey: claude.apiKey,
      model: claude.metadataModel,
      maxTokens: 4000,
      content,
      outputSchema: METADATA_SCHEMA
    })
    const data = msg.json
    if (!data) throw new Error('O modelo não retornou metadados.')

    const year = Number.isInteger(data.publication_year) && data.publication_year > 0 && data.publication_year <= new Date().getFullYear()
      ? data.publication_year
      : null

    const result: Record<string, any> = {
      title: data.title?.trim(),
      summary: data.summary?.trim(),
      authors_list: (data.authors || []).map((a: string) => a.trim()).filter(Boolean).join(', '),
      tags_list: (data.tags || []).map((t: string) => t.trim()).filter(Boolean).join(', '),
      category_name: data.category?.trim(),
      publication_year: year,
      language: data.language?.trim() || 'Português',
      type: DOCUMENT_TYPES.includes(data.type) ? data.type : undefined,
      extracted_content: text.slice(0, 15000)
    }
    // Não sobrescrever no formulário o que a IA não soube responder
    for (const key of Object.keys(result)) if (result[key] === undefined || result[key] === '') delete result[key]
    return result
  } catch (error: any) {
    console.error('[IA] Erro na análise:', error?.message)
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Erro na análise com IA.' })
  }
})
