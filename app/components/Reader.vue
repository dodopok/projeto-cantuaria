<template>
  <div class="w-full h-full bg-cantuaria-charcoal overflow-hidden">
    <!-- Visualizador Nativo do Browser -->
    <iframe 
      v-if="url && url.endsWith('.pdf')" 
      :src="`${url}#view=Fit&toolbar=1`" 
      class="w-full h-full border-none bg-white"
      title="Visualizador de PDF"
    ></iframe>

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
</template>

<script setup>
import { FileWarning as LucideFileWarning } from 'lucide-vue-next'

defineProps({
  url: String,
  type: String
})
</script>

<style scoped>
/* Garante que o iframe ocupe todo o espaço disponível sem margens */
iframe {
  display: block;
}
</style>
