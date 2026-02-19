import { defineEventHandler, readBody, createError } from 'h3'
import { createRequire } from 'module'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { filename, documentId, fileUrl } = body
  const config = useRuntimeConfig()
  
  const _require = createRequire(import.meta.url)
  let pdfParser: any
  
  try {
    const pdfLib = _require('pdf-parse')
    pdfParser = pdfLib.default || pdfLib
    if (typeof pdfParser !== 'function' && typeof pdfLib === 'object') {
      pdfParser = Object.values(pdfLib).find(v => typeof v === 'function')
    }
  } catch (e) {
    console.error('Falha ao carregar pdf-parse:', e)
  }

  const PERPLEXITY_API_KEY = config.perplexityApiKey || process.env.PERPLEXITY_API_KEY

  if (!PERPLEXITY_API_KEY) {
    throw createError({ statusCode: 500, statusMessage: 'API Key do Perplexity não configurada.' })
  }

  let extractedText = ''

  try {
    if (fileUrl && fileUrl.toLowerCase().endsWith('.pdf')) {
      const response = await $fetch.raw(fileUrl)
      const arrayBuffer = await (response._data as any).arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      if (typeof pdfParser === 'function') {
        const data = await pdfParser(buffer)
        extractedText = data.text || ''
      }
    }

    if (!extractedText || extractedText.length < 10) {
      extractedText = `Título provisório: ${filename}. (Extração falhou ou PDF é imagem)`
    }

    const prompt = `
      Analise este documento para a biblioteca "Projeto Cantuária".
      Extraia estritamente em JSON:
      {
        "title": "Título",
        "authors": ["Autor"],
        "category": "Categoria única",
        "tags": ["Tag1"],
        "summary": "Resumo detalhado de 2 parágrafos",
        "publication_year": 1662,
        "language": "Português"
      }
      
      Conteúdo extraído: ${extractedText.substring(0, 8000)}
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
          { role: 'system', content: 'Você é um bibliotecário anglicano especializado. Responda apenas com JSON puro, sem citações [n] e sem markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1
      }
    })

    const rawContent = aiResponse.choices[0].message.content
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
    const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent)

    const clean = (t: any) => typeof t === 'string' ? t.replace(/\[\d+\]/g, '').trim() : t
    
    return {
      title: clean(analysis.title),
      summary: clean(analysis.summary),
      authors_list: Array.isArray(analysis.authors) ? analysis.authors.join(', ') : analysis.authors,
      tags_list: Array.isArray(analysis.tags) ? analysis.tags.join(', ') : analysis.tags,
      category_name: clean(analysis.category),
      publication_year: analysis.publication_year,
      language: analysis.language,
      extracted_content: extractedText.substring(0, 10000)
    }
  } catch (error: any) {
    console.error('Erro na análise:', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
