<template>
  <div v-if="show" class="fixed inset-0 z-[150] bg-cantuaria-oxford/98 backdrop-blur-xl flex flex-col items-center justify-center p-4">
    <div class="bg-white w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
      <header class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center">
        <h3 class="font-serif text-xl text-cantuaria-oxford">Ajustar Capa</h3>
        <button @click="$emit('close')" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full"><LucideX class="w-5 h-5" /></button>
      </header>
      
      <div class="flex-grow bg-cantuaria-charcoal overflow-hidden flex items-center justify-center p-4">
        <img ref="cropImgRef" :src="image" class="max-w-full max-h-full block" />
      </div>

      <footer class="p-6 border-t border-cantuaria-charcoal/5 flex justify-between items-center bg-cantuaria-cream/30">
        <div class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">
          Arraste e redimensione para definir a capa (Proporção 3:4.5)
        </div>
        <div class="flex gap-4">
          <button @click="$emit('close')" class="px-6 py-2 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">Cancelar</button>
          <button @click="confirm" :disabled="loading" class="px-10 py-3 bg-cantuaria-gold text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-gold/90 transition-all shadow-lg disabled:opacity-50">
            <template v-if="loading"><LucideLoader2 class="w-4 h-4 animate-spin inline mr-2" /> Enviando...</template>
            <template v-else>Confirmar Capa</template>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X as LucideX, Loader2 as LucideLoader2 } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  image: string
  loading: boolean
}>()

const emit = defineEmits(['close', 'confirm'])

const cropImgRef = ref<HTMLImageElement | null>(null)
let cropperInstance: any = null

const confirm = () => {
  if (cropperInstance) {
    emit('confirm', cropperInstance)
  }
}

watch(() => props.show, async (newVal) => {
  if (newVal) {
    const Cropper = (await import('cropperjs')).default
    await nextTick()
    if (cropperInstance) cropperInstance.destroy()
    cropperInstance = new Cropper(cropImgRef.value!, {
      aspectRatio: 3 / 4.5,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1,
      background: false,
    })
  } else if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
})
</script>
