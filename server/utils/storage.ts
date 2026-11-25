import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Converte a URL pública do Storage no caminho do objeto dentro do bucket.
 * Ex.: https://x.supabase.co/storage/v1/object/public/documents/uploads/a.pdf
 *      → bucket "documents", caminho "uploads/a.pdf"
 * Retorna null se a URL não for deste bucket (ex.: capa externa, data: URL).
 */
export const storagePathFromPublicUrl = (url: string | null | undefined, bucket: string): string | null => {
  if (!url) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const path = url.slice(idx + marker.length).split('?')[0]
  return path ? decodeURIComponent(path) : null
}

/** true se a URL aponta para um arquivo público do nosso projeto Supabase. */
export const isOwnStorageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false
  const base = process.env.SUPABASE_URL
  if (!base) return false
  try {
    const u = new URL(url)
    return u.origin === new URL(base).origin && u.pathname.startsWith('/storage/v1/object/public/')
  } catch {
    return false
  }
}

/** Remove do Storage o PDF e a capa (quando hospedada no bucket covers) dos documentos informados. */
export const removeDocumentFiles = async (
  supabase: SupabaseClient,
  docs: { file_url?: string | null; thumbnail_url?: string | null }[]
) => {
  const docPaths = docs.map(d => storagePathFromPublicUrl(d.file_url, 'documents')).filter(Boolean) as string[]
  const coverPaths = docs.map(d => storagePathFromPublicUrl(d.thumbnail_url, 'covers')).filter(Boolean) as string[]

  if (docPaths.length) {
    const { error } = await supabase.storage.from('documents').remove(docPaths)
    if (error) console.error('[Storage] Erro ao remover PDFs:', error.message)
  }
  if (coverPaths.length) {
    const { error } = await supabase.storage.from('covers').remove(coverPaths)
    if (error) console.error('[Storage] Erro ao remover capas:', error.message)
  }
}

/**
 * Busca a URL do arquivo de um documento no banco (nunca confiar na URL enviada pelo cliente)
 * e garante que ela aponta para o nosso Storage.
 */
export const getDocumentFileUrl = async (supabase: SupabaseClient, documentId: string): Promise<string> => {
  const { data } = await supabase.from('documents').select('file_url').eq('id', documentId).maybeSingle()
  if (!data?.file_url) {
    throw createError({ statusCode: 404, statusMessage: 'Documento ou arquivo não encontrado.' })
  }
  if (!isOwnStorageUrl(data.file_url)) {
    throw createError({ statusCode: 400, statusMessage: 'O arquivo do documento não está no Storage do projeto.' })
  }
  return data.file_url
}
