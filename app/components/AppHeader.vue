<template>
  <header class="sticky top-0 z-50 bg-cantuaria-cream/80 backdrop-blur-md border-b border-cantuaria-charcoal/5">
    <nav class="container mx-auto px-6 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 bg-cantuaria-oxford flex items-center justify-center rounded-sm transition-transform group-hover:scale-105">
          <span class="font-serif text-2xl text-white">C</span>
        </div>
        <div class="flex flex-col">
          <span class="font-serif text-xl leading-none font-bold tracking-tight text-cantuaria-oxford">Projeto Cantuária</span>
          <span class="font-sans text-[10px] uppercase tracking-[0.2em] text-cantuaria-charcoal/60 leading-tight">Biblioteca Digital Anglicana</span>
        </div>
      </NuxtLink>

      <div class="hidden md:flex items-center gap-10">
        <NuxtLink to="/biblioteca" class="nav-link">Biblioteca</NuxtLink>
        <NuxtLink to="/autores" class="nav-link">Autores</NuxtLink>
        <NuxtLink to="/categorias" class="nav-link">Categorias</NuxtLink>
        <NuxtLink to="/contribuir" class="nav-link text-cantuaria-crimson/80 hover:text-cantuaria-crimson">Contribuir</NuxtLink>
      </div>

      <div class="flex items-center gap-4">
        <button class="p-2 text-cantuaria-charcoal/60 hover:text-cantuaria-oxford transition-colors">
          <LucideSearch class="w-5 h-5" />
        </button>
        <NuxtLink to="/login" class="btn-primary py-2 px-5 text-sm">Acesso</NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { Search as LucideSearch } from 'lucide-vue-next'
</script>
