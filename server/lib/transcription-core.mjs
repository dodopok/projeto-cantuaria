// Núcleo da transcrição de PDFs com Claude, sem dependências do Nuxt.
// Usado pelas rotas do servidor (server/api/admin/transcription/*) e pelo
// script de reprocessamento em lote (scripts/retranscrever-acervo.mjs).
//
// Por que em partes: um modelo devolve no máximo algumas dezenas de milhares de
// tokens por resposta. Antes o OCR mandava o PDF inteiro com limite de 8192 tokens
// de saída e o texto saía cortado (~25–30 mil caracteres). Agora o PDF é dividido
// em faixas de páginas, cada faixa é transcrita separadamente e o resultado é
// concatenado na ordem das páginas.

export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
export const ANTHROPIC_VERSION = '2023-06-01'
export const DEFAULT_OCR_MODEL = 'claude-haiku-5-5'
export const DEFAULT_METADATA_MODEL = 'claude-sonnet-5-5'

/** Limite de saída por parte. Se for atingido, a parte é dividida ao meio e refeita. */
export const CHUNK_MAX_TOKENS = 32000
/** Limite de tamanho de requisição da API para PDFs (32 MB), com folga para o base64. */
const MAX_CHUNK_BYTES = 20 * 1024 * 1024

// O pdfjs é carregado só quando uma rota de transcrição precisa dele (import dinâmico).
// Importá-lo no topo faria o servidor inteiro falhar ao iniciar: o build "legacy"
// usa DOMMatrix/ImageData/Path2D, que não existem no Node. Para dividir páginas
// (extractPages) nada é renderizado, então stubs mínimos bastam.
//
// Um único pdf.js por processo: o unpdf traz um pdf.js próprio (outra versão) que
// registra o worker no mesmo globalThis.pdfjsWorker. Misturar os dois dá
// "API version X does not match Worker version Y". Por isso o worker é sempre o do
// pdfjs-dist e o unpdf é configurado para usar este mesmo módulo (extractPdfText).
let pdfjsPromise = null
export function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      globalThis.DOMMatrix ??= class DOMMatrix {
        constructor() { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0 }
      }
      globalThis.ImageData ??= class ImageData {}
      globalThis.Path2D ??= class Path2D {}
      // Worker "falso" no mesmo processo: não depende de arquivo de worker resolvido
      // em tempo de execução (que não sobrevive ao bundle da Vercel).
      globalThis.pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.mjs')
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
      // Faz o unpdf usar este mesmo pdf.js (em vez do bundle próprio, de outra versão)
      const { definePDFJSModule } = await import('unpdf')
      await definePDFJSModule(() => Promise.resolve(pdfjs))
      return pdfjs
    })()
  }
  return pdfjsPromise
}

/** Texto da camada de texto do PDF (sem OCR), usando o mesmo pdf.js do restante. */
export async function extractPdfText(bytes) {
  await getPdfjs()
  const { extractText } = await import('unpdf')
  const { text } = await extractText(new Uint8Array(bytes), { mergePages: true })
  return String(text || '')
}

async function loadPdf(bytes) {
  const pdfjs = await getPdfjs()
  return pdfjs.getDocument({
    data: new Uint8Array(bytes),
    isEvalSupported: false,
    useSystemFonts: false,
    disableFontFace: true,
    verbosity: 0
  }).promise
}

/** Número de páginas do PDF. */
export async function countPdfPages(bytes) {
  const doc = await loadPdf(bytes)
  try {
    return doc.numPages
  } finally {
    await doc.destroy()
  }
}

/** Gera um novo PDF só com as páginas [from, to] (1-based, inclusivo). */
export async function extractPdfPages(bytes, from, to) {
  const doc = await loadPdf(bytes)
  try {
    const out = await doc.extractPages([{ document: null, includePages: [[from - 1, to - 1]] }])
    return new Uint8Array(out)
  } finally {
    await doc.destroy()
  }
}

/**
 * Divide o documento em faixas de páginas. Escaneamentos pesados (muitos bytes por
 * página, ex.: jornais do séc. XIX) usam faixas menores, porque cada página rende
 * mais texto e a requisição fica maior.
 */
export function planChunks(totalPages, totalBytes) {
  const bytesPerPage = totalBytes / Math.max(totalPages, 1)
  let pagesPerChunk = 10
  if (bytesPerPage > 1_000_000) pagesPerChunk = 1
  else if (bytesPerPage > 400_000) pagesPerChunk = 2
  else if (bytesPerPage > 150_000) pagesPerChunk = 4
  // Nunca ultrapassar o limite de bytes por requisição
  pagesPerChunk = Math.max(1, Math.min(pagesPerChunk, Math.floor(MAX_CHUNK_BYTES / Math.max(bytesPerPage, 1))))

  const chunks = []
  for (let from = 1; from <= totalPages; from += pagesPerChunk) {
    chunks.push({ from, to: Math.min(from + pagesPerChunk - 1, totalPages) })
  }
  return chunks
}

