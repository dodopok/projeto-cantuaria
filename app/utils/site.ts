/** Endereço público do site (canonical, sitemap, JSON-LD). */
export const SITE_URL = 'https://cantuaria.caminhoanglicano.com.br'
export const SITE_NAME = 'Projeto Cantuária'
export const SITE_DESCRIPTION = 'Biblioteca digital pública da produção litúrgica, teológica e histórica anglicana em língua portuguesa: livros, Livros de Oração Comum, artigos, periódicos e documentos históricos, com transcrição integral.'

/** Ordo: app de Ofício Diário do ecossistema Caminho Anglicano. */
export const ORDO = {
  site: 'https://www.oficio.app/',
  web: 'https://web.oficio.app/',
  appStore: 'https://apps.apple.com/br/app/ordo-of%C3%ADcio-di%C3%A1rio/id6756016908',
  googlePlay: 'https://play.google.com/store/apps/details?id=br.com.caminhoanglicano.ordo',
  oficioDiario: 'https://www.oficio.app/oficio-diario',
  guiaLoc: 'https://www.oficio.app/guias/livro-de-oracao-comum',
  appLoc: 'https://www.oficio.app/app-livro-de-oracao-comum'
}

/**
 * Livros de Oração do acervo que existem no Ordo (página do livro no Ordo web).
 * Só entram correspondências confirmadas; obras sem par usam o link geral do Ordo.
 */
const ORDO_BOOKS: Record<string, { id: string; label: string }> = {
  'livro-de-oracao-comum-ieab-2021-2015-86vj': { id: 'loc_2015', label: 'LOC IEAB 2015' },
  'livro-de-oracao-comum-brasileiro-2008-6s6e': { id: 'locb_2008', label: 'LOCb 2008' },
  'the-book-of-common-prayer-1662-go2k': { id: 'loc_1662_en', label: 'Book of Common Prayer 1662' },
  'the-book-of-common-prayer-tec-1979-gofo': { id: 'loc_1979_en', label: 'BCP 1979 (TEC)' },
  'the-book-of-common-prayer-canada-1962-eonh': { id: 'loc_1962_en', label: 'BCP canadense 1962' },
  'the-book-of-common-prayer-acna-2019-rer7': { id: 'loc_2019_en', label: 'BCP 2019 (ACNA)' }
}

/** Link do Ordo mais específico para uma obra (livro no Ordo, se houver). */
export const ordoBookFor = (slug?: string | null) => {
  const book = slug ? ORDO_BOOKS[slug] : undefined
  return book ? { url: `${ORDO.web}livros-de-oracao/${book.id}`, label: book.label } : null
}

/** Obras litúrgicas: onde faz sentido convidar para orar o Ofício Diário. */
export const isLiturgicalWork = (doc: { type?: string | null; title?: string | null; categories?: { name?: string } | null }) =>
  doc?.type === 'LOC' ||
  /ora[cç][aã]o comum|common prayer|of[ií]cio di[aá]rio|liturgi/i.test(`${doc?.title || ''} ${doc?.categories?.name || ''}`)
