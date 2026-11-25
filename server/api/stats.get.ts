/** Números do acervo para a home (renderizados no servidor, com cache de 10 min). */
export default defineEventHandler(async () => {
  const supabase = useAdminSupabase()
  const [docs, transcribed, authors, categories] = await Promise.all([
    supabase.from('documents').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('documents').select('id', { count: 'exact', head: true }).eq('status', 'published').not('content_markdown', 'is', null),
    supabase.from('authors').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true })
  ])
  return {
    documents: docs.count ?? 0,
    transcribed: transcribed.count ?? 0,
    authors: authors.count ?? 0,
    categories: categories.count ?? 0
  }
})
