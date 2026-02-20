<template>
  <header class="bg-cantuaria-oxford text-white py-12">
    <div class="container mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div class="flex items-center gap-3 mb-4 text-cantuaria-gold">
            <LucideShieldCheck class="w-5 h-5" />
            <span class="text-[10px] uppercase tracking-[0.3em] font-bold">Painel de Administração</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-serif">Gestão do Acervo</h1>
        </div>
        <div class="flex gap-4">
          <button @click="$emit('logout')" class="px-6 py-3 border border-white/20 hover:bg-white/10 transition-colors text-[10px] uppercase tracking-widest font-bold">Sair</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ShieldCheck as LucideShieldCheck } from 'lucide-vue-next'

defineEmits(['logout'])
</script>
