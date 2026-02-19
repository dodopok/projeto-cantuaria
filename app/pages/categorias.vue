<template>
  <NuxtLayout>
    <section class="py-20 bg-[#002147] text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000')] bg-cover bg-center grayscale"></div>
      </div>
      <div class="container mx-auto px-6 relative z-10">
        <h1 class="text-5xl md:text-6xl font-serif mb-6 leading-tight">Categorias Temáticas</h1>
        <p class="text-white/60 max-w-2xl font-sans text-lg">
          Navegue pelo acervo através de grandes eixos temáticos da teologia e prática anglicana.
        </p>
      </div>
    </section>

    <section class="py-20 bg-cantuaria-cream min-h-screen">
      <div class="container mx-auto px-6">
        <div v-if="loading" class="py-20 text-center">
          <LucideLoader2 class="w-10 h-10 animate-spin mx-auto text-cantuaria-oxford/20" />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="cat in categories" 
            :key="cat.id"
            @click="goToCategory(cat.slug)"
            class="bg-white aspect-square flex flex-col items-center justify-center text-center p-8 border border-cantuaria-charcoal/5 shadow-sm group cursor-pointer hover:bg-cantuaria-oxford hover:border-cantuaria-oxford transition-all duration-500"
          >
            <LucideBookOpen class="w-10 h-10 text-cantuaria-gold mb-6 transition-transform group-hover:scale-110" />
            <h3 class="text-xl font-serif text-cantuaria-oxford mb-2 group-hover:text-white transition-colors">{{ cat.name }}</h3>
            <span class="text-[9px] uppercase tracking-[0.3em] font-bold text-cantuaria-charcoal/30 group-hover:text-cantuaria-gold transition-colors">Explorar Coleção</span>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { BookOpen as LucideBookOpen, Loader2 as LucideLoader2 } from 'lucide-vue-next'

const categories = ref<any[]>([])
const loading = ref(true)

const fetchCategories = async () => {
  try {
    const data = await $fetch('/api/categories')
    categories.value = data as any[]
  } catch (err) {
    console.error('Erro ao buscar categorias:', err)
  } finally {
    loading.value = false
  }
}

const goToCategory = (slug: string) => {
  navigateTo({
    path: '/biblioteca',
    query: { categoria: slug }
  })
}

onMounted(fetchCategories)
</script>
