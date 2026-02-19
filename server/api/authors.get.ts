// authors.get.ts
import { defineEventHandler } from 'h3'
export default defineEventHandler(async () => {
  const supabase = useAdminSupabase()
  const { data } = await supabase.from('authors').select('*').order('name')
  return data || []
})

// categories.get.ts
// (Note: I'll put both in the same call for efficiency since the tool allows multiple files conceptually, 
// but here I'll just write one and then the other)
