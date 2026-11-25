import { defineEventHandler, readBody, createError } from 'h3'
import { countPdfPages, planChunks } from '../../../lib/transcription-core.mjs'

/**
 * Prepara a transcrição de um documento: conta as páginas, divide em faixas e
 * grava as partes como "pending". Se já houver partes concluídas para a mesma
 * divisão, elas são mantidas (retomada), a menos que restart=true.
 */
export default defineEventHandler(async (event) => {
  const { documentId, restart } = (await readBody(event)) ?? {}
  if (!documentId) throw createError({ statusCode: 400, statusMessage: 'documentId é obrigatório.' })

  const supabase = useAdminSupabase()
  const fileUrl = await getDocumentFileUrl(supabase, documentId)
  if (!fileUrl.toLowerCase().split('?')[0].endsWith('.pdf')) {
    throw createError({ statusCode: 400, statusMessage: 'Transcrição automática disponível apenas para PDF.' })
  }

  const bytes = await downloadDocumentPdf(fileUrl)
  const totalPages = await countPdfPages(bytes)
  const plan = planChunks(totalPages, bytes.length)

  const { data: existing } = await supabase
    .from('transcription_chunks')
    .select('page_from, page_to, status')
    .eq('document_id', documentId)

  const coversAll = (existing?.length ?? 0) > 0 &&
    Math.max(...existing!.map(c => c.page_to)) === totalPages &&
    Math.min(...existing!.map(c => c.page_from)) === 1

  if (restart || !coversAll) {
    await supabase.from('transcription_chunks').delete().eq('document_id', documentId)
    const rows = plan.map(c => ({ document_id: documentId, page_from: c.from, page_to: c.to, status: 'pending' }))
    const { error } = await supabase.from('transcription_chunks').insert(rows)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  } else {
    // Retomada: partes que ficaram "processing" (aba fechada, timeout) voltam para a fila
    await supabase.from('transcription_chunks')
      .update({ status: 'pending' })
      .eq('document_id', documentId)
      .in('status', ['processing', 'error'])
  }

  await supabase.from('documents')
    .update({ page_count: totalPages, transcription_status: 'processing' })
    .eq('id', documentId)

  return await getTranscriptionState(supabase, documentId)
})
