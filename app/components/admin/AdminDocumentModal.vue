<template>
  <div v-if="modelValue" class="fixed inset-0 z-[100] bg-cantuaria-oxford/95 backdrop-blur-md flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-fade-in">
      <header class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center bg-white">
        <h3 class="font-serif text-2xl text-cantuaria-oxford">Gerenciamento de Documento</h3>
        <button @click="$emit('update:modelValue', null)" :disabled="publishing" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full disabled:opacity-30"><LucideX class="w-6 h-6" /></button>
      </header>

      <div class="flex-grow flex overflow-hidden">
        <div class="hidden lg:block w-1/2 bg-cantuaria-charcoal border-r border-cantuaria-charcoal/10 overflow-hidden">
          <Reader :url="modelValue.file_url" :type="modelValue.type" />
        </div>

        <div class="w-full lg:w-1/2 overflow-y-auto p-8 lg:p-12 space-y-10" :class="{ 'opacity-50 pointer-events-none': publishing }">
          <div class="flex justify-between items-center border-b border-cantuaria-oxford/5 pb-6">
            <h4 class="text-[10px] uppercase tracking-[0.2em] font-bold text-cantuaria-charcoal/40">Dados da Obra</h4>
            <div class="flex gap-2">
              <button v-if="modelValue.file_url?.toLowerCase().endsWith('.pdf')" @click="$emit('runOcr')" :disabled="analyzing || publishing || performingOCR" class="flex items-center gap-2 px-4 py-2 border border-cantuaria-gold text-cantuaria-gold text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-gold hover:text-white transition-all disabled:opacity-50">
                <LucideLoader2 v-if="performingOCR" class="w-3.5 h-3.5 animate-spin" />
                <LucideScanText v-else class="w-3.5 h-3.5" />
                {{ performingOCR ? 'Gerando Markdown...' : 'OCR com Gemini' }}
              </button>
              <button @click="$emit('analyze')" :disabled="analyzing || publishing || performingOCR" class="flex items-center gap-2 px-4 py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all disabled:opacity-50">
                <LucideSparkles class="w-3.5 h-3.5" :class="{ 'animate-spin': analyzing }" />
                {{ analyzing ? 'Analisando...' : 'Re-analisar com IA' }}
              </button>
            </div>
          </div>

          <!-- Cover & Details -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-1">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 block mb-4">Capa</label>
              <div @click="$emit('triggerUpload')" class="aspect-[3/4.5] bg-cantuaria-cream/50 border-2 border-dashed border-cantuaria-charcoal/10 flex flex-col items-center justify-center p-4 cursor-pointer hover:border-cantuaria-oxford/30 transition-colors group relative overflow-hidden shadow-inner">
                <img v-if="modelValue.thumbnail_url" :src="modelValue.thumbnail_url" class="absolute inset-0 w-full h-full object-cover" />
                <template v-else><LucideImage class="w-8 h-8 text-cantuaria-charcoal/20 group-hover:text-cantuaria-oxford transition-colors mb-2" /><span class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 text-center">Subir Imagem</span></template>
                <div v-if="uploadingCover || capturingPdf" class="absolute inset-0 bg-white/80 flex items-center justify-center"><LucideLoader2 class="w-6 h-6 animate-spin text-cantuaria-oxford" /></div>
              </div>
              <div class="flex flex-col gap-2 mt-4">
                <button @click.stop="$emit('generateCover')" :disabled="publishing" class="w-full py-2 border border-cantuaria-gold text-cantuaria-gold text-[8px] uppercase tracking-widest font-bold hover:bg-cantuaria-gold hover:text-white transition-all disabled:opacity-50">Gerar Capa Cantuária</button>
                <button 
                  v-if="modelValue.file_url?.toLowerCase().endsWith('.pdf')" 
                  @click.stop="$emit('capturePdfCover')" 
                  :disabled="capturingPdf || publishing"
                  class="w-full py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[8px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all disabled:opacity-50"
                >
                  {{ capturingPdf ? 'Capturando...' : 'Usar 1ª pág como Capa' }}
                </button>
              </div>
            </div>
            <div class="md:col-span-2 space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Título Final</label>
                <input type="text" v-model="modelValue.title" @input="$emit('updateSlug')" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-serif text-xl bg-transparent disabled:opacity-50" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Link Amigável (Slug)</label>
                <input type="text" v-model="modelValue.slug" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-oxford text-[10px] font-mono bg-transparent text-cantuaria-charcoal/40 disabled:opacity-50" />
              </div>
              <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Autor(es)</label><input type="text" v-model="modelValue.authors_list" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent disabled:opacity-50" /></div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Ano</label><input type="number" v-model="modelValue.publication_year" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent disabled:opacity-50" /></div>
                <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Idioma</label><input type="text" v-model="modelValue.language" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent disabled:opacity-50" /></div>
              </div>
              <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Categoria</label><input type="text" v-model="modelValue.category_name" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent disabled:opacity-50" /></div>
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Tipo de Documento</label>
                <select v-model="modelValue.type" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent appearance-none disabled:opacity-50">
                  <option value="Livro">Livro</option>
                  <option value="Artigo">Artigo</option>
                  <option value="LOC">Liturgia (LOC)</option>
                  <option value="Revista">Revista</option>
                  <option value="Foto">Foto</option>
                  <option value="Documento">Documento Histórico</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Publicação</label>
                <select v-model="modelValue.publication_id" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent appearance-none disabled:opacity-50">
                  <option :value="null">Nenhuma</option>
                  <option v-for="pub in publications" :key="pub.id" :value="pub.id">{{ pub.title }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Resumo</label><textarea rows="6" v-model="modelValue.summary" :disabled="publishing" class="w-full border border-cantuaria-charcoal/10 p-4 focus:outline-none focus:border-cantuaria-oxford font-sans text-sm leading-relaxed bg-cantuaria-cream/10 disabled:opacity-50"></textarea></div>
          <div class="space-y-2"><label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Tags</label><input type="text" v-model="modelValue.tags_list" :disabled="publishing" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent disabled:opacity-50" /></div>
          <div class="pt-10 flex justify-end gap-4 border-t border-cantuaria-oxford/5">
            <button @click="$emit('update:modelValue', null)" :disabled="publishing" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors disabled:opacity-50">Cancelar</button>
            <button @click="$emit('publish')" :disabled="publishing" class="px-12 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl disabled:opacity-50 transition-all">
              <template v-if="publishing"><LucideLoader2 class="w-4 h-4 animate-spin inline mr-2" /> Salvando...</template>
              <template v-else>Salvar & Publicar</template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  X as LucideX, 
  Sparkles as LucideSparkles, 
  ScanText as LucideScanText, 
  Loader2 as LucideLoader2, 
  Image as LucideImage 
} from 'lucide-vue-next'

defineProps<{
  modelValue: any
  publications: any[]
  analyzing: boolean
  publishing: boolean
  uploadingCover: boolean
  capturingPdf: boolean
  performingOCR: boolean
}>()

defineEmits([
  'update:modelValue', 
  'runOcr', 
  'analyze', 
  'triggerUpload', 
  'generateCover', 
  'capturePdfCover', 
  'updateSlug', 
  'publish'
])
</script>
