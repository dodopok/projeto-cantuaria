import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string || '0')
  const pageSize = parseInt(query.pageSize as string || '9')
  const search = query.q as string || ''
  const type = query.tipo as string || ''
  const category = query.categoria as string || ''
  const seculo = query.seculo as string || ''
  const idioma = query.idioma as string || ''

  const adminSupabase = useAdminSupabase()

  let dbQuery = adminSupabase
    .from('documents')
    .select('*, authors(*), categories(*), tags(*)', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  // Pesquisa de Texto (Full Text Search)
  if (search) {
    dbQuery = dbQuery.textSearch('search_vector', search, { 
      config: 'portuguese',
      type: 'websearch'
    })
  }

  // Filtro de Múltiplos Tipos
  if (type) {
    const types = type.split(',')
    dbQuery = dbQuery.in('type', types)
  }

  // Filtro de Idioma
  if (idioma) {
    dbQuery = dbQuery.eq('language', idioma)
  }

  // Filtro de Século
  if (seculo) {
    const startYear = parseInt(seculo) * 100 - 100
    const endYear = parseInt(seculo) * 100 - 1
    dbQuery = dbQuery.gte('publication_year', startYear).lte('publication_year', endYear)
  }

  const { data, count, error } = await dbQuery

  // Filtro de Categoria (necessita ser feito via join ou sub-query se for múltiplo)
  let filteredData = data
  if (category && data) {
    const categoriesSlugs = category.split(',')
    filteredData = data.filter(doc => 
      doc.categories && categoriesSlugs.includes(doc.categories.slug)
    )
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar documentos no servidor'
    })
  }

  return {
    documents: filteredData || [],
    total: count,
    page,
    pageSize,
    hasMore: count ? (page + 1) * pageSize < count : false
  }
})
