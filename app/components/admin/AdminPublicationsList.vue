<template>
  <div class="space-y-6">
    <div class="flex justify-end">
      <button @click="$emit('openNew')" class="flex items-center gap-2 px-6 py-3 bg-cantuaria-oxford text-white text-[10px] uppercase tracking-widest font-bold hover:shadow-lg transition-all">
        <LucidePlus class="w-4 h-4" />
        Nova Publicação
      </button>
    </div>
    <div v-if="publications.length === 0" class="bg-white border border-cantuaria-charcoal/5 p-20 text-center shadow-sm">
      <LucideNewspaper class="w-12 h-12 mx-auto mb-4 text-cantuaria-gold/30" />
      <p class="font-serif text-xl text-cantuaria-oxford/50">Nenhuma publicação cadastrada.</p>
    </div>
    <div v-else class="bg-white border border-cantuaria-charcoal/5 shadow-sm overflow-hidden rounded-sm">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-cantuaria-cream/50 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal/40 border-b border-cantuaria-charcoal/5">
            <th class="px-6 py-4">Publicação</th>
            <th class="px-6 py-4">Tipo</th>
            <th class="px-6 py-4">Anos</th>
            <th class="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-cantuaria-charcoal/5">
          <tr v-for="pub in publications" :key="pub.id" class="group hover:bg-cantuaria-cream/30 transition-colors">
            <td class="px-6 py-5">
              <div class="font-medium text-cantuaria-oxford">{{ pub.title }}</div>
              <div v-if="pub.publisher" class="text-[10px] text-cantuaria-charcoal/40 mt-0.5">{{ pub.publisher }}</div>
            </td>
            <td class="px-6 py-5 text-xs text-cantuaria-charcoal/60">{{ pub.publication_type || '—' }}</td>
            <td class="px-6 py-5 text-xs text-cantuaria-charcoal/60">
              {{ pub.start_year || '—' }}{{ pub.end_year && pub.end_year !== pub.start_year ? `–${pub.end_year}` : '' }}
            </td>
            <td class="px-6 py-5 text-right whitespace-nowrap">
              <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="$emit('openEdit', pub)" class="px-4 py-2 border border-cantuaria-oxford text-cantuaria-oxford text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-oxford hover:text-white transition-all">Editar</button>
                <button @click="$emit('delete', pub)" class="p-2 text-cantuaria-charcoal/20 hover:text-cantuaria-crimson transition-colors"><LucideTrash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus as LucidePlus, 
  Newspaper as LucideNewspaper, 
  Trash2 as LucideTrash2 
} from 'lucide-vue-next'

defineProps<{
  publications: any[]
}>()

defineEmits(['openNew', 'openEdit', 'delete'])
</script>
