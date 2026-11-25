/**
 * /documento/{slug}/texto.md — texto integral da obra em Markdown, com cabeçalho de
 * metadados. Formato leve para assistentes de IA e leitores de tela; a página HTML
 * correspondente é /documento/{slug}/texto.
 */
export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').toLowerCase()
  const supabase = useAdminSupabase()

  const { data: doc } = await supabase
    .from('documents')
    .select('title, slug, summary, type, language, publication_year, content_markdown, authors(name), categories(name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!doc?.content_markdown) {
    throw createError({ statusCode: 404, statusMessage: 'Transcrição não encontrada' })
  }

  const d: any = doc
  const page = `${PUBLIC_SITE_URL}/documento/${d.slug}`
  const header = [
    `# ${d.title}`,
    '',
    d.authors?.length ? `- Autor(es): ${d.authors.map((a: any) => a.name).join(', ')}` : null,
    d.publication_year ? `- Ano: ${d.publication_year}` : null,
    d.type ? `- Tipo: ${d.type}` : null,
    d.categories?.name ? `- Categoria: ${d.categories.name}` : null,
    d.language ? `- Idioma: ${d.language}` : null,
    `- Fonte: Projeto Cantuária — Biblioteca Digital Anglicana (${page})`,
    '- Transcrição integral gerada por IA a partir do PDF original; em caso de dúvida, consulte o PDF.',
    d.summary ? `\n## Resumo\n\n${d.summary.trim()}` : null,
    '',
    '---',
    ''
  ].filter((l) => l !== null).join('\n')

  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
  setHeader(event, 'Link', `<${page}/texto>; rel="canonical"`)
  return `${header}\n${d.content_markdown.trim()}\n`
})
