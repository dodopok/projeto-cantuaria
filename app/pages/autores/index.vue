<template>
  <NuxtLayout>
    <section class="py-6 bg-cantuaria-oxford text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 grayscale pointer-events-none">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1455391230247-0c59109b75e6?q=80&w=2000')] bg-cover bg-center"></div>
      </div>
      <div class="container mx-auto px-6 relative z-10">
        <h1 class="text-5xl md:text-6xl font-serif mb-6 leading-tight">Nossos Autores</h1>
        <p class="text-white/60 max-w-2xl font-sans text-lg">
          Explore a produção intelectual de teólogos, historiadores e liturgistas que moldaram a tradição anglicana através dos séculos.
        </p>
      </div>
    </section>

    <section class="py-6 bg-cantuaria-cream min-h-screen">
      <div class="container mx-auto px-6">
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 6" :key="i" class="bg-white p-8 border border-cantuaria-charcoal/5 shadow-sm">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 animate-skeleton rounded-full"></div>
              <div class="h-3 w-12 animate-skeleton"></div>
            </div>
            <div class="h-8 w-3/4 animate-skeleton mb-2"></div>
            <div class="h-3 w-1/2 animate-skeleton"></div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NuxtLink 
            v-for="author in authors" 
            :key="author.id"
            :to="`/autores/${author.slug}`"
            class="bg-white p-8 border border-cantuaria-charcoal/5 shadow-sm group cursor-pointer hover:border-cantuaria-gold transition-all"
          >
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 bg-cantuaria-cream flex items-center justify-center rounded-full text-cantuaria-oxford group-hover:bg-cantuaria-oxford group-hover:text-white transition-colors">
                <LucideUser class="w-6 h-6" />
              </div>
              <span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/20">Autor</span>
            </div>
            <h3 class="text-2xl font-serif text-cantuaria-oxford mb-2 group-hover:text-cantuaria-gold transition-colors">{{ author.name }}</h3>
            <p class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40 group-hover:text-cantuaria-charcoal/60 transition-colors">Ver biografia e obras</p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { User as LucideUser, Loader2 as LucideLoader2 } from 'lucide-vue-next'

const authors = ref<any[]>([])
const loading = ref(true)

useSeoMeta({
  title: 'Autores & Tradutores | Projeto Cantuária',
  ogTitle: 'Autores & Tradutores | Projeto Cantuária',
  description: 'Conheça os grandes nomes da teologia e liturgia anglicana cujas obras estão catalogadas em nosso acervo.',
  ogDescription: 'Conheça os grandes nomes da teologia e liturgia anglicana cujas obras estão catalogadas em nosso acervo.',
  ogImage: 'https://images.unsplash.com/photo-1455391230247-0c59109b75e6?q=80&w=2000',
  twitterCard: 'summary_large_image'
})

const fetchAuthors = async () => {
  try {
    const data = await $fetch('/api/authors')
    authors.value = data as any[]
  } catch (err) {
    console.error('Erro ao buscar autores:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAuthors)
</script>
