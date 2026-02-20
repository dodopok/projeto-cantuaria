<template>
  <div class="space-y-6">
    <div v-if="items.length === 0" class="bg-white border border-cantuaria-charcoal/5 p-20 text-center shadow-sm">
      <LucideCheckCircle class="w-12 h-12 mx-auto mb-4 text-cantuaria-gold/30" />
      <p class="font-serif text-xl text-cantuaria-oxford/50">Nenhum documento encontrado.</p>
    </div>

    <template v-else>
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="item in items" :key="item.id" 
          class="group relative bg-white border border-cantuaria-charcoal/5 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden rounded-sm"
          @click="$emit('openReview', item)"
        >
          <!-- Checkbox Overlay -->
          <div class="absolute top-2 left-2 z-10" @click.stop>
            <input type="checkbox" :value="item.id" v-model="selectedIdsProxy" class="w-5 h-5 accent-cantuaria-oxford shadow-sm" />
          </div>

          <!-- Thumbnail -->
          <div class="aspect-[3/4.5] bg-cantuaria-oxford/5 flex items-center justify-center overflow-hidden border-b border-cantuaria-charcoal/5">
            <img v-if="item.thumbnail_url" :src="item.thumbnail_url" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <LucideFileText v-else class="w-12 h-12 text-cantuaria-oxford/20" />
            
            <!-- Hover Actions -->
            <div class="absolute inset-0 bg-cantuaria-oxford/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
              <button class="p-3 bg-white text-cantuaria-oxford rounded-full shadow-lg hover:scale-110 transition-transform">
                <LucidePencil class="w-5 h-5" />
              </button>
              <button @click.stop="$emit('delete', item)" class="p-3 bg-cantuaria-crimson text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                <LucideTrash2 class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <div class="flex items-center justify-between gap-2 mb-1">
              <div class="flex items-center gap-2">
                <span class="text-[7px] px-1.5 py-0.5 bg-cantuaria-oxford/5 text-cantuaria-oxford/60 uppercase tracking-widest font-bold rounded-sm">{{ item.type }}</span>
                <span class="text-[7px] text-cantuaria-charcoal/30 uppercase font-bold">{{ new Date(item.created_at).toLocaleDateString() }}</span>
              </div>
              <div v-if="item.content_markdown" class="flex items-center" title="Possui transcrição Markdown">
                <LucideScanText class="w-3 h-3 text-cantuaria-gold" />
              </div>
            </div>
            <h4 class="font-medium text-cantuaria-oxford text-xs truncate mb-1" :title="item.title">{{ item.title }}</h4>
            <p v-if="item.authors_list" class="text-[9px] text-cantuaria-charcoal/40 font-serif italic truncate">{{ item.authors_list }}</p>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-else class="bg-white border border-cantuaria-charcoal/5 shadow-sm overflow-hidden rounded-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-cantuaria-cream/50 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 border-b border-cantuaria-charcoal/5">
              <th class="px-6 py-4 w-10">
                <input type="checkbox" @change="$emit('toggleAll')" :checked="allSelected" class="w-4 h-4 accent-cantuaria-oxford" />
              </th>
              <th class="px-6 py-4">Obra</th>
              <th class="px-6 py-4">Transcrição</th>
              <th class="px-6 py-4">Data</th>
              <th class="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-cantuaria-charcoal/5">
            <tr v-for="item in items" :key="item.id" class="group hover:bg-cantuaria-cream/30 transition-colors">
              <td class="px-6 py-6">
                <input type="checkbox" :value="item.id" v-model="selectedIdsProxy" class="w-4 h-4 accent-cantuaria-oxford" />
              </td>
              <td class="px-6 py-6">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-cantuaria-oxford/5 flex items-center justify-center rounded text-cantuaria-oxford overflow-hidden shrink-0 shadow-inner border border-cantuaria-charcoal/5">
                    <img v-if="item.thumbnail_url" :src="item.thumbnail_url" class="w-full h-full object-cover" />
                    <LucideFileTextIcon v-else class="w-5 h-5" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium text-cantuaria-oxford truncate max-w-md">{{ item.title }}</div>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-[8px] px-1.5 py-0.5 bg-cantuaria-oxford/5 text-cantuaria-oxford/60 uppercase tracking-widest font-bold rounded-sm">{{ item.type }}</span>
                      <span v-if="item.authors_list" class="text-[9px] text-cantuaria-charcoal/40 font-serif italic truncate max-w-xs">{{ item.authors_list }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div v-if="item.content_markdown" class="flex items-center gap-2 text-cantuaria-gold" title="Documento Transcrito">
                  <LucideScanText class="w-4 h-4" />
                  <span class="text-[8px] uppercase font-bold">Markdown</span>
                </div>
                <div v-else class="text-cantuaria-charcoal/20" title="Sem transcrição">
                  <LucideMinusCircle class="w-4 h-4" />
                </div>
              </td>
              <td class="px-6 py-6 text-sm text-cantuaria-charcoal/60">{{ new Date(item.created_at).toLocaleDateString() }}</td>
              <td class="px-6 py-6 text-right whitespace-nowrap">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="$emit('openReview', item)" class="px-4 py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all">Editar</button>
                  <button @click="$emit('delete', item)" class="p-2 text-cantuaria-charcoal/20 hover:text-cantuaria-crimson transition-colors"><LucideTrash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination UI -->
      <div class="flex items-center justify-between px-2 py-4">
        <div class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40">
          Mostrando {{ items.length }} de {{ totalItems }} itens
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="$emit('update:currentPage', currentPage - 1)" 
            :disabled="currentPage === 0"
            class="p-2 border border-cantuaria-charcoal/10 rounded-sm hover:bg-white disabled:opacity-30 transition-colors"
          >
            <LucideChevronLeft class="w-4 h-4" />
          </button>
          <span class="text-xs font-bold text-cantuaria-oxford px-4">Página {{ currentPage + 1 }} de {{ Math.ceil(totalItems / pageSize) }}</span>
          <button 
            @click="$emit('update:currentPage', currentPage + 1)" 
            :disabled="(currentPage + 1) * pageSize >= totalItems"
            class="p-2 border border-cantuaria-charcoal/10 rounded-sm hover:bg-white disabled:opacity-30 transition-colors"
          >
            <LucideChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { 
  CheckCircle as LucideCheckCircle,
  FileText as LucideFileText,
  Pencil as LucidePencil,
  Trash2 as LucideTrash2,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight
} from 'lucide-vue-next'

const props = defineProps<{
  items: any[]
  viewMode: 'table' | 'grid'
  selectedIds: string[]
  allSelected: boolean
  totalItems: number
  currentPage: number
  pageSize: number
}>()

const emit = defineEmits([
  'openReview', 
  'delete', 
  'toggleAll', 
  'update:selectedIds', 
  'update:currentPage'
])

const selectedIdsProxy = computed({
  get: () => props.selectedIds,
  set: (val) => emit('update:selectedIds', val)
})
</script>
