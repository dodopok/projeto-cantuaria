<template>
  <NuxtLayout>
    <div v-if="pending && !document" class="min-h-screen bg-cantuaria-cream">
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

    <div v-else-if="!document && !pending" class="min-h-screen bg-cantuaria-cream flex flex-col items-center justify-center text-center px-6">
      <LucideBookX class="w-20 h-20 text-cantuaria-charcoal/10 mb-8" />
      <h1 class="text-3xl md:text-4xl font-serif text-cantuaria-oxford mb-4">Obra não encontrada</h1>
      <p class="text-cantuaria-charcoal/60 mb-10">Este documento pode ter sido removido ou o link está incorreto.</p>
      <NuxtLink to="/biblioteca" class="btn-primary">Voltar para a Biblioteca</NuxtLink>
    </div>

    <div v-else-if="document" class="min-h-screen bg-cantuaria-cream">
      <!-- Breadcrumbs & Actions -->
      <nav class="container mx-auto px-6 py-4 md:py-6 border-b border-cantuaria-oxford/5 flex flex-wrap justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">
        <div class="flex items-center gap-3">
          <NuxtLink to="/biblioteca" class="hover:text-cantuaria-oxford transition-colors">Biblioteca</NuxtLink>
          <span class="w-1 h-1 rounded-full bg-cantuaria-gold/30"></span>
          <span class="text-cantuaria-oxford">{{ document.type }}</span>
        </div>
        <div class="flex items-center gap-3 md:gap-4">
          <button @click="share" class="flex items-center gap-2 transition-all px-3 py-2 md:px-4 md:py-2 rounded-sm border border-transparent md:border-cantuaria-oxford/10 md:bg-white md:hover:border-cantuaria-oxford md:hover:shadow-sm md:text-cantuaria-oxford group">
            <LucideShare2 class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" /> 
            <span class="hidden md:inline">Compartilhar</span>
          </button>
          <button @click="download" :disabled="downloading" class="flex items-center gap-2 transition-all px-3 py-2 md:px-4 md:py-2 rounded-sm border border-transparent md:border-cantuaria-oxford/10 md:bg-white md:hover:border-cantuaria-oxford md:hover:shadow-sm md:text-cantuaria-oxford disabled:opacity-50 group">
            <LucideLoader2 v-if="downloading" class="w-3.5 h-3.5 animate-spin" />
            <LucideDownload v-else class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" /> 
            <span class="hidden md:inline">{{ downloading ? 'Baixando...' : 'Baixar PDF' }}</span>
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <section class="container mx-auto px-6 py-10 md:py-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          
          <!-- Document Cover & Quick Stats -->
          <div class="lg:col-span-4 space-y-4">
            <NuxtLink 
              :to="`/documento/${document.slug}/pdf`"
              class="relative block group shadow-2xl border border-cantuaria-charcoal/5 cursor-pointer overflow-hidden max-w-sm mx-auto lg:max-w-none"
            >
              <img :src="document.thumbnail_url || 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000'" :alt="document.title" class="w-full aspect-[3/4.5] object-cover transition-transform duration-700 group-hover:scale-105" />
              <div class="absolute inset-0 bg-cantuaria-oxford/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div class="bg-white/90 px-6 py-3 rounded-sm shadow-xl">
                  <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-oxford">Clique para Ler</span>
                </div>
              </div>
            </NuxtLink>

            <!-- Botão de Ação Mobile/Desktop -->
            <div class="pt-2 space-y-3">
              <NuxtLink :to="`/documento/${document.slug}/pdf`" class="w-full btn-primary py-4 px-8 text-center text-[10px] tracking-[0.2em] font-bold uppercase shadow-xl flex items-center justify-center gap-3 group">
                <LucideBookOpen class="w-4 h-4" />
                <span>Abrir Original (PDF)</span>
              </NuxtLink>
              <NuxtLink 
                v-if="document.has_markdown"
                :to="`/documento/${document.slug}/texto`" 
                class="w-full block py-4 px-8 text-center text-[10px] tracking-[0.2em] font-bold uppercase border border-cantuaria-oxford/20 text-cantuaria-oxford hover:bg-cantuaria-oxford hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <LucideFileText class="w-4 h-4" />
                <span>Versão em Texto</span>
              </NuxtLink>
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

            <!-- Botão de Remoção Discreto -->
            <div class="pt-12 mt-12 border-t border-cantuaria-oxford/5">
              <button @click="showRemovalModal = true" class="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 hover:text-cantuaria-crimson transition-colors">
                <LucideAlertCircle class="w-3 h-3" />
                <span>Solicitar remoção desta obra</span>
              </button>
            </div>
          </div>

          <!-- Document Info & Metadata -->
          <div class="lg:col-span-8 space-y-10 md:space-y-12">
            <div>
              <h1 class="text-4xl md:text-6xl lg:text-7xl font-serif text-cantuaria-oxford leading-[1.1] tracking-tight mb-6 text-balance">
                {{ document.title }}
              </h1>
              
              <div class="flex flex-col gap-6 mb-8 pb-8 border-b border-cantuaria-oxford/10">
                <div class="flex flex-wrap items-center gap-6">
                  <div v-for="author in document.authors" :key="author.id" class="flex flex-col">
                    <span class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 mb-1">Autor</span>
                    <span class="font-serif text-xl text-cantuaria-oxford leading-none">{{ author.name }}</span>
                  </div>
                </div>

                <!-- Tags do Documento -->
                <div v-if="document.tags && document.tags.length > 0" class="flex flex-wrap gap-2">
                  <span 
                    v-for="tag in document.tags" 
                    :key="tag.id"
                    class="px-3 py-1 bg-cantuaria-gold/5 border border-cantuaria-gold/10 text-cantuaria-gold text-[9px] uppercase tracking-widest font-bold rounded-full"
                  >
                    {{ tag.name }}
                  </span>
                </div>
              </div>

              <div class="max-w-none">
                <p class="text-lg md:text-xl leading-relaxed text-cantuaria-charcoal/80 font-serif italic mb-10 text-balance">
                  {{ document.summary }}
                </p>
                <div class="h-px w-20 bg-cantuaria-gold/30 mb-10"></div>
                <!-- Mini visualização do texto - Essencial para o Google indexar o conteúdo inicial -->
                <div class="prose-cantuaria text-cantuaria-charcoal/70 line-clamp-[15] pointer-events-none opacity-80" v-html="document.content_text"></div>
                <div v-if="document.has_markdown" class="mt-8 flex flex-wrap gap-4">
                  <NuxtLink :to="`/documento/${document.slug}/texto`" class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-gold hover:text-cantuaria-oxford transition-colors flex items-center gap-2 group">
                    Ler versão em texto completo <LucideArrowRight class="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Removal Request Modal -->
    <Teleport to="body">
      <div v-if="showRemovalModal" class="fixed inset-0 z-[9999] bg-cantuaria-oxford/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md p-8 md:p-10 shadow-2xl relative animate-fade-in">
          <button @click="showRemovalModal = false" class="absolute top-4 right-4 p-2 text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">
            <LucideX class="w-5 h-5" />
          </button>
          
          <h3 class="font-serif text-2xl text-cantuaria-oxford mb-2">Solicitar Remoção</h3>
          <p class="text-xs text-cantuaria-charcoal/60 mb-8 leading-relaxed">
            Se você é o detentor dos direitos desta obra ou encontrou conteúdo inadequado, por favor informe os dados abaixo para nossa análise.
          </p>

          <form @submit.prevent="submitRemovalRequest" class="space-y-6">
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Seu Nome</label>
              <input v-model="removalForm.name" type="text" required class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-gold text-sm bg-transparent" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">E-mail de Contato</label>
              <input v-model="removalForm.email" type="email" required class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-gold text-sm bg-transparent" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Motivo da Solicitação</label>
              <textarea v-model="removalForm.reason" required rows="4" class="w-full border border-cantuaria-charcoal/10 p-3 focus:outline-none focus:border-cantuaria-gold text-sm leading-relaxed bg-cantuaria-cream/10 resize-none"></textarea>
            </div>

            <div class="pt-4">
              <button 
                type="submit" 
                :disabled="submittingRemoval"
                class="w-full py-4 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 transition-all disabled:opacity-50"
              >
                <LucideLoader2 v-if="submittingRemoval" class="w-4 h-4 animate-spin mx-auto" />
                <span v-else>Enviar Solicitação</span>
              </button>
            </div>
          </form>
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
  X as LucideX,
  AlertCircle as LucideAlertCircle,
  ArrowRight as LucideArrowRight,
  FileText as LucideFileText
} from 'lucide-vue-next'
import { useScrollLock } from '@vueuse/core'

