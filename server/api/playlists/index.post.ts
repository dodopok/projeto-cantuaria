import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, slug, description, cover_url } = body

  if (!title || !slug) throw createError({ statusCode: 400, statusMessage: 'Título e slug são obrigatórios.' })

  const supabase = useAdminSupabase()

  const { data, error } = await supabase
    .from('playlists')
    .insert({ title, slug, description, cover_url })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await purgeCache()
  return data
})
