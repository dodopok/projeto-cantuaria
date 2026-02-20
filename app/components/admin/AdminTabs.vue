<template>
  <div class="flex flex-col md:flex-row justify-between items-center border-b border-cantuaria-oxford/10 gap-4">
    <div class="flex gap-8">
      <button 
        v-for="tab in tabOptions"
        :key="tab.id"
        @click="$emit('update:currentTab', tab.id)"
        :class="['pb-4 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2', 
        currentTab === tab.id ? 'border-cantuaria-oxford text-cantuaria-oxford' : 'border-transparent text-cantuaria-charcoal/40 hover:text-cantuaria-oxford']"
      >
        {{ tab.label }} {{ tab.count !== undefined ? `(${tab.count})` : '' }}
      </button>
    </div>

    <div v-if="selectedCount > 0 && currentTab !== 'removal'" class="pb-4 flex gap-3 animate-fade-in">
      <button
        v-if="currentTab === 'pending'"
        @click="$emit('startBatchAnalysis')"
        class="flex items-center gap-2 px-6 py-2 bg-cantuaria-gold text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:shadow-lg transition-all"
      >
        <LucideSparkles class="w-4 h-4" />
        Analisar com IA
      </button>
      <button
        @click="$emit('startBatchOcr')"
        class="flex items-center gap-2 px-6 py-2 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-widest font-bold hover:shadow-lg transition-all"
      >
        <LucideScanText class="w-4 h-4" />
        OCR em Massa
      </button>
      <button
        @click="$emit('deleteSelected')"
        :disabled="deletingBulk"
        class="flex items-center gap-2 px-6 py-2 bg-cantuaria-crimson text-white text-[10px] uppercase tracking-widest font-bold hover:shadow-lg transition-all disabled:opacity-50"
      >
        <LucideLoader2 v-if="deletingBulk" class="w-4 h-4 animate-spin" />
        <LucideTrash2 v-else class="w-4 h-4" />
        Excluir {{ selectedCount }} selecionados
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Sparkles as LucideSparkles, 
  ScanText as LucideScanText, 
  Trash2 as LucideTrash2, 
  Loader2 as LucideLoader2 
} from 'lucide-vue-next'

const props = defineProps<{
  currentTab: string
  pendingCount: number
  removalCount: number
  publicationsCount: number
  selectedCount: number
  deletingBulk: boolean
}>()

const emit = defineEmits([
  'update:currentTab', 
  'startBatchAnalysis', 
  'startBatchOcr', 
  'deleteSelected'
])

const tabOptions = computed(() => [
  { id: 'pending', label: 'Pendentes', count: props.pendingCount },
  { id: 'published', label: 'Publicados' },
  { id: 'removal', label: 'Solicitações', count: props.removalCount },
  { id: 'publications', label: 'Publicações', count: props.publicationsCount }
])
</script>
