import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const supabase = useAdminSupabase()

  // Buscamos apenas as solicitações que ainda não foram resolvidas (pendentes)
  const { data, error } = await supabase
    .from('removal_requests')
    .select('*, documents(id, title, slug, file_url)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar solicitações de remoção'
    })
  }

  return data
})
