import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { title, slug, description, cover_url } = body

  const supabase = useAdminSupabase()

  const { data, error } = await supabase
    .from('playlists')
    .update({ title, slug, description, cover_url })
    .eq('id', id!)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await purgeCache()
  return data
})
