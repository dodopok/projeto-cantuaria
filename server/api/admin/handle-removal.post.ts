import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = useAdminSupabase()

  const { requestId, action } = body // action: 'approve' | 'deny'

  if (!requestId || !action) {
    throw createError({ statusCode: 400, statusMessage: 'Dados incompletos' })
  }

  // 1. Buscar a solicitação para saber qual o documento
  const { data: request, error: fetchError } = await supabase
    .from('removal_requests')
    .select('document_id')
    .eq('id', requestId)
    .single()

  if (fetchError || !request) {
    throw createError({ statusCode: 404, statusMessage: 'Solicitação não encontrada' })
  }

  if (action === 'approve') {
    // APROVAR: Excluir o documento (o Cascade excluirá a solicitação também no banco real, 
    // mas aqui atualizamos o status primeiro para garantir consistência lógica se necessário)
    
    // O delete do document vai remover o registro do banco. 
    // Nota: O arquivo no Storage precisaria ser removido manualmente se não houver trigger.
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', request.document_id)

    if (deleteError) {
      throw createError({ statusCode: 500, statusMessage: 'Erro ao excluir documento' })
    }
  } else {
    // NEGAR: Apenas atualizar status da solicitação
    const { error: updateError } = await supabase
      .from('removal_requests')
      .update({ status: 'denied', resolved_at: new Date().toISOString() })
      .eq('id', requestId)

    if (updateError) {
      throw createError({ statusCode: 500, statusMessage: 'Erro ao negar solicitação' })
    }
  }

  return { success: true }
})
