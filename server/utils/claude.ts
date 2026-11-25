import { createError } from 'h3'
import { DEFAULT_METADATA_MODEL, DEFAULT_OCR_MODEL } from '../lib/transcription-core.mjs'

/** Configuração do Claude (Anthropic). Modelos podem ser trocados por variável de ambiente. */
export const useClaudeConfig = () => {
  const config = useRuntimeConfig()
  const apiKey = (config.anthropicApiKey as string) || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'ANTHROPIC_API_KEY não configurada.' })
  }
  return {
    apiKey,
    ocrModel: (config.anthropicOcrModel as string) || DEFAULT_OCR_MODEL,
    metadataModel: (config.anthropicMetadataModel as string) || DEFAULT_METADATA_MODEL
  }
}

/** Baixa o PDF do documento (URL lida do banco) com cache em /tmp na mesma instância. */
export const downloadDocumentPdf = async (fileUrl: string): Promise<Uint8Array> => {
  const { createHash } = await import('node:crypto')
  const { readFile, writeFile, stat } = await import('node:fs/promises')
  const cachePath = `/tmp/cantuaria-${createHash('sha1').update(fileUrl).digest('hex')}.pdf`

  try {
    const s = await stat(cachePath)
    if (s.size > 0) return new Uint8Array(await readFile(cachePath))
  } catch {}

  const res = await fetch(fileUrl)
  if (!res.ok) throw createError({ statusCode: 502, statusMessage: `Falha ao baixar o PDF (HTTP ${res.status}).` })
  const bytes = new Uint8Array(await res.arrayBuffer())
  try { await writeFile(cachePath, bytes) } catch {}
  return bytes
}
