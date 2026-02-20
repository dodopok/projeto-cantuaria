import { defineEventHandler, getRouterParam, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 0
  const pageSize = parseInt(query.pageSize as string) || 20
  const search = query.q as string || ''
  const year = query.year as string || ''
  const sort = query.sort as string || 'publication_year' // 'publication_year' or 'title'
  const order = query.order as string || 'asc' // 'asc' or 'desc'
  
  const supabase = useAdminSupabase()

  const { data: pub } = await supabase
    .from('publications')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!pub) throw createError({ statusCode: 404, statusMessage: 'Publicação não encontrada.' })

  // Seleção otimizada para listagem de documentos da publicação
  const optimizedSelect = 'id, title, slug, type, thumbnail_url, publication_year, language, created_at, has_markdown, authors(name)'

  let dbQuery = supabase
    .from('documents')
    .select(optimizedSelect, { count: 'exact' })
    .eq('publication_id', pub.id)
    .eq('status', 'published')

  if (search) {
    dbQuery = dbQuery.textSearch('search_vector', search, { 
      config: 'portuguese',
      type: 'websearch'
    })
  }

  if (year) {
    dbQuery = dbQuery.eq('publication_year', parseInt(year))
  }

  // Sorting
  if (search && !query.sort) {
    // Se estiver pesquisando e não houver ordenação explícita, prioriza relevância
    dbQuery = dbQuery.order('search_vector', { ascending: false })
  } else if (sort === 'title') {
    dbQuery = dbQuery.order('title', { ascending: order === 'asc' })
  } else {
    dbQuery = dbQuery.order('publication_year', { ascending: order === 'asc' })
    dbQuery = dbQuery.order('title', { ascending: true })
  }

  const { data: documents, count } = await dbQuery
    .range(page * pageSize, (page + 1) * pageSize - 1)

  return { 
    ...pub, 
    documents: documents || [],
    hasMore: count ? (page + 1) * pageSize < count : false,
    totalDocuments: count || 0
  }
})
