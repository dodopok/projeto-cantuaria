<template>
  <div v-if="show" class="fixed inset-0 z-[150] bg-cantuaria-oxford/98 backdrop-blur-xl flex flex-col items-center justify-center p-4">
    <div class="bg-white w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] animate-in fade-in zoom-in duration-300">
      <header class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center bg-white shrink-0">
        <div>
          <h3 class="font-serif text-xl text-cantuaria-oxford">Ajustar Capa</h3>
          <p class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mt-1">Defina o enquadramento ideal para o documento</p>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full transition-colors"><LucideX class="w-5 h-5 text-cantuaria-oxford/40" /></button>
      </header>
      
      <!-- Container do Cropper - Ajuste crítico de posicionamento -->
      <div class="flex-grow bg-cantuaria-charcoal relative overflow-hidden">
        <div v-if="!cropperReady" class="absolute inset-0 flex items-center justify-center z-10 bg-cantuaria-charcoal">
          <LucideLoader2 class="w-8 h-8 animate-spin text-white/20" />
        </div>
        
        <!-- Wrapper absoluto para garantir que o CropperJS veja um tamanho fixo e contido -->
        <div class="absolute inset-0 m-4 flex items-center justify-center">
          <div class="w-full h-full relative">
            <img 
              ref="cropImgRef" 
              :src="image" 
              class="max-w-full max-h-full block" 
              :style="{ visibility: cropperReady ? 'visible' : 'hidden' }"
              @load="onImageLoad"
            />
          </div>
        </div>
      </div>

      <footer class="p-6 border-t border-cantuaria-charcoal/5 flex flex-col sm:flex-row gap-6 justify-between items-center bg-cantuaria-cream/30 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-cantuaria-gold/10 flex items-center justify-center rounded-full">
            <LucideCrop class="w-4 h-4 text-cantuaria-gold" />
          </div>
          <div class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 leading-tight">
            Arraste e redimensione<br/>(Proporção 3:4.5)
          </div>
        </div>
        <div class="flex gap-4 w-full sm:w-auto">
          <button @click="$emit('close')" class="flex-1 sm:flex-none px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">Cancelar</button>
          <button @click="confirm" :disabled="loading || !cropperReady" class="flex-1 sm:flex-none px-10 py-3 bg-cantuaria-gold text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-gold/90 transition-all shadow-lg disabled:opacity-50 active:scale-[0.98]">
            <template v-if="loading"><LucideLoader2 class="w-4 h-4 animate-spin inline mr-2" /> Processando...</template>
            <template v-else>Confirmar Capa</template>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X as LucideX, Loader2 as LucideLoader2, Crop as LucideCrop } from 'lucide-vue-next'
import 'cropperjs/dist/cropper.css'

const props = defineProps<{
  show: boolean
  image: string
  loading: boolean
}>()

const emit = defineEmits(['close', 'confirm'])

const cropImgRef = ref<HTMLImageElement | null>(null)
const cropperReady = ref(false)
let cropperInstance: any = null

const confirm = () => {
  if (cropperInstance) {
    emit('confirm', cropperInstance)
  }
}

const onImageLoad = () => {
  if (props.show) {
    initCropper()
  }
}

const initCropper = async () => {
  if (!cropImgRef.value) return
  
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }

  cropperReady.value = false
  const Cropper = (await import('cropperjs')).default
  
  // Pequeno delay para garantir que o layout flex do modal terminou de se ajustar
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 50))
  
  cropperInstance = new Cropper(cropImgRef.value!, {
    aspectRatio: 3 / 4.5,
    viewMode: 2, // Força a imagem a caber inteira no container
    dragMode: 'move',
    autoCropArea: 0.7, // Inicia um pouco menor para mostrar que há margem
    background: false,
    responsive: true,
    checkCrossOrigin: true,
    ready: () => {
      cropperReady.value = true
    }
  })
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (cropImgRef.value?.complete) {
      initCropper()
    }
  } else {
    if (cropperInstance) {
      cropperInstance.destroy()
      cropperInstance = null
    }
    cropperReady.value = false
  }
})

onUnmounted(() => {
  if (cropperInstance) {
    cropperInstance.destroy()
  }
})
</script>

<style>
/* Customização para o tema Cantuária */
.cropper-line, .cropper-point {
  background-color: #C5A059 !important;
}
.cropper-view-box {
  outline: 1px solid #C5A059 !important;
}
.cropper-modal {
  opacity: 0.8 !important;
  background-color: #1A1A1A !important;
}

/* Garante que o container do cropper ocupe todo o espaço disponível do container absoluto */
.cropper-container {
  width: 100% !important;
  height: 100% !important;
}
</style>
