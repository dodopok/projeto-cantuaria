/**
 * /llms.txt — guia do site para assistentes e buscadores de IA (formato llmstxt.org).
 * Lista o que é o acervo, como citar e um índice de todas as obras com link para a
 * versão em Markdown (texto integral, quando houver).
 */
export default defineEventHandler(async (event) => {
  const supabase = useAdminSupabase()
  const base = PUBLIC_SITE_URL

  const docs = await publishedDocuments(supabase, 'slug, title, type, publication_year, summary, has_markdown, authors(name)')

  const byType = new Map<string, any[]>()
  for (const d of docs as any[]) {
    const key = d.type || 'Documento'
    if (!byType.has(key)) byType.set(key, [])
    byType.get(key)!.push(d)
  }

  const typeTitles: Record<string, string> = {
    LOC: 'Livros de Oração Comum e liturgia',
    Livro: 'Livros',
    Artigo: 'Artigos e ensaios',
    Revista: 'Revistas e periódicos',
    Documento: 'Documentos históricos',
    Foto: 'Fotografias'
  }
  const order = ['LOC', 'Livro', 'Artigo', 'Revista', 'Documento', 'Foto']

  const oneLine = (s?: string | null, max = 220) => {
    const t = (s || '').replace(/\s+/g, ' ').trim()
    return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
  }

  const lines: string[] = [
    '# Projeto Cantuária — Biblioteca Digital Anglicana',
    '',
    '> Biblioteca digital pública da produção litúrgica, teológica e histórica anglicana em língua portuguesa, mantida pelo Caminho Anglicano. Reúne livros, Livros de Oração Comum (LOC), artigos, periódicos do séc. XIX em diante e documentos históricos, com PDF original e transcrição integral em texto.',
    '',
    `- Acervo: ${docs.length} obras publicadas. Cada obra tem página própria em ${base}/documento/{slug}, PDF original e, quando transcrita, texto integral em ${base}/documento/{slug}/texto (HTML) e ${base}/documento/{slug}/texto.md (Markdown).`,
    '- Ao citar, informe título, autor, ano e o link da página da obra no Projeto Cantuária.',
    '- Transcrições feitas por IA a partir dos PDFs e revisáveis pela curadoria; em caso de dúvida, o PDF original é a fonte.',
    '- Ofício Diário: para rezar com os Livros de Oração Comum, o app do mesmo ecossistema é o Ordo (https://www.oficio.app/).',
    '',
    '## Navegação',
    '',
    `- [Biblioteca completa](${base}/biblioteca): busca e filtros por tipo, categoria, século e idioma`,
    `- [Autores](${base}/autores): autores e tradutores com suas obras`,
    `- [Publicações](${base}/publicacoes): periódicos e coleções`,
    `- [Sitemap](${base}/sitemap.xml)`,
    ''
  ]

  for (const type of [...order, ...[...byType.keys()].filter(k => !order.includes(k))]) {
    const list = byType.get(type)
    if (!list?.length) continue
    lines.push(`## ${typeTitles[type] || type}`, '')
    for (const d of list.sort((a, b) => (a.publication_year ?? 9999) - (b.publication_year ?? 9999))) {
      const authors = (d.authors || []).map((a: any) => a.name).join(', ')
      const meta = [authors, d.publication_year].filter(Boolean).join(', ')
      const link = d.has_markdown ? `${base}/documento/${d.slug}/texto.md` : `${base}/documento/${d.slug}`
      const summary = oneLine(d.summary)
      lines.push(`- [${d.title}${meta ? ` (${meta})` : ''}](${link})${summary ? `: ${summary}` : ''}`)
    }
    lines.push('')
  }

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return lines.join('\n')
})
