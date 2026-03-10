<template>
  <NuxtLayout>
    <div v-if="pending" class="min-h-screen bg-cantuaria-cream flex items-center justify-center">
      <LucideLoader2 class="w-10 h-10 animate-spin text-cantuaria-oxford/30" />
    </div>

    <div v-else-if="!video" class="min-h-screen bg-cantuaria-cream flex flex-col items-center justify-center gap-4">
      <LucideVideo class="w-16 h-16 text-cantuaria-oxford/20" />
      <p class="font-serif text-2xl text-cantuaria-oxford/40">Vídeo não encontrado.</p>
      <NuxtLink to="/videos" class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-oxford border border-cantuaria-oxford px-6 py-3 hover:bg-cantuaria-oxford hover:text-white transition-all">
        Ver todos os vídeos
      </NuxtLink>
    </div>

    <div v-else class="bg-cantuaria-cream min-h-screen">
      <!-- Hero com embed -->
      <section class="bg-cantuaria-oxford">
        <div class="container mx-auto px-6 py-10 max-w-5xl">
          <div class="aspect-video w-full shadow-2xl">
            <iframe
              :src="`https://www.youtube.com/embed/${video.youtube_id}?rel=0`"
              class="w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>
      </section>

      <!-- Conteúdo -->
      <section class="container mx-auto px-6 py-12 max-w-5xl">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Principal -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Playlist breadcrumb -->
            <div v-if="video.playlists" class="flex items-center gap-2">
              <NuxtLink :to="`/videos?playlist=${video.playlists.slug}`" class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-gold hover:underline">
                {{ video.playlists.title }}
              </NuxtLink>
              <span class="text-cantuaria-charcoal/20">›</span>
            </div>

            <h1 class="font-serif text-3xl md:text-4xl text-cantuaria-oxford leading-tight">{{ video.title }}</h1>

            <!-- Meta -->
            <div class="flex flex-wrap gap-4 text-xs text-cantuaria-charcoal/50 border-t border-b border-cantuaria-charcoal/5 py-4">
              <span v-if="video.publication_year" class="flex items-center gap-1.5">
                <LucideCalendar class="w-3.5 h-3.5" />
                {{ video.publication_year }}
              </span>
              <span v-if="authors.length" class="flex items-center gap-1.5">
                <LucideUser class="w-3.5 h-3.5" />
                {{ authors.join(', ') }}
              </span>
              <span v-if="video.categories" class="flex items-center gap-1.5">
                <LucideTag class="w-3.5 h-3.5" />
                {{ video.categories.name }}
              </span>
              <span v-if="video.views_count" class="flex items-center gap-1.5">
                <LucideEye class="w-3.5 h-3.5" />
                {{ video.views_count.toLocaleString('pt-BR') }} visualizações
              </span>
            </div>

            <!-- Descrição -->
            <div v-if="video.summary" class="prose prose-sm max-w-none text-cantuaria-charcoal/80 leading-relaxed whitespace-pre-line">
              {{ video.summary }}
            </div>

            <!-- Tags -->
            <div v-if="tags.length" class="flex flex-wrap gap-2">
              <span v-for="tag in tags" :key="tag" class="text-[9px] uppercase tracking-widest font-bold bg-cantuaria-oxford/5 text-cantuaria-oxford/50 px-3 py-1.5 hover:bg-cantuaria-oxford/10 transition-colors">
                {{ tag }}
              </span>
            </div>

            <!-- Link YouTube -->
            <a
              :href="video.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-crimson transition-colors"
            >
              <LucideYoutube class="w-4 h-4" />
              Ver no YouTube
            </a>
          </div>

          <!-- Sidebar: outros vídeos da playlist -->
          <div v-if="playlistVideos.length > 1" class="space-y-4">
            <h3 class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 border-b border-cantuaria-charcoal/5 pb-3">
              Nesta playlist
            </h3>
            <div class="space-y-3">
              <NuxtLink
                v-for="pv in playlistVideos"
                :key="pv.id"
                :to="`/videos/${pv.slug}`"
                :class="['group flex gap-3 p-3 transition-all', pv.id === video.id ? 'bg-cantuaria-oxford/5 border-l-2 border-cantuaria-oxford' : 'hover:bg-cantuaria-oxford/5']"
              >
                <img v-if="pv.thumbnail_url" :src="pv.thumbnail_url" class="w-16 aspect-video object-cover flex-shrink-0" />
                <div v-else class="w-16 aspect-video bg-cantuaria-charcoal/5 flex-shrink-0 flex items-center justify-center">
                  <LucideYoutube class="w-4 h-4 text-cantuaria-charcoal/20" />
                </div>
                <p :class="['text-xs leading-snug line-clamp-2', pv.id === video.id ? 'font-semibold text-cantuaria-oxford' : 'text-cantuaria-charcoal/70 group-hover:text-cantuaria-oxford']">
                  {{ pv.title }}
                </p>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  Loader2 as LucideLoader2,
  Video as LucideVideo,
  Youtube as LucideYoutube,
  Calendar as LucideCalendar,
  User as LucideUser,
  Tag as LucideTag,
  Eye as LucideEye,
} from 'lucide-vue-next'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: video, pending } = await useAsyncData(
  () => `video-${slug.value}`,
  () => $fetch(`/api/videos/${slug.value}`) as Promise<any>
)

const authors = computed(() =>
  (video.value?.video_authors || []).map((va: any) => va.authors?.name).filter(Boolean)
)

const tags = computed(() =>
  (video.value?.video_tags || []).map((vt: any) => vt.tags?.name).filter(Boolean)
)

const { data: playlistVideosData } = await useAsyncData(
  () => `playlist-videos-${video.value?.playlist_id || 'none'}`,
  async () => {
    if (!video.value?.playlist_id) return []
    const result: any = await $fetch('/api/videos', { query: { playlist_id: video.value.playlist_id, page_size: 50 } })
    return result.data || []
  }
)

const playlistVideos = computed(() => playlistVideosData.value || [])

useHead({
  title: computed(() => video.value ? `${video.value.title} | Projeto Cantuária` : 'Vídeo | Projeto Cantuária'),
  meta: [
    { name: 'description', content: computed(() => video.value?.summary?.substring(0, 160) || '') },
    { property: 'og:image', content: computed(() => video.value?.thumbnail_url || '') },
  ]
})
</script>
