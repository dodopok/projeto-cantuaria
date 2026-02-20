import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, data } = body
  const adminSupabase = useAdminSupabase()

  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do documento ausente' })

  try {
    // 1. Resolver Categoria
    let categoryId = null
    if (data.category_name) {
      const catSlug = data.category_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
      const { data: cat } = await adminSupabase.from('categories').upsert({ name: data.category_name, slug: catSlug }, { onConflict: 'slug' }).select().single()
      if (cat) categoryId = cat.id
    }

    // 2. Atualizar Documento Principal
    const { error: docError } = await adminSupabase.from('documents').update({
      title: data.title,
      slug: data.slug,
      type: data.type || 'Documento',
      summary: data.summary,
      publication_year: data.publication_year,
      language: data.language,
      thumbnail_url: data.thumbnail_url,
      category_id: categoryId,
      status: 'published',
      search_metadata: `${data.authors_list || ''} ${data.tags_list || ''}`.trim()
    }).eq('id', id)

    if (docError) throw docError

    // 3. Sincronizar Autores (Upsert em lote e Sync de Pivot)
    if (data.authors_list) {
      const authorNames = data.authors_list.split(',').map((a: string) => a.trim()).filter(Boolean)
      const authorsToUpsert = authorNames.map(name => ({
        name,
        slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
      }))

      const { data: upsertedAuthors } = await adminSupabase.from('authors').upsert(authorsToUpsert, { onConflict: 'slug' }).select()
      
      if (upsertedAuthors) {
        await adminSupabase.from('document_authors').delete().eq('document_id', id)
        const pivotRows = upsertedAuthors.map(a => ({ document_id: id, author_id: a.id }))
        await adminSupabase.from('document_authors').insert(pivotRows)
      }
    }

    // 4. Sincronizar Tags
    if (data.tags_list) {
      const tagNames = data.tags_list.split(',').map((t: string) => t.trim()).filter(Boolean)
      const tagsToUpsert = tagNames.map(name => ({
        name,
        slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
      }))

      const { data: upsertedTags } = await adminSupabase.from('tags').upsert(tagsToUpsert, { onConflict: 'slug' }).select()
      
      if (upsertedTags) {
        await adminSupabase.from('document_tags').delete().eq('document_id', id)
        const pivotRows = upsertedTags.map(t => ({ document_id: id, tag_id: t.id }))
        await adminSupabase.from('document_tags').insert(pivotRows)
      }
    }

    // 5. Invalidação de Cache (Nitro/SWR)
    // Limpamos o cache das rotas que listam documentos para que a mudança apareça na hora
    try {
      const storage = useStorage('cache')
      const keys = await storage.getKeys()
      
      // Filtramos chaves que correspondem às nossas rotas principais e APIs de listagem
      // O Nitro armazena como nitro:handlers:_:...
      const keysToPurge = keys.filter(key => 
        key.includes('handlers:_:index') || 
        key.includes('handlers:_:biblioteca') ||
        key.includes('handlers:_:api:documents') ||
        key.includes('handlers:_:api:authors') ||
        key.includes('handlers:_:api:categories')
      )

      for (const key of keysToPurge) {
        await storage.removeItem(key)
      }
      console.log(`[Cache] Invalidadas ${keysToPurge.length} chaves de cache devido à atualização de documento.`)
    } catch (cacheErr) {
      console.error('[Cache] Erro ao limpar cache:', cacheErr)
      // Não travamos a resposta se o cache falhar
    }

    return { success: true }
  } catch (error: any) {
    console.error('[API Publish] Erro:', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
