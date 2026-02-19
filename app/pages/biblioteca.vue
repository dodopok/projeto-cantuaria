<template>
  <NuxtLayout>
    <section class="py-12 border-b border-cantuaria-oxford/5">
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 class="text-3xl md:text-5xl text-cantuaria-oxford mb-4">Biblioteca Digital</h1>
            <p class="text-cantuaria-charcoal/60 max-w-xl text-sm md:text-base">
              Navegue por séculos de sabedoria e liturgia. Explore o acervo oficial da tradição anglicana.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters & Main Content -->
    <section class="py-8 md:py-12 bg-cantuaria-cream/50 min-h-screen">
      <div class="container mx-auto px-6 flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 space-y-8 shrink-0">
          <!-- Search Block - Always visible -->
          <div class="bg-white p-6 border border-cantuaria-charcoal/5 shadow-sm">
            <h3 class="font-serif text-lg text-cantuaria-oxford mb-6 border-b border-cantuaria-oxford/10 pb-2">Pesquisa</h3>
            <div class="relative">
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Título, autor..." 
                class="w-full pl-10 pr-4 py-2 bg-cantuaria-cream/30 border border-cantuaria-charcoal/10 text-xs focus:outline-none focus:border-cantuaria-oxford"
              />
              <LucideSearch class="w-4 h-4 absolute left-3 top-2.5 text-cantuaria-charcoal/30" />
            </div>
            
            <!-- Mobile Toggle for Additional Filters -->
            <button @click="showMobileFilters = !showMobileFilters" class="lg:hidden w-full mt-6 py-2 bg-cantuaria-cream/50 border border-cantuaria-oxford/10 text-cantuaria-oxford text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
              <LucideFilter class="w-3 h-3" />
              {{ showMobileFilters ? 'Ocultar Filtros' : 'Mais Filtros' }}
            </button>

            <div :class="['mt-8 space-y-6 lg:block', showMobileFilters ? 'block' : 'hidden']">
              <div>
                <h4 class="text-[9px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40 mb-3">Tipo de Obra</h4>
                <div class="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  <label v-for="type in ['Livro', 'Artigo', 'LOC', 'Documento']" :key="type" class="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" :value="type" v-model="filterTypes" class="w-3 h-3 border-cantuaria-charcoal/20 text-cantuaria-oxford focus:ring-cantuaria-oxford" />
                    <span class="text-sm text-cantuaria-charcoal/60 group-hover:text-cantuaria-oxford transition-colors uppercase tracking-widest text-[9px] font-bold">{{ type }}</span>
                  </label>
                </div>
              </div>

              <div v-if="categories.length > 0">
                <h4 class="text-[9px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40 mb-3">Categorias</h4>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="cat in categories" 
                    :key="cat.id" 
                    @click="toggleCategory(cat.slug)"
                    :class="['px-2 py-1 text-[8px] uppercase tracking-widest font-bold border transition-all', filterCategory === cat.slug ? 'bg-cantuaria-oxford text-white border-cantuaria-oxford' : 'bg-transparent text-cantuaria-charcoal/40 border-cantuaria-charcoal/10 hover:border-cantuaria-oxford']"
                  >
                    {{ cat.name }}
                  </button>
                </div>
              </div>
            </div>

            <NuxtLink to="/pesquisa" class="block text-center mt-8 pt-4 border-t border-cantuaria-charcoal/5 text-[9px] uppercase tracking-widest font-bold text-cantuaria-gold hover:underline">
              Pesquisa Avançada
            </NuxtLink>
          </div>
        </aside>

        <!-- Document Grid -->
        <div class="flex-grow">
          <div v-if="loading && documents.length === 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
            <DocumentSkeleton v-for="i in 6" :key="i" />
          </div>

          <div v-else-if="documents.length === 0 && !loading" class="py-20 text-center bg-white border border-cantuaria-charcoal/5">
            <LucideBookX class="w-12 h-12 mx-auto mb-4 text-cantuaria-charcoal/10" />
            <p class="font-serif text-xl text-cantuaria-charcoal/40">Nenhuma obra encontrada.</p>
          </div>

          <div v-else class="space-y-12">
            <div :class="['grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10 transition-opacity duration-300', loading ? 'opacity-50 pointer-events-none' : 'opacity-100']">
              <NuxtLink v-for="doc in documents" :key="doc.id" :to="`/documento/${doc.slug}`">
                <DocumentCard :document="formatDoc(doc)" />
              </NuxtLink>
            </div>

            <!-- Load More -->
            <div class="flex justify-center pt-12 border-t border-cantuaria-oxford/5">
              <button 
                v-if="hasMore" 
                @click="loadMore" 
                :disabled="loading"
                class="w-full sm:w-auto px-12 py-4 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford hover:text-white transition-all disabled:opacity-50"
              >
                {{ loading ? 'Carregando...' : 'Carregar mais obras' }}
              </button>
              <p v-else class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/20 italic">Fim do acervo disponível</p>
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
  Filter as LucideFilter
} from 'lucide-vue-next'
import { watchDebounced } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const documents = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(true)
const showMobileFilters = ref(false)
const searchQuery = ref(route.query.q?.toString() || '')
const filterTypes = ref<string[]>(route.query.tipo ? route.query.tipo.toString().split(',') : [])
const filterCategory = ref(route.query.categoria?.toString() || '')
const page = ref(0)
const pageSize = 9
const hasMore = ref(true)

const fetchCategories = async () => {
  try {
    categories.value = await $fetch('/api/categories') as any[]
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
  }
}

const fetchDocuments = async (append = false) => {
  loading.value = true
  try {
    const data: any = await $fetch('/api/documents', {
      params: {
        page: page.value,
        pageSize,
        q: searchQuery.value,
        tipo: filterTypes.value.join(','),
        categoria: filterCategory.value
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
  router.replace({ query })
}

const toggleCategory = (slug: string) => {
  if (filterCategory.value === slug) filterCategory.value = ''
  else filterCategory.value = slug
  handleSearch()
}

const loadMore = () => { page.value++; fetchDocuments(true) }
const formatDoc = (doc: any) => ({
  ...doc,
  authors: doc.authors || [{ name: 'Autor Desconhecido' }],
  thumbnail_url: doc.thumbnail_url || 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000'
})

// Live search for text input
watchDebounced(searchQuery, () => {
  handleSearch()
}, { debounce: 500 })

// Live search for filters
watch(filterTypes, () => {
  handleSearch()
}, { deep: true })

onMounted(() => { 
  fetchCategories()
  fetchDocuments() 
})

watch(() => route.query.q, (newQ) => { 
  if (newQ !== searchQuery.value) { 
    searchQuery.value = newQ?.toString() || ''; 
  } 
})
</script>
