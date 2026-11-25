import { defineEventHandler, readBody, createError } from 'h3'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = String(body?.id ?? '')

  if (!UUID_RE.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID do documento é obrigatório' })
  }

  // Incremento atômico via função SQL public.increment_views (só conta obras publicadas)
  const { error } = await useAdminSupabase().rpc('increment_views', { doc_id: id })
  if (error) console.warn('[View Count] Falha ao incrementar:', error.message)

  return { success: true }
})
