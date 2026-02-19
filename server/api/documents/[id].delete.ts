import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const adminSupabase = useAdminSupabase()

  // 1. Pegar informações do documento para saber o caminho do arquivo
  const { data: doc } = await adminSupabase
    .from('documents')
    .select('file_url, thumbnail_url')
    .eq('id', id)
    .single()

  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Documento não encontrado' })

  // 2. Tentar deletar arquivos do Storage se forem do nosso bucket
  const extractPath = (url: string) => url?.split('/public/')[1]?.split('?')[0]
  
  if (doc.file_url) {
    const filePath = extractPath(doc.file_url)
    if (filePath) await adminSupabase.storage.from('documents').remove([filePath])
  }
  
  if (doc.thumbnail_url && doc.thumbnail_url.includes('covers/')) {
    const coverPath = extractPath(doc.thumbnail_url)
    if (coverPath) await adminSupabase.storage.from('covers').remove([coverPath])
  }

  // 3. Deletar do Banco (o RLS/Cascade cuidará das tabelas pivot se configurado)
  const { error } = await adminSupabase.from('documents').delete().eq('id', id)

  if (error) throw createError({ statusCode: 500, statusMessage: 'Erro ao deletar registro' })

  return { success: true }
})
