import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const supabase = useAdminSupabase()

  const { data: pub } = await supabase
    .from('publications')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!pub) throw createError({ statusCode: 404, statusMessage: 'Publicação não encontrada.' })

  const { data: documents } = await supabase
    .from('documents')
    .select('*, authors(*)')
    .eq('publication_id', pub.id)
    .eq('status', 'published')
    .order('publication_year', { ascending: true })
    .order('title', { ascending: true })

  return { ...pub, documents: documents || [] }
})
