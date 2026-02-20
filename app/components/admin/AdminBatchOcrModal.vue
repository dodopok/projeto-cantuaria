<template>
  <div v-if="active" class="fixed inset-0 z-[110] bg-cantuaria-oxford/98 backdrop-blur-xl flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden relative animate-fade-in">
      <header class="p-8 border-b border-cantuaria-charcoal/5 flex justify-between items-center bg-white">
        <div>
          <h3 class="font-serif text-3xl text-cantuaria-oxford">Markdown em Massa</h3>
          <p class="text-xs text-cantuaria-charcoal/40 uppercase tracking-widest font-bold mt-1">Geração de transcrição via Gemini 2.0 Flash</p>
        </div>
        <button v-if="!isRunning" @click="$emit('close')" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full"><LucideX class="w-6 h-6" /></button>
      </header>

      <div class="flex-grow overflow-auto p-8 bg-cantuaria-cream/20 space-y-3">
        <div v-for="res in results" :key="res.id" class="flex items-center gap-4 p-4 border border-cantuaria-charcoal/10 bg-white rounded-sm">
          <div class="shrink-0">
            <LucideLoader2 v-if="res.status === 'processing'" class="w-5 h-5 animate-spin text-cantuaria-gold" />
            <LucideCheckCircle v-else-if="res.status === 'complete'" class="w-5 h-5 text-green-600" />
            <LucideAlertCircle v-else-if="res.status === 'error'" class="w-5 h-5 text-cantuaria-crimson" />
            <LucideScanText v-else class="w-5 h-5 text-cantuaria-charcoal/20" />
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-sm font-medium text-cantuaria-oxford truncate">{{ res.originalTitle }}</p>
            <p v-if="res.status === 'processing'" class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-gold animate-pulse mt-0.5">Transcrição com Gemini...</p>
            <p v-else-if="res.status === 'complete'" class="text-[9px] uppercase tracking-widest font-bold text-green-600 mt-0.5">Markdown atualizado ({{ res.chars }} chars)</p>
            <p v-else-if="res.status === 'error'" class="text-[9px] text-cantuaria-crimson mt-0.5">{{ res.errorMessage }}</p>
            <p v-else class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mt-0.5">Aguardando...</p>
          </div>
        </div>
      </div>

      <footer class="p-6 border-t border-cantuaria-charcoal/5 bg-cantuaria-cream/30 flex justify-between items-center">
        <span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">
          {{ results.filter(r => r.status === 'complete').length }} de {{ results.length }} concluídos
        </span>
        <button v-if="!isRunning" @click="$emit('close')" class="px-8 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl transition-all">
          Fechar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  X as LucideX, 
  Loader2 as LucideLoader2, 
  CheckCircle as LucideCheckCircle, 
  AlertCircle as LucideAlertCircle, 
  ScanText as LucideScanText 
} from 'lucide-vue-next'

defineProps<{
  active: boolean
  isRunning: boolean
  results: any[]
}>()

defineEmits(['close'])
</script>
