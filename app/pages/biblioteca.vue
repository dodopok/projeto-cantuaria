<template>
  <NuxtLayout>
    <section class="py-12 border-b border-cantuaria-oxford/5">
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 class="text-4xl md:text-5xl text-cantuaria-oxford mb-4">Biblioteca Digital</h1>
            <p class="text-cantuaria-charcoal/60 max-w-xl">
              Navegue por séculos de sabedoria e liturgia. Explore o acervo oficial da tradição anglicana.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters & Main Content -->
    <section class="py-12 bg-cantuaria-cream/50 min-h-screen">
      <div class="container mx-auto px-6 flex flex-col lg:flex-row gap-12">
        
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 space-y-10 shrink-0">
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
          </div>

          <div>
            <h3 class="font-serif text-lg text-cantuaria-oxford mb-6 border-b border-cantuaria-oxford/10 pb-2">Tipo de Obra</h3>
            <div class="space-y-3">
              <label v-for="type in ['Livro', 'Artigo', 'LOC', 'Documento']" :key="type" class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" :value="type" v-model="filterTypes" class="w-4 h-4 border-cantuaria-charcoal/20 text-cantuaria-oxford focus:ring-cantuaria-oxford" />
                <span class="text-sm text-cantuaria-charcoal/60 group-hover:text-cantuaria-oxford transition-colors uppercase tracking-widest text-[10px] font-bold">{{ type }}</span>
              </label>
            </div>
          </div>
        </aside>

        <!-- Document Grid -->
        <div class="flex-grow">
          <div v-if="loading" class="py-20 text-center">
            <LucideLoader2 class="w-10 h-10 animate-spin mx-auto text-cantuaria-oxford/20" />
          </div>

          <div v-else-if="filteredDocuments.length === 0" class="py-20 text-center bg-white border border-cantuaria-charcoal/5">
            <LucideBookX class="w-12 h-12 mx-auto mb-4 text-cantuaria-charcoal/10" />
            <p class="font-serif text-xl text-cantuaria-charcoal/40">Nenhuma obra encontrada para estes filtros.</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
            <NuxtLink v-for="doc in filteredDocuments" :key="doc.id" :to="`/documento/${doc.slug}`">
              <DocumentCard :document="formatDoc(doc)" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup>
import { 
  Search as LucideSearch, 
  Loader2 as LucideLoader2,
  BookX as LucideBookX
} from 'lucide-vue-next'

const supabase = useSupabaseClient()
const documents = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterTypes = ref([])

const fetchDocuments = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('documents')
    .select('*, authors(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  if (!error) documents.value = data
  loading.value = false
}

const filteredDocuments = computed(() => {
  return documents.value.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = filterTypes.value.length === 0 || filterTypes.value.includes(doc.type)
    return matchesSearch && matchesType
  })
})

const formatDoc = (doc) => ({
  ...doc,
  authors: doc.authors || [{ name: 'Autor Desconhecido' }],
  thumbnail_url: doc.thumbnail_url || 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000'
})

onMounted(fetchDocuments)
</script>
