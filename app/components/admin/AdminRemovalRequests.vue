<template>
  <div class="space-y-6">
    <div v-if="requests.length === 0" class="bg-white border border-cantuaria-charcoal/5 p-20 text-center shadow-sm">
      <LucideShieldCheck class="w-12 h-12 mx-auto mb-4 text-cantuaria-gold/30" />
      <p class="font-serif text-xl text-cantuaria-oxford/50">Nenhuma solicitação de remoção pendente.</p>
    </div>
    <div v-else class="grid grid-cols-1 gap-6">
      <div v-for="req in requests" :key="req.id" class="bg-white border border-cantuaria-charcoal/5 p-8 shadow-sm flex flex-col md:flex-row justify-between gap-8 group hover:border-cantuaria-gold/30 transition-all">
        <div class="space-y-4 max-w-2xl">
          <div class="flex items-center gap-3">
            <span class="text-[10px] uppercase tracking-widest font-bold text-cantuaria-crimson bg-cantuaria-crimson/5 px-2 py-1">Solicitação de Remoção</span>
            <span class="text-[10px] text-cantuaria-charcoal/40 uppercase tracking-widest font-bold">{{ new Date(req.created_at).toLocaleDateString() }}</span>
          </div>
          <h3 class="font-serif text-2xl text-cantuaria-oxford">{{ req.documents?.title }}</h3>
          <div class="grid grid-cols-2 gap-6 text-xs">
            <div>
              <span class="block text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mb-1">Solicitante</span>
              <span class="font-bold text-cantuaria-charcoal">{{ req.requester_name }}</span>
              <span class="block text-cantuaria-charcoal/60">{{ req.requester_email }}</span>
            </div>
            <div>
              <span class="block text-[8px] uppercase tracking-widest font-bold text-cantuaria-charcoal/30 mb-1">Motivo</span>
              <p class="text-cantuaria-charcoal/80 leading-relaxed italic">"{{ req.reason }}"</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <button @click="$emit('handleRemoval', req.id, 'deny')" class="px-6 py-3 border border-cantuaria-charcoal/10 text-[10px] uppercase tracking-widest font-bold text-cantuaria-charcoal hover:bg-cantuaria-charcoal/5 transition-all">Ignorar</button>
          <button @click="$emit('handleRemoval', req.id, 'approve')" class="px-6 py-3 bg-cantuaria-crimson text-white text-[10px] uppercase tracking-widest font-bold hover:bg-cantuaria-crimson/90 shadow-lg transition-all">Excluir Obra</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShieldCheck as LucideShieldCheck } from 'lucide-vue-next'

defineProps<{
  requests: any[]
}>()

defineEmits(['handleRemoval'])
</script>
