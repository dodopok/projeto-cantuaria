<template>
  <NuxtLayout>
    <div v-if="loading && !document" class="min-h-screen bg-cantuaria-cream">
      <nav class="container mx-auto px-6 py-6 border-b border-cantuaria-oxford/5 flex justify-between items-center">
        <div class="h-4 w-32 animate-skeleton"></div>
        <div class="flex gap-6">
          <div class="h-4 w-24 animate-skeleton"></div>
          <div class="h-4 w-24 animate-skeleton"></div>
        </div>
      </nav>
      <section class="container mx-auto px-6 py-12 md:py-24">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div class="lg:col-span-4 space-y-8">
            <div class="aspect-[3/4.5] w-full max-w-sm mx-auto lg:max-w-none animate-skeleton"></div>
            <div class="grid grid-cols-2 gap-8">
              <div class="space-y-2"><div class="h-3 w-12 animate-skeleton"></div><div class="h-6 w-20 animate-skeleton"></div></div>
              <div class="space-y-2"><div class="h-3 w-12 animate-skeleton"></div><div class="h-6 w-20 animate-skeleton"></div></div>
            </div>
          </div>
          <div class="lg:col-span-8 space-y-12">
            <div class="space-y-4">
              <div class="h-16 w-full animate-skeleton"></div>
              <div class="h-16 w-2/3 animate-skeleton"></div>
            </div>
            <div class="flex gap-8 border-y border-cantuaria-oxford/10 py-8">
              <div class="space-y-2"><div class="h-3 w-12 animate-skeleton"></div><div class="h-8 w-40 animate-skeleton"></div></div>
            </div>
            <div class="space-y-6">
              <div class="h-4 w-full animate-skeleton"></div>
              <div class="h-4 w-full animate-skeleton"></div>
              <div class="h-4 w-4/5 animate-skeleton"></div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-else-if="!document" class="min-h-screen bg-cantuaria-cream flex flex-col items-center justify-center text-center px-6">
      <LucideBookX class="w-20 h-20 text-cantuaria-charcoal/10 mb-8" />
      <h1 class="text-3xl md:text-4xl font-serif text-cantuaria-oxford mb-4">Obra não encontrada</h1>
      <p class="text-cantuaria-charcoal/60 mb-10">Este documento pode ter sido removido ou o link está incorreto.</p>
      <NuxtLink to="/biblioteca" class="btn-primary">Voltar para a Biblioteca</NuxtLink>
    </div>

    <div v-else class="min-h-screen bg-cantuaria-cream">
      <!-- Breadcrumbs & Actions -->
      <nav class="container mx-auto px-6 py-4 md:py-6 border-b border-cantuaria-oxford/5 flex flex-wrap justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">
        <div class="flex items-center gap-3">
          <NuxtLink to="/biblioteca" class="hover:text-cantuaria-oxford transition-colors">Biblioteca</NuxtLink>
          <span class="w-1 h-1 rounded-full bg-cantuaria-gold/30"></span>
          <span class="text-cantuaria-oxford">{{ document.type }}</span>
        </div>
        <div class="flex items-center gap-4 md:gap-6">
          <button @click="share" class="hover:text-cantuaria-oxford flex items-center gap-2 transition-colors">
            <LucideShare2 class="w-3.5 h-3.5" /> <span class="hidden xs:inline">Compartilhar</span>
          </button>
          <button @click="download" :disabled="downloading" class="hover:text-cantuaria-oxford flex items-center gap-2 transition-colors disabled:opacity-50">
            <LucideLoader2 v-if="downloading" class="w-3.5 h-3.5 animate-spin" />
            <LucideDownload v-else class="w-3.5 h-3.5" /> 
            <span class="hidden xs:inline">{{ downloading ? 'Baixando...' : 'Baixar PDF' }}</span>
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <section class="container mx-auto px-6 py-10 md:py-24">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          
          <!-- Document Cover & Quick Stats -->
          <div class="lg:col-span-4 space-y-8 md:space-y-12">
            <div 
              @click="showReader = true"
              class="relative group shadow-2xl border border-cantuaria-charcoal/5 cursor-pointer overflow-hidden max-w-sm mx-auto lg:max-w-none"
            >
              <img :src="document.thumbnail_url || 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000'" :alt="document.title" class="w-full aspect-[3/4.5] object-cover transition-transform duration-700 group-hover:scale-105" />
              <div class="absolute inset-0 bg-cantuaria-oxford/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div class="bg-white/90 px-6 py-3 rounded-sm shadow-xl">
                  <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-oxford">Clique para Ler</span>
                </div>
              </div>
            </div>

            <!-- Botão de Ação Mobile/Desktop -->
            <div class="pt-2">
              <button @click="showReader = true" class="w-full btn-primary py-4 px-8 text-center text-[10px] tracking-[0.2em] font-bold uppercase shadow-xl flex items-center justify-center gap-3 group">
                <LucideBookOpen class="w-4 h-4" />
                <span>Visualizar Obra</span>
              </button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-6 md:gap-8 pt-8 border-t border-cantuaria-oxford/10">
              <div>
                <span class="block text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mb-1">Publicado em</span>
                <span class="font-serif text-lg text-cantuaria-oxford italic leading-tight">{{ document.publication_year || 'Séc. XIX' }}</span>
              </div>
              <div>
                <span class="block text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mb-1">Idioma</span>
                <span class="font-sans text-xs font-bold text-cantuaria-oxford uppercase tracking-widest">{{ document.language }}</span>
              </div>
              <div>
                <span class="block text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mb-1">Tipo</span>
                <span class="font-sans text-xs font-bold text-cantuaria-oxford uppercase tracking-widest">{{ document.type }}</span>
              </div>
            </div>
          </div>

          <!-- Document Info & Metadata -->
          <div class="lg:col-span-8 space-y-10 md:space-y-12">
            <div>
              <h1 class="text-4xl md:text-6xl lg:text-7xl font-serif text-cantuaria-oxford leading-[1.1] tracking-tight mb-6">
                {{ document.title }}
              </h1>
              
              <div class="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-cantuaria-oxford/10">
                <div v-for="author in document.authors" :key="author.id" class="flex flex-col">
                  <span class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 mb-1">Autor</span>
                  <span class="font-serif text-xl text-cantuaria-oxford leading-none">{{ author.name }}</span>
                </div>
              </div>

              <div class="prose prose-lg prose-cantuaria max-w-none">
                <p class="text-lg md:text-xl leading-relaxed text-cantuaria-charcoal/80 font-serif italic mb-8">
                  {{ document.summary }}
                </p>
                <div class="h-px w-20 bg-cantuaria-gold/30 mb-8"></div>
                <div class="text-cantuaria-charcoal/70 leading-relaxed font-sans text-sm md:text-base" v-html="document.content_text || 'Sem prévia de texto disponível.'"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Reader Overlay -->
    <Teleport to="body">
      <div v-if="showReader" class="fixed inset-0 z-[100] bg-white flex flex-col">
        <header class="h-16 border-b border-cantuaria-charcoal/5 flex items-center justify-between px-4 md:px-6 bg-cantuaria-cream/50 backdrop-blur-sm">
          <div class="flex items-center gap-4 truncate">
            <span class="font-serif text-base md:text-lg text-cantuaria-oxford truncate max-w-[200px] md:max-w-md">{{ document?.title }}</span>
          </div>
          <button @click="showReader = false" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full transition-colors">
            <LucideX class="w-6 h-6 text-cantuaria-oxford" />
          </button>
        </header>
        <div class="flex-grow bg-cantuaria-charcoal/95 overflow-hidden">
          <Reader :url="document?.file_url" :type="document?.type" />
        </div>
      </div>
    </Teleport>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { 
  Share2 as LucideShare2, 
  Download as LucideDownload, 
  BookOpen as LucideBookOpen,
  Loader2 as LucideLoader2,
  BookX as LucideBookX,
  X as LucideX
} from 'lucide-vue-next'

