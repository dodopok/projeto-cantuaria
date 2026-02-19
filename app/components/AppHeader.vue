<template>
  <header class="sticky top-0 z-50 bg-cantuaria-cream/80 backdrop-blur-md border-b border-cantuaria-charcoal/5">
    <nav class="container mx-auto px-6 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-3 group shrink-0">
        <div class="w-10 h-10 bg-cantuaria-oxford flex items-center justify-center rounded-sm transition-transform group-hover:scale-105">
          <span class="font-serif text-2xl text-white">C</span>
        </div>
        <div class="flex flex-col">
          <span class="font-serif text-lg md:text-xl leading-none font-bold tracking-tight text-cantuaria-oxford">Projeto Cantuária</span>
          <span class="font-sans text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-cantuaria-charcoal/60 leading-tight">Biblioteca Digital Anglicana</span>
        </div>
      </NuxtLink>

      <!-- Desktop Nav -->
      <div class="hidden lg:flex items-center gap-10">
        <NuxtLink to="/biblioteca" class="nav-link">Biblioteca</NuxtLink>
        <NuxtLink to="/autores" class="nav-link">Autores</NuxtLink>
        <NuxtLink to="/categorias" class="nav-link">Categorias</NuxtLink>
        <NuxtLink to="/contribuir" class="nav-link text-cantuaria-crimson/80 hover:text-cantuaria-crimson font-bold">Contribuir</NuxtLink>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 md:gap-4">
        <NuxtLink to="/pesquisa" class="p-2 text-cantuaria-charcoal/60 hover:text-cantuaria-oxford transition-colors" title="Pesquisa Avançada">
          <LucideSearch class="w-5 h-5" />
        </NuxtLink>
        <NuxtLink to="/login" class="hidden sm:block btn-primary py-2 px-5 text-sm">Acesso</NuxtLink>
        
        <!-- Mobile Menu Toggle -->
        <button @click="isMenuOpen = !isMenuOpen" class="lg:hidden p-2 text-cantuaria-oxford transition-colors">
          <LucideMenu v-if="!isMenuOpen" class="w-6 h-6" />
          <LucideX v-else class="w-6 h-6" />
        </button>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="isMenuOpen" class="lg:hidden absolute top-full inset-x-0 bg-white border-b border-cantuaria-charcoal/10 shadow-2xl overflow-hidden">
        <div class="flex flex-col p-6 gap-6">
          <NuxtLink to="/biblioteca" @click="isMenuOpen = false" class="text-lg font-serif text-cantuaria-oxford border-b border-cantuaria-cream pb-2">Biblioteca</NuxtLink>
          <NuxtLink to="/autores" @click="isMenuOpen = false" class="text-lg font-serif text-cantuaria-oxford border-b border-cantuaria-cream pb-2">Autores</NuxtLink>
          <NuxtLink to="/categorias" @click="isMenuOpen = false" class="text-lg font-serif text-cantuaria-oxford border-b border-cantuaria-cream pb-2">Categorias</NuxtLink>
          <NuxtLink to="/contribuir" @click="isMenuOpen = false" class="text-lg font-serif text-cantuaria-crimson border-b border-cantuaria-cream pb-2">Contribuir</NuxtLink>
          <NuxtLink to="/login" @click="isMenuOpen = false" class="btn-primary py-4 text-center">Área do Administrador</NuxtLink>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { Search as LucideSearch, Menu as LucideMenu, X as LucideX } from 'lucide-vue-next'
const isMenuOpen = ref(false)

// Fecha menu ao mudar de rota
watch(() => useRoute().fullPath, () => {
  isMenuOpen.value = false
})
</script>
