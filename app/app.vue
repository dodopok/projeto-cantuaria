<template>
  <div>
    <NuxtPage />
    <Analytics />
  </div>
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt'

const route = useRoute()

// Canonical e og:url em todas as páginas (sem query string; páginas podem sobrescrever)
const canonical = computed(() => `${SITE_URL}${route.path === '/' ? '/' : route.path.replace(/\/+$/, '')}`)

// Identidade do site para buscadores e assistentes de IA (Organization + WebSite com busca interna)
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organizacao`,
      name: SITE_NAME,
      alternateName: 'Biblioteca Digital Anglicana',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/favicon.svg`,
      description: SITE_DESCRIPTION,
      parentOrganization: {
        '@type': 'Organization',
        name: 'Caminho Anglicano',
        url: 'https://www.caminhoanglicano.com.br/'
      }
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#site`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE_URL}/#organizacao` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/biblioteca?q={search_term_string}` },
        'query-input': 'required name=search_term_string'
      }
    }
  ]
}

useHead({
  link: [
    { rel: 'canonical', href: canonical },
    { rel: 'alternate', type: 'text/plain', title: 'Resumo do site para IA (llms.txt)', href: `${SITE_URL}/llms.txt` }
  ],
  meta: [{ property: 'og:url', content: canonical }],
  script: [{ type: 'application/ld+json', key: 'ld-site', innerHTML: JSON.stringify(siteJsonLd) }]
})
</script>
