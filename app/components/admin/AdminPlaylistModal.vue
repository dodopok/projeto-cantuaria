<template>
  <div v-if="modelValue" class="fixed inset-0 z-[100] bg-cantuaria-oxford/95 backdrop-blur-md flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in">
      <header class="p-6 border-b border-cantuaria-charcoal/5 flex justify-between items-center">
        <h3 class="font-serif text-2xl text-cantuaria-oxford">{{ modelValue.id ? 'Editar Playlist' : 'Nova Playlist' }}</h3>
        <button @click="$emit('update:modelValue', null)" class="p-2 hover:bg-cantuaria-charcoal/5 rounded-full">
          <LucideX class="w-6 h-6" />
        </button>
      </header>

      <div class="p-8 space-y-6">
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

        <div class="space-y-2">
          <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">Descrição</label>
          <textarea
            v-model="modelValue.description"
            rows="4"
            class="w-full border border-cantuaria-charcoal/10 p-3 focus:outline-none focus:border-cantuaria-oxford text-sm leading-relaxed bg-cantuaria-cream/10"
          />
        </div>

        <div class="space-y-2">
          <label class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">URL da Capa</label>
          <input
            v-model="modelValue.cover_url"
            type="url"
            placeholder="https://..."
            class="w-full border-b border-cantuaria-charcoal/10 py-2 focus:outline-none focus:border-cantuaria-oxford text-sm bg-transparent"
          />
          <img v-if="modelValue.cover_url" :src="modelValue.cover_url" class="w-32 aspect-video object-cover border border-cantuaria-charcoal/10 mt-2" />
        </div>
      </div>

      <footer class="px-8 py-6 border-t border-cantuaria-charcoal/5 bg-cantuaria-cream/30 flex justify-end gap-4">
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
} from 'lucide-vue-next'

defineProps<{
  modelValue: any
  saving: boolean
}>()

defineEmits(['update:modelValue', 'updateSlug', 'save'])
</script>
