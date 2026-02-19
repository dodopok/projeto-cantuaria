<template>
  <NuxtLayout>
    <section class="py-12 md:py-20 bg-cantuaria-oxford text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-5 grayscale pointer-events-none">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000')] bg-cover bg-center"></div>
      </div>
      <div class="container mx-auto px-6 relative z-10 text-center">
        <h1 class="text-4xl md:text-6xl font-serif mb-4 md:mb-6 leading-tight tracking-tight">Pesquisa Avançada</h1>
        <p class="text-white/60 max-w-2xl mx-auto font-sans text-sm md:text-lg">
          Refine sua busca no acervo utilizando filtros cronológicos, temáticos e linguísticos para encontrar exatamente o que procura.
        </p>
      </div>
    </section>

    <section class="py-10 md:py-20 bg-cantuaria-cream min-h-screen">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto bg-white p-6 md:p-16 shadow-2xl border border-cantuaria-charcoal/5">
          <form @submit.prevent="executeSearch" class="space-y-10 md:space-y-12">
            <!-- Text Search -->
            <div class="space-y-4">
              <label class="text-[9px] uppercase tracking-[0.3em] font-bold text-cantuaria-charcoal/40 block">Termos de Busca</label>
              <div class="relative">
                <input 
                  v-model="filters.q"
                  type="text" 
                  placeholder="Título, autor ou tema..." 
                  class="w-full text-xl md:text-2xl font-serif border-b-2 border-cantuaria-oxford/10 py-3 md:py-4 focus:outline-none focus:border-cantuaria-oxford bg-transparent transition-all placeholder:text-cantuaria-charcoal/20"
                />
                <LucideSearch class="w-5 h-5 absolute right-0 top-4 text-cantuaria-oxford/20" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div class="space-y-4">
                <label class="text-[9px] uppercase tracking-[0.3em] font-bold text-cantuaria-charcoal/40 block">Século</label>
                <select v-model="filters.century" class="w-full bg-cantuaria-cream/30 border border-cantuaria-charcoal/10 p-3 md:p-4 text-sm focus:outline-none focus:border-cantuaria-oxford appearance-none">
                  <option value="">Qualquer período</option>
                  <option value="16">Século XVI</option>
                  <option value="17">Século XVII</option>
                  <option value="18">Século XVIII</option>
                  <option value="19">Século XIX</option>
                  <option value="20">Século XX</option>
                  <option value="21">Século XXI</option>
                </select>
              </div>
              <div class="space-y-4">
                <label class="text-[9px] uppercase tracking-[0.3em] font-bold text-cantuaria-charcoal/40 block">Idioma</label>
                <select v-model="filters.language" class="w-full bg-cantuaria-cream/30 border border-cantuaria-charcoal/10 p-3 md:p-4 text-sm focus:outline-none focus:border-cantuaria-oxford appearance-none">
                  <option value="">Todos os idiomas</option>
                  <option value="Português">Português</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Latim">Latim</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div class="space-y-4">
                <label class="text-[9px] uppercase tracking-[0.3em] font-bold text-cantuaria-charcoal/40 block">Tipo</label>
                <div class="grid grid-cols-2 gap-2 md:gap-3">
                  <label v-for="type in ['Livro', 'Artigo', 'LOC', 'Documento']" :key="type" class="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-cantuaria-cream/30 border border-cantuaria-charcoal/5 cursor-pointer hover:bg-cantuaria-oxford/5 transition-colors">
                    <input type="checkbox" :value="type" v-model="filters.types" class="w-4 h-4 accent-cantuaria-oxford" />
                    <span class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/60">{{ type }}</span>
                  </label>
                </div>
              </div>
              <div class="space-y-4">
                <label class="text-[9px] uppercase tracking-[0.3em] font-bold text-cantuaria-charcoal/40 block">Categorias</label>
                <div class="flex flex-wrap gap-2">
                  <button v-for="cat in categories" :key="cat.id" type="button" @click="toggleCategory(cat.slug)" :class="['px-3 py-1.5 md:px-4 md:py-2 text-[9px] uppercase tracking-widest font-bold border transition-all', filters.categories.includes(cat.slug) ? 'bg-cantuaria-oxford text-white border-cantuaria-oxford' : 'bg-transparent text-cantuaria-charcoal/40 border-cantuaria-charcoal/10 hover:border-cantuaria-oxford']">
                    {{ cat.name }}
                  </button>
                </div>
              </div>
            </div>

            <div class="pt-8 border-t border-cantuaria-charcoal/5">
              <button type="submit" class="w-full py-5 md:py-6 bg-cantuaria-oxford text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-cantuaria-oxford/90 shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-4">
                <LucideSearch class="w-5 h-5" /> Filtrar Acervo
              </button>
              <button @click="resetFilters" type="button" class="w-full mt-6 text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 hover:text-cantuaria-crimson">Limpar Critérios</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Search as LucideSearch } from 'lucide-vue-next'
const categories = ref<any[]>([]); const filters = ref({ q: '', century: '', language: '', types: [] as string[], categories: [] as string[] })
const fetchCategories = async () => { categories.value = await $fetch('/api/categories') as any[] }
const toggleCategory = (slug: string) => { const idx = filters.value.categories.indexOf(slug); if (idx > -1) filters.value.categories.splice(idx, 1); else filters.value.categories.push(slug) }
const resetFilters = () => { filters.value = { q: '', century: '', language: '', types: [], categories: [] } }
const executeSearch = () => {
  const query: any = {}; if (filters.value.q) query.q = filters.value.q; if (filters.value.century) query.seculo = filters.value.century; if (filters.value.language) query.idioma = filters.value.language
  if (filters.value.types.length > 0) query.tipo = filters.value.types.join(','); if (filters.value.categories.length > 0) query.categoria = filters.value.categories.join(',')
  navigateTo({ path: '/biblioteca', query })
}
onMounted(fetchCategories)
</script>
