<template>
  <NuxtLayout>
    <div v-if="pending" class="min-h-screen flex items-center justify-center bg-cantuaria-cream">
      <LucideLoader2 class="w-12 h-12 animate-spin text-cantuaria-oxford/20" stroke-width="1" />
    </div>

    <div v-else-if="!author" class="min-h-screen flex flex-col items-center justify-center bg-cantuaria-cream p-6 text-center">
      <LucideUserX class="w-16 h-16 text-cantuaria-oxford/10 mb-6" />
      <h1 class="font-serif text-3xl text-cantuaria-oxford mb-4">Autor não encontrado</h1>
      <NuxtLink to="/autores" class="px-8 py-3 bg-cantuaria-oxford text-white font-bold uppercase tracking-widest text-xs">Ver todos os autores</NuxtLink>
    </div>

    <div v-else class="min-h-screen bg-cantuaria-cream">
      <!-- Header do Autor -->
      <section class="bg-cantuaria-oxford text-white py-6 relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.03] grayscale pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
        
        <div class="container mx-auto px-6 relative z-10">
          <NuxtLink to="/autores" class="inline-flex items-center gap-2 text-white/30 hover:text-white/70 text-[10px] uppercase tracking-[0.2em] font-bold transition-all mb-12 hover:-translate-x-1">
            <LucideArrowLeft class="w-4 h-4" />
            Voltar para Autores
          </NuxtLink>

          <div class="flex flex-col md:flex-row gap-12 items-start">
            <!-- Foto/Avatar -->
            <div class="shrink-0">
              <div v-if="author.photo_url" class="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                <img :src="author.photo_url" :alt="author.name" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center shadow-2xl">
                <LucideUser class="w-16 h-16 md:w-24 md:h-24 text-white/10" />
              </div>
            </div>

            <!-- Bio -->
            <div class="space-y-6 max-w-3xl">
              <div class="space-y-2">
                <span class="text-[10px] uppercase tracking-[0.4em] font-bold text-cantuaria-gold">Perfil do Autor</span>
                <h1 class="text-4xl md:text-6xl font-serif leading-tight text-white">{{ author.name }}</h1>
                <p v-if="author.born_year" class="text-white/40 font-sans text-sm uppercase tracking-widest">
                  {{ author.born_year }} — {{ author.died_year || 'Presente' }}
                </p>
              </div>
              <p v-if="author.bio" class="text-white/70 text-lg leading-relaxed font-serif italic border-l-2 border-cantuaria-gold/30 pl-6">
                {{ author.bio }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Listagem de Obras -->
      <section class="py-12">
        <div class="container mx-auto px-6">
          <div class="flex items-center justify-between mb-6 border-b border-cantuaria-oxford/10 pb-6">
            <h2 class="text-3xl font-serif text-cantuaria-oxford">Obras no Acervo</h2>
            <span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">{{ author.documents?.length || 0 }} títulos catalogados</span>
          </div>

          <div v-if="author.documents?.length === 0" class="py-20 text-center bg-white border border-cantuaria-oxford/5 shadow-sm">
            <LucideBookX class="w-12 h-12 mx-auto mb-4 text-cantuaria-oxford/10" />
            <p class="font-serif text-xl text-cantuaria-oxford/40">Nenhuma obra deste autor foi publicada ainda.</p>
          </div>

          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-12">
            <NuxtLink 
              v-for="doc in author.documents" 
              :key="doc.id" 
              :to="`/documento/${doc.slug}`"
              class="group"
            >
              <DocumentCard :document="doc" class="transition-transform duration-500 group-hover:-translate-y-2" />
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { 
  Loader2 as LucideLoader2, 
  ArrowLeft as LucideArrowLeft, 
  User as LucideUser, 
  UserX as LucideUserX,
  BookX as LucideBookX 
} from 'lucide-vue-next'

const route = useRoute()

// SSR Fetch
const { data: author, pending } = await useAsyncData(`author-${route.params.slug}`, () => 
  $fetch(`/api/authors/${route.params.slug}`)
)

useSeoMeta({
  title: computed(() => author.value ? `${author.value.name} | Projeto Cantuária` : 'Autor | Projeto Cantuária'),
  description: computed(() => author.value?.bio || `Conheça a produção intelectual de ${author.value?.name} no Projeto Cantuária.`),
  ogTitle: computed(() => author.value ? `${author.value.name} | Projeto Cantuária` : 'Autor | Projeto Cantuária'),
  ogImage: computed(() => author.value?.photo_url || 'https://images.unsplash.com/photo-1455391230247-0c59109b75e6?q=80&w=2000'),
})
</script>
