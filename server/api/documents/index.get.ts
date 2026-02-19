import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string || '0')
  const pageSize = parseInt(query.pageSize as string || '9')
  const search = query.q as string || ''
  const type = query.tipo as string || ''
  const category = query.categoria as string || ''

  const adminSupabase = useAdminSupabase()

  // Construção da Query no Servidor
  let dbQuery = adminSupabase
    .from('documents')
    .select('*, authors(*), categories(*)', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (search) {
    // Busca textual simples ou usando o search_vector se configurado
    dbQuery = dbQuery.ilike('title', `%${search}%`)
  }

  if (type) {
    dbQuery = dbQuery.eq('type', type)
  }

  if (category) {
    // Filtra pelo slug da categoria através do join
    dbQuery = dbQuery.filter('categories.slug', 'eq', category)
  }

  const { data, count, error } = await dbQuery

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar documentos no servidor'
    })
  }

  return {
    documents: data,
    total: count,
    page,
    pageSize,
    hasMore: count ? (page + 1) * pageSize < count : false
  }
})
