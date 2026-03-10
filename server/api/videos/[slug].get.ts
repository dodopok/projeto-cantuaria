import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const supabase = useAdminSupabase()

  const { data, error } = await supabase
    .from('videos')
    .select('*, playlists(id, title, slug), categories(name), video_authors(authors(id, name)), video_tags(tags(id, name))')
    .eq('slug', slug!)
    .eq('status', 'published')
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Vídeo não encontrado.' })

  // Incrementa views_count de forma assíncrona (fire-and-forget)
  supabase.from('videos').update({ views_count: (data.views_count || 0) + 1 }).eq('id', data.id).then(() => {})

  return data
})
