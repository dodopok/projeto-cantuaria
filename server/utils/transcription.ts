import type { SupabaseClient } from '@supabase/supabase-js'

/** Situação das partes de uma transcrição (para o painel mostrar progresso). */
export const getTranscriptionState = async (supabase: SupabaseClient, documentId: string) => {
  const [{ data: chunks }, { data: doc }] = await Promise.all([
    supabase.from('transcription_chunks')
      .select('page_from, page_to, status, error')
      .eq('document_id', documentId)
      .order('page_from'),
    supabase.from('documents').select('page_count, transcription_status').eq('id', documentId).maybeSingle()
  ])

  return {
    documentId,
    totalPages: doc?.page_count ?? null,
    status: doc?.transcription_status ?? null,
    chunks: (chunks || []).map(c => ({ pageFrom: c.page_from, pageTo: c.page_to, status: c.status, error: c.error }))
  }
}
