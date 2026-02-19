<template>
  <NuxtLayout>
    <section class="py-12 border-b border-cantuaria-oxford/5">
      <div class="container mx-auto px-6">
        <h1 class="text-4xl md:text-5xl text-cantuaria-oxford mb-4">Categorias do Acervo</h1>
        <p class="text-cantuaria-charcoal/60 max-w-xl italic font-serif text-lg">
          Explore o acervo através de grandes eixos temáticos.
        </p>
      </div>
    </section>

    <section class="py-20 bg-cantuaria-cream/30 min-h-screen">
      <div class="container mx-auto px-6">
        <div v-if="loading" class="py-20 text-center">
          <LucideLoader2 class="w-10 h-10 animate-spin mx-auto text-cantuaria-oxford/20" />
        </div>

        <div v-else-if="categories.length === 0" class="py-20 text-center bg-white border border-cantuaria-charcoal/5">
          <LucideLibrary class="w-12 h-12 mx-auto mb-4 text-cantuaria-charcoal/10" />
          <p class="font-serif text-xl text-cantuaria-charcoal/40">Nenhuma categoria cadastrada ainda.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NuxtLink 
            v-for="category in categories" 
            :key="category.id" 
            :to="`/biblioteca?categoria=${category.slug}`"
            class="group bg-white p-8 border border-cantuaria-charcoal/5 shadow-sm hover:shadow-xl hover:border-cantuaria-oxford transition-all duration-500"
          >
            <div class="flex items-center justify-between mb-8">
              <div class="w-12 h-12 bg-cantuaria-oxford/5 flex items-center justify-center rounded-sm text-cantuaria-oxford group-hover:bg-cantuaria-oxford group-hover:text-white transition-all duration-500">
                <LucideBookmark class="w-6 h-6" />
              </div>
              <span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Explorar Obras</span>
            </div>
            <h3 class="font-serif text-3xl text-cantuaria-oxford mb-4 group-hover:text-cantuaria-crimson transition-colors tracking-tight">{{ category.name }}</h3>
            <p class="text-sm text-cantuaria-charcoal/60 leading-relaxed line-clamp-2">
              {{ category.description || 'Nenhuma descrição disponível para esta categoria.' }}
            </p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup>
import { Loader2 as LucideLoader2, Library as LucideLibrary, Bookmark as LucideBookmark } from 'lucide-vue-next'

const supabase = useSupabaseClient()
const categories = ref([])
const loading = ref(true)

const fetchCategories = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (!error) categories.value = data
  loading.value = false
}

onMounted(fetchCategories)
</script>
