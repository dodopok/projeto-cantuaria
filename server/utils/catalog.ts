import type { SupabaseClient } from '@supabase/supabase-js'

/** Endereço público do site (no servidor). */
export const PUBLIC_SITE_URL = 'https://cantuaria.caminhoanglicano.com.br'

/**
 * Busca todas as linhas, paginando de 1000 em 1000 (limite padrão do PostgREST).
 * Sem isso, sitemap e llms.txt param silenciosamente nas primeiras 1000 linhas.
 */
export const fetchAllRows = async <T = any>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>,
  pageSize = 1000
): Promise<T[]> => {
  const rows: T[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build(from, from + pageSize - 1)
    if (error) throw error
    rows.push(...(data || []))
    if (!data || data.length < pageSize) break
  }
  return rows
}

/** Escapa texto para XML. */
export const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** Data mais recente entre as informadas, em ISO. */
export const latestIso = (...dates: (string | null | undefined)[]) => {
  const ts = dates.filter(Boolean).map(d => new Date(d as string).getTime()).filter(n => !Number.isNaN(n))
  return ts.length ? new Date(Math.max(...ts)).toISOString() : undefined
}

export const publishedDocuments = (supabase: SupabaseClient, select: string) =>
  fetchAllRows((from, to) =>
    supabase.from('documents').select(select).eq('status', 'published').order('created_at', { ascending: true }).range(from, to)
  )
