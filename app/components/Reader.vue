<template>
  <div class="w-full h-full bg-white flex flex-col overflow-hidden">
    <!-- Visualizador Mobile (PDF.js) -->
    <div v-if="isMobile && url && url.endsWith('.pdf')" class="flex-grow overflow-y-auto overflow-x-hidden relative bg-cantuaria-charcoal" style="-webkit-overflow-scrolling: touch;">
      <div v-if="loadingPdf" class="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-4">
        <LucideLoader2 class="w-8 h-8 animate-spin" />
        <span class="text-[10px] uppercase tracking-widest font-bold">Carregando Obra...</span>
      </div>
      
      <div v-show="!loadingPdf" class="flex flex-col gap-4 p-2 md:p-4 min-h-full">
        <canvas v-for="page in pages" :key="page" :ref="el => setPageRef(el, page)" class="w-full h-auto shadow-2xl mx-auto block bg-white"></canvas>
      </div>
    </div>

    <!-- Visualizador Desktop (Iframe Nativo) -->
    <div v-else-if="url && url.endsWith('.pdf')" class="flex-grow bg-white">
      <iframe 
        :src="`${url}#view=FitH`" 
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
import { FileWarning as LucideFileWarning, Loader2 as LucideLoader2 } from 'lucide-vue-next'

const props = defineProps({
  url: String,
  type: String
})

const isMobile = ref(false)
const loadingPdf = ref(false)
const pages = ref([])
const pageRefs = ref({})

const setPageRef = (el, pageNum) => {
  if (el) pageRefs.value[pageNum] = el
}

const initPdfJs = async () => {
  if (!props.url || !isMobile.value || !process.client) return
  
  loadingPdf.value = true
  pages.value = []
  
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
        // Escala 1.5 a 2.0 para garantir nitidez no mobile (retina)
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