const route = useRoute()
const downloading = ref(false)

// SSR Fetch
const { data: document, pending } = await useAsyncData(`document-${route.params.slug}`, () => 
  $fetch(`/api/documents/${route.params.slug}`)
)

// SEO Metadata
useSeoMeta({
  title: computed(() => document.value ? `${document.value.title} | Projeto Cantuária` : 'Obra | Projeto Cantuária'),
  ogTitle: computed(() => document.value ? `${document.value.title} | Projeto Cantuária` : 'Obra | Projeto Cantuária'),
  description: computed(() => document.value?.summary || 'Obra histórica da tradição anglicana disponível na Biblioteca Digital Cantuária.'),
  ogDescription: computed(() => document.value?.summary || 'Obra histórica da tradição anglicana disponível na Biblioteca Digital Cantuária.'),
  ogImage: computed(() => document.value?.thumbnail_url),
  ogUrl: computed(() => `https://cantuaria.caminhoanglicano.com.br/documento/${document.value?.slug}`),
  twitterCard: 'summary_large_image',
  twitterTitle: computed(() => document.value?.title),
  twitterDescription: computed(() => document.value?.summary)
})

// Dados Estruturados (Schema.org) & Canonical
useHead(() => {
  if (!document.value) return {}
  
  const url = `https://cantuaria.caminhoanglicano.com.br/documento/${document.value.slug}`
  const authors = document.value.authors?.map((a: any) => ({
    "@type": "Person",
    "name": a.name
  })) || []

  return {
    link: [
      { rel: 'canonical', href: url }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Book",
          "name": document.value.title,
          "author": authors,
          "datePublished": document.value.publication_year,
          "description": document.value.summary,
          "image": document.value.thumbnail_url,
          "publisher": {
            "@type": "Organization",
            "name": "Projeto Cantuária"
          }
        })
      }
    ]
  }
})

