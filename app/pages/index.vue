<template>
  <NuxtLayout>
    <!-- Hero Section -->
    <section class="relative min-h-[95vh] flex items-center justify-center overflow-hidden py-20 bg-[#001529]">
      <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000')] bg-cover bg-center grayscale opacity-20 scale-110 blur-[2px] transition-transform duration-[10s] ease-out hover:scale-100"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#001529]/50 to-[#001529]"></div>
      </div>

      <div class="container mx-auto px-6 relative z-10 text-center">
        <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-10 animate-fade-in backdrop-blur-sm">
          <span class="w-2 h-2 rounded-full bg-cantuaria-gold animate-pulse"></span>
          <span class="text-[10px] uppercase tracking-[0.3em] font-bold text-white/80">Preservando o Legado Anglicano</span>
        </div>
        
        <h1 class="text-6xl md:text-8xl lg:text-9xl font-serif text-white mb-8 leading-[0.9] tracking-tighter">
          Biblioteca <br />
          <span class="serif-italic italic text-cantuaria-gold">Digital</span>
        </h1>
        
        <p class="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-16 font-sans leading-relaxed font-light">
          Um repositório centralizado para a produção intelectual, litúrgica e histórica da tradição anglicana em língua portuguesa.
        </p>

        <div class="flex flex-col sm:flex-row justify-center items-center gap-6 animate-fade-in" style="animation-delay: 0.3s">
          <NuxtLink to="/biblioteca" class="group relative px-12 py-5 bg-cantuaria-gold text-cantuaria-oxford text-[10px] md:text-xs uppercase font-bold tracking-[0.3em] overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(197,168,124,0.3)]">
            <div class="relative z-10 flex items-center gap-3">
              <LucideLibrary class="w-4 h-4" />
              <span>Explorar Acervo Completo</span>
            </div>
            <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </NuxtLink>
          
          <NuxtLink to="/contribuir" class="px-12 py-5 border border-white/20 text-white text-[10px] md:text-xs uppercase font-bold tracking-[0.3em] hover:bg-white/5 transition-all">
            Contribuir
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-24 bg-cantuaria-cream border-b border-cantuaria-oxford/5">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-8">
          <div v-for="stat in stats" :key="stat.label" class="flex flex-col items-center text-center group">
            <div class="text-5xl md:text-6xl font-serif text-cantuaria-oxford mb-4 transition-transform group-hover:-translate-y-1 h-[1.2em] flex items-center">
              <div v-if="stat.loading" class="h-10 w-20 animate-skeleton"></div>
              <span v-else>{{ stat.value }}</span>
            </div>
            <div class="h-px w-8 bg-cantuaria-gold/30 mb-4 transition-all group-hover:w-16"></div>
            <div class="text-[10px] uppercase tracking-[0.3em] font-bold text-cantuaria-charcoal/40 group-hover:text-cantuaria-gold transition-colors">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Collections -->
    <section class="py-32 bg-white">
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div class="max-w-2xl">
            <h2 class="text-5xl md:text-6xl text-cantuaria-oxford mb-6 leading-tight">Coleções Curadas</h2>
            <p class="text-cantuaria-charcoal/50 leading-relaxed font-serif text-xl italic">
              "Buscai primeiro o Reino de Deus e a sua justiça, e todas as coisas vos serão acrescentadas."
            </p>
          </div>
          <NuxtLink to="/biblioteca" class="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.3em] text-cantuaria-oxford hover:text-cantuaria-gold transition-all">
            Ver Acervo Completo
            <div class="w-10 h-10 border border-cantuaria-oxford/10 rounded-full flex items-center justify-center group-hover:border-cantuaria-gold transition-all">
              <LucideArrowUpRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <NuxtLink v-for="collection in featuredCollections" :key="collection.id" :to="`/biblioteca?tipo=${collection.type}`" class="group block relative aspect-[3/4] overflow-hidden bg-cantuaria-oxford">
            <img :src="collection.image" :alt="collection.title" class="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-[1.5s] ease-out" />
            <div class="absolute inset-0 bg-gradient-to-t from-cantuaria-oxford via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
            <div class="absolute bottom-10 left-10 right-10">
              <span class="text-[9px] uppercase tracking-[0.3em] font-bold text-cantuaria-gold mb-3 block transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">{{ collection.category }}</span>
              <h3 class="text-3xl font-serif text-white leading-tight tracking-tight transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">{{ collection.title }}</h3>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ArrowUpRight as LucideArrowUpRight, Library as LucideLibrary } from 'lucide-vue-next'

const supabase = useSupabaseClient()

const stats = ref([
  { label: 'Obras Catalogadas', value: '0', loading: true },
  { label: 'Autores & Tradutores', value: '0', loading: true },
  { label: 'Categorias Temáticas', value: '0', loading: true },
  { label: 'Anos de História', value: '500+', loading: false }
])

const fetchStats = async () => {
  try {
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
  } catch (e) {
    console.error('Erro ao carregar estatísticas:', e)
  }
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
@keyframes hero-fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: hero-fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
