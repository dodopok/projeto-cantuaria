export default defineCachedEventHandler(async () => {
  const supabase = useAdminSupabase()

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
}, {
  maxAge: 60,
  getKey: () => 'playlists:all'
})
