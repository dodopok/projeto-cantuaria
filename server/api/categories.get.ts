import { defineEventHandler } from 'h3'
export default defineEventHandler(async () => {
  const supabase = useAdminSupabase()
  const { data } = await supabase.from('categories').select('*').order('name')
  return data || []
})
