import { defineEventHandler, readBody, createError } from 'h3'
import pdf from 'pdf-parse'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { filename, documentId, fileUrl } = body
  const config = useRuntimeConfig()
  
  const PERPLEXITY_API_KEY = config.perplexityApiKey || process.env.PERPLEXITY_API_KEY

  if (!PERPLEXITY_API_KEY) {
    throw createError({ statusCode: 500, statusMessage: 'API Key ausente' })
  }

  let extractedText = ''

  try {
    // 1. Baixar o arquivo se for PDF
    if (fileUrl && fileUrl.toLowerCase().endsWith('.pdf')) {
      const fileBuffer = await $fetch<ArrayBuffer>(fileUrl)
      const data = await pdf(Buffer.from(fileBuffer))
      extractedText = data.text
    } else {
      extractedText = body.documentText || ''
    }

    const prompt = `
      Analise o conteúdo deste documento para a biblioteca "Projeto Cantuária".
      Extraia os metadados em JSON:
      {
        "title": "Título",
        "authors": ["Autor"],
        "category": "Categoria única",
        "tags": ["Tag1"],
        "summary": "Resumo de 2 parágrafos",
        "publication_year": 1662,
        "language": "Português"
      }
      
      Conteúdo extraído: ${extractedText.substring(0, 5000)}
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
          { role: 'system', content: 'Você é um bibliotecário acadêmico anglicano. Responda apenas com JSON puro.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1
      }
    })

    const rawContent = aiResponse.choices[0].message.content
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
    const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent)

    if (documentId) {
      const adminSupabase = useAdminSupabase()
      await adminSupabase
        .from('documents')
        .update({
          title: analysis.title,
          summary: analysis.summary,
          publication_year: analysis.publication_year,
          language: analysis.language,
          content_text: extractedText.substring(0, 10000) // Salva uma parte do texto para SEO
        })
        .eq('id', documentId)
    }
    
    return analysis
  } catch (error: any) {
    console.error('AI Analysis Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Erro na análise: ${error.message}`
    })
  }
})
