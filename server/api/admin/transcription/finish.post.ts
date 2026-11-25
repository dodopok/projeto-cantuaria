import { defineEventHandler, readBody, createError } from 'h3'
import { joinChunks, markdownToPlainText } from '../../../lib/transcription-core.mjs'

/** Junta as partes concluídas e grava a transcrição integral no documento. */
export default defineEventHandler(async (event) => {
  const { documentId } = (await readBody(event)) ?? {}
  if (!documentId) throw createError({ statusCode: 400, statusMessage: 'documentId é obrigatório.' })

  const supabase = useAdminSupabase()
  const { data: chunks, error } = await supabase
    .from('transcription_chunks')
    .select('page_from, page_to, status, markdown, model')
    .eq('document_id', documentId)
    .order('page_from')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!chunks?.length) throw createError({ statusCode: 400, statusMessage: 'Nenhuma parte transcrita.' })

  const done = chunks.filter(c => c.status === 'done')
  const complete = done.length === chunks.length
  const markdown = joinChunks(done)
  const models = [...new Set(done.map(c => c.model).filter(Boolean))].join(', ')

  const { error: updateError } = await supabase.from('documents').update({
    content_markdown: markdown || null,
    transcription_status: complete ? 'complete' : 'partial',
    transcription_model: models || null,
    transcribed_at: new Date().toISOString()
  }).eq('id', documentId)
  if (updateError) throw createError({ statusCode: 500, statusMessage: updateError.message })

  // Partes concluídas não são mais necessárias (o texto está no documento)
  if (complete) await supabase.from('transcription_chunks').delete().eq('document_id', documentId)

  await purgeCache()

  return {
    complete,
    chars: markdown.length,
    missingPages: chunks.filter(c => c.status !== 'done').map(c => [c.page_from, c.page_to]),
    // Amostra em texto puro para a análise de metadados
    extractedText: markdownToPlainText(markdown).slice(0, 15000)
  }
})
