<template>
  <NuxtLayout>
    <div v-if="loading" class="min-h-screen bg-cantuaria-cream flex items-center justify-center">
      <LucideLoader2 class="w-10 h-10 animate-spin text-cantuaria-oxford/20" />
    </div>

    <div v-else-if="!document" class="min-h-screen bg-cantuaria-cream flex flex-col items-center justify-center text-center px-6">
      <LucideBookX class="w-20 h-20 text-cantuaria-charcoal/10 mb-8" />
      <h1 class="text-4xl font-serif text-cantuaria-oxford mb-4">Obra não encontrada</h1>
      <p class="text-cantuaria-charcoal/60 mb-10">Este documento pode ter sido removido ou o link está incorreto.</p>
      <NuxtLink to="/biblioteca" class="btn-primary">Voltar para a Biblioteca</NuxtLink>
    </div>

    <div v-else class="min-h-screen bg-cantuaria-cream">
      <!-- Breadcrumbs & Actions -->
      <nav class="container mx-auto px-6 py-6 border-b border-cantuaria-oxford/5 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">
        <div class="flex items-center gap-3">
          <NuxtLink to="/biblioteca" class="hover:text-cantuaria-oxford transition-colors">Biblioteca</NuxtLink>
          <span class="w-1 h-1 rounded-full bg-cantuaria-gold/30"></span>
          <span class="text-cantuaria-oxford">{{ document.type }}</span>
        </div>
        <div class="flex items-center gap-6">
          <button @click="share" class="hover:text-cantuaria-oxford flex items-center gap-2 transition-colors">
            <LucideShare2 class="w-3.5 h-3.5" /> Compartilhar
          </button>
          <a :href="document.file_url" target="_blank" download class="hover:text-cantuaria-oxford flex items-center gap-2 transition-colors">
            <LucideDownload class="w-3.5 h-3.5" /> Baixar PDF
          </a>
        </div>
      </nav>

      <!-- Main Content -->
      <section class="container mx-auto px-6 py-16 lg:py-24">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          <!-- Document Cover & Quick Stats -->
          <div class="lg:col-span-4 space-y-12">
            <div class="relative group shadow-2xl border border-cantuaria-charcoal/5">
              <img :src="document.thumbnail_url || 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000'" :alt="document.title" class="w-full aspect-[3/4.5] object-cover" />
              <div class="absolute inset-0 ring-1 ring-inset ring-black/5"></div>
            </div>

            <div class="grid grid-cols-2 gap-8 pt-8 border-t border-cantuaria-oxford/10">
              <div>
                <span class="block text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mb-2">Publicado em</span>
                <span class="font-serif text-lg text-cantuaria-oxford italic">{{ document.publication_year || 'Séc. XIX' }}</span>
              </div>
              <div>
                <span class="block text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mb-2">Idioma</span>
                <span class="font-sans text-sm font-bold text-cantuaria-oxford uppercase tracking-widest">{{ document.language }}</span>
              </div>
              <div>
                <span class="block text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mb-2">Tipo</span>
                <span class="font-sans text-sm font-bold text-cantuaria-oxford uppercase tracking-widest">{{ document.type }}</span>
              </div>
            </div>
          </div>

          <!-- Document Info & Metadata -->
          <div class="lg:col-span-8 space-y-12">
            <div>
              <h1 class="text-5xl lg:text-7xl font-serif text-cantuaria-oxford leading-tight tracking-tight mb-6">
                {{ document.title }}
              </h1>
              
              <div class="flex flex-wrap items-center gap-4 mb-10 pb-10 border-b border-cantuaria-oxford/10">
                <div v-for="author in document.authors" :key="author.id" class="flex items-center gap-3">
                  <div class="flex flex-col">
                    <span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 leading-none">Autor</span>
                    <span class="font-serif text-xl text-cantuaria-oxford">{{ author.name }}</span>
                  </div>
                </div>
              </div>

              <div class="prose prose-lg prose-cantuaria max-w-none">
                <p class="text-xl leading-relaxed text-cantuaria-charcoal/80 font-serif italic mb-10">
                  {{ document.summary }}
                </p>
                <div class="h-px w-24 bg-cantuaria-gold/30 mb-10"></div>
                <div class="text-cantuaria-charcoal/70 leading-relaxed font-sans" v-html="document.content_text || 'Sem prévia de texto disponível.'"></div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-6 pt-12">
              <button @click="showReader = true" class="btn-primary py-5 px-12 text-center text-sm tracking-[0.2em] font-bold uppercase shadow-2xl flex items-center justify-center gap-3 group">
                <LucideBookOpen class="w-5 h-5" />
                Iniciar Leitura
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Reader Overlay -->
    <Teleport to="body">
      <div v-if="showReader" class="fixed inset-0 z-[100] bg-white flex flex-col">
        <header class="h-16 border-b border-cantuaria-charcoal/5 flex items-center justify-between px-6 bg-cantuaria-cream/50 backdrop-blur-sm">
          <div class="flex items-center gap-4">
            <span class="font-serif text-lg text-cantuaria-oxford truncate max-w-md">{{ document?.title }}</span>
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

<script setup>
import { 
  Share2 as LucideShare2, 
  Download as LucideDownload, 
  BookOpen as LucideBookOpen,
  Loader2 as LucideLoader2,
  BookX as LucideBookX,
  X as LucideX
} from 'lucide-vue-next'

const route = useRoute()
const supabase = useSupabaseClient()
const showReader = ref(false)
const document = ref(null)
const loading = ref(true)

const fetchDocument = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('documents')
    .select('*, authors(*)')
    .eq('slug', route.params.slug)
    .single()
  
  if (!error) document.value = data
  loading.value = false
}

const share = () => {
  if (navigator.share) {
    navigator.share({
      title: document.value.title,
      text: document.value.summary,
      url: window.location.href
    })
  }
}

onMounted(fetchDocument)
</script>

<style>
.prose-cantuaria p {
  @apply text-cantuaria-charcoal/70 mb-6;
}
</style>
