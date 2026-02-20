<template>
  <NuxtLayout>
    <div v-if="pendingInitial && documents.length === 0" class="min-h-screen flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <LucideLoader2 class="w-12 h-12 animate-spin text-cantuaria-oxford/20" stroke-width="1" />
        <p class="text-[10px] uppercase tracking-[0.3em] font-bold text-cantuaria-oxford/40">Iniciando Acervo</p>
      </div>
    </div>

    <div v-else-if="!publication && !pendingInitial" class="min-h-screen flex flex-col items-center justify-center gap-6">
      <LucideBookX class="w-16 h-16 text-cantuaria-oxford/10" />
      <p class="font-serif text-3xl text-cantuaria-oxford/60">Publicação não encontrada</p>
      <NuxtLink to="/publicacoes" class="btn-primary py-3 px-8 text-xs uppercase tracking-widest">Ver todas as publicações</NuxtLink>
    </div>

    <template v-else-if="publication">
      <!-- Hero da publicação -->
      <section class="bg-cantuaria-oxford text-white py-6 relative overflow-hidden">
        <!-- Textura de fundo sutil -->
        <div class="absolute inset-0 opacity-[0.03] grayscale pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
        
        <div class="container mx-auto px-6 relative z-10">
          <NuxtLink to="/publicacoes" class="inline-flex items-center gap-2 text-white/30 hover:text-white/70 text-[10px] uppercase tracking-[0.2em] font-bold transition-all mb-12 hover:-translate-x-1">
            <LucideChevronLeft class="w-4 h-4" />
            Voltar para Coleções
          </NuxtLink>

          <div class="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            <!-- Capa -->
            <div class="shrink-0 group relative">
              <div v-if="publication.cover_url" class="w-40 md:w-56 aspect-[3/4.5] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-[1.02]">
                <img :src="publication.cover_url" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-40 md:w-56 aspect-[3/4.5] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                <LucideNewspaper class="w-16 h-16 text-white/10" />
              </div>
              <!-- Brilho na borda -->
              <div class="absolute inset-0 border border-white/20 pointer-events-none"></div>
            </div>

            <!-- Metadados -->
            <div class="space-y-6 max-w-3xl">
              <div class="flex items-center gap-4">
                <span class="text-[9px] uppercase tracking-[0.4em] font-bold text-cantuaria-gold bg-cantuaria-gold/10 border border-cantuaria-gold/20 px-3 py-1.5">
                  {{ publication.publication_type || 'Coleção' }}
                </span>
                <span v-if="publication.start_year" class="text-xs uppercase tracking-[0.2em] font-medium text-white/40 font-sans">
                  {{ publication.start_year }}{{ publication.end_year && publication.end_year !== publication.start_year ? `–${publication.end_year}` : '' }}
                </span>
              </div>
              <h1 class="text-4xl md:text-6xl font-serif leading-[1.1] text-white selection:bg-cantuaria-gold/30">{{ publication.title }}</h1>
              <p v-if="publication.publisher" class="text-cantuaria-gold/60 text-sm font-sans uppercase tracking-widest font-bold">{{ publication.publisher }}</p>
              <p v-if="publication.description" class="text-white/60 text-base md:text-lg leading-relaxed font-serif italic max-w-2xl">{{ publication.description }}</p>
              
              <div class="pt-4 flex items-center gap-6">
                <div class="flex flex-col">
                  <span class="text-[10px] uppercase tracking-widest font-bold text-white/20">Acervo Digital</span>
                  <span class="text-2xl font-serif text-white/80">{{ totalDocuments }} <span class="text-sm font-sans text-white/40 uppercase tracking-tighter">itens</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Seção de Filtros e Grade -->
      <section class="bg-cantuaria-cream min-h-screen relative">
        <!-- Linha de progresso de carregamento sutil -->
        <div v-if="isFiltering" class="absolute top-0 left-0 w-full h-0.5 bg-cantuaria-gold/10 overflow-hidden z-20">
          <div class="h-full bg-cantuaria-gold w-1/3 animate-[loading_1s_infinite_ease-in-out]"></div>
        </div>

        <div class="container mx-auto px-6 py-12">
          
          <!-- Toolbar de Filtros (Estilo Refinado) -->
          <div class="mb-16">
            <div class="flex flex-col lg:flex-row items-center gap-8 border border-cantuaria-oxford/10 bg-white p-2 shadow-sm">
              <!-- Busca -->
              <div class="relative w-full lg:flex-grow border-b lg:border-b-0 lg:border-r border-cantuaria-oxford/5">
                <div class="absolute left-5 top-2 pointer-events-none">
                  <span class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-oxford/70">Pesquisa</span>
                </div>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Título do documento..." 
                  class="w-full pl-12 pr-4 pt-6 pb-4 text-sm font-sans focus:outline-none placeholder:text-cantuaria-charcoal/20 bg-transparent"
                />
                <LucideSearch class="w-4 h-4 absolute left-5 top-7 text-cantuaria-oxford/30" />
              </div>

              <!-- Filtro de Ano -->
              <div class="relative w-full lg:w-48 group border-b lg:border-b-0 lg:border-r border-cantuaria-oxford/5">
                <div class="absolute left-4 top-2 pointer-events-none flex items-center gap-2">
                  <LucideCalendar class="w-3 h-3 text-cantuaria-oxford/30" />
                  <span class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-oxford/70">Ano</span>
                </div>
                <input 
                  v-model="filterYear" 
                  type="number" 
                  class="w-full pl-4 pr-4 pt-6 pb-4 text-sm font-sans focus:outline-none bg-transparent"
                />
              </div>

              <!-- Ordenação -->
              <div class="relative w-full lg:w-64 flex flex-col px-4 pt-2 pb-2">
                <div class="flex items-center gap-2 mb-1">
                  <LucideArrowUpDown class="w-3 h-3 text-cantuaria-oxford/30" />
                  <span class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-oxford/70">Ordenação</span>
                </div>
                <select v-model="sortOption" class="w-full text-[10px] uppercase tracking-widest font-bold text-cantuaria-oxford/60 focus:outline-none appearance-none cursor-pointer bg-transparent">
                  <option value="year_asc">Cronológica (Crescente)</option>
                  <option value="year_desc">Cronológica (Decrescente)</option>
                  <option value="title_asc">Alfabética (A-Z)</option>
                  <option value="title_desc">Alfabética (Z-A)</option>
                </select>
                <LucideChevronDown class="w-3 h-3 absolute right-4 top-8 text-cantuaria-oxford/20 pointer-events-none" />
              </div>

              <!-- Botão de Reset (só aparece se houver filtros) -->
              <div v-if="searchQuery || filterYear" class="px-4 py-2">
                <button 
                  @click="resetFilters" 
                  class="text-[9px] uppercase tracking-[0.2em] font-bold text-cantuaria-crimson/60 hover:text-cantuaria-crimson transition-colors whitespace-nowrap"
                >
                  Limpar
                </button>
              </div>
            </div>
            
            <div class="mt-4 flex justify-between items-center px-2">
              <div class="text-[9px] uppercase tracking-[0.3em] font-bold text-cantuaria-charcoal/30">
                Exibindo {{ documents.length }} de {{ totalDocuments }} documentos
              </div>
              <div v-if="isFiltering" class="text-[9px] uppercase tracking-[0.3em] font-bold text-cantuaria-gold animate-pulse">
                Sincronizando...
              </div>
            </div>
          </div>

          <!-- Listagem -->
          <div v-if="documents.length === 0 && !loadingMore && !pendingInitial" class="py-32 text-center max-w-md mx-auto">
            <div class="w-20 h-20 bg-cantuaria-oxford/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <LucideBookX class="w-8 h-8 text-cantuaria-oxford/20" />
            </div>
            <h3 class="font-serif text-2xl text-cantuaria-oxford/60 mb-4">Nenhum registro encontrado</h3>
            <p class="text-sm text-cantuaria-charcoal/40 mb-8 leading-relaxed">
              Não encontramos documentos que correspondam aos critérios de busca atuais para esta publicação.
            </p>
            <button @click="resetFilters" class="px-8 py-3 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all">
              Remover Filtros
            </button>
          </div>

          <div v-else class="space-y-20">
            <div :class="['grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-12 transition-all duration-500', isFiltering ? 'opacity-30 blur-[2px]' : 'opacity-100 blur-0']">
              <NuxtLink v-for="doc in documents" :key="doc.id" :to="`/documento/${doc.slug}`" class="group">
                <DocumentCard :document="doc" class="transition-transform duration-500 group-hover:-translate-y-2" />
              </NuxtLink>
            </div>

            <!-- Loader / Fim -->
            <div ref="loadMoreTrigger" class="flex justify-center pt-16 border-t border-cantuaria-oxford/5 min-h-[200px]">
              <div v-if="loadingMore" class="flex flex-col items-center gap-6">
                <div class="relative w-12 h-12">
                  <LucideLoader2 class="w-12 h-12 animate-spin text-cantuaria-oxford/10" stroke-width="1" />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-2 h-2 bg-cantuaria-gold rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p class="text-[10px] uppercase tracking-[0.4em] font-bold text-cantuaria-oxford/40">Recuperando mais itens</p>
              </div>
              <div v-else-if="!hasMore && documents.length > 0" class="flex flex-col items-center gap-4">
                <div class="h-[1px] w-20 bg-cantuaria-oxford/10 mb-2"></div>
                <p class="text-[10px] uppercase tracking-[0.4em] font-bold text-cantuaria-oxford/20 italic text-center">
                  Fim da Coleção Literária
                </p>
                <p class="text-[8px] uppercase tracking-widest text-cantuaria-gold/40">Projeto Cantuária</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  Loader2 as LucideLoader2,
  ChevronLeft as LucideChevronLeft,
  Newspaper as LucideNewspaper,
  Search as LucideSearch,
  BookX as LucideBookX,
  Calendar as LucideCalendar,
  ArrowUpDown as LucideArrowUpDown,
  ChevronDown as LucideChevronDown
} from 'lucide-vue-next'
import { useIntersectionObserver, watchDebounced } from '@vueuse/core'

