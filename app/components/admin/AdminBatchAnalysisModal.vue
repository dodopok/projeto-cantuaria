<template>
  <div v-if="active" class="fixed inset-0 z-[110] bg-cantuaria-oxford/98 backdrop-blur-xl flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-fade-in">
      <header class="p-8 border-b border-cantuaria-charcoal/5 flex justify-between items-center bg-white">
        <div>
          <h3 class="font-serif text-3xl text-cantuaria-oxford">Processamento em Lote</h3>
          <p class="text-xs text-cantuaria-charcoal/40 uppercase tracking-widest font-bold mt-1">Análise inteligente de múltiplos documentos simultaneamente</p>
        </div>
        <button v-if="!isAnalyzing && !publishing" @click="$emit('close')" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full"><LucideX class="w-6 h-6" /></button>
      </header>

      <div class="flex-grow overflow-auto p-8 bg-cantuaria-cream/20">
        <div class="grid grid-cols-1 gap-6">
          <div v-for="res in results" :key="res.id" class="border border-cantuaria-charcoal/10 p-6 rounded-sm bg-white shadow-sm hover:border-cantuaria-gold/50">
            <div class="flex flex-col lg:flex-row gap-8" :class="{ 'opacity-50 pointer-events-none': publishing }">
              <div class="lg:w-1/4">
                <div class="flex items-center gap-3 mb-4">
                  <LucideFileText v-if="res.status !== 'complete'" class="w-5 h-5 text-cantuaria-charcoal/20" />
                  <LucideCheckCircle v-else class="w-5 h-5 text-green-600" />
                  <span class="font-bold text-cantuaria-oxford truncate" :title="res.originalTitle">{{ res.originalTitle }}</span>
                </div>
                <div v-if="res.status === 'processing'" class="space-y-2">
                  <div class="h-1 bg-cantuaria-oxford/5 overflow-hidden rounded-full"><div class="h-full bg-cantuaria-gold animate-progress-indefinite"></div></div>
                  <span class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-gold animate-pulse">Extraindo dados...</span>
                </div>
                <div v-else-if="res.status === 'error'" class="text-xs text-cantuaria-crimson bg-cantuaria-crimson/5 p-3 border border-cantuaria-crimson/10 rounded">{{ res.errorMessage }}</div>
              </div>

              <div v-if="res.status === 'complete'" class="lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                <div class="space-y-4">
                  <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Título</label><input type="text" v-model="res.data.title" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-sm font-serif bg-transparent disabled:opacity-50" /></div>
                  <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Autores</label><input type="text" v-model="res.data.authors_list" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent disabled:opacity-50" /></div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Ano</label><input type="number" v-model="res.data.publication_year" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent disabled:opacity-50" /></div>
                    <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Categoria</label><input type="text" v-model="res.data.category_name" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent disabled:opacity-50" /></div>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Resumo</label><textarea rows="3" v-model="res.data.summary" :disabled="publishing" class="w-full border border-cantuaria-charcoal/10 p-2 focus:outline-none focus:border-cantuaria-gold text-xs leading-relaxed bg-cantuaria-cream/10 disabled:opacity-50"></textarea></div>
                  <div class="space-y-1"><label class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30">Tags</label><input type="text" v-model="res.data.tags_list" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-gold text-xs bg-transparent disabled:opacity-50" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="p-8 border-t border-cantuaria-charcoal/5 bg-cantuaria-cream/30 flex justify-between items-center">
        <div class="flex items-center gap-4"><span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">{{ completedCount }} de {{ results.length }} processados</span></div>
        <div class="flex gap-4">
          <button v-if="!isAnalyzing && !publishing" @click="$emit('close')" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">Cancelar</button>
          <button @click="$emit('save')" :disabled="isAnalyzing || completedCount === 0 || publishing" class="px-12 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl disabled:opacity-50 transition-all">
            <template v-if="publishing"><LucideLoader2 class="w-4 h-4 animate-spin inline mr-2" /> Salvando...</template>
            <template v-else>Publicar Todos</template>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  X as LucideX, 
  FileText as LucideFileText, 
  CheckCircle as LucideCheckCircle, 
  Loader2 as LucideLoader2 
} from 'lucide-vue-next'

const props = defineProps<{
  active: boolean
  isAnalyzing: boolean
  publishing: boolean
  results: any[]
}>()

defineEmits(['close', 'save'])

const completedCount = computed(() => props.results.filter(r => r.status === 'complete').length)
</script>

<style scoped>
.animate-progress-indefinite { width: 100%; animation: progress-indefinite 2s infinite linear; transform-origin: 0% 50%; }
@keyframes progress-indefinite { 0% { transform: translateX(0) scaleX(0); } 40% { transform: translateX(0) scaleX(0.4); } 100% { transform: translateX(100%) scaleX(0.5); } }
</style>
