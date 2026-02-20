<template>
  <div v-if="modelValue" class="fixed inset-0 z-[100] bg-cantuaria-oxford/95 backdrop-blur-md flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-4xl shadow-2xl overflow-hidden animate-fade-in">
      <header class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center">
        <h3 class="font-serif text-2xl text-cantuaria-oxford">{{ modelValue.id ? 'Editar Publicação' : 'Nova Publicação' }}</h3>
        <button @click="$emit('update:modelValue', null)" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full"><LucideX class="w-6 h-6" /></button>
      </header>
      <div class="p-8 flex flex-col md:flex-row gap-10">
        <!-- Cover Upload -->
        <div class="w-full md:w-1/3">
          <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 block mb-4">Capa da Publicação</label>
          <div @click="$emit('triggerUpload')" class="aspect-[3/4.5] bg-cantuaria-cream/50 border-2 border-dashed border-cantuaria-charcoal/10 flex flex-col items-center justify-center p-4 cursor-pointer hover:border-cantuaria-oxford/30 transition-colors group relative overflow-hidden shadow-inner">
            <img v-if="modelValue.cover_url" :src="modelValue.cover_url" class="absolute inset-0 w-full h-full object-cover" />
            <template v-else>
              <LucideImage class="w-8 h-8 text-cantuaria-charcoal/20 group-hover:text-cantuaria-oxford transition-colors mb-2" />
              <span class="text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 text-center">Subir Capa</span>
            </template>
            <div v-if="uploadingCover" class="absolute inset-0 bg-white/80 flex items-center justify-center">
              <LucideLoader2 class="w-6 h-6 animate-spin text-cantuaria-oxford" />
            </div>
          </div>
          <p class="text-[9px] text-cantuaria-charcoal/40 mt-4 leading-relaxed italic">
            A capa será exibida na listagem de publicações e na página da coleção.
          </p>
        </div>

        <!-- Fields -->
        <div class="flex-grow space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Título *</label>
            <input type="text" v-model="modelValue.title" @input="$emit('updateSlug')" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-serif text-xl bg-transparent" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Slug *</label>
            <input type="text" v-model="modelValue.slug" class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-oxford text-[10px] font-mono bg-transparent text-cantuaria-charcoal/40" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Tipo</label>
              <select v-model="modelValue.publication_type" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent appearance-none">
                <option value="">—</option>
                <option value="Revista">Revista</option>
                <option value="Jornal">Jornal</option>
                <option value="Série">Série</option>
                <option value="Coleção">Coleção</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Editora / Órgão</label>
              <input type="text" v-model="modelValue.publisher" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Ano Inicial</label>
              <input type="number" v-model="modelValue.start_year" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Ano Final</label>
              <input type="number" v-model="modelValue.end_year" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Descrição</label>
            <textarea rows="3" v-model="modelValue.description" class="w-full border border-cantuaria-charcoal/10 p-3 focus:outline-none focus:border-cantuaria-oxford text-sm leading-relaxed bg-cantuaria-cream/10"></textarea>
          </div>
        </div>
      </div>
      <footer class="px-8 py-6 border-t border-cantuaria-charcoal/5 bg-cantuaria-cream/30 flex justify-end gap-4">
        <button @click="$emit('update:modelValue', null)" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">Cancelar</button>
        <button @click="$emit('save')" :disabled="saving" class="px-12 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl disabled:opacity-50 transition-all">
          <template v-if="saving"><LucideLoader2 class="w-4 h-4 animate-spin inline mr-2" /> Salvando...</template>
          <template v-else>Salvar</template>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  X as LucideX, 
  Image as LucideImage, 
  Loader2 as LucideLoader2 
} from 'lucide-vue-next'

defineProps<{
  modelValue: any
  saving: boolean
  uploadingCover: boolean
}>()

defineEmits(['update:modelValue', 'triggerUpload', 'updateSlug', 'save'])
</script>
