import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const supabase = useAdminSupabase()

  const { data: video } = await supabase.from('videos').select('id').eq('slug', slug!).single()
  if (!video) throw createError({ statusCode: 404, statusMessage: 'Vídeo não encontrado.' })

  const { error } = await supabase.from('videos').delete().eq('id', video.id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await purgeCache()
  return { success: true }
})
