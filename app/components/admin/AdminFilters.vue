<template>
  <div class="flex flex-col md:flex-row gap-4 bg-white p-4 border border-cantuaria-charcoal/5 shadow-sm rounded-sm">
    <div class="relative flex-grow">
      <LucideSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cantuaria-charcoal/30" />
      <input 
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text" 
        placeholder="Pesquisar por título, autor ou tag..." 
        class="w-full pl-10 pr-4 py-2 bg-cantuaria-cream/50 border border-cantuaria-charcoal/10 focus:outline-none focus:border-cantuaria-oxford text-xs font-sans rounded-sm transition-colors"
      />
    </div>
    <div class="flex gap-4 items-center flex-wrap md:flex-nowrap">
      <!-- Filtros de Pendências -->
      <div class="flex items-center gap-2 mr-2 border-r border-cantuaria-charcoal/10 pr-4">
        <label class="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            :checked="filterNoMarkdown" 
            @change="$emit('update:filterNoMarkdown', ($event.target as HTMLInputElement).checked)"
            class="w-4 h-4 accent-cantuaria-gold rounded-sm" 
          />
          <span class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 group-hover:text-cantuaria-oxford transition-colors">Sem Markdown</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer group ml-2">
          <input 
            type="checkbox" 
            :checked="filterNoCover" 
            @change="$emit('update:filterNoCover', ($event.target as HTMLInputElement).checked)"
            class="w-4 h-4 accent-cantuaria-gold rounded-sm" 
          />
          <span class="text-[9px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 group-hover:text-cantuaria-oxford transition-colors">Sem Capa</span>
        </label>
      </div>

      <!-- View Mode Toggle -->
      <div class="flex border border-cantuaria-charcoal/10 rounded-sm overflow-hidden mr-2">
        <button 
          @click="$emit('update:viewMode', 'table')"
          :class="['p-2 transition-colors', viewMode === 'table' ? 'bg-cantuaria-oxford text-white' : 'bg-cantuaria-cream/50 text-cantuaria-charcoal/40 hover:text-cantuaria-oxford']"
          title="Vista em Tabela"
        >
          <LucideLayoutList class="w-4 h-4" />
        </button>
        <button 
          @click="$emit('update:viewMode', 'grid')"
          :class="['p-2 transition-colors', viewMode === 'grid' ? 'bg-cantuaria-oxford text-white' : 'bg-cantuaria-cream/50 text-cantuaria-charcoal/40 hover:text-cantuaria-oxford']"
          title="Vista em Grade"
        >
          <LucideLayoutGrid class="w-4 h-4" />
        </button>
      </div>

      <select 
        :value="orderBy"
        @change="$emit('update:orderBy', ($event.target as HTMLSelectElement).value)"
        class="bg-cantuaria-cream/50 border border-cantuaria-charcoal/10 px-4 py-2 text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:border-cantuaria-oxford rounded-sm"
      >
        <option value="created_at:desc">Mais recentes</option>
        <option value="created_at:asc">Mais antigos</option>
        <option value="title:asc">Título (A-Z)</option>
        <option value="title:desc">Título (Z-A)</option>
      </select>
      <select 
        :value="pageSize"
        @change="$emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))"
        class="bg-cantuaria-cream/50 border border-cantuaria-charcoal/10 px-4 py-2 text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:border-cantuaria-oxford rounded-sm"
      >
        <option :value="10">10 por pág</option>
        <option :value="25">25 por pág</option>
        <option :value="50">50 por pág</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Search as LucideSearch, 
  LayoutList as LucideLayoutList, 
  LayoutGrid as LucideLayoutGrid 
} from 'lucide-vue-next'

defineProps<{
  searchQuery: string
  viewMode: 'table' | 'grid'
  orderBy: string
  pageSize: number
  filterNoMarkdown: boolean
  filterNoCover: boolean
}>()

defineEmits([
  'update:searchQuery', 
  'update:viewMode', 
  'update:orderBy', 
  'update:pageSize',
  'update:filterNoMarkdown',
  'update:filterNoCover'
])
</script>
