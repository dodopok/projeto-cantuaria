<template>
  <NuxtLayout>
    <!-- Hero Section -->
    <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
      <div class="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000')] bg-cover bg-center grayscale scale-110 blur-sm"></div>
      </div>

      <div class="container mx-auto px-6 relative z-10 text-center">
        <div class="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-cantuaria-oxford/5 border border-cantuaria-oxford/10 mb-8 animate-fade-in">
          <span class="w-1.5 h-1.5 rounded-full bg-cantuaria-gold animate-pulse"></span>
          <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-oxford/70">O acervo digital da memória anglicana</span>
        </div>
        
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-serif text-cantuaria-oxford mb-8 leading-tight tracking-tight">
          Preservando a <br />
          <span class="serif-italic italic">Tradição Anglicana</span>
        </h1>
        
        <p class="text-lg md:text-xl text-cantuaria-charcoal/70 max-w-2xl mx-auto mb-12 font-sans leading-relaxed">
          Explore uma vasta coleção de documentos, livros, artigos e memórias da Igreja Una, Santa, Católica e Apostólica em seu ramo anglicano.
        </p>

        <!-- Search Bar -->
        <form @submit.prevent="handleSearch" class="max-w-3xl mx-auto relative group">
          <div class="absolute inset-0 bg-cantuaria-oxford/5 blur-2xl group-hover:bg-cantuaria-oxford/10 transition-all"></div>
          <div class="relative bg-white border border-cantuaria-charcoal/10 p-2 flex items-center shadow-xl group-focus-within:border-cantuaria-oxford transition-all">
            <LucideSearch class="w-6 h-6 ml-4 text-cantuaria-charcoal/40" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Pesquise por títulos, autores, séculos ou temas..." 
              class="w-full px-4 py-4 focus:outline-none text-lg font-sans placeholder:text-cantuaria-charcoal/30 bg-transparent"
            />
            <button type="submit" class="btn-primary py-4 px-8 flex items-center gap-2 group/btn">
              <span>Explorar</span>
              <LucideArrowRight class="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
          <div class="mt-4 flex flex-wrap justify-center gap-4 text-sm text-cantuaria-charcoal/40 uppercase tracking-widest font-bold">
            <span @click="quickSearch('Liturgia')" class="cursor-pointer hover:text-cantuaria-oxford transition-colors">#Liturgia</span>
            <span @click="quickSearch('Teologia')" class="cursor-pointer hover:text-cantuaria-oxford transition-colors">#Teologia</span>
            <span @click="quickSearch('História')" class="cursor-pointer hover:text-cantuaria-oxford transition-colors">#História</span>
            <span @click="quickSearch('Patrística')" class="cursor-pointer hover:text-cantuaria-oxford transition-colors">#Patrística</span>
          </div>
        </form>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="py-24 bg-cantuaria-oxford/5 border-y border-cantuaria-oxford/5">
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div class="max-w-xl">
            <h2 class="text-4xl md:text-5xl text-cantuaria-oxford mb-4">Coleções Destacadas</h2>
            <p class="text-cantuaria-charcoal/60 leading-relaxed italic font-serif text-lg">
              "As Escrituras contêm todas as coisas necessárias para a salvação."
            </p>
          </div>
          <NuxtLink to="/biblioteca" class="text-sm font-bold uppercase tracking-widest text-cantuaria-oxford hover:text-cantuaria-crimson transition-colors flex items-center gap-2 group">
            Ver Todo Acervo
            <LucideArrowUpRight class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <NuxtLink v-for="collection in featuredCollections" :key="collection.id" :to="`/biblioteca?tipo=${collection.type}`" class="group cursor-pointer">
            <div class="relative aspect-[3/4] overflow-hidden mb-6 bg-cantuaria-charcoal">
              <img :src="collection.image" :alt="collection.title" class="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
              <div class="absolute inset-0 bg-gradient-to-t from-cantuaria-charcoal/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              <div class="absolute bottom-6 left-6 text-white">
                <span class="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70 mb-2 block">{{ collection.category }}</span>
                <h3 class="text-2xl font-serif tracking-tight leading-tight">{{ collection.title }}</h3>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 border-b border-cantuaria-oxford/5">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div v-for="stat in stats" :key="stat.label">
            <div class="text-4xl font-serif text-cantuaria-oxford mb-2">
              <span v-if="stat.loading" class="animate-pulse opacity-20">---</span>
              <span v-else>{{ stat.value }}</span>
            </div>
            <div class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Search as LucideSearch, ArrowRight as LucideArrowRight, ArrowUpRight as LucideArrowUpRight } from 'lucide-vue-next'

const supabase = useSupabaseClient()
const searchQuery = ref('')

const stats = ref([
  { label: 'Obras Catalogadas', value: '0', loading: true },
  { label: 'Autores', value: '0', loading: true },
  { label: 'Categorias', value: '0', loading: true },
  { label: 'Anos de História', value: '500+', loading: false }
])

const fetchStats = async () => {
  const [docs, authors, cats] = await Promise.all([
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('authors').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true })
  ])

  stats.value[0].value = docs.count?.toString() || '0'
  stats.value[0].loading = false
  stats.value[1].value = authors.count?.toString() || '0'
  stats.value[1].loading = false
  stats.value[2].value = cats.count?.toString() || '0'
  stats.value[2].loading = false
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  navigateTo(`/biblioteca?q=${encodeURIComponent(searchQuery.value)}`)
}

const quickSearch = (term: string) => {
  navigateTo(`/biblioteca?q=${encodeURIComponent(term)}`)
}

const featuredCollections = [
  {
    id: 1,
    title: 'Livros de Oração Comum',
    category: 'Liturgia',
    type: 'LOC',
    image: 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000'
  },
  {
    id: 2,
    title: 'Sermões Clássicos',
    category: 'Sermonários',
    type: 'Artigo',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000'
  },
  {
    id: 3,
    title: 'História Anglicana',
    category: 'História',
    type: 'Documento',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1000'
  }
]

onMounted(fetchStats)
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}
</style>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}
</style>
