<template>
  <div v-if="modelValue" class="fixed inset-0 z-[100] bg-cantuaria-oxford/95 backdrop-blur-md flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-4xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
      <header class="px-6 py-5 border-b border-cantuaria-charcoal/5 flex justify-between items-center flex-shrink-0">
        <h3 class="font-serif text-2xl text-cantuaria-oxford">{{ modelValue.id ? 'Editar Vídeo' : 'Novo Vídeo' }}</h3>
        <button @click="$emit('update:modelValue', null)" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full">
          <LucideX class="w-6 h-6" />
        </button>
      </header>

      <div class="overflow-y-auto flex-grow">
        <div class="p-8 flex flex-col md:flex-row gap-10">
          <!-- Thumb + Analyze -->
          <div class="w-full md:w-72 flex-shrink-0 space-y-4">
            <!-- URL Input + Analyze button -->
            <div v-if="!modelValue.id" class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 block">URL do YouTube *</label>
              <div class="flex gap-2">
                <input
                  v-model="modelValue.url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  class="flex-grow border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent"
                />
                <button
                  @click="$emit('analyze')"
                  :disabled="analyzing || !modelValue.url"
                  class="px-4 py-2 bg-cantuaria-gold text-cantuaria-oxford text-[9px] uppercase tracking-widest font-bold hover:shadow-md disabled:opacity-40 transition-all flex items-center gap-1 whitespace-nowrap"
                >
                  <LucideLoader2 v-if="analyzing" class="w-3.5 h-3.5 animate-spin" />
                  <LucideSparkles v-else class="w-3.5 h-3.5" />
                  {{ analyzing ? 'Analisando...' : 'Analisar' }}
                </button>
              </div>
            </div>
            <div v-else class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 block">URL do YouTube</label>
              <input
                v-model="modelValue.url"
                type="url"
                class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent"
              />
            </div>

            <!-- Thumbnail preview -->
            <div class="aspect-video bg-cantuaria-cream/50 border border-dashed border-cantuaria-charcoal/10 overflow-hidden relative shadow-inner">
              <img v-if="modelValue.thumbnail_url" :src="modelValue.thumbnail_url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2">
                <LucideYoutube class="w-10 h-10 text-cantuaria-charcoal/20" />
                <span class="text-[9px] uppercase tracking-widest text-cantuaria-charcoal/30">Thumbnail</span>
              </div>
            </div>

            <!-- Embed preview -->
            <div v-if="modelValue.youtube_id" class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 block">Preview</label>
              <div class="aspect-video">
                <iframe
                  :src="`https://www.youtube.com/embed/${modelValue.youtube_id}`"
                  class="w-full h-full"
                  frameborder="0"
                  allowfullscreen
                />
              </div>
            </div>
          </div>

          <!-- Fields -->
          <div class="flex-grow space-y-5">
            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Título *</label>
              <input
                v-model="modelValue.title"
                @input="$emit('updateSlug')"
                type="text"
                class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford font-serif text-xl bg-transparent"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Slug *</label>
              <input
                v-model="modelValue.slug"
                type="text"
                class="w-full border-b border-cantuaria-charcoal/10 py-1 focus:outline-none focus:border-cantuaria-oxford text-[10px] font-mono bg-transparent text-cantuaria-charcoal/40"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Ano de Publicação</label>
                <input
                  v-model.number="modelValue.publication_year"
                  type="number"
                  min="1900"
                  :max="new Date().getFullYear()"
                  class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent"
                />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Status</label>
                <select v-model="modelValue.status" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent appearance-none">
                  <option value="pending">Pendente</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Playlist</label>
                <select v-model="modelValue.playlist_id" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent appearance-none">
                  <option :value="null">—</option>
                  <option v-for="pl in playlists" :key="pl.id" :value="pl.id">{{ pl.title }}</option>
                </select>
              </div>
              <div v-if="modelValue.playlist_id" class="space-y-2">
                <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Posição na Playlist</label>
                <input
                  v-model.number="modelValue.position"
                  type="number"
                  min="0"
                  class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Categoria</label>
              <select v-model="modelValue.category_id" class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent appearance-none">
                <option :value="null">—</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Autores</label>
              <input
                v-model="modelValue.authors_list"
                type="text"
                placeholder="Nome 1, Nome 2..."
                class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Tags</label>
              <input
                v-model="modelValue.tags_list"
                type="text"
                placeholder="tag1, tag2, tag3..."
                class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Descrição / Resumo</label>
              <textarea
                v-model="modelValue.summary"
                rows="5"
                class="w-full border border-cantuaria-charcoal/10 p-3 focus:outline-none focus:border-cantuaria-oxford text-sm leading-relaxed bg-cantuaria-cream/10"
              />
            </div>
          </div>
        </div>
      </div>

      <footer class="px-8 py-5 border-t border-cantuaria-charcoal/5 bg-cantuaria-cream/30 flex justify-end gap-4 flex-shrink-0">
        <button @click="$emit('update:modelValue', null)" class="px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 hover:text-cantuaria-oxford transition-colors">Cancelar</button>
        <button
          @click="$emit('save')"
          :disabled="saving"
          class="px-12 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-cantuaria-oxford/90 shadow-xl disabled:opacity-50 transition-all"
        >
          <template v-if="saving"><LucideLoader2 class="w-4 h-4 animate-spin inline mr-2" />Salvando...</template>
          <template v-else>Salvar</template>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  X as LucideX,
  Loader2 as LucideLoader2,
  Sparkles as LucideSparkles,
  Youtube as LucideYoutube,
} from 'lucide-vue-next'

defineProps<{
  modelValue: any
  playlists: any[]
  categories: any[]
  analyzing: boolean
  saving: boolean
}>()

defineEmits(['update:modelValue', 'analyze', 'updateSlug', 'save'])
</script>
