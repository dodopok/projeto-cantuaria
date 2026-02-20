<template>
  <div class="w-full h-full bg-cantuaria-charcoal flex flex-col">
    <!-- Visualizador Nativo do Browser -->
    <div class="flex-grow relative bg-white overflow-y-auto overflow-x-hidden touch-auto" style="-webkit-overflow-scrolling: touch;">
      <object
        v-if="url && url.endsWith('.pdf')" 
        :data="url"
        type="application/pdf"
        class="w-full h-full min-h-[calc(100vh-120px)] block"
      >
        <!-- Fallback caso o browser não consiga renderizar o object -->
        <iframe :src="url" class="w-full h-full border-none"></iframe>
      </object>

      <!-- Fallback / Texto Reader -->
      <div v-else class="flex justify-center p-4 lg:p-12 h-full overflow-auto">
        <div class="w-full max-w-3xl bg-cantuaria-cream text-cantuaria-charcoal p-12 shadow-2xl font-serif leading-relaxed h-fit min-h-full">
          <slot name="content">
            <div class="text-center py-20 text-cantuaria-charcoal/30">
              <LucideFileWarning class="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p class="uppercase tracking-widest text-xs font-bold">Documento em processamento ou formato não suportado para prévia.</p>
            </div>
          </slot>
        </div>
      </div>
    </div>

    <!-- Barra de Ajuda Mobile (Fallbacks para iOS onde o embed é limitado) -->
    <div v-if="url && url.endsWith('.pdf')" class="md:hidden p-4 bg-cantuaria-oxford border-t border-white/10 flex justify-center shrink-0">
      <a 
        :href="url" 
        target="_blank" 
        class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-gold flex items-center gap-2"
      >
        <LucideExternalLink class="w-3.5 h-3.5" />
        Abrir em tela cheia (Melhor p/ iPhone)
      </a>
    </div>
  </div>
</template>

<script setup>
import { FileWarning as LucideFileWarning, ExternalLink as LucideExternalLink } from 'lucide-vue-next'

defineProps({
  url: String,
  type: String
})
</script>

<style scoped>
/* Estilos específicos para garantir que o object/iframe respeite o container */
object, iframe {
  width: 100%;
  height: 100%;
}
</style>
