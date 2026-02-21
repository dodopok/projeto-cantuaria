import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do documento é obrigatório' })
  }

  const adminSupabase = useAdminSupabase()

  // Incrementa o contador de visualizações usando a sintaxe de incremento do PostgreSQL via RPC ou SQL puro
  // Aqui usaremos uma abordagem direta de update para simplicidade, 
  // mas o ideal em produção seria uma function RPC para evitar race conditions.
  const { error } = await adminSupabase.rpc('increment_views', { doc_id: id })

  // Se a function RPC não existir (primeira vez), fazemos um fallback via update simples
  if (error) {
    console.warn('[View Count] RPC falhou, tentando update simples:', error.message)
    await adminSupabase
      .from('documents')
      .update({ views_count: adminSupabase.raw('views_count + 1') as any })
      .eq('id', id)
  }

  return { success: true }
})
