import { defineEventHandler, createError, getRouterParam, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  // O Nitro passará o valor da URL (:id ou :slug) para este parâmetro
  const idOrSlug = getRouterParam(event, 'id')
  const query = getQuery(event)
  const isFull = query.full === 'true'
  const adminSupabase = useAdminSupabase()

  if (!idOrSlug || idOrSlug === 'undefined') {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Identificador inválido.'
    })
  }

  // Sanitização (Tratamos como slug na busca do banco)
  const cleanSlug = idOrSlug.toLowerCase().trim()

  // Seleção de colunas: excluímos content_markdown por padrão se não for 'full'
  // Colunas explícitas: nunca expor campos internos (file_hash, search_metadata, search_vector)
  const baseColumns = 'id, title, slug, summary, content_text, file_url, thumbnail_url, type, language, publication_year, publication_id, created_at, status, views_count, has_markdown, authors(*), categories(*), tags(*)'
  // content_markdown é sempre lido: no modo resumido vira só um trecho inicial (excerpt)
  const selectQuery = `${baseColumns}, content_markdown`

  // Só administradores enxergam documentos ainda não publicados (sugestões pendentes)
  const isAdmin = await isAdminRequest(event)

  let dbQuery = adminSupabase
    .from('documents')
    .select(selectQuery)
    .eq('slug', cleanSlug)

  if (!isAdmin) dbQuery = dbQuery.eq('status', 'published')

  const { data, error } = await dbQuery.maybeSingle()

  if (error) {
    console.error(`[API GET] Erro no Supabase:`, error)
    throw createError({ statusCode: 500, statusMessage: 'Erro interno ao consultar banco' })
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Obra não encontrada'
    })
  }

  if (!isFull) {
    const doc: any = data
    const plain = (doc.content_markdown || '')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/[*_>`]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    doc.excerpt = plain ? (plain.length > 1500 ? `${plain.slice(0, 1500).replace(/\s+\S*$/, '')}…` : plain) : null
    delete doc.content_markdown
    return doc
  }

  return data
})
