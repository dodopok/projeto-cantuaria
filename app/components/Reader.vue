<template>
  <div class="w-full h-full flex flex-col bg-cantuaria-charcoal text-white">
    <!-- Toolbar do Leitor -->
    <div class="h-12 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4">
      <div class="flex items-center gap-4">
        <button class="p-1.5 hover:bg-white/10 rounded transition-colors" title="Zoom Out">
          <LucideZoomOut class="w-4 h-4" />
        </button>
        <span class="text-[10px] uppercase tracking-widest font-bold text-white/40">100%</span>
        <button class="p-1.5 hover:bg-white/10 rounded transition-colors" title="Zoom In">
          <LucideZoomIn class="w-4 h-4" />
        </button>
      </div>
      
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] uppercase tracking-widest font-bold transition-colors">
          <LucideChevronLeft class="w-3.5 h-3.5" /> Anterior
        </button>
        <span class="text-[10px] font-bold text-white/40">Pág 1 de 124</span>
        <button class="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] uppercase tracking-widest font-bold transition-colors">
          Próximo <LucideChevronRight class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="flex items-center gap-4">
        <button class="p-1.5 hover:bg-white/10 rounded transition-colors" @click="toggleFullscreen">
          <LucideMaximize class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Area de Conteúdo -->
    <div class="flex-grow overflow-auto flex justify-center p-4 lg:p-12 relative">
      <!-- PDF Viewer -->
      <iframe 
        v-if="url && url.endsWith('.pdf')" 
        :src="`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`" 
        class="w-full max-w-5xl bg-white shadow-2xl h-full border-none"
      ></iframe>

      <!-- Fallback / Texto Reader -->
      <div v-else class="w-full max-w-3xl bg-cantuaria-cream text-cantuaria-charcoal p-12 shadow-2xl font-serif leading-relaxed h-fit min-h-full">
        <slot name="content">
          <div class="text-center py-20 text-cantuaria-charcoal/30">
            <LucideFileWarning class="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p class="uppercase tracking-widest text-xs font-bold">Documento em processamento ou formato não suportado para prévia.</p>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ZoomIn as LucideZoomIn, 
  ZoomOut as LucideZoomOut, 
  ChevronLeft as LucideChevronLeft, 
  ChevronRight as LucideChevronRight,
  Maximize as LucideMaximize,
  FileWarning as LucideFileWarning
} from 'lucide-vue-next'

defineProps({
  url: String,
  type: String
})

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}
</script>
