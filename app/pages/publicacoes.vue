<template>
  <NuxtLayout>
    <!-- Hero -->
    <section class="py-6 bg-cantuaria-oxford text-white relative overflow-hidden">
      <div class="container mx-auto px-6 relative z-10">
        <h1 class="text-5xl md:text-6xl font-serif mb-6 leading-tight">Publicações</h1>
        <p class="text-white/60 max-w-2xl font-sans text-lg">
          Periódicos, revistas, jornais e séries documentais agrupados por publicação.
        </p>
      </div>
    </section>

    <section class="py-12 bg-cantuaria-cream min-h-screen">
      <div class="container mx-auto px-6">

        <!-- Loading -->
        <div v-if="loading" class="space-y-12">
          <div v-for="i in 2" :key="i" class="space-y-6">
            <div class="h-6 w-24 animate-skeleton"></div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="j in 3" :key="j" class="bg-white border border-cantuaria-charcoal/5 p-6 animate-skeleton h-48"></div>
            </div>
          </div>
        </div>

        <!-- Sem publicações -->
        <div v-else-if="publications.length === 0" class="py-32 text-center">
          <LucideLibrary class="w-16 h-16 mx-auto mb-6 text-cantuaria-oxford/20" />
          <p class="font-serif text-2xl text-cantuaria-oxford/40">Nenhuma publicação cadastrada ainda.</p>
        </div>

        <!-- Grupos por ano -->
        <div v-else class="space-y-14">
          <div v-for="group in grouped" :key="group.year" class="space-y-6">
            <!-- Cabeçalho do grupo -->
            <div class="flex items-center gap-4">
              <span class="font-serif text-3xl text-cantuaria-oxford">{{ group.year }}</span>
              <div class="flex-grow h-px bg-cantuaria-charcoal/10"></div>
            </div>

            <!-- Grid de publicações -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <NuxtLink
                v-for="pub in group.publications"
                :key="pub.id"
                :to="`/publicacao/${pub.slug}`"
                class="group bg-white border border-cantuaria-charcoal/5 shadow-sm hover:shadow-xl hover:border-cantuaria-oxford/20 transition-all duration-300 flex gap-5 p-6"
              >
                <!-- Capa -->
                <div class="shrink-0 w-16 aspect-[3/4.5] bg-cantuaria-oxford/5 overflow-hidden border border-cantuaria-charcoal/5">
                  <img v-if="pub.cover_url" :src="pub.cover_url" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <LucideNewspaper class="w-6 h-6 text-cantuaria-oxford/20" />
                  </div>
                </div>

                <!-- Info -->
                <div class="flex flex-col min-w-0">
                  <span class="text-[8px] uppercase tracking-[0.25em] font-bold text-cantuaria-gold mb-1">
                    {{ pub.publication_type || 'Publicação' }}
                  </span>
                  <h3 class="font-serif text-lg text-cantuaria-oxford leading-snug mb-1 group-hover:text-cantuaria-oxford/80 transition-colors">
                    {{ pub.title }}
                  </h3>
                  <p v-if="pub.publisher" class="text-xs text-cantuaria-charcoal/50 mb-2">{{ pub.publisher }}</p>
                  <p v-if="pub.description" class="text-xs text-cantuaria-charcoal/60 leading-relaxed line-clamp-2 mb-3">{{ pub.description }}</p>
                  <div class="mt-auto flex items-center gap-4 text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">
                    <span v-if="pub.start_year">
                      {{ pub.start_year }}{{ pub.end_year && pub.end_year !== pub.start_year ? `–${pub.end_year}` : '' }}
                    </span>
                    <span>{{ pub.document_count }} {{ pub.document_count === 1 ? 'documento' : 'documentos' }}</span>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Library as LucideLibrary, Newspaper as LucideNewspaper } from 'lucide-vue-next'

useSeoMeta({
  title: 'Publicações | Projeto Cantuária',
  description: 'Periódicos, revistas e séries documentais do acervo anglicano.',
})

const publications = ref<any[]>([])
const loading = ref(true)

const grouped = computed(() => {
  const map = new Map<string, any[]>()

  for (const pub of publications.value) {
    const year = pub.start_year ? String(pub.start_year) : 'Sem data'
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(pub)
  }

  // Ordenar grupos: anos numéricos decrescentes, depois "Sem data"
  const entries = [...map.entries()].sort((a, b) => {
    if (a[0] === 'Sem data') return 1
    if (b[0] === 'Sem data') return -1
    return Number(b[0]) - Number(a[0])
  })

  return entries.map(([year, pubs]) => ({
    year,
    publications: pubs.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
  }))
})

const fetchPublications = async () => {
  try {
    publications.value = await $fetch('/api/publications') as any[]
  } catch (err) {
    console.error('Erro ao buscar publicações:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchPublications)
</script>
