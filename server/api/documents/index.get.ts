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
    .select('*, authors(*), categories!inner(*), tags(*)', { count: 'exact' })
    .eq('status', 'published')

  // Pesquisa de Texto (Full Text Search)
  if (search) {
    dbQuery = dbQuery.textSearch('search_vector', search, { 
      config: 'portuguese',
      type: 'websearch'
    })
    dbQuery = dbQuery.order('search_vector', { ascending: false })
  } else {
    dbQuery = dbQuery.order('created_at', { ascending: false })
  }

  // Filtro de Categoria (via Slug na tabela relacionada)
  // O !inner garante que o Supabase filtre a tabela principal baseada na existência/match da relacionada
  if (category) {
    dbQuery = dbQuery.eq('categories.slug', category)
  }

  // Filtro de Múltiplos Tipos
  if (type) {
    const types = type.split(',').map(t => {
      const clean = t.trim().toLowerCase()
      if (clean === 'loc') return 'LOC'
      if (clean === 'livro') return 'Livro'
      if (clean === 'artigo') return 'Artigo'
      if (clean === 'revista') return 'Revista'
      if (clean === 'foto') return 'Foto'
      if (clean === 'documento') return 'Documento'
      return t
    })
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

  // Paginação aplicada ao final
  dbQuery = dbQuery.range(page * pageSize, (page + 1) * pageSize - 1)

  const { data, count, error } = await dbQuery

  if (error) {
    console.error('[API GET Error]:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar documentos no servidor'
    })
  }

  return {
    documents: data || [],
    total: count,
    page,
    pageSize,
    hasMore: count ? (page + 1) * pageSize < count : false
  }
})