export function buildTranscriptionPrompt({ from, to, totalPages, title }) {
  const where = totalPages > 1
    ? `Este arquivo contém as páginas ${from} a ${to} (de ${totalPages}) de um documento`
    : 'Este arquivo é um documento'
  const isContinuation = from > 1

  return `${where} do acervo da Biblioteca Digital Anglicana "Projeto Cantuária"${title ? ` (título provisório: "${title}")` : ''}.

Transcreva TODO o texto destas páginas para Markdown, do início ao fim, com fidelidade.

Regras:
- Não resuma, não omita trechos e não pare antes do fim da última página.
- Preserve a ortografia original da época (ex.: "pharmacia", "egreja", "christão"); não modernize.
- Use #, ## e ### apenas para títulos e seções reais do documento.
- Texto em colunas: transcreva coluna por coluna, na ordem de leitura.
- Use **negrito** e *itálico* só onde houver destaque no original; use > para citações recuadas e bíblicas.
- Junte palavras hifenizadas na quebra de linha ("hon- rada" → "honrada") e una as linhas de um mesmo parágrafo.
- Ignore números de página, cabeçalhos e rodapés que se repetem em todas as páginas.
- Tabelas simples podem virar tabelas Markdown. Notas de rodapé vão ao fim do trecho, como [^n].
- Trecho ilegível: [ilegível]. Imagem sem texto: ignore.${isContinuation ? '\n- Estas páginas continuam um texto já iniciado: comece exatamente onde a primeira página começa, mesmo no meio de uma frase.' : ''}
- Responda apenas com o Markdown, sem comentários, explicações ou cercas de código.`
}

/**
 * Chamada simples à Messages API (sem SDK, para não adicionar dependências).
 * Com `outputSchema`, usa saída estruturada (JSON Schema) e devolve `json` já parseado.
 */
export async function callClaude({ apiKey, model, maxTokens, system, content, outputSchema, signal }) {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      ...(outputSchema ? { output_config: { format: { type: 'json_schema', schema: outputSchema } } } : {}),
      messages: [{ role: 'user', content }]
    })
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = json?.error?.message || `HTTP ${res.status}`
    const err = new Error(`Claude: ${message}`)
    err.status = res.status
    throw err
  }
  if (outputSchema) {
    const text = (json.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('')
    try {
      json.json = JSON.parse(text)
    } catch {
      throw new Error('Claude: resposta estruturada inválida.')
    }
  }
  return json
}

/**
 * Transcreve uma faixa de páginas. Retorna o Markdown, se a resposta foi cortada
 * pelo limite de saída (truncated) e o uso de tokens.
 */
export async function transcribePdfRange({ apiKey, model, pdfBytes, from, to, totalPages, title, signal }) {
  const data = Buffer.from(pdfBytes).toString('base64')
  const msg = await callClaude({
    apiKey,
    model: model || DEFAULT_OCR_MODEL,
    maxTokens: CHUNK_MAX_TOKENS,
    signal,
    content: [
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } },
      { type: 'text', text: buildTranscriptionPrompt({ from, to, totalPages, title }) }
    ]
  })

  const markdown = (msg.content || [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('')
    .replace(/^```(?:markdown|md)?\s*\n/i, '')
    .replace(/\n```\s*$/, '')
    .trim()

  return {
    markdown,
    truncated: msg.stop_reason === 'max_tokens',
    model: msg.model,
    inputTokens: msg.usage?.input_tokens ?? 0,
    outputTokens: msg.usage?.output_tokens ?? 0
  }
}

/**
 * Junta as partes na ordem das páginas. Quando uma frase atravessa a divisa entre
 * duas partes (a anterior termina sem pontuação e a seguinte começa em minúscula),
 * emenda na mesma linha em vez de abrir um parágrafo novo.
 */
export function joinChunks(chunks) {
  const parts = [...chunks]
    .sort((a, b) => a.page_from - b.page_from)
    .map((c) => (c.markdown || '').trim())
    .filter(Boolean)

  let out = ''
  for (const part of parts) {
    if (!out) { out = part; continue }
    const lastLine = out.slice(out.lastIndexOf('\n') + 1)
    // Título, lista, citação ou tabela nunca recebem continuação na mesma linha
    const startsLower = /^[a-zà-ÿ]/.test(part) && !/^\s*(#|>|\||[-*+]\s|\d+[.)]\s)/.test(lastLine)
    if (startsLower && /[A-Za-zÀ-ÿ]-$/.test(out)) out = out.slice(0, -1) + part
    else if (startsLower && /[A-Za-zÀ-ÿ0-9,]$/.test(out)) out += ' ' + part
    else out += '\n\n' + part
  }
  return out
}

/** Texto puro aproximado a partir do Markdown (para busca e para a análise de metadados). */
export function markdownToPlainText(markdown) {
  return (markdown || '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^---$/gm, '')
    .replace(/\[\^\d+\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
