<template>
  <NuxtLayout>
    <!-- Header Refinado -->
    <section class="py-6 bg-cantuaria-oxford text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-[0.03] grayscale pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
      <div class="container mx-auto px-6 relative z-10">
        <h1 class="text-4xl md:text-7xl font-serif mb-6 leading-tight">Biblioteca Digital</h1>
        <p class="text-white/50 max-w-2xl font-serif italic text-base md:text-xl">
          Navegue por séculos de sabedoria e liturgia. Explore o acervo oficial da tradição anglicana em uma experiência digital imersiva.
        </p>
      </div>
    </section>

    <!-- Filtros & Conteúdo Principal -->
    <section class="py-8 bg-cantuaria-cream/50 min-h-screen relative">
      <!-- Linha de progresso de carregamento -->
      <div v-if="loading && documents.length > 0" class="absolute top-0 left-0 w-full h-0.5 bg-cantuaria-gold/10 overflow-hidden z-20">
        <div class="h-full bg-cantuaria-gold w-1/3 animate-[loading_1s_infinite_ease-in-out]"></div>
      </div>

      <div class="container mx-auto px-6 flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        <!-- Sidebar de Filtros -->
        <aside class="w-full lg:w-80 shrink-0">
          <div class="lg:sticky lg:top-28 bg-white border border-cantuaria-oxford/5 shadow-[0_10px_30px_-15px_rgba(0,33,71,0.05)] p-5 relative overflow-hidden">
            <!-- Detalhe decorativo superior em ouro -->
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cantuaria-gold/0 via-cantuaria-gold/40 to-cantuaria-gold/0"></div>
            
            <!-- Bloco de Busca -->
            <div class="space-y-2">
              <h4 class="text-[10px] uppercase tracking-[0.3em] font-bold text-cantuaria-oxford/70 border-b border-cantuaria-oxford/5 pb-2">Pesquisa Direta</h4>
              <div class="relative group">
                <input 
                  v-model="searchQuery"
                  type="text" 
                  placeholder="Título, autor, tema..." 
                  class="w-full pl-0 pr-4 py-2 bg-transparent border-b border-cantuaria-oxford/10 text-sm focus:outline-none focus:border-cantuaria-gold transition-all placeholder:text-cantuaria-charcoal/20"
                />
                <LucideSearch class="w-4 h-4 absolute right-0 top-2 text-cantuaria-oxford/20 group-focus-within:text-cantuaria-gold transition-colors" />
              </div>
            </div>

            <!-- Filtros Ativos (Categoria) -->
            <div v-if="filterCategory" class="mt-6 p-3 bg-cantuaria-gold/5 border border-cantuaria-gold/20 rounded-sm">
              <p class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-gold mb-2">Categoria Ativa</p>
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] font-serif italic text-cantuaria-oxford truncate">{{ filterCategory.replace(/-/g, ' ') }}</span>
                <button @click="filterCategory = ''" class="p-1 hover:bg-cantuaria-gold/10 rounded-full transition-colors text-cantuaria-gold" title="Remover filtro">
                  <LucideX class="w-3 h-3" />
                </button>
              </div>
            </div>

            <!-- Ordenação -->
            <div class="space-y-2 mt-6">
              <h4 class="text-[10px] uppercase tracking-[0.3em] font-bold text-cantuaria-oxford/70 border-b border-cantuaria-oxford/5 pb-2">Ordenação</h4>
              <div class="relative group">
                <select 
                  v-model="sortOption" 
                  class="w-full pl-0 pr-8 py-2 bg-transparent border-b border-cantuaria-oxford/10 text-[10px] uppercase tracking-widest font-bold text-cantuaria-oxford focus:outline-none focus:border-cantuaria-gold transition-all appearance-none cursor-pointer relative z-10"
                >
                  <option value="recent" class="text-cantuaria-oxford">Recém Adicionados</option>
                  <option value="newest" class="text-cantuaria-oxford">Mais Novos (Publicação)</option>
                  <option value="oldest" class="text-cantuaria-oxford">Mais Antigos (Publicação)</option>
                  <option value="alpha" class="text-cantuaria-oxford">Ordem Alfabética (A-Z)</option>
                  <option value="popular" class="text-cantuaria-oxford">Mais Acessados</option>
                </select>
                <LucideChevronDown class="w-3.5 h-3.5 absolute right-0 top-2 text-cantuaria-oxford/40 group-focus-within:text-cantuaria-gold transition-colors pointer-events-none z-0" />
              </div>
            </div>
            
            <!-- Filtros Mobile Toggle -->
            <button @click="showMobileFilters = !showMobileFilters" class="lg:hidden w-full mt-6 py-3 bg-cantuaria-cream/50 border border-cantuaria-oxford/10 text-cantuaria-oxford text-[10px] uppercase font-bold tracking-[0.2em] flex items-center justify-center gap-3">
              <LucideFilter class="w-4 h-4" />
              {{ showMobileFilters ? 'Ocultar Refinamentos' : 'Refinar Busca' }}
            </button>

            <div :class="['space-y-6 mt-6 lg:block', showMobileFilters ? 'block' : 'hidden']">
              <!-- Tipo de Obra -->
              <div class="space-y-4">
                <h4 class="text-[10px] uppercase tracking-[0.3em] font-bold text-cantuaria-oxford/70 border-b border-cantuaria-oxford/5 pb-2">Natureza da Obra</h4>
                <div class="grid grid-cols-1 gap-3">
                  <label v-for="type in ['Livro', 'Artigo', 'LOC', 'Documento']" :key="type" class="flex items-center gap-3 cursor-pointer group">
                    <div class="relative flex items-center justify-center">
                      <input type="checkbox" :value="type" v-model="filterTypes" class="peer appearance-none w-4 h-4 border border-cantuaria-oxford/20 checked:border-cantuaria-gold transition-all" />
                      <div class="absolute w-2 h-2 bg-cantuaria-gold scale-0 peer-checked:scale-100 transition-transform"></div>
                    </div>
                    <span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 group-hover:text-cantuaria-oxford transition-colors">{{ type }}</span>
                  </label>
                </div>
              </div>

              <div class="pt-4 border-t border-cantuaria-oxford/5">
                <NuxtLink to="/pesquisa" class="group flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-gold">
                  <span>Busca Avançada</span>
                  <LucideArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </aside>

        <!-- Grade de Documentos -->
        <div class="flex-grow">
          <!-- Estados de Carregamento e Vazio -->
          <div v-if="loading && documents.length === 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
            <DocumentSkeleton v-for="i in 6" :key="i" />
          </div>

          <div v-else-if="documents.length === 0 && !loading" class="py-32 text-center bg-white border border-cantuaria-oxford/5 shadow-sm max-w-2xl mx-auto">
            <div class="w-16 h-16 bg-cantuaria-oxford/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <LucideBookX class="w-8 h-8 text-cantuaria-oxford/20" />
            </div>
            <p class="font-serif text-2xl text-cantuaria-oxford/60 mb-4">Nenhum registro encontrado</p>
            <p class="text-sm text-cantuaria-charcoal/40 mb-8 max-w-xs mx-auto">Ajuste seus filtros ou termos de busca para explorar o acervo.</p>
            <button @click="searchQuery = ''; filterTypes = []; handleSearch()" class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-gold hover:underline">Limpar Filtros</button>
          </div>

          <div v-else class="space-y-20">
            <div :class="['grid grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-12 transition-all duration-500', loading ? 'opacity-30 blur-[2px]' : 'opacity-100 blur-0']">
              <NuxtLink v-for="doc in documents" :key="doc.id" :to="`/documento/${doc.slug}`" class="group">
                <DocumentCard :document="formatDoc(doc)" class="transition-transform duration-500 group-hover:-translate-y-2" />
              </NuxtLink>
            </div>

            <!-- Loader de Scroll Infinito -->
            <div ref="loadMoreTrigger" class="flex justify-center pt-16 border-t border-cantuaria-oxford/5 min-h-[200px]">
              <div v-if="loading" class="flex flex-col items-center gap-6">
                <div class="relative w-12 h-12">
                  <LucideLoader2 class="w-12 h-12 animate-spin text-cantuaria-oxford/10" stroke-width="1" />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-2 h-2 bg-cantuaria-gold rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p class="text-[10px] uppercase tracking-[0.4em] font-bold text-cantuaria-oxford/40">Sincronizando Acervo</p>
              </div>
              <div v-else-if="!hasMore" class="flex flex-col items-center gap-4">
                <div class="h-[1px] w-20 bg-cantuaria-oxford/10 mb-2"></div>
                <p class="text-[10px] uppercase tracking-[0.4em] font-bold text-cantuaria-oxford/20 italic text-center">
                  Fim dos Registros Disponíveis
                </p>
                <p class="text-[8px] uppercase tracking-widest text-cantuaria-gold/40">Projeto Cantuária</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { 
  Search as LucideSearch, 
  Loader2 as LucideLoader2,
  BookX as LucideBookX,
  Filter as LucideFilter,
  ArrowRight as LucideArrowRight,
  ChevronDown as LucideChevronDown,
  X as LucideX
} from 'lucide-vue-next'
import { watchDebounced, useIntersectionObserver } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const documents = ref<any[]>([])
const loading = ref(true)
const showMobileFilters = ref(false)
const searchQuery = ref(route.query.q?.toString() || '')
const filterTypes = ref<string[]>(route.query.tipo ? route.query.tipo.toString().split(',') : [])
const filterCategory = ref(route.query.categoria?.toString() || '')
const sortOption = ref(route.query.sort?.toString() || 'recent')
const page = ref(0)
const pageSize = 20
const hasMore = ref(true)
const loadMoreTrigger = ref(null)