const route = useRoute()
const documents = ref<any[]>([])
const publication = ref<any>(null)
const page = ref(0)
const pageSize = 15
const hasMore = ref(true)
const loadingMore = ref(false)
const pendingInitial = ref(true)
const isFiltering = ref(false)
const totalDocuments = ref(0)
const loadMoreTrigger = ref(null)

// Filtros
const searchQuery = ref('')
const filterYear = ref('')
const sortOption = ref('year_asc')

const fetchDocuments = async (append = false) => {
  if (!append) {
    page.value = 0
    if (documents.value.length > 0) isFiltering.value = true
  } else {
    loadingMore.value = true
  }

  const [sort, order] = sortOption.value.split('_')

  try {
    const data: any = await $fetch(`/api/publications/${route.params.slug}`, {
      params: { 
        page: page.value, 
        pageSize,
        q: searchQuery.value,
        year: filterYear.value,
        sort: sort === 'year' ? 'publication_year' : 'title',
        order
      }
    })
    
    if (append) {
      documents.value = [...documents.value, ...data.documents]
    } else {
      publication.value = data
      documents.value = data.documents || []
      totalDocuments.value = data.totalDocuments
    }
    hasMore.value = data.hasMore
  } catch (error) {
    console.error('Erro ao carregar documentos:', error)
  } finally {
    loadingMore.value = false
    pendingInitial.value = false
    isFiltering.value = false
  }
}

const loadMore = () => {
  if (loadingMore.value || !hasMore.value || isFiltering.value) return
  page.value++
  fetchDocuments(true)
}

const resetFilters = () => {
  searchQuery.value = ''
  filterYear.value = ''
  sortOption.value = 'year_asc'
}

// Inicialização
onMounted(() => {
  fetchDocuments()
})

// Observadores de filtros
watchDebounced([searchQuery, filterYear], () => {
  fetchDocuments()
}, { debounce: 500 })

watch(sortOption, () => {
  fetchDocuments()
})

// Scroll Infinito
useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !pendingInitial.value && !loadingMore.value && hasMore.value && !isFiltering.value) {
      loadMore()
    }
  },
  { rootMargin: '300px' }
)

useSeoMeta({
  title: computed(() => publication.value ? `${publication.value.title} | Projeto Cantuária` : 'Publicação | Projeto Cantuária'),
  description: computed(() => publication.value?.description || `Documentos da publicação ${publication.value?.title}`),
})
</script>

<style scoped>
@keyframes loading {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
</style>
