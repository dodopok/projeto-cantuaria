<template>
  <NuxtLayout>
    <div v-if="pending" class="min-h-screen flex items-center justify-center">
      <LucideLoader2 class="w-8 h-8 animate-spin text-cantuaria-oxford/30" />
    </div>

    <div v-else-if="!publication" class="min-h-screen flex flex-col items-center justify-center gap-4">
      <p class="font-serif text-2xl text-cantuaria-oxford/40">Publicação não encontrada.</p>
      <NuxtLink to="/publicacoes" class="btn-primary py-2 px-6 text-sm">Ver todas as publicações</NuxtLink>
    </div>

    <template v-else>
      <!-- Hero da publicação -->
      <section class="bg-cantuaria-oxford text-white py-12">
        <div class="container mx-auto px-6">
          <NuxtLink to="/publicacoes" class="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-[10px] uppercase tracking-widest font-bold transition-colors mb-8">
            <LucideChevronLeft class="w-3.5 h-3.5" />
            Publicações
          </NuxtLink>

          <div class="flex flex-col md:flex-row gap-10 items-start">
            <!-- Capa -->
            <div v-if="publication.cover_url" class="shrink-0 w-32 md:w-40 aspect-[3/4.5] overflow-hidden border border-white/10 shadow-2xl">
              <img :src="publication.cover_url" class="w-full h-full object-cover" />
            </div>
            <div v-else class="shrink-0 w-32 md:w-40 aspect-[3/4.5] bg-white/5 border border-white/10 flex items-center justify-center">
              <LucideNewspaper class="w-12 h-12 text-white/20" />
            </div>

            <!-- Metadados -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <span class="text-[8px] uppercase tracking-[0.3em] font-bold text-cantuaria-gold bg-cantuaria-gold/10 px-2 py-1">
                  {{ publication.publication_type || 'Publicação' }}
                </span>
                <span v-if="publication.start_year" class="text-[10px] uppercase tracking-widest font-bold text-white/40">
                  {{ publication.start_year }}{{ publication.end_year && publication.end_year !== publication.start_year ? `–${publication.end_year}` : '' }}
                </span>
              </div>
              <h1 class="text-4xl md:text-5xl font-serif leading-tight">{{ publication.title }}</h1>
              <p v-if="publication.publisher" class="text-white/50 text-sm">{{ publication.publisher }}</p>
              <p v-if="publication.description" class="text-white/70 max-w-2xl leading-relaxed">{{ publication.description }}</p>
              <p class="text-[10px] uppercase tracking-widest font-bold text-white/30">
                {{ documents.length }} {{ documents.length === 1 ? 'documento' : 'documentos' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Grade de documentos -->
      <section class="py-12 bg-cantuaria-cream min-h-[50vh]">
        <div class="container mx-auto px-6">
          <div v-if="documents.length === 0" class="py-20 text-center">
            <p class="font-serif text-xl text-cantuaria-oxford/40">Nenhum documento publicado nesta coleção ainda.</p>
          </div>

          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <DocumentCard v-for="doc in documents" :key="doc.id" :document="doc" />
          </div>
        </div>
      </section>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  Loader2 as LucideLoader2,
  ChevronLeft as LucideChevronLeft,
  Newspaper as LucideNewspaper
} from 'lucide-vue-next'

const route = useRoute()

const { data, pending } = await useFetch(`/api/publications/${route.params.slug}`)

const publication = computed(() => data.value as any)
const documents = computed(() => (data.value as any)?.documents || [])

useSeoMeta({
  title: computed(() => publication.value ? `${publication.value.title} | Projeto Cantuária` : 'Publicação | Projeto Cantuária'),
  description: computed(() => publication.value?.description || `Documentos da publicação ${publication.value?.title}`),
})
</script>
