import { getQuery } from 'h3'

export default defineCachedEventHandler(async (event) => {
  const supabase = useAdminSupabase()
  const query = getQuery(event)

  const playlistId = query.playlist_id as string | undefined
  const search = query.search as string | undefined
  const page = parseInt((query.page as string) || '0')
  const pageSize = parseInt((query.page_size as string) || '20')

  let q = supabase
    .from('videos')
    .select('id, title, slug, url, youtube_id, summary, thumbnail_url, publication_year, position, status, created_at, playlist_id, category_id, playlists(id, title, slug), categories(name), video_authors(authors(id, name)), video_tags(tags(id, name))', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (playlistId) q = q.eq('playlist_id', playlistId).order('position', { ascending: true })
  if (search) q = q.textSearch('search_vector', search, { config: 'portuguese', type: 'websearch' })

  const from = page * pageSize
  const to = from + pageSize - 1
  q = q.range(from, to)

  const { data, count, error } = await q
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { data, count }
}, {
  maxAge: 60,
  getKey: (event) => {
    const q = getQuery(event)
    return `videos:${q.playlist_id || ''}:${q.search || ''}:${q.page || 0}:${q.page_size || 20}`
  }
})
