import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, slug, description, cover_url, publisher, publication_type, start_year, end_year } = body

  if (!title || !slug) throw createError({ statusCode: 400, statusMessage: 'título e slug são obrigatórios.' })

  const supabase = useAdminSupabase()

  const { data, error } = await supabase
    .from('publications')
    .insert({ title, slug, description, cover_url, publisher, publication_type, start_year, end_year })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
