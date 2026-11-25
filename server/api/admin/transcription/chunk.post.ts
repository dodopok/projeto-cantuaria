import { defineEventHandler, readBody, createError } from 'h3'
import { extractPdfPages, transcribePdfRange } from '../../../lib/transcription-core.mjs'

/**
 * Transcreve UMA parte (faixa de páginas). Chamado em sequência pelo painel.
 * Se a resposta do modelo for cortada pelo limite de saída, a parte é dividida
 * ao meio e as duas metades voltam para a fila.
 */
export default defineEventHandler(async (event) => {
  const { documentId, pageFrom, model } = (await readBody(event)) ?? {}
  if (!documentId || !pageFrom) throw createError({ statusCode: 400, statusMessage: 'documentId e pageFrom são obrigatórios.' })

  const supabase = useAdminSupabase()
  const claude = useClaudeConfig()

  const { data: chunk } = await supabase
    .from('transcription_chunks')
    .select('id, page_from, page_to, attempts')
    .eq('document_id', documentId)
    .eq('page_from', pageFrom)
    .maybeSingle()
  if (!chunk) throw createError({ statusCode: 404, statusMessage: 'Parte não encontrada. Reinicie a transcrição.' })

  const { data: doc } = await supabase.from('documents').select('title, page_count').eq('id', documentId).single()
  await supabase.from('transcription_chunks')
    .update({ status: 'processing', attempts: chunk.attempts + 1, updated_at: new Date().toISOString() })
    .eq('id', chunk.id)

  try {
    const fileUrl = await getDocumentFileUrl(supabase, documentId)
    const bytes = await downloadDocumentPdf(fileUrl)
    const part = await extractPdfPages(bytes, chunk.page_from, chunk.page_to)

    const result = await transcribePdfRange({
      apiKey: claude.apiKey,
      model: model || claude.ocrModel,
      pdfBytes: part,
      from: chunk.page_from,
      to: chunk.page_to,
      totalPages: doc?.page_count ?? chunk.page_to,
      title: doc?.title
    })

    if (result.truncated && chunk.page_to > chunk.page_from) {
      const mid = Math.floor((chunk.page_from + chunk.page_to) / 2)
      await supabase.from('transcription_chunks')
        .update({ page_to: mid, status: 'pending', markdown: null, updated_at: new Date().toISOString() })
        .eq('id', chunk.id)
      await supabase.from('transcription_chunks')
        .insert({ document_id: documentId, page_from: mid + 1, page_to: chunk.page_to, status: 'pending' })
      return { status: 'split', state: await getTranscriptionState(supabase, documentId) }
    }

    await supabase.from('transcription_chunks').update({
      status: 'done',
      markdown: result.truncated ? `${result.markdown}\n\n[transcrição incompleta nesta página]` : result.markdown,
      model: result.model,
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      error: null,
      updated_at: new Date().toISOString()
    }).eq('id', chunk.id)

    return { status: 'done', chars: result.markdown.length, inputTokens: result.inputTokens, outputTokens: result.outputTokens }
  } catch (err: any) {
    await supabase.from('transcription_chunks')
      .update({ status: 'error', error: String(err?.message || err).slice(0, 500), updated_at: new Date().toISOString() })
      .eq('id', chunk.id)
    throw createError({ statusCode: err?.status === 429 ? 429 : 500, statusMessage: err?.message || 'Erro ao transcrever parte.' })
  }
})
