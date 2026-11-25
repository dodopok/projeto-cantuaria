/**
 * Transcrição de um documento em partes (faixas de páginas), orquestrada pelo navegador:
 *   1. /api/admin/transcription/start  → divide o PDF e cria as partes
 *   2. /api/admin/transcription/chunk  → transcreve cada parte (algumas em paralelo)
 *   3. /api/admin/transcription/finish → junta tudo e grava no documento
 * Cada chamada é curta, então não esbarra no tempo máximo das funções da Vercel,
 * e a transcrição pode ser retomada se a aba for fechada no meio.
 */
export interface TranscriptionProgress {
  doneChunks: number
  totalChunks: number
  totalPages: number | null
  pagesDone: number
  errors: number
}

interface Chunk { pageFrom: number; pageTo: number; status: string; error?: string | null }
interface State { totalPages: number | null; chunks: Chunk[] }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export const useTranscription = () => {
  const transcribe = async (
    documentId: string,
    opts: { onProgress?: (p: TranscriptionProgress) => void; concurrency?: number; restart?: boolean } = {}
  ) => {
    const concurrency = opts.concurrency ?? 3
    let state = await $fetch<State>('/api/admin/transcription/start', {
      method: 'POST',
      body: { documentId, restart: !!opts.restart }
    })

    const status = new Map<number, string>(state.chunks.map(c => [c.pageFrom, c.status]))
    const ranges = new Map<number, number>(state.chunks.map(c => [c.pageFrom, c.pageTo]))
    const failures = new Map<number, number>()

    const report = () => {
      const all = [...status.entries()]
      const done = all.filter(([, s]) => s === 'done')
      opts.onProgress?.({
        doneChunks: done.length,
        totalChunks: all.length,
        totalPages: state.totalPages,
        pagesDone: done.reduce((n, [from]) => n + ((ranges.get(from) ?? from) - from + 1), 0),
        errors: all.filter(([, s]) => s === 'error').length
      })
    }

    const applyState = (s: State) => {
      state = s
      for (const c of s.chunks) {
        ranges.set(c.pageFrom, c.pageTo)
        if (status.get(c.pageFrom) !== 'done') status.set(c.pageFrom, c.status === 'processing' ? 'pending' : c.status)
      }
    }

    const nextPending = () => [...status.entries()].find(([, s]) => s === 'pending')?.[0]

    const worker = async () => {
      while (true) {
        const pageFrom = nextPending()
        if (pageFrom === undefined) return
        status.set(pageFrom, 'processing')
        try {
          const res: any = await $fetch('/api/admin/transcription/chunk', {
            method: 'POST',
            body: { documentId, pageFrom }
          })
          if (res.status === 'split') applyState(res.state)
          else status.set(pageFrom, 'done')
        } catch (err: any) {
          const n = (failures.get(pageFrom) ?? 0) + 1
          failures.set(pageFrom, n)
          const rateLimited = err?.statusCode === 429 || err?.status === 429
          // até 3 tentativas por parte; limite de taxa espera mais
          if (n < 3) {
            await sleep(rateLimited ? 30000 : 3000 * n)
            status.set(pageFrom, 'pending')
          } else {
            status.set(pageFrom, 'error')
          }
        }
        report()
      }
    }

    report()
    await Promise.all(Array.from({ length: concurrency }, worker))

    const result: any = await $fetch('/api/admin/transcription/finish', { method: 'POST', body: { documentId } })
    return result as { complete: boolean; chars: number; missingPages: [number, number][]; extractedText: string }
  }

  return { transcribe }
}
