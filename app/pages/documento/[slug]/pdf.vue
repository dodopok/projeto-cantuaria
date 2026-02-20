<template>
  <NuxtLayout name="default">
    <div v-if="pending" class="min-h-screen flex items-center justify-center bg-cantuaria-charcoal">
      <LucideLoader2 class="w-12 h-12 animate-spin text-white/20" />
    </div>

    <div v-else-if="!document" class="min-h-screen flex flex-col items-center justify-center bg-cantuaria-cream p-6 text-center">
      <LucideFileWarning class="w-16 h-16 text-cantuaria-oxford/10 mb-6" />
      <h1 class="font-serif text-3xl text-cantuaria-oxford mb-4">Documento não disponível</h1>
      <NuxtLink to="/biblioteca" class="btn-primary">Voltar para Biblioteca</NuxtLink>
    </div>

    <div v-else class="h-screen flex flex-col overflow-hidden bg-cantuaria-charcoal">
      <!-- Fullscreen Header -->
      <header class="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-cantuaria-oxford shrink-0 gap-4 z-50">
        <div class="flex items-center gap-4 truncate">
          <NuxtLink :to="`/documento/${document.slug}`" class="p-2 hover:bg-white/5 rounded-full transition-colors shrink-0" title="Voltar para detalhes">
            <LucideArrowLeft class="w-5 h-5 text-white/70" />
          </NuxtLink>
          <div class="flex flex-col truncate">
            <h1 class="font-serif text-sm md:text-base text-white truncate leading-tight">{{ document.title }}</h1>
            <span class="text-[8px] uppercase tracking-widest font-bold text-white/30">Visualização de Documento Original (PDF)</span>
          </div>
        </div>
        
        <div class="flex items-center gap-2 shrink-0">
          <NuxtLink 
            v-if="document.content_markdown"
            :to="`/documento/${document.slug}/texto`" 
            class="hidden sm:flex items-center gap-2 px-4 py-2 text-[9px] uppercase tracking-widest font-bold text-cantuaria-gold hover:text-white transition-colors"
          >
            <LucideFileText class="w-3.5 h-3.5" /> Ver Texto
          </NuxtLink>
          <button @click="download" class="p-2 text-white/50 hover:text-white transition-colors" title="Baixar Original">
            <LucideDownload class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- PDF Reader Area -->
      <main class="flex-grow relative">
        <Reader :url="document.file_url" :type="document.type" class="w-full h-full" />
      </main>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { 
  ArrowLeft as LucideArrowLeft, 
  Loader2 as LucideLoader2, 
  FileWarning as LucideFileWarning,
  Download as LucideDownload,
  FileText as LucideFileText
} from 'lucide-vue-next'

const route = useRoute()

const { data: document, pending } = await useAsyncData(`document-pdf-${route.params.slug}`, () => 
  $fetch(`/api/documents/${route.params.slug}`)
)

useSeoMeta({
  title: computed(() => document.value ? `PDF: ${document.value.title} | Projeto Cantuária` : 'PDF | Projeto Cantuária'),
  description: computed(() => `Visualização do documento original: ${document.value?.title}`),
  ogType: 'website'
})

const download = async () => {
  if (!document.value?.file_url) return
  try {
    const response = await fetch(document.value.file_url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = `${document.value.title}.pdf`
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    window.open(document.value.file_url, '_blank')
  }
}
</script>

<style scoped>
/* Remove o scroll do layout padrão para focar no PDF */
:deep(body) {
  overflow: hidden !important;
}
</style>
