import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'slug')
  const supabase = useAdminSupabase()

  // Desvincular documentos antes de deletar
  await supabase
    .from('documents')
    .update({ publication_id: null })
    .eq('publication_id', id)

  const { error } = await supabase
    .from('publications')
    .delete()
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Limpar cache
  await purgeCache()

  return { success: true }
})
