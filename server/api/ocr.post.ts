import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { documentId, fileUrl } = body
  const config = useRuntimeConfig()

  const GEMINI_API_KEY = config.geminiApiKey || process.env.GEMINI_API_KEY

  if (!GEMINI_API_KEY) {
    throw createError({ statusCode: 500, statusMessage: 'Chave de API do Gemini não configurada.' })
  }

  if (!documentId || !fileUrl) {
    throw createError({ statusCode: 400, statusMessage: 'documentId e fileUrl são obrigatórios.' })
  }

  const adminSupabase = useAdminSupabase()

  try {
    console.log(`[OCR] Baixando arquivo: ${fileUrl}`)
    const response = await $fetch.raw(fileUrl)
    const arrayBuffer = await (response._data as any).arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const sizeMB = buffer.length / (1024 * 1024)
    if (sizeMB > 15) {
      throw new Error(`Arquivo muito grande (${sizeMB.toFixed(1)}MB). Limite de 15MB para processamento inline.`)
    }

    const base64Data = buffer.toString('base64')
    const mimeType = fileUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'

    console.log(`[OCR] Enviando para Gemini 2.5 Flash-Lite (${sizeMB.toFixed(1)}MB, ${mimeType})...`)

    const prompt = `Você é um especialista em digitalização de documentos históricos. Analise este documento e gere um Markdown estruturado e fiel ao conteúdo original.

Diretrizes:
- Use # para o título principal do documento (se houver), ## para capítulos/seções, ### para subseções
- Preserve o texto original com máxima fidelidade
- Para múltiplas colunas, ordene o conteúdo linearmente (coluna da esquerda, depois da direita)
- Use **negrito** para termos com destaque tipográfico no original
- Use *itálico* para ênfases, citações em latim ou outras línguas
- Use > para citações bíblicas, epígrafes e citações longas recuadas
- Use --- para separadores de seção quando houver divisão visual clara entre blocos
- Corrija apenas erros óbvios de digitalização/OCR quando o contexto tornar a correção inequívoca
- Ignore cabeçalhos e rodapés de página repetitivos (número de página, título do livro no topo de cada página)
- Não inclua metadados bibliográficos (título, autor, editora, ISBN) como conteúdo — esses dados já estão no registro do sistema
- Comece diretamente com o conteúdo principal
- Se o documento for muito extenso, processe o máximo possível mantendo qualidade

Gere apenas o Markdown resultante, sem explicações, comentários ou delimitadores de código.`

    const geminiResponse: any = await $fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              },
              { text: prompt }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192
          }
        }
      }
    )

    const markdown = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    if (!markdown) {
      throw new Error('Gemini não retornou conteúdo. Verifique se o arquivo é legível.')
    }

    console.log(`[OCR] Markdown gerado (${markdown.length} chars). Salvando no banco...`)

    const { error: updateError } = await adminSupabase
      .from('documents')
      .update({ content_markdown: markdown })
      .eq('id', documentId)

    if (updateError) throw updateError

    console.log(`[OCR] Salvo com sucesso para documento ${documentId}`)

    // Invalidação de Cache
    await purgeCache()

    // Texto puro extraído do markdown para uso opcional em análise de metadados
    const extractedText = markdown
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/^>\s+/gm, '')
      .replace(/^---$/gm, '')
      .substring(0, 15000)

    return { markdown, extractedText }
  } catch (error: any) {
    console.error('[OCR] Erro:', error)
    throw createError({ statusCode: 500, statusMessage: error.message || 'Erro no processamento OCR com Gemini.' })
  }
})
