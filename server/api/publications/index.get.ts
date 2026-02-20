import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  const supabase = useAdminSupabase()

  const { data } = await supabase
    .from('publications')
    .select('*, documents(count)')
    .order('start_year', { ascending: false, nullsFirst: false })
    .order('title', { ascending: true })

  return (data || []).map((pub: any) => ({
    ...pub,
    document_count: pub.documents?.[0]?.count ?? 0,
    documents: undefined
  }))
})
