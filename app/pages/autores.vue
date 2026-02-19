<template>
  <NuxtLayout>
    <section class="py-12 border-b border-cantuaria-oxford/5">
      <div class="container mx-auto px-6">
        <h1 class="text-4xl md:text-5xl text-cantuaria-oxford mb-4">Autores & Tradutores</h1>
        <p class="text-cantuaria-charcoal/60 max-w-xl italic font-serif text-lg">
          "As palavras dos sábios são como aguilhões, e como pregos bem fixados."
        </p>
      </div>
    </section>

    <section class="py-20 bg-cantuaria-cream/30 min-h-screen">
      <div class="container mx-auto px-6">
        <div v-if="loading" class="py-20 text-center">
          <LucideLoader2 class="w-10 h-10 animate-spin mx-auto text-cantuaria-oxford/20" />
        </div>

        <div v-else-if="authors.length === 0" class="py-20 text-center bg-white border border-cantuaria-charcoal/5">
          <LucideUsers class="w-12 h-12 mx-auto mb-4 text-cantuaria-charcoal/10" />
          <p class="font-serif text-xl text-cantuaria-charcoal/40">Nenhum autor catalogado ainda.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div v-for="author in authors" :key="author.id" class="group cursor-pointer">
            <div class="relative aspect-square overflow-hidden mb-6 bg-cantuaria-oxford/5 border border-cantuaria-charcoal/5 shadow-sm grayscale hover:grayscale-0 transition-all duration-700">
              <img v-if="author.photo_url" :src="author.photo_url" :alt="author.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div v-else class="w-full h-full flex items-center justify-center text-cantuaria-oxford/20">
                <LucideUser class="w-20 h-20" />
              </div>
            </div>
            <h3 class="font-serif text-2xl text-cantuaria-oxford group-hover:text-cantuaria-crimson transition-colors tracking-tight">{{ author.name }}</h3>
            <p class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 mb-3">
              {{ author.born_year || '---' }} — {{ author.died_year || '---' }}
            </p>
            <p class="text-sm text-cantuaria-charcoal/60 line-clamp-3 leading-relaxed">
              {{ author.bio }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup>
import { Loader2 as LucideLoader2, Users as LucideUsers, User as LucideUser } from 'lucide-vue-next'

const supabase = useSupabaseClient()
const authors = ref([])
const loading = ref(true)

const fetchAuthors = async () => {
  loading.value = true
  try {
    authors.value = await $fetch('/api/authors')
  } catch (error) {
    console.error('Erro ao buscar autores:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAuthors)
</script>