// Remoção
const showRemovalModal = ref(false)
const submittingRemoval = ref(false)
const removalForm = ref({
  name: '',
  email: '',
  reason: ''
})

// Bloqueia o scroll do body quando o modal está aberto
const isLocked = useScrollLock(process.client ? window.document.body : null)
watch(showRemovalModal, (m) => {
  isLocked.value = m
})

const submitRemovalRequest = async () => {
  if (!document.value) return
  submittingRemoval.value = true
  try {
    await $fetch('/api/documents/request-removal', {
      method: 'POST',
      body: {
        documentId: document.value.id,
        ...removalForm.value
      }
    })
    alert('Solicitação enviada com sucesso. Nossa equipe analisará o pedido.')
    showRemovalModal.value = false
    removalForm.value = { name: '', email: '', reason: '' }
  } catch (err) {
    alert('Erro ao enviar solicitação. Por favor, tente novamente mais tarde.')
  } finally {
    submittingRemoval.value = false
  }
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

const share = () => { if (document.value && navigator.share) navigator.share({ title: document.value.title, url: window.location.href }) }

// Incrementar visualizações (Apenas no cliente)
onMounted(() => {
  if (document.value?.id) {
    $fetch('/api/documents/view', {
      method: 'POST',
      body: { id: document.value.id }
    }).catch(err => console.error('Erro ao registrar view:', err))
  }
})
</script>

<style lang="postcss">
.prose-cantuaria {
  @apply font-serif leading-relaxed text-cantuaria-charcoal;
  
  & h1 { @apply text-4xl md:text-5xl font-serif text-cantuaria-oxford mt-12 mb-8 leading-tight border-b border-cantuaria-oxford/5 pb-4; }
  & h2 { @apply text-2xl md:text-3xl font-serif text-cantuaria-oxford mt-10 mb-6 leading-tight; }
  & h3 { @apply text-xl md:text-2xl font-serif text-cantuaria-oxford mt-8 mb-4 font-bold; }
  & h4 { @apply text-lg font-serif text-cantuaria-oxford mt-6 mb-3 font-bold italic; }
  
  & p { @apply mb-6 text-base md:text-lg text-justify; }
  
  & strong { @apply font-bold text-cantuaria-oxford; }
  & em { @apply italic; }
  
  & blockquote {
    @apply border-l-4 border-cantuaria-gold pl-6 py-2 my-10 italic text-cantuaria-charcoal/70 bg-cantuaria-gold/5;
    & p { @apply mb-0; }
  }
  
  & ul { @apply list-disc list-outside ml-6 mb-6 space-y-2; }
  & ol { @apply list-decimal list-outside ml-6 mb-6 space-y-2; }
  & li { @apply pl-2 text-base md:text-lg; }
  
  & hr { @apply border-t border-cantuaria-oxford/10 my-12 w-1/3 mx-auto; }
  
  & a { @apply text-cantuaria-gold underline hover:text-cantuaria-oxford transition-colors; }
}
</style>
