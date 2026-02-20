<template>
  <div class="w-full h-full bg-white flex flex-col relative overflow-hidden">
    <!-- Toolbar de Zoom Mobile -->
    <div v-if="isMobile && !loadingPdf && url" class="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
      <button @click="adjustScale(0.2)" class="w-12 h-12 bg-cantuaria-oxford/90 backdrop-blur-md text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform border border-white/10">
        <LucidePlus class="w-6 h-6" />
      </button>
      <button @click="adjustScale(-0.2)" class="w-12 h-12 bg-cantuaria-oxford/90 backdrop-blur-md text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform border border-white/10">
        <LucideMinus class="w-6 h-6" />
      </button>
      <button @click="resetScale" class="w-12 h-12 bg-cantuaria-gold/90 backdrop-blur-md text-cantuaria-oxford rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform border border-white/10">
        <LucideRotateCcw class="w-5 h-5" />
      </button>
    </div>

    <!-- Visualizador Mobile (PDF.js) -->
    <div 
      v-if="isMobile && url && url.endsWith('.pdf')" 
      class="flex-grow overflow-auto relative bg-cantuaria-charcoal overscroll-contain" 
      style="-webkit-overflow-scrolling: touch;"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
    >
      <div v-if="loadingPdf" class="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-4">
        <LucideLoader2 class="w-8 h-8 animate-spin" />
        <span class="text-[10px] uppercase tracking-widest font-bold">Carregando Obra...</span>
      </div>
      
      <div 
        v-show="!loadingPdf" 
        class="flex flex-col gap-4 p-2 md:p-4 min-h-full transition-transform duration-200 ease-out origin-top"
        :style="{ transform: `scale(${scale})`, width: scale > 1 ? `${100 * scale}%` : '100%' }"
      >
        <canvas v-for="page in pages" :key="page" :ref="el => setPageRef(el, page)" class="w-full h-auto shadow-2xl mx-auto block bg-white"></canvas>
      </div>
    </div>

    <!-- Visualizador Desktop (Iframe Nativo) -->
    <div v-else-if="url && url.endsWith('.pdf')" class="flex-grow bg-white">
      <iframe 
        :src="url" 
        class="w-full h-full border-none"
        title="Visualizador de PDF"
      ></iframe>
    </div>

    <!-- Fallback / Texto Reader -->
    <div v-else class="flex-grow flex justify-center p-4 lg:p-12 overflow-auto bg-cantuaria-cream">
      <div class="w-full max-w-3xl bg-cantuaria-cream text-cantuaria-charcoal p-8 md:p-12 shadow-2xl font-serif leading-relaxed h-fit min-h-full">
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
  FileWarning as LucideFileWarning, 
  Loader2 as LucideLoader2,
  Plus as LucidePlus,
  Minus as LucideMinus,
  RotateCcw as LucideRotateCcw
} from 'lucide-vue-next'

const props = defineProps({
  url: String,
  type: String
})

const isMobile = ref(false)
const loadingPdf = ref(false)
const pages = ref([])
const pageRefs = ref({})
const scale = ref(1.0)

// Lógica de Pinch-to-zoom
let initialDist = 0
const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    initialDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY)
  }
}

const handleTouchMove = (e) => {
  if (e.touches.length === 2 && initialDist > 0) {
    const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY)
    const delta = dist / initialDist
    const newScale = Math.min(Math.max(scale.value * delta, 1.0), 3.0)
    scale.value = newScale
    initialDist = dist
  }
}

const adjustScale = (delta) => {
  scale.value = Math.min(Math.max(scale.value + delta, 1.0), 3.0)
}

const resetScale = () => { scale.value = 1.0 }

const setPageRef = (el, pageNum) => {
  if (el) pageRefs.value[pageNum] = el
}

const initPdfJs = async () => {
  if (!props.url || !isMobile.value || !process.client) return
  
  loadingPdf.value = true
  pages.value = []
  scale.value = 1.0
  
  try {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    
    const loadingTask = pdfjs.getDocument({ url: props.url, disableFontFace: true })
    const pdf = await loadingTask.promise
    
    const numPages = pdf.numPages
    pages.value = Array.from({ length: numPages }, (_, i) => i + 1)
    
    nextTick(async () => {
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const canvas = pageRefs.value[i]
        if (!canvas) continue
        
        const context = canvas.getContext('2d')
        // Escala 1.5 para boa resolução sem pesar demais na memória
        const viewport = page.getViewport({ scale: 1.5 })
        
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        await page.render({ canvasContext: context, viewport }).promise
      }
      loadingPdf.value = false
    })
  } catch (err) {
    console.error('Erro PDF.js:', err)
    loadingPdf.value = false
  }
}

onMounted(() => {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) initPdfJs()
})

watch(() => props.url, () => {
  if (isMobile.value) initPdfJs()
})
</script>
