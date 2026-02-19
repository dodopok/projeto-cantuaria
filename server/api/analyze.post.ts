import { defineEventHandler, readBody, createError } from 'h3'
import { extractText } from 'unpdf'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { filename, documentId, fileUrl } = body
  const config = useRuntimeConfig()
  
  const PERPLEXITY_API_KEY = config.perplexityApiKey || process.env.PERPLEXITY_API_KEY

  if (!PERPLEXITY_API_KEY) {
    throw createError({ statusCode: 500, statusMessage: 'API Key do Perplexity não configurada.' })
  }

  let extractedText: string = ''

  try {
    if (fileUrl && fileUrl.toLowerCase().endsWith('.pdf')) {
      console.log(`[IA] Baixando arquivo para extração: ${filename}`)
      const response = await $fetch.raw(fileUrl)
      const arrayBuffer = await (response._data as any).arrayBuffer()
      
      try {
        const result = await extractText(arrayBuffer)
        // Garante que o texto seja uma string, tratando arrays ou objetos inesperados
        extractedText = typeof result.text === 'string' ? result.text : String(result.text || '')
        console.log(`[IA] Texto extraído com sucesso (${extractedText.length} caracteres)`)
      } catch (pdfError: any) {
        console.error('[IA] Erro na biblioteca unpdf:', pdfError)
        extractedText = ''
      }
    }

    // Se falhou ou não é PDF, usa fallback
    const textForIA = extractedText && extractedText.length > 10 
      ? extractedText 
      : `(Texto não extraível. Nome do arquivo: ${filename})`

    const prompt = `
      CONTEXTO FUNDAMENTAL:
      Você está analisando um arquivo para a biblioteca "Projeto Cantuária".
      NOME DO ARQUIVO: "${filename}"
      
      CONTEÚDO EXTRAÍDO (FONTE ÚNICA):
      --- INÍCIO ---
      ${textForIA.substring(0, 12000)}
      --- FIM ---

      TAREFA:
      Extraia os metadados no formato JSON:
      {
        "title": "Título exato",
        "authors": ["Autor Completo"],
        "category": "Categoria única",
        "tags": ["Tag1"],
        "summary": "Resumo de 2-3 parágrafos",
        "publication_year": 2024,
        "language": "Português"
      }

      REGRAS:
      1. Responda APENAS JSON.
      2. NUNCA use citações [n].
      3. Se o conteúdo for apenas o nome do arquivo, tente deduzir o título, mas seja honesto no resumo se não houver dados.
    `

    console.log(`[IA] Enviando para Perplexity...`)
    const aiResponse: any = await $fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'sonar',
        messages: [
          { role: 'system', content: 'Você é um bibliotecário acadêmico anglicano infalível.' },
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
      extracted_content: String(extractedText).substring(0, 15000)
    }
  } catch (error: any) {
    console.error('[IA] Erro na análise:', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
