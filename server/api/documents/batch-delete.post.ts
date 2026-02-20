import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const ids = body.ids
  const adminSupabase = useAdminSupabase()

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum ID fornecido' })
  }

  // 1. Pegar informações dos documentos para limpar o storage
  const { data: docs } = await adminSupabase
    .from('documents')
    .select('file_url, thumbnail_url')
    .in('id', ids)

  if (docs && docs.length > 0) {
    const extractPath = (url: string) => url?.split('/public/')[1]?.split('?')[0]
    
    const docPaths = docs.map(d => extractPath(d.file_url)).filter(Boolean) as string[]
    const coverPaths = docs
      .filter(d => d.thumbnail_url?.includes('covers/'))
      .map(d => extractPath(d.thumbnail_url))
      .filter(Boolean) as string[]

    if (docPaths.length > 0) await adminSupabase.storage.from('documents').remove(docPaths)
    if (coverPaths.length > 0) await adminSupabase.storage.from('covers').remove(coverPaths)
  }

  // 2. Deletar do Banco
  const { error } = await adminSupabase
    .from('documents')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('[Batch Delete Error]:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao deletar registros' })
  }

  // 3. Invalidação de Cache
  await purgeCache()

  return { success: true, deletedCount: ids.length }
})
