import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const supabase = useAdminSupabase()
  const query = getQuery(event)

  const status = (query.status as string) || 'pending'
  const search = query.search as string | undefined
  const page = parseInt((query.page as string) || '0')
  const pageSize = parseInt((query.page_size as string) || '20')

  let q = supabase
    .from('videos')
    .select('id, title, slug, url, youtube_id, thumbnail_url, publication_year, position, status, playlist_id, category_id, views_count, created_at, playlists(title), video_authors(authors(name)), video_tags(tags(name))', { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (search) q = q.textSearch('search_vector', search, { config: 'portuguese', type: 'websearch' })

  const from = page * pageSize
  const to = from + pageSize - 1
  q = q.range(from, to)

  const { data, count, error } = await q
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { data, count }
})
