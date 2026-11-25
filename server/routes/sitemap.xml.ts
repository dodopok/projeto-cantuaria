/**
 * Sitemap dinâmico.
 * - Pagina as consultas (antes parava nas primeiras 1000 linhas do PostgREST).
 * - Inclui /texto só quando a obra tem transcrição; não inclui o visualizador /pdf
 *   (página sem conteúdo próprio, marcada como noindex).
 * - lastmod usa a data da transcrição quando houver.
 * - Inclui as capas (image sitemap), que ajudam na busca por imagens.
 */
export default defineEventHandler(async (event) => {
  const client = useAdminSupabase()
  const base = PUBLIC_SITE_URL

  const [docs, pubs, authors, videos] = await Promise.all([
    // transcribed_at vem da migração de transcrição; sem ela, cai para created_at
    publishedDocuments(client, 'slug, title, created_at, transcribed_at, thumbnail_url, has_markdown')
      .catch(() => publishedDocuments(client, 'slug, title, created_at, thumbnail_url, has_markdown')),
    fetchAllRows((f, t) => client.from('publications').select('slug, created_at').range(f, t)),
    fetchAllRows((f, t) => client.from('authors').select('slug, created_at, document_authors!inner(document_id)').range(f, t)),
    fetchAllRows((f, t) => client.from('videos').select('slug, created_at').eq('status', 'published').range(f, t))
  ]).catch((err) => {
    console.error('[Sitemap] Erro:', err?.message || err)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao gerar sitemap' })
  })

  const url = (loc: string, opts: { lastmod?: string; priority?: string; image?: { loc: string; title: string } } = {}) =>
    [
      '  <url>',
      `    <loc>${xmlEscape(loc)}</loc>`,
      opts.lastmod ? `    <lastmod>${opts.lastmod}</lastmod>` : '',
      opts.priority ? `    <priority>${opts.priority}</priority>` : '',
      opts.image ? `    <image:image><image:loc>${xmlEscape(opts.image.loc)}</image:loc><image:title>${xmlEscape(opts.image.title)}</image:title></image:image>` : '',
      '  </url>'
    ].filter(Boolean).join('\n')

  const out: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    url(`${base}/`, { priority: '1.0' }),
    url(`${base}/biblioteca`, { priority: '0.9' }),
    url(`${base}/autores`, { priority: '0.8' }),
    url(`${base}/categorias`, { priority: '0.8' }),
    url(`${base}/publicacoes`, { priority: '0.8' }),
    url(`${base}/videos`, { priority: '0.7' }),
    url(`${base}/contribuir`, { priority: '0.5' })
  ]

  for (const pub of pubs as any[]) out.push(url(`${base}/publicacao/${pub.slug}`, { lastmod: latestIso(pub.created_at), priority: '0.7' }))

  // Só autores com ao menos uma obra (o inner join acima filtra os demais)
  const seenAuthors = new Set<string>()
  for (const a of authors as any[]) {
    if (seenAuthors.has(a.slug)) continue
    seenAuthors.add(a.slug)
    out.push(url(`${base}/autores/${a.slug}`, { lastmod: latestIso(a.created_at), priority: '0.6' }))
  }

  for (const doc of docs as any[]) {
    const lastmod = latestIso(doc.created_at, doc.transcribed_at)
    const isOwnCover = typeof doc.thumbnail_url === 'string' && doc.thumbnail_url.startsWith('http')
    out.push(url(`${base}/documento/${doc.slug}`, {
      lastmod,
      priority: '0.8',
      image: isOwnCover ? { loc: doc.thumbnail_url, title: doc.title } : undefined
    }))
    if (doc.has_markdown) out.push(url(`${base}/documento/${doc.slug}/texto`, { lastmod, priority: '0.7' }))
  }

  for (const v of videos as any[]) out.push(url(`${base}/videos/${v.slug}`, { lastmod: latestIso(v.created_at), priority: '0.6' }))

  out.push('</urlset>')

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return out.join('\n')
})
