<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex gap-3">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          @click="$emit('update:statusFilter', tab.value)"
          :class="['px-5 py-2 text-[10px] uppercase tracking-widest font-bold transition-all border',
            statusFilter === tab.value
              ? 'bg-cantuaria-oxford text-white border-cantuaria-oxford'
              : 'border-cantuaria-charcoal/10 text-cantuaria-charcoal/40 hover:text-cantuaria-oxford']"
        >
          {{ tab.label }}
        </button>
      </div>
      <button @click="$emit('openNew')" class="flex items-center gap-2 px-6 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-widest font-bold hover:shadow-lg transition-all">
        <LucidePlus class="w-4 h-4" />
        Novo Vídeo
      </button>
    </div>

    <div v-if="videos.length === 0" class="bg-white border border-cantuaria-charcoal/5 p-20 text-center shadow-sm">
      <LucideVideo class="w-12 h-12 mx-auto mb-4 text-cantuaria-gold/30" />
      <p class="font-serif text-xl text-cantuaria-oxford/50">Nenhum vídeo cadastrado.</p>
    </div>

    <div v-else class="bg-white border border-cantuaria-charcoal/5 shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-cantuaria-cream/50 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 border-b border-cantuaria-charcoal/5">
            <th class="px-6 py-4 w-16"></th>
            <th class="px-6 py-4">Título</th>
            <th class="px-4 py-4">Playlist</th>
            <th class="px-4 py-4">Ano</th>
            <th class="px-4 py-4">Views</th>
            <th class="px-4 py-4">Status</th>
            <th class="px-4 py-4 w-16">Ordem</th>
            <th class="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-cantuaria-charcoal/5">
          <tr v-for="video in videos" :key="video.id" class="group hover:bg-cantuaria-cream/30 transition-colors">
            <td class="px-6 py-4">
              <img
                v-if="video.thumbnail_url"
                :src="video.thumbnail_url"
                class="w-14 aspect-video object-cover rounded-sm shadow-sm"
              />
              <div v-else class="w-14 aspect-video bg-cantuaria-charcoal/5 rounded-sm flex items-center justify-center">
                <LucideYoutube class="w-5 h-5 text-cantuaria-charcoal/20" />
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="font-medium text-cantuaria-oxford line-clamp-1">{{ video.title }}</div>
              <div class="text-[10px] text-cantuaria-charcoal/40 font-mono mt-0.5 truncate max-w-xs">{{ video.slug }}</div>
            </td>
            <td class="px-4 py-4 text-xs text-cantuaria-charcoal/60">{{ video.playlists?.title || '—' }}</td>
            <td class="px-4 py-4 text-xs text-cantuaria-charcoal/60">{{ video.publication_year || '—' }}</td>
            <td class="px-4 py-4 text-xs text-cantuaria-charcoal/60">{{ video.views_count || 0 }}</td>
            <td class="px-4 py-4">
              <span :class="['text-[9px] uppercase tracking-widest font-bold px-2 py-1',
                video.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700']">
                {{ video.status === 'published' ? 'Publicado' : 'Pendente' }}
              </span>
            </td>
            <td class="px-4 py-4">
              <div v-if="video.playlist_id" class="flex flex-col gap-0.5">
                <button
                  @click="$emit('reorder', video, 'up')"
                  :disabled="!canMoveUp(video)"
                  class="p-0.5 text-cantuaria-charcoal/30 hover:text-cantuaria-oxford disabled:opacity-20 disabled:cursor-default transition-colors"
                >
                  <LucideChevronUp class="w-4 h-4" />
                </button>
                <button
                  @click="$emit('reorder', video, 'down')"
                  :disabled="!canMoveDown(video)"
                  class="p-0.5 text-cantuaria-charcoal/30 hover:text-cantuaria-oxford disabled:opacity-20 disabled:cursor-default transition-colors"
                >
                  <LucideChevronDown class="w-4 h-4" />
                </button>
              </div>
              <span v-else class="text-[10px] text-cantuaria-charcoal/20">—</span>
            </td>
            <td class="px-6 py-4 text-right whitespace-nowrap">
              <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a :href="`https://youtube.com/watch?v=${video.youtube_id}`" target="_blank" class="p-2 text-cantuaria-charcoal/20 hover:text-cantuaria-crimson transition-colors">
                  <LucideExternalLink class="w-4 h-4" />
                </a>
                <button @click="$emit('openEdit', video)" class="px-4 py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all">Editar</button>
                <button @click="$emit('delete', video)" class="p-2 text-cantuaria-charcoal/20 hover:text-cantuaria-crimson transition-colors"><LucideTrash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Plus as LucidePlus,
  Video as LucideVideo,
  Youtube as LucideYoutube,
  Trash2 as LucideTrash2,
  ExternalLink as LucideExternalLink,
  ChevronUp as LucideChevronUp,
  ChevronDown as LucideChevronDown,
} from 'lucide-vue-next'

const props = defineProps<{
  videos: any[]
  statusFilter: string
}>()

defineEmits(['openNew', 'openEdit', 'delete', 'update:statusFilter', 'reorder'])

const statusTabs = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'published', label: 'Publicados' },
]

// Agrupa vídeos por playlist para habilitar reordenação
const playlistGroups = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const v of props.videos) {
    const key = v.playlist_id || '__none__'
    if (!groups[key]) groups[key] = []
    groups[key].push(v)
  }
  return groups
})

const getPlaylistSiblings = (video: any) => {
  const key = video.playlist_id || '__none__'
  return (playlistGroups.value[key] || []).sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
}

const canMoveUp = (video: any) => {
  if (!video.playlist_id) return false
  const siblings = getPlaylistSiblings(video)
  return siblings.findIndex((v: any) => v.id === video.id) > 0
}

const canMoveDown = (video: any) => {
  if (!video.playlist_id) return false
  const siblings = getPlaylistSiblings(video)
  const idx = siblings.findIndex((v: any) => v.id === video.id)
  return idx < siblings.length - 1
}
</script>
