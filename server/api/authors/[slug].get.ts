import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const adminSupabase = useAdminSupabase()

  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug do autor é obrigatório' })

  // 1. Buscar Detalhes do Autor
  const { data: author, error: authorError } = await adminSupabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single()

  if (authorError || !author) {
    throw createError({ statusCode: 404, statusMessage: 'Autor não encontrado' })
  }

  // 2. Buscar Obras do Autor (via tabela pivot document_authors)
  // Nota: fazemos um join para pegar apenas os documentos publicados
  const { data: documents, error: docsError } = await adminSupabase
    .from('documents')
    .select('id, title, slug, type, thumbnail_url, publication_year, language, has_markdown, document_authors!inner(author_id)')
    .eq('document_authors.author_id', author.id)
    .eq('status', 'published')
    .order('publication_year', { ascending: false })

  return {
    ...author,
    documents: documents || []
  }
})
