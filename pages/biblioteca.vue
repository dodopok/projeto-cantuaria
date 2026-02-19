<template>
  <NuxtLayout>
    <section class="py-12 border-b border-cantuaria-oxford/5">
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 class="text-4xl md:text-5xl text-cantuaria-oxford mb-4">Biblioteca Digital</h1>
            <p class="text-cantuaria-charcoal/60 max-w-xl">
              Navegue por séculos de sabedoria e liturgia. Use os filtros para refinar sua busca por autores, categorias ou tipos de documentos.
            </p>
          </div>
          
          <div class="flex items-center gap-4 bg-white p-1 border border-cantuaria-charcoal/10 shadow-sm">
            <button 
              v-for="view in ['grid', 'list']" 
              :key="view"
              @click="currentView = view"
              :class="[
                'p-2 transition-colors',
                currentView === view ? 'bg-cantuaria-oxford text-white' : 'text-cantuaria-charcoal/40 hover:text-cantuaria-oxford'
              ]"
            >
              <LucideLayoutGrid v-if="view === 'grid'" class="w-4 h-4" />
              <LucideList v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters & Main Content -->
    <section class="py-12 bg-cantuaria-cream/50 min-h-screen">
      <div class="container mx-auto px-6 flex flex-col lg:flex-row gap-12">
        
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 space-y-10 shrink-0">
          <div>
            <h3 class="font-serif text-lg text-cantuaria-oxford mb-6 border-b border-cantuaria-oxford/10 pb-2">Tipo de Obra</h3>
            <div class="space-y-3">
              <label v-for="type in documentTypes" :key="type" class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" class="w-4 h-4 border-cantuaria-charcoal/20 text-cantuaria-oxford focus:ring-cantuaria-oxford" />
                <span class="text-sm text-cantuaria-charcoal/60 group-hover:text-cantuaria-oxford transition-colors uppercase tracking-widest text-[10px] font-bold">{{ type }}</span>
              </label>
            </div>
          </div>

          <div>
            <h3 class="font-serif text-lg text-cantuaria-oxford mb-6 border-b border-cantuaria-oxford/10 pb-2">Idiomas</h3>
            <div class="space-y-3">
              <label v-for="lang in ['Português', 'Inglês', 'Latim']" :key="lang" class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" class="w-4 h-4 border-cantuaria-charcoal/20 text-cantuaria-oxford focus:ring-cantuaria-oxford" />
                <span class="text-sm text-cantuaria-charcoal/60 group-hover:text-cantuaria-oxford transition-colors uppercase tracking-widest text-[10px] font-bold">{{ lang }}</span>
              </label>
            </div>
          </div>

          <div class="pt-8">
            <div class="bg-cantuaria-oxford p-6 text-white text-center rounded-sm">
              <LucideUpload class="w-8 h-8 mx-auto mb-4 text-cantuaria-gold" />
              <h4 class="font-serif text-xl mb-2">Tem algo para nos enviar?</h4>
              <p class="text-xs text-white/60 mb-6 leading-relaxed">Ajude-nos a expandir o acervo enviando documentos raros ou artigos.</p>
              <NuxtLink to="/contribuir" class="block w-full py-2 bg-white text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-gold hover:text-white transition-colors">
                Contribuir
              </NuxtLink>
            </div>
          </div>
        </aside>

        <!-- Document Grid -->
        <div class="flex-grow">
          <div class="flex justify-between items-center mb-8 pb-4 border-b border-cantuaria-oxford/5">
            <div class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">
              Mostrando <span class="text-cantuaria-oxford">24</span> de 1,200 obras
            </div>
            
            <div class="flex items-center gap-4">
              <span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Ordenar por:</span>
              <select class="bg-transparent text-[10px] uppercase tracking-widest font-bold text-cantuaria-oxford focus:outline-none border-b border-cantuaria-oxford/20 pb-1 cursor-pointer">
                <option>Mais recentes</option>
                <option>Título (A-Z)</option>
                <option>Popularidade</option>
                <option>Séc. de Publicação</option>
              </select>
            </div>
          </div>

          <div :class="[
            'grid gap-10 transition-all duration-500',
            currentView === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
          ]">
            <DocumentCard v-for="doc in mockDocuments" :key="doc.id" :document="doc" />
          </div>

          <!-- Pagination Mock -->
          <div class="mt-20 flex justify-center items-center gap-4">
            <button class="w-10 h-10 flex items-center justify-center border border-cantuaria-charcoal/10 hover:border-cantuaria-oxford transition-colors opacity-50">
              <LucideChevronLeft class="w-4 h-4" />
            </button>
            <div class="flex gap-2">
              <span v-for="p in [1, 2, 3, '...', 12]" :key="p" 
                    :class="['w-10 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-widest border transition-colors cursor-pointer', 
                    p === 1 ? 'bg-cantuaria-oxford border-cantuaria-oxford text-white' : 'border-cantuaria-charcoal/10 hover:border-cantuaria-oxford']">
                {{ p }}
              </span>
            </div>
            <button class="w-10 h-10 flex items-center justify-center border border-cantuaria-charcoal/10 hover:border-cantuaria-oxford transition-colors">
              <LucideChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  </NuxtLayout>
</template>

<script setup>
import { 
  LayoutGrid as LucideLayoutGrid, 
  List as LucideList, 
  Upload as LucideUpload,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight
} from 'lucide-vue-next'

const currentView = ref('grid')
const documentTypes = ['Livros', 'Artigos', 'Revistas', 'Liturgia', 'Documentos Históricos']

const mockDocuments = [
  {
    id: 1,
    title: 'O Livro de Oração Comum (1662)',
    type: 'Liturgia',
    authors: [{ name: 'Igreja da Inglaterra' }],
    thumbnail_url: 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000',
    publication_year: '1662',
    language: 'Português'
  },
  {
    id: 2,
    title: 'Os Trinta e Nove Artigos de Religião',
    type: 'Documento',
    authors: [{ name: 'Arcebispo Thomas Cranmer' }],
    thumbnail_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000',
    publication_year: '1571',
    language: 'Latim/Português'
  },
  {
    id: 3,
    title: 'Ecclesiastical Polity',
    type: 'Livro',
    authors: [{ name: 'Richard Hooker' }],
    thumbnail_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1000',
    publication_year: '1594',
    language: 'Inglês'
  },
  {
    id: 4,
    title: 'Apologia Pro Vita Sua',
    type: 'Livro',
    authors: [{ name: 'John Henry Newman' }],
    thumbnail_url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000',
    publication_year: '1864',
    language: 'Português'
  },
  {
    id: 5,
    title: 'Sermões de Natal',
    type: 'Artigo',
    authors: [{ name: 'Lancelot Andrewes' }],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000',
    publication_year: 'Séc. XVII',
    language: 'Português'
  },
  {
    id: 6,
    title: 'A Igreja Primitiva',
    type: 'Revista',
    authors: [{ name: 'Sociedade Histórica Anglicana' }],
    thumbnail_url: 'https://images.unsplash.com/photo-1474932430478-3a7fb9065ba0?q=80&w=1000',
    publication_year: '1924',
    language: 'Português'
  }
]
</script>
