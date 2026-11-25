import { defineEventHandler, readBody, createError } from 'h3'
import { callClaude, DEFAULT_METADATA_MODEL } from '../../lib/transcription-core.mjs'

const extractYoutubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

const VIDEO_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: { summary: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } } },
  required: ['summary', 'tags']
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event) ?? {}
  const { url } = body
  const config = useRuntimeConfig()

  if (!url) throw createError({ statusCode: 400, statusMessage: 'URL é obrigatória.' })

  const videoId = extractYoutubeId(url)
  if (!videoId) throw createError({ statusCode: 400, statusMessage: 'URL do YouTube inválida.' })

  const YOUTUBE_API_KEY = config.youtubeApiKey || process.env.YOUTUBE_API_KEY
  const ANTHROPIC_API_KEY = (config.anthropicApiKey as string) || process.env.ANTHROPIC_API_KEY

  if (!YOUTUBE_API_KEY) {
    throw createError({ statusCode: 500, statusMessage: 'YouTube API Key não configurada.' })
  }

  try {
    // 1. Buscar metadados do YouTube
    const ytResponse: any = await $fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet`
    )

    if (!ytResponse.items || ytResponse.items.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Vídeo não encontrado no YouTube.' })
    }

    const snippet = ytResponse.items[0].snippet
    const thumbnails = snippet.thumbnails

    const thumbnail =
      thumbnails.maxres?.url ||
      thumbnails.standard?.url ||
      thumbnails.high?.url ||
      thumbnails.medium?.url ||
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

    const publicationYear = snippet.publishedAt ? new Date(snippet.publishedAt).getFullYear() : null
    const ytTags: string[] = snippet.tags || []

    // 2. Usar Claude para gerar resumo curado para a biblioteca
    let summary = snippet.description || ''
    let refinedTags = ytTags.slice(0, 15)

    if (ANTHROPIC_API_KEY) {
      try {
        const prompt = `Você cataloga vídeos para a Biblioteca Digital Anglicana "Projeto Cantuária".

TÍTULO: ${snippet.title}
CANAL: ${snippet.channelTitle}
ANO: ${publicationYear}
DESCRIÇÃO ORIGINAL:
${snippet.description?.substring(0, 3000) || '(sem descrição)'}

Produza metadados usando só as informações acima, sem inventar:
- summary: 2 a 3 parágrafos objetivos em português sobre o conteúdo do vídeo.
- tags: até 10 assuntos relevantes (teológicos, litúrgicos ou históricos).`

        const msg: any = await callClaude({
          apiKey: ANTHROPIC_API_KEY,
          model: (config.anthropicMetadataModel as string) || DEFAULT_METADATA_MODEL,
          maxTokens: 2000,
          content: [{ type: 'text', text: prompt }],
          outputSchema: VIDEO_SCHEMA
        })
        const parsed = msg.json
        if (parsed?.summary) summary = parsed.summary
        if (Array.isArray(parsed?.tags) && parsed.tags.length > 0) refinedTags = parsed.tags.slice(0, 10)
      } catch (aiErr: any) {
        console.warn('[videos/analyze] Claude falhou, usando dados brutos do YouTube:', aiErr?.message)
      }
    }

    return {
      youtube_id: videoId,
      title: snippet.title || '',
      summary,
      thumbnail_url: thumbnail,
      publication_year: publicationYear,
      tags_list: refinedTags.join(', '),
      channel_title: snippet.channelTitle || '',
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Erro ao analisar vídeo.' })
  }
})
