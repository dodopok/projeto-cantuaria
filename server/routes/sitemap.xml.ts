export default defineEventHandler(async (event) => {
  // Usamos o cliente admin para garantir que buscamos todos os registros ignorando RLS
  const client = useAdminSupabase()
  const baseUrl = 'https://cantuaria.caminhoanglicano.com.br'

  // 1. Buscar slugs de documentos, publicações e autores
  const [
    { data: docs, error: docsErr }, 
    { data: pubs, error: pubsErr }, 
    { data: authors, error: authorsErr }
  ] = await Promise.all([
    client.from('documents').select('slug, created_at').eq('status', 'published'),
    client.from('publications').select('slug, created_at'),
    client.from('authors').select('slug, created_at')
  ])

  if (docsErr) console.error('Sitemap Error (Docs):', docsErr)
  if (pubsErr) console.error('Sitemap Error (Pubs):', pubsErr)
  if (authorsErr) console.error('Sitemap Error (Authors):', authorsErr)

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    // Páginas Estáticas
    `  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>`,
    `  <url><loc>${baseUrl}/biblioteca</loc><priority>0.9</priority></url>`,
    `  <url><loc>${baseUrl}/autores</loc><priority>0.8</priority></url>`,
    `  <url><loc>${baseUrl}/categorias</loc><priority>0.8</priority></url>`,
    `  <url><loc>${baseUrl}/publicacoes</loc><priority>0.8</priority></url>`,
    `  <url><loc>${baseUrl}/contribuir</loc><priority>0.7</priority></url>`
  ]

  // 2. Adicionar Publicações
  pubs?.forEach(pub => {
    const lastMod = pub.created_at ? new Date(pub.created_at).toISOString() : new Date().toISOString()
    sitemap.push(`  <url><loc>${baseUrl}/publicacao/${pub.slug}</loc><lastmod>${lastMod}</lastmod><priority>0.7</priority></url>`)
  })

  // 3. Adicionar Autores
  authors?.forEach(author => {
    const lastMod = author.created_at ? new Date(author.created_at).toISOString() : new Date().toISOString()
    sitemap.push(`  <url><loc>${baseUrl}/autores/${author.slug}</loc><lastmod>${lastMod}</lastmod><priority>0.6</priority></url>`)
  })

  // 4. Adicionar Documentos (Landing, Texto e PDF)
  docs?.forEach(doc => {
    const lastMod = doc.created_at ? new Date(doc.created_at).toISOString() : new Date().toISOString()
    // Landing page da obra
    sitemap.push(`  <url><loc>${baseUrl}/documento/${doc.slug}</loc><lastmod>${lastMod}</lastmod><priority>0.8</priority></url>`)
    // Versão em Texto
    sitemap.push(`  <url><loc>${baseUrl}/documento/${doc.slug}/texto</loc><lastmod>${lastMod}</lastmod><priority>0.7</priority></url>`)
    // Versão PDF
    sitemap.push(`  <url><loc>${baseUrl}/documento/${doc.slug}/pdf</loc><lastmod>${lastMod}</lastmod><priority>0.5</priority></url>`)
  })

  sitemap.push('</urlset>')

  // Configura o header como XML
  event.node.res.setHeader('Content-Type', 'application/xml')
  return sitemap.join('\n')
})
