<template>
  <NuxtLayout>
    <!-- Hero -->
    <section class="py-6 bg-cantuaria-oxford text-white relative overflow-hidden">
      <div class="container mx-auto px-6 relative z-10">
        <h1 class="text-5xl md:text-6xl font-serif mb-6 leading-tight">Vídeos</h1>
        <p class="text-white/60 max-w-2xl font-sans text-lg mb-8">
          Sermões, conferências e documentários da tradição anglicana em vídeo.
        </p>
        <div class="relative max-w-xl">
          <LucideSearch class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar vídeos..."
            class="w-full bg-white/10 border border-white/20 pl-11 pr-10 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50 text-sm"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
            <LucideX class="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>

    <section class="py-12 bg-cantuaria-cream min-h-screen">
      <div class="container mx-auto px-6">

        <!-- Loading -->
        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="bg-white animate-skeleton aspect-video"></div>
        </div>

        <!-- Sem vídeos -->
        <div v-else-if="!videos.length" class="py-32 text-center">
          <LucideVideo class="w-16 h-16 mx-auto mb-6 text-cantuaria-oxford/20" />
          <p class="font-serif text-2xl text-cantuaria-oxford/40">
            {{ searchQuery ? `Nenhum resultado para "${searchQuery}".` : 'Nenhum vídeo disponível ainda.' }}
          </p>
          <button v-if="searchQuery" @click="searchQuery = ''" class="mt-4 text-[10px] uppercase tracking-widest font-bold text-cantuaria-oxford border border-cantuaria-oxford px-6 py-2 hover:bg-cantuaria-oxford hover:text-white transition-all">
            Limpar busca
          </button>
        </div>

        <template v-else>
          <!-- Playlists em destaque -->
          <div v-if="playlists.length" class="mb-14 space-y-4">
            <h2 class="font-serif text-2xl text-cantuaria-oxford">Playlists</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <NuxtLink
                v-for="pl in playlists"
                :key="pl.id"
                :to="`/videos?playlist=${pl.slug}`"
                class="group flex items-center gap-4 bg-white border border-cantuaria-charcoal/5 p-5 hover:shadow-lg hover:border-cantuaria-oxford/20 transition-all"
              >
                <LucideListVideo class="w-8 h-8 text-cantuaria-gold flex-shrink-0" />
                <div>
                  <div class="font-medium text-cantuaria-oxford group-hover:text-cantuaria-oxford/80">{{ pl.title }}</div>
                  <div v-if="pl.description" class="text-xs text-cantuaria-charcoal/50 mt-0.5 line-clamp-1">{{ pl.description }}</div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Filtro de playlist ativo -->
          <div v-if="activePlaylist" class="flex items-center gap-3 mb-8">
            <span class="text-sm font-medium text-cantuaria-oxford">Playlist: <strong>{{ activePlaylist.title }}</strong></span>
            <button @click="clearPlaylist" class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-crimson border border-cantuaria-charcoal/10 px-3 py-1">
              Limpar filtro
            </button>
          </div>

          <!-- Grid de vídeos -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="video in videos"
              :key="video.id"
              :to="`/videos/${video.slug}`"
              class="group bg-white border border-cantuaria-charcoal/5 shadow-sm hover:shadow-xl hover:border-cantuaria-oxford/20 transition-all duration-300 flex flex-col"
            >
              <!-- Thumbnail -->
              <div class="aspect-video overflow-hidden relative">
                <img
                  v-if="video.thumbnail_url"
                  :src="video.thumbnail_url"
                  :alt="video.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div v-else class="w-full h-full bg-cantuaria-oxford/10 flex items-center justify-center">
                  <LucideYoutube class="w-12 h-12 text-cantuaria-oxford/20" />
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                  <LucidePlay class="w-10 h-10 text-white drop-shadow-lg" />
                </div>
              </div>

              <!-- Info -->
              <div class="p-5 flex flex-col flex-grow">
                <div v-if="video.playlists" class="text-[8px] uppercase tracking-[0.25em] font-bold text-cantuaria-gold mb-1">
                  {{ video.playlists.title }}
                </div>
                <h3 class="font-serif text-cantuaria-oxford font-medium leading-snug line-clamp-2 group-hover:text-cantuaria-oxford/80 transition-colors">
                  {{ video.title }}
                </h3>
                <div class="mt-auto pt-3 flex items-center justify-between">
                  <span v-if="video.publication_year" class="text-[10px] text-cantuaria-charcoal/40">{{ video.publication_year }}</span>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="va in video.video_authors?.slice(0, 2)"
                      :key="va.authors?.id"
                      class="text-[9px] bg-cantuaria-cream/80 text-cantuaria-charcoal/60 px-2 py-0.5"
                    >
                      {{ va.authors?.name }}
                    </span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </template>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import {
  Video as LucideVideo,
  Youtube as LucideYoutube,
  Play as LucidePlay,
  ListVideo as LucideListVideo,
  Search as LucideSearch,
  X as LucideX,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const playlistSlug = computed(() => route.query.playlist as string | undefined)
const searchQuery = ref((route.query.q as string) || '')

const { data: playlistsData } = await useAsyncData('playlists-list', () =>
  $fetch('/api/playlists') as Promise<any[]>
)
const playlists = computed(() => playlistsData.value || [])

const activePlaylist = computed(() =>
  playlistSlug.value ? playlists.value.find((p: any) => p.slug === playlistSlug.value) : null
)

const buildQuery = () => {
  const q: Record<string, any> = { page_size: 50 }
  if (playlistSlug.value && activePlaylist.value?.id) q.playlist_id = activePlaylist.value.id
  if (searchQuery.value.trim()) q.search = searchQuery.value.trim()
  return q
}

const { data: videosResult, pending, refresh } = await useAsyncData(
  () => `videos-list-${playlistSlug.value || 'all'}-${searchQuery.value}`,
  () => $fetch('/api/videos', { query: buildQuery() }) as Promise<{ data: any[]; count: number }>
)

const videos = computed(() => videosResult.value?.data || [])

const clearPlaylist = () => { router.push('/videos') }

const debouncedRefresh = useDebounceFn(() => refresh(), 400)
watch(searchQuery, debouncedRefresh)
watch(playlistSlug, () => refresh())

useHead({
  title: 'Vídeos | Projeto Cantuária',
  meta: [{ name: 'description', content: 'Sermões, conferências e documentários da tradição anglicana.' }]
})
</script>
