import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) ?? {}
  const { title, slug, url, youtube_id, summary, thumbnail_url, publication_year, category_id, playlist_id, position, status, authors_list, tags_list } = body

  if (!title || !slug || !url || !youtube_id) {
    throw createError({ statusCode: 400, statusMessage: 'Título, slug, URL e youtube_id são obrigatórios.' })
  }

  const supabase = useAdminSupabase()

  const { data: existing } = await supabase
    .from('videos')
    .select('id, title, status')
    .eq('youtube_id', youtube_id)
    .maybeSingle()

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Este vídeo já está cadastrado como "${existing.title}" (${existing.status === 'published' ? 'publicado' : 'pendente'}).`
    })
  }

  const { data: video, error } = await supabase
    .from('videos')
    .insert({ title, slug, url, youtube_id, summary, thumbnail_url, publication_year, category_id: category_id || null, playlist_id: playlist_id || null, position: position || 0, status: status || 'pending' })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Authors
  if (authors_list) {
    await syncVideoAuthors(supabase, video.id, authors_list)
  }

  // Tags
  if (tags_list) {
    await syncVideoTags(supabase, video.id, tags_list)
  }

  await purgeCache()
  return video
})

async function syncVideoAuthors(supabase: any, videoId: string, authorsList: string) {
  const names = authorsList.split(',').map((n: string) => n.trim()).filter(Boolean)
  const authorIds: string[] = []

  for (const name of names) {
    let { data } = await supabase.from('authors').select('id').ilike('name', name).single()
    if (!data) {
      const { data: newAuthor } = await supabase.from('authors').insert({ name }).select().single()
      data = newAuthor
    }
    if (data) authorIds.push(data.id)
  }

  await supabase.from('video_authors').delete().eq('video_id', videoId)
  if (authorIds.length > 0) {
    await supabase.from('video_authors').insert(authorIds.map(aid => ({ video_id: videoId, author_id: aid })))
  }
}

async function syncVideoTags(supabase: any, videoId: string, tagsList: string) {
  const names = tagsList.split(',').map((n: string) => n.trim()).filter(Boolean)
  const tagIds: string[] = []

  for (const name of names) {
    let { data } = await supabase.from('tags').select('id').ilike('name', name).single()
    if (!data) {
      const { data: newTag } = await supabase.from('tags').insert({ name }).select().single()
      data = newTag
    }
    if (data) tagIds.push(data.id)
  }

  await supabase.from('video_tags').delete().eq('video_id', videoId)
  if (tagIds.length > 0) {
    await supabase.from('video_tags').insert(tagIds.map(tid => ({ video_id: videoId, tag_id: tid })))
  }
}