useSeoMeta({
  title: 'Biblioteca Digital | Projeto Cantuária',
  ogTitle: 'Biblioteca Digital | Projeto Cantuária',
  description: 'Explore nosso acervo completo de livros, artigos e documentos da tradição anglicana.',
  ogDescription: 'Explore nosso acervo completo de livros, artigos e documentos da tradição anglicana.',
  ogImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000',
  twitterCard: 'summary_large_image'
})

const fetchDocuments = async (append = false) => {
  loading.value = true
  try {
    const data: any = await $fetch('/api/documents', {
      params: {
        page: page.value,
        pageSize,
        q: searchQuery.value,
        tipo: filterTypes.value.join(','),
        categoria: filterCategory.value,
        sort: sortOption.value
      }
    })
    if (append) documents.value = [...documents.value, ...data.documents]
    else documents.value = data.documents
    hasMore.value = data.hasMore
  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 0
  fetchDocuments(false)
  const query: any = { ...route.query }
  if (searchQuery.value) query.q = searchQuery.value; else delete query.q
  if (filterTypes.value.length > 0) query.tipo = filterTypes.value.join(','); else delete query.tipo
  if (filterCategory.value) query.categoria = filterCategory.value; else delete query.categoria
  if (sortOption.value !== 'recent') query.sort = sortOption.value; else delete query.sort
  router.replace({ query })
}

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  page.value++
  fetchDocuments(true)
}

const formatDoc = (doc: any) => ({
  ...doc,
  authors: doc.authors || [{ name: 'Autor Desconhecido' }],
  thumbnail_url: doc.thumbnail_url || 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000'
})

// Setup infinite scroll
useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !loading.value && hasMore.value) {
      loadMore()
    }
  },
  { rootMargin: '300px' }
)

// Live search for text input
watchDebounced(searchQuery, () => {
  handleSearch()
}, { debounce: 500 })

// Live search for filters
watch([filterTypes, sortOption, filterCategory], () => {
  handleSearch()
}, { deep: true })

onMounted(() => { 
  fetchDocuments() 
})

watch(() => route.query.q, (newQ) => { 
  if (newQ !== searchQuery.value) { 
    searchQuery.value = newQ?.toString() || ''; 
  } 
})

watch(() => route.query.categoria, (newCat) => {
  if (newCat !== filterCategory.value) {
    filterCategory.value = newCat?.toString() || ''
  }
})
</script>

<style scoped>
@keyframes loading {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
</style>
