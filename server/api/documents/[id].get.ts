import { defineEventHandler, createError, getRouterParam, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  // O Nitro passará o valor da URL (:id ou :slug) para este parâmetro
  const idOrSlug = getRouterParam(event, 'id')
  const query = getQuery(event)
  const isFull = query.full === 'true'
  const adminSupabase = useAdminSupabase()

  console.log(`[API GET] Buscando obra com identificador: "${idOrSlug}" (Full: ${isFull})`)

  if (!idOrSlug || idOrSlug === 'undefined') {
    throw createError({ 
      statusCode: 400, 
      statusMessage: `Identificador inválido. Recebido: ${idOrSlug}` 
    })
  }

  // Sanitização (Tratamos como slug na busca do banco)
  const cleanSlug = idOrSlug.toLowerCase().trim()

  // Seleção de colunas: excluímos content_markdown por padrão se não for 'full'
  const selectQuery = isFull 
    ? '*, authors(*), categories(*), tags(*)' 
    : 'id, title, slug, summary, content_text, file_url, thumbnail_url, type, language, publication_year, created_at, status, has_markdown, authors(*), categories(*), tags(*)'

  const { data, error } = await adminSupabase
    .from('documents')
    .select(selectQuery)
    .eq('slug', cleanSlug)
    .maybeSingle()

  if (error) {
    console.error(`[API GET] Erro no Supabase:`, error)
    throw createError({ statusCode: 500, statusMessage: 'Erro interno ao consultar banco' })
  }

  if (!data) {
    console.warn(`[API GET] Obra não encontrada no banco para o slug: "${cleanSlug}"`)
    throw createError({
      statusCode: 404,
      statusMessage: 'Obra não encontrada'
    })
  }

  return data
})
