import { defineEventHandler, readBody, createError } from 'h3'
import { createRequire } from 'module'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { filename, documentId, fileUrl } = body
  const config = useRuntimeConfig()
  
  // Tenta resolver o pdf-parse dinamicamente
  const _require = createRequire(import.meta.url)
  let pdfParser: any
  try {
    const rawPdf = _require('pdf-parse')
    pdfParser = typeof rawPdf === 'function' ? rawPdf : (rawPdf.default || rawPdf)
  } catch (e) {
    console.error('Erro ao carregar pdf-parse:', e)
  }

  const PERPLEXITY_API_KEY = config.perplexityApiKey || process.env.PERPLEXITY_API_KEY

  if (!PERPLEXITY_API_KEY) {
    throw createError({ statusCode: 500, statusMessage: 'API Key ausente' })
  }

  let extractedText = ''

  try {
    // 1. Baixar o arquivo se for PDF
    if (fileUrl && fileUrl.toLowerCase().endsWith('.pdf')) {
      const response = await $fetch.raw(fileUrl)
      const arrayBuffer = await (response._data as any).arrayBuffer()
      
      if (typeof pdfParser === 'function') {
        const data = await pdfParser(Buffer.from(arrayBuffer))
        extractedText = data.text
      } else {
        extractedText = `(O arquivo é um PDF, mas o extrator de texto falhou. Analise apenas pelo nome: ${filename})`
      }
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
          { role: 'system', content: 'Você é um bibliotecário acadêmico anglicano. Responda apenas com JSON puro. NUNCA inclua citações numéricas como [1], [2], etc.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1
      }
    })

    const rawContent = aiResponse.choices[0].message.content
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
    const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent)

    // Função para limpar citações numéricas [1], [2], etc.
    const cleanCitations = (text: string) => {
      if (typeof text !== 'string') return text
      return text.replace(/\[\d+\]/g, '').replace(/\s\s+/g, ' ').trim()
    }

    // Limpa todos os campos textuais
    if (analysis.summary) analysis.summary = cleanCitations(analysis.summary)
    if (analysis.title) analysis.title = cleanCitations(analysis.title)

    // Formata campos de lista para strings para facilitar edição no formulário
    const formattedAnalysis = {
      ...analysis,
      authors_list: Array.isArray(analysis.authors) ? analysis.authors.join(', ') : analysis.authors,
      tags_list: Array.isArray(analysis.tags) ? analysis.tags.join(', ') : analysis.tags,
      category_name: analysis.category
    }

    if (documentId) {
      const adminSupabase = useAdminSupabase()
      await adminSupabase
        .from('documents')
        .update({
          title: analysis.title,
          summary: analysis.summary,
          publication_year: analysis.publication_year,
          language: analysis.language,
          content_text: extractedText.substring(0, 10000)
        })
        .eq('id', documentId)
    }
    
    return formattedAnalysis
  } catch (error: any) {
    console.error('AI Analysis Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Erro na análise: ${error.message}`
    })
  }
})
