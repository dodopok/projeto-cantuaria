import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = useAdminSupabase()

  const { requestId, action } = body ?? {} // action: 'approve' | 'deny'

  if (!requestId || !['approve', 'deny'].includes(action)) {
    throw createError({ statusCode: 400, statusMessage: 'Dados incompletos' })
  }

  // 1. Buscar a solicitação para saber qual o documento
  const { data: request, error: fetchError } = await supabase
    .from('removal_requests')
    .select('id, document_id, status')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    throw createError({ statusCode: 404, statusMessage: 'Solicitação não encontrada' })
  }

  const resolvedAt = new Date().toISOString()

  if (action === 'approve') {
    // Registrar a decisão ANTES de excluir o documento. Com a migração
    // 20261125_seguranca_admin.sql a FK passa a ser ON DELETE SET NULL,
    // então o pedido fica no histórico mesmo após a remoção da obra.
    await supabase
      .from('removal_requests')
      .update({ status: 'approved', resolved_at: resolvedAt })
      .eq('id', requestId)

    if (request.document_id) {
      const { data: doc } = await supabase
        .from('documents')
        .select('file_url, thumbnail_url')
        .eq('id', request.document_id)
        .maybeSingle()

      // Remover também o PDF e a capa do Storage: sem isso o arquivo continuaria público pela URL
      if (doc) await removeDocumentFiles(supabase, [doc])

      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', request.document_id)

      if (deleteError) {
        throw createError({ statusCode: 500, statusMessage: 'Erro ao excluir documento' })
      }
    }
  } else {
    // NEGAR: Apenas atualizar status da solicitação
    const { error: updateError } = await supabase
      .from('removal_requests')
      .update({ status: 'denied', resolved_at: resolvedAt })
      .eq('id', requestId)

    if (updateError) {
      throw createError({ statusCode: 500, statusMessage: 'Erro ao negar solicitação' })
    }
  }

  // 2. Invalidação de Cache
  await purgeCache()

  return { success: true }
})
