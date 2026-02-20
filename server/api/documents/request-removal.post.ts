import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = useAdminSupabase()

  const { documentId, name, email, reason } = body

  if (!documentId || !name || !email || !reason) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Todos os campos são obrigatórios'
    })
  }

  const { data, error } = await supabase
    .from('removal_requests')
    .insert([
      {
        document_id: documentId,
        requester_name: name,
        requester_email: email,
        reason: reason,
        status: 'pending'
      }
    ])
    .select()

  if (error) {
    console.error('[Removal Request Error]:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao enviar solicitação'
    })
  }

  return { success: true, message: 'Solicitação enviada com sucesso' }
})
