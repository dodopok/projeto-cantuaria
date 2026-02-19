import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const { documentText, filename, documentId } = await readBody(event)
  const config = useRuntimeConfig()
  
  // No Nuxt 3 server side, usamos runtimeConfig ou process.env
  const PERPLEXITY_API_KEY = config.perplexityApiKey || process.env.PERPLEXITY_API_KEY

  if (!PERPLEXITY_API_KEY) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Perplexity API Key not configured'
    })
  }

  const prompt = `
    Analise o seguinte conteúdo de um documento para a biblioteca "Projeto Cantuária" (uma biblioteca digital anglicana).
    Extraia os seguintes metadados em formato JSON puro:
    - title: Título da obra
    - authors: Lista de autores (apenas nomes)
    - category: Categoria (ex: Liturgia, Teologia, História, Sermões)
    - tags: Lista de tags relevantes (ex: BCP, Reforma, Patrística)
    - summary: Um resumo de 2-3 parágrafos sobre a importância da obra
    - publication_year: Ano ou século provável de publicação
    - language: Idioma principal

    Nome do arquivo: ${filename}
    Conteúdo (primeiros 3000 caracteres): ${documentText?.substring(0, 3000)}
  `

  try {
    const aiResponse = await $fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: 'Você é um bibliotecário acadêmico especializado em história e liturgia anglicana. Retorne apenas JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1
      }
    })

    const content = aiResponse.choices[0].message.content
    const jsonStr = content.match(/\{[\s\S]*\}/)?.[0] || content
    const analysis = JSON.parse(jsonStr)

    // Opcional: Já salvar os metadados no Supabase usando o cliente admin
    if (documentId) {
      const adminSupabase = useAdminSupabase()
      await adminSupabase
        .from('documents')
        .update({
          title: analysis.title,
          summary: analysis.summary,
          language: analysis.language,
          // Adicione outros campos conforme necessário
        })
        .eq('id', documentId)
    }
    
    return analysis
  } catch (error) {
    console.error('AI Analysis Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Falha ao analisar o documento com IA'
    })
  }
})
