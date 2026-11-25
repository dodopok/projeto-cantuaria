<template>
  <div v-if="pending" class="min-h-screen flex items-center justify-center bg-cantuaria-cream">
    <LucideLoader2 class="w-12 h-12 animate-spin text-cantuaria-oxford/20" />
  </div>

  <div v-else-if="!document" class="min-h-screen flex flex-col items-center justify-center bg-cantuaria-cream p-6 text-center">
    <LucideFileWarning class="w-16 h-16 text-cantuaria-oxford/10 mb-6" />
    <h1 class="font-serif text-3xl text-cantuaria-oxford mb-4">Texto não disponível</h1>
    <NuxtLink to="/biblioteca" class="px-8 py-3 bg-cantuaria-oxford text-white rounded-sm font-bold uppercase tracking-widest text-xs">Voltar para Biblioteca</NuxtLink>
  </div>

  <article v-else class="min-h-screen bg-cantuaria-cream pb-24">
    <!-- Top Navigation / Progress Bar -->
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-cantuaria-charcoal/5 shadow-sm">
      <div class="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 truncate">
          <NuxtLink :to="`/documento/${document.slug}`" class="p-2 hover:bg-cantuaria-oxford/5 rounded-full transition-colors shrink-0" title="Voltar para detalhes">
            <LucideArrowLeft class="w-5 h-5 text-cantuaria-oxford" />
          </NuxtLink>
          <div class="flex flex-col truncate">
            <p class="font-serif text-sm md:text-base text-cantuaria-oxford truncate leading-tight">{{ document.title }}</p>
            <span class="text-[11px] uppercase tracking-widest font-bold text-cantuaria-charcoal/60">Versão integral em texto</span>
          </div>
        </div>
        
        <div class="flex items-center gap-2 shrink-0">
          <NuxtLink :to="`/documento/${document.slug}/pdf`" class="hidden sm:flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold text-cantuaria-oxford/70 hover:text-cantuaria-oxford transition-colors">
            <LucideFileDown class="w-3.5 h-3.5" /> Ver PDF
          </NuxtLink>
          <button @click="share" aria-label="Compartilhar" class="p-2 text-cantuaria-oxford/60 hover:text-cantuaria-oxford transition-colors">
            <LucideShare2 class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Text Content -->
    <main class="container mx-auto px-6 pt-12 md:pt-20">
      <div class="max-w-3xl mx-auto bg-white shadow-2xl px-5 py-10 sm:p-10 md:p-24 min-h-[80vh]">
        <!-- Title Section inside the paper -->
        <div class="mb-12 pb-10 border-b border-cantuaria-oxford/10 text-center">
          <h1 class="font-serif text-3xl md:text-5xl text-cantuaria-oxford mb-6 leading-tight">{{ document.title }}</h1>
          <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/70">
            <NuxtLink v-for="author in document.authors" :key="author.id" :to="`/autores/${author.slug}`" class="hover:text-cantuaria-gold">{{ author.name }}</NuxtLink>
            <span v-if="document.authors?.length" aria-hidden="true">•</span>
            <span>{{ document.publication_year || 'Data desconhecida' }}</span>
          </div>
        </div>

        <!-- Sobre esta obra: recolhível e fechado por padrão; o texto continua no HTML (leitores, buscadores e IAs) -->
        <details v-if="document.summary" class="sobre-obra group mb-12 bg-cantuaria-cream/60 border-l-4 border-cantuaria-gold">
          <summary class="flex items-center justify-between gap-4 cursor-pointer list-none p-5 md:px-6 min-h-[44px] text-xs uppercase tracking-[0.2em] font-bold text-cantuaria-oxford">
            <h2 class="m-0 font-sans text-xs">Sobre esta obra</h2>
            <LucideChevronDown class="w-4 h-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div class="px-5 pb-5 md:px-6 md:pb-6">
          <p class="font-serif text-lg leading-relaxed text-cantuaria-charcoal/90 whitespace-pre-line">{{ document.summary }}</p>
          <p class="mt-4 text-sm text-cantuaria-charcoal/70 leading-relaxed">
            Transcrição integral gerada por IA a partir do
            <NuxtLink :to="`/documento/${document.slug}/pdf`" class="underline underline-offset-2 hover:text-cantuaria-oxford">PDF original</NuxtLink>.
            Também disponível em <a :href="`/documento/${document.slug}/texto.md`" class="underline underline-offset-2 hover:text-cantuaria-oxford">Markdown</a>.
          </p>
          </div>
        </details>

        <!-- Rendered Markdown -->
        <div class="prose-cantuaria" v-html="renderedMarkdown"></div>

        <!-- Footer Section inside the paper -->
        <footer class="mt-20 pt-12 border-t border-cantuaria-oxford/5 text-center space-y-6">
          <div class="flex justify-center items-center gap-4">
            <div class="h-px w-12 bg-cantuaria-gold/30"></div>
            <LucideBookOpen class="w-5 h-5 text-cantuaria-gold/40" />
            <div class="h-px w-12 bg-cantuaria-gold/30"></div>
          </div>
          <p class="text-xs uppercase tracking-[0.25em] font-bold text-cantuaria-charcoal/60">Projeto Cantuária • Biblioteca Digital Anglicana</p>
          <OrdoPromo v-if="isLiturgicalWork(document)" variant="card" :slug="document.slug" class="text-left mt-10" />
        </footer>
      </div>
    </main>

    <!-- FAB Back to Top -->
    <button 
      @click="scrollToTop" 
      aria-label="Voltar ao topo"
      v-show="showScrollTop"
      class="fixed bottom-8 right-8 p-4 bg-cantuaria-oxford text-white rounded-full shadow-2xl hover:bg-cantuaria-gold transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 z-40"
    >
      <LucideChevronUp class="w-6 h-6" />
    </button>
  </article>