const route = useRoute()
const showReader = ref(false)
const document = ref<any>(null)
const loading = ref(true)
const downloading = ref(false)

const fetchDocument = async () => {
  loading.value = true
  try {
    const data: any = await $fetch(`/api/documents/${route.params.slug}`)
    document.value = data
    useSeoMeta({
      title: `${data.title} | Projeto Cantuária`,
      ogTitle: `${data.title} | Projeto Cantuária`,
      description: data.summary || 'Obra histórica da tradição anglicana disponível na Biblioteca Digital Cantuária.',
      ogDescription: data.summary || 'Obra histórica da tradição anglicana disponível na Biblioteca Digital Cantuária.',
      ogImage: data.thumbnail_url,
      twitterCard: 'summary_large_image',
      twitterTitle: data.title,
      twitterDescription: data.summary,
      twitterImage: data.thumbnail_url
    })
  } catch (err) { console.error('Erro:', err) } finally { loading.value = false }
}

const download = async () => {
  if (!document.value?.file_url) return
  downloading.value = true
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
    console.error('Erro ao baixar:', err)
    window.open(document.value.file_url, '_blank')
  } finally {
    downloading.value = false
  }
}

const share = () => { if (navigator.share) navigator.share({ title: document.value.title, url: window.location.href }) }
onMounted(fetchDocument)
</script>
