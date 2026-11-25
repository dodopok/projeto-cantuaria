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

  // 2. Remover PDF e capa do Storage
  await removeDocumentFiles(adminSupabase, [doc])

  // 3. Deletar do Banco (o RLS/Cascade cuidará das tabelas pivot se configurado)
  const { error } = await adminSupabase.from('documents').delete().eq('id', id)

  if (error) throw createError({ statusCode: 500, statusMessage: 'Erro ao deletar registro' })

  // 4. Invalidação de Cache
  await purgeCache()

  return { success: true }
})
