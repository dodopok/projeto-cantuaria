<template>
  <NuxtLayout>
    <!-- Hero: o que é + busca direta (funciona mesmo sem JavaScript) -->
    <section class="relative flex items-center justify-center overflow-hidden py-20 md:py-28 bg-[#001529]">
      <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000')] bg-cover bg-center grayscale opacity-20 scale-110 blur-[2px]"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#001529]/50 to-[#001529]"></div>
      </div>

      <div class="container mx-auto px-6 relative z-10 text-center">
        <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in backdrop-blur-sm">
          <span class="w-2 h-2 rounded-full bg-cantuaria-gold animate-pulse"></span>
          <span class="text-xs uppercase tracking-[0.25em] font-bold text-white/85">Preservando o Legado Anglicano</span>
        </div>

        <h1 class="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-[0.95] tracking-tight">
          Biblioteca <span class="serif-italic italic text-cantuaria-gold">Digital Anglicana</span>
        </h1>

        <p class="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
          Livros de Oração Comum, livros, artigos, periódicos e documentos históricos da tradição anglicana em língua portuguesa, com PDF original e texto integral.
        </p>

        <form action="/biblioteca" method="get" role="search" class="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 mb-8" @submit.prevent="search">
          <label for="busca-home" class="sr-only">Buscar no acervo</label>
          <input
            id="busca-home"
            v-model="query"
            name="q"
            type="search"
            placeholder="Busque por título, autor, tema ou trecho do texto"
            class="flex-grow min-h-[52px] px-5 bg-white text-cantuaria-charcoal placeholder:text-cantuaria-charcoal/50 text-base focus:outline-none focus:ring-2 focus:ring-cantuaria-gold"
          />
          <button type="submit" class="min-h-[52px] px-8 bg-cantuaria-gold text-cantuaria-oxford text-sm uppercase font-bold tracking-[0.2em] hover:bg-white transition-colors flex items-center justify-center gap-2">
            <LucideSearch class="w-4 h-4" /> Buscar
          </button>
        </form>

        <div class="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
          <NuxtLink to="/biblioteca" class="text-white/85 hover:text-cantuaria-gold underline-offset-4 hover:underline flex items-center gap-2">
            <LucideLibrary class="w-4 h-4" /> Explorar acervo completo
          </NuxtLink>
          <NuxtLink to="/contribuir" class="text-white/85 hover:text-cantuaria-gold underline-offset-4 hover:underline">Contribuir com uma obra</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Números do acervo (renderizados no servidor) -->
    <section class="py-10 bg-cantuaria-cream border-b border-cantuaria-oxford/5" aria-label="Números do acervo">
      <div class="container mx-auto px-6">
        <dl class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div v-for="stat in stats" :key="stat.label" class="flex flex-col-reverse items-center gap-2">
            <dt class="text-xs uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/70">{{ stat.label }}</dt>
            <dd class="text-4xl md:text-5xl font-serif text-cantuaria-oxford">{{ stat.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Chegaram ao acervo -->
    <section v-if="recent.length" class="py-16 bg-white" aria-labelledby="recentes-titulo">
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-10">
          <div>
            <h2 id="recentes-titulo" class="text-4xl md:text-5xl font-serif text-cantuaria-oxford leading-tight">Chegaram ao acervo</h2>
            <p class="text-cantuaria-charcoal/70 mt-2">As obras catalogadas mais recentemente.</p>
          </div>
          <NuxtLink to="/biblioteca" class="text-sm font-bold uppercase tracking-[0.2em] text-cantuaria-oxford hover:text-cantuaria-gold flex items-center gap-2">
            Ver todas <LucideArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
        <ul class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <li v-for="doc in recent" :key="doc.id">
            <NuxtLink :to="`/documento/${doc.slug}`" class="block">
              <DocumentCard :document="doc" />
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- Coleções -->
    <section class="py-16 bg-cantuaria-cream/60" aria-labelledby="colecoes-titulo">
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mb-10">
          <h2 id="colecoes-titulo" class="text-4xl md:text-5xl text-cantuaria-oxford mb-4 leading-tight font-serif">Coleções</h2>
          <p class="text-cantuaria-charcoal/70 leading-relaxed font-serif text-xl italic">
            "Buscai primeiro o Reino de Deus e a sua justiça, e todas as coisas vos serão acrescentadas."
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          <NuxtLink v-for="collection in featuredCollections" :key="collection.id" :to="`/biblioteca?tipo=${collection.type}`" class="group block relative aspect-[4/3] md:aspect-[3/4] overflow-hidden bg-cantuaria-oxford">
            <img :src="collection.image" :alt="collection.alt" loading="lazy" class="absolute inset-0 w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out" />
            <div class="absolute inset-0 bg-gradient-to-t from-cantuaria-oxford via-cantuaria-oxford/30 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
              <span class="text-xs uppercase tracking-[0.25em] font-bold text-cantuaria-gold mb-2 block">{{ collection.category }}</span>
              <h3 class="text-3xl font-serif text-white leading-tight tracking-tight">{{ collection.title }}</h3>
              <p class="text-white/80 text-sm mt-2">{{ collection.description }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Ordo: do acervo para a oração diária -->
    <OrdoPromo variant="section" />

    <!-- Identidade -->
    <section class="py-16 bg-white overflow-hidden">
      <div class="container mx-auto px-6">
        <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div class="w-full lg:w-1/2 space-y-6">
            <h2 class="text-4xl md:text-5xl font-serif text-cantuaria-oxford leading-tight">O braço arqueológico-digital do Caminho Anglicano</h2>
            <div class="h-1 w-20 bg-cantuaria-gold"></div>
            <p class="text-cantuaria-charcoal/80 text-lg leading-relaxed font-serif italic">
              O Projeto Cantuária é a biblioteca digital oficial do ecossistema Caminho Anglicano, dedicada a tornar a herança teológica e litúrgica da Igreja acessível a todos os fiéis e pesquisadores lusófonos.
            </p>
            <p class="text-cantuaria-charcoal/75 leading-relaxed">
              Enquanto o Portal Caminho Anglicano conecta a comunidade através de notícias, localizador de igrejas e recursos práticos, o Projeto Cantuária foca na custódia e digitalização de documentos que formam a nossa identidade histórica e espiritual.
            </p>
            <a href="https://www.caminhoanglicano.com.br/" target="_blank" rel="noopener" class="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-cantuaria-oxford hover:text-cantuaria-gold transition-all">
              Conheça o Caminho Anglicano
              <LucideArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <div class="w-full lg:w-1/2">
            <div class="aspect-video bg-cantuaria-cream rounded-sm overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1600" alt="Livros antigos e manuscritos sobre uma mesa" loading="lazy" class="w-full h-full object-cover grayscale" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Library as LucideLibrary, ArrowRight as LucideArrowRight, Search as LucideSearch } from 'lucide-vue-next'

useSeoMeta({
  title: 'Projeto Cantuária | Biblioteca Digital Anglicana',
  description: 'Biblioteca digital anglicana em português: Livros de Oração Comum, livros, artigos, periódicos e documentos históricos com PDF original e texto integral. Acesso livre.',
  ogTitle: 'Projeto Cantuária | Biblioteca Digital Anglicana',
  ogDescription: 'Livros de Oração Comum, livros, artigos, periódicos e documentos históricos da tradição anglicana em português, com texto integral.'
})

const query = ref('')
const search = () => navigateTo({ path: '/biblioteca', query: query.value.trim() ? { q: query.value.trim() } : {} })

// Dados renderizados no servidor (aparecem no HTML para buscadores e IAs)
const [{ data: statsData }, { data: recentData }] = await Promise.all([
  useAsyncData('home-stats', () => $fetch('/api/stats')),
  useAsyncData('home-recent', () => $fetch('/api/documents', { params: { page: 0, pageSize: 8, sort: 'recent' } }))
])

const fmt = (n?: number) => (n ?? 0).toLocaleString('pt-BR')
const stats = computed(() => [
  { label: 'Obras no acervo', value: fmt((statsData.value as any)?.documents) },
  { label: 'Com texto integral', value: fmt((statsData.value as any)?.transcribed) },
  { label: 'Autores e tradutores', value: fmt((statsData.value as any)?.authors) },
  { label: 'Categorias', value: fmt((statsData.value as any)?.categories) }
])

const recent = computed(() => ((recentData.value as any)?.documents || []) as any[])

const featuredCollections = [
  {
    id: 1,
    title: 'Livros de Oração Comum',
    category: 'Liturgia',
    description: 'Edições brasileiras e históricas do LOC.',
    type: 'LOC',
    image: 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000',
    alt: 'Livro de orações aberto'
  },
  {
    id: 2,
    title: 'Artigos e Ensaios',
    category: 'Teologia',
    description: 'Estudos, sermões e reflexões.',
    type: 'Artigo',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000',
    alt: 'Paisagem de montanha sob céu estrelado'
  },
  {
    id: 3,
    title: 'Documentos Históricos',
    category: 'História',
    description: 'Periódicos, atas e registros da Igreja.',
    type: 'Documento',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1000',
    alt: 'Estantes de uma biblioteca antiga'
  }
]
</script>

<style scoped>
@keyframes hero-fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: hero-fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
