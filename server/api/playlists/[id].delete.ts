import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const supabase = useAdminSupabase()

  const { error } = await supabase.from('playlists').delete().eq('id', id!)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await purgeCache()
  return { success: true }
})
