import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug
  const adminSupabase = useAdminSupabase()

  const { data, error } = await adminSupabase
    .from('documents')
    .select('*, authors(*), categories(*)')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Obra não encontrada'
    })
  }

  return data
})
