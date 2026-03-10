import { defineEventHandler, readBody, createError } from 'h3'

const extractYoutubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event) ?? {}
  const { url } = body
  const config = useRuntimeConfig()

  if (!url) throw createError({ statusCode: 400, statusMessage: 'URL é obrigatória.' })

  const videoId = extractYoutubeId(url)
  if (!videoId) throw createError({ statusCode: 400, statusMessage: 'URL do YouTube inválida.' })

  const YOUTUBE_API_KEY = config.youtubeApiKey || process.env.YOUTUBE_API_KEY
  const PERPLEXITY_API_KEY = config.perplexityApiKey || process.env.PERPLEXITY_API_KEY

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

    // 2. Usar Perplexity para gerar resumo curado para a biblioteca
    let summary = snippet.description || ''
    let refinedTags = ytTags.slice(0, 15)

    if (PERPLEXITY_API_KEY) {
      try {
        const prompt = `
Você é um bibliotecário da biblioteca digital anglicana "Projeto Cantuária".

Analise o seguinte vídeo do YouTube e produza metadados curados para a biblioteca:

TÍTULO: ${snippet.title}
CANAL: ${snippet.channelTitle}
ANO: ${publicationYear}
DESCRIÇÃO ORIGINAL:
${snippet.description?.substring(0, 3000) || '(sem descrição)'}

Responda APENAS com JSON no formato:
{
  "summary": "Resumo descritivo de 2-3 parágrafos sobre o conteúdo do vídeo, escrito em português, adequado para uma biblioteca acadêmica anglicana.",
  "tags": ["tag1", "tag2", "tag3"]
}

REGRAS:
- O resumo deve estar em português
- As tags devem ser relevantes para o conteúdo teológico/litúrgico/histórico anglicano
- Máximo 10 tags
- Responda SOMENTE JSON, sem texto adicional
`
        const aiResponse: any = await $fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: {
            model: 'sonar',
            messages: [
              { role: 'system', content: 'Você é um bibliotecário acadêmico anglicano. Responda sempre em JSON válido.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2
          }
        })

        const rawContent = aiResponse.choices[0].message.content
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (parsed.summary) summary = parsed.summary
          if (Array.isArray(parsed.tags) && parsed.tags.length > 0) refinedTags = parsed.tags
        }
      } catch (aiErr) {
        console.warn('[videos/analyze] Perplexity falhou, usando dados brutos do YouTube:', aiErr)
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