</template>

<script setup lang="ts">
import { 
  ArrowLeft as LucideArrowLeft, 
  Loader2 as LucideLoader2, 
  FileWarning as LucideFileWarning,
  Share2 as LucideShare2,
  FileDown as LucideFileDown,
  BookOpen as LucideBookOpen,
  ChevronUp as LucideChevronUp,
  ChevronDown as LucideChevronDown
} from 'lucide-vue-next'
import { Marked } from 'marked'

// HTML cru vindo da transcrição é exibido como texto (nunca interpretado): evita XSS armazenado
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const md = new Marked({ renderer: { html: (token: any) => escapeHtml(token.text || '') } })

// O título da página já é o <h1>; os títulos da transcrição descem um nível (h1→h2 …)
const shiftHeadings = (html: string) =>
  html.replace(/<(\/?)h([1-5])(\s|>)/g, (_m, slash, level, rest) => `<${slash}h${Number(level) + 1}${rest}`)

definePageMeta({
  layout: false
})

const route = useRoute()
const showScrollTop = ref(false)

// SSR Fetch
const { data: document, pending } = await useAsyncData(`document-text-${route.params.slug}`, () => 
  $fetch(`/api/documents/${route.params.slug}`, {
    params: { full: 'true' }
  })
)

const renderedMarkdown = computed(() => {
  if (!document.value?.content_markdown) return '<p class="text-center italic text-cantuaria-charcoal/40 py-20">Transcrição de texto não disponível para esta obra.</p>'
  return shiftHeadings(md.parse(document.value.content_markdown) as string)
})

useSeoMeta({
  title: computed(() => document.value ? `${document.value.title} (texto integral) | Projeto Cantuária` : 'Texto | Projeto Cantuária'),
  ogTitle: computed(() => document.value ? `${document.value.title} (texto integral) | Projeto Cantuária` : 'Texto | Projeto Cantuária'),
  description: computed(() => document.value?.summary?.slice(0, 300) || 'Leitura integral em texto do acervo digital.'),
  ogDescription: computed(() => document.value?.summary?.slice(0, 300) || 'Leitura integral em texto do acervo digital.'),
  ogImage: computed(() => document.value?.thumbnail_url),
  twitterCard: 'summary_large_image',
  ogType: 'article'
})

// Dados estruturados: trilha de navegação + obra (com link para o texto em Markdown)
useHead(() => {
  if (!document.value) return {}
  const d: any = document.value
  const page = `${SITE_URL}/documento/${d.slug}`
  return {
    link: [{ rel: 'alternate', type: 'text/markdown', href: `${page}/texto.md`, title: 'Texto integral em Markdown' }],
    script: [{
      type: 'application/ld+json',
      key: 'ld-texto',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Biblioteca', item: `${SITE_URL}/biblioteca` },
              { '@type': 'ListItem', position: 2, name: d.title, item: page },
              { '@type': 'ListItem', position: 3, name: 'Texto integral', item: `${page}/texto` }
            ]
          },
          {
            '@type': 'WebPage',
            '@id': `${page}/texto`,
            name: `${d.title} (texto integral)`,
            inLanguage: 'pt-BR',
            isPartOf: { '@id': `${SITE_URL}/#site` },
            about: { '@id': `${page}#obra` },
            description: d.summary || undefined
          }
        ]
      })
    }]
  }
})

const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }) }
const handleScroll = () => { showScrollTop.value = window.scrollY > 500 }
const share = () => { if (document.value && navigator.share) navigator.share({ title: document.value.title, url: window.location.href }) }

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="postcss">
.sobre-obra > summary::-webkit-details-marker { display: none; }

/* Reutilizando os estilos prose-cantuaria já definidos no componente pai para consistência */
.prose-cantuaria {
  @apply font-serif leading-relaxed text-cantuaria-charcoal;
  
  & h1 { @apply text-4xl md:text-5xl font-serif text-cantuaria-oxford mt-12 mb-8 leading-tight border-b border-cantuaria-oxford/5 pb-4; }
  & h2 { @apply text-2xl md:text-3xl font-serif text-cantuaria-oxford mt-10 mb-6 leading-tight; }
  & h3 { @apply text-xl md:text-2xl font-serif text-cantuaria-oxford mt-8 mb-4 font-bold; }
  & h4 { @apply text-lg font-serif text-cantuaria-oxford mt-6 mb-3 font-bold italic; }
  
  & p { @apply mb-6 text-lg leading-[1.75] md:text-justify hyphens-auto; }
  
  & strong { @apply font-bold text-cantuaria-oxford; }
  & em { @apply italic; }
  
  & blockquote {
    @apply border-l-4 border-cantuaria-gold pl-6 py-2 my-10 italic text-cantuaria-charcoal/70 bg-cantuaria-gold/5;
    & p { @apply mb-0; }
  }
  
  & ul { @apply list-disc list-outside ml-6 mb-6 space-y-2; }
  & ol { @apply list-decimal list-outside ml-6 mb-6 space-y-2; }
  & li { @apply pl-2 text-base md:text-lg; }
  
  & hr { @apply border-t border-cantuaria-oxford/10 my-12 w-1/3 mx-auto; }
  
  & a { @apply text-cantuaria-gold underline hover:text-cantuaria-oxford transition-colors; }
}
</style>
