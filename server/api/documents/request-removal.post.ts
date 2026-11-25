import { defineEventHandler, readBody, createError } from 'h3'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = useAdminSupabase()

  const documentId = String(body?.documentId ?? '').trim()
  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const reason = String(body?.reason ?? '').trim()

  if (!documentId || !name || !email || !reason) {
    throw createError({ statusCode: 400, statusMessage: 'Todos os campos são obrigatórios' })
  }
  if (!UUID_RE.test(documentId) || !EMAIL_RE.test(email) || name.length > 200 || email.length > 320 || reason.length > 5000) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }

  // Só aceita pedidos para obras publicadas
  const { data: doc } = await supabase
    .from('documents')
    .select('id')
    .eq('id', documentId)
    .eq('status', 'published')
    .maybeSingle()

  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Obra não encontrada' })
  }

  // Evita spam: um pedido pendente por e-mail e obra
  const { data: existing } = await supabase
    .from('removal_requests')
    .select('id')
    .eq('document_id', documentId)
    .eq('requester_email', email)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return { success: true, message: 'Solicitação já registrada' }
  }

  const { error } = await supabase
    .from('removal_requests')
    .insert([
      {
        document_id: documentId,
        requester_name: name,
        requester_email: email,
        reason,
        status: 'pending'
      }
    ])

  if (error) {
    console.error('[Removal Request Error]:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao enviar solicitação'
    })
  }

  return { success: true, message: 'Solicitação enviada com sucesso' }
})
