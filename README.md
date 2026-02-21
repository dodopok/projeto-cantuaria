# 📖 Projeto Cantuária (Biblioteca Digital Anglicana)

O **Projeto Cantuária** é uma plataforma digital centralizada para a preservação e disseminação da produção intelectual, litúrgica e histórica anglicana em língua portuguesa. Como o braço literário do ecossistema [Caminho Anglicano](https://www.caminhoanglicano.com.br/), o projeto une uma estética acadêmica refinada com tecnologias de ponta para tornar séculos de tradição acessíveis a todos.

## 🛠 Stack Tecnológica

- **Framework:** [Nuxt 3](https://nuxt.com/) (Vue.js) com renderização híbrida (SSR/SWR).
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com foco em tipografia clássica (**EB Garamond** & **Inter**).
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL) com Full-Text Search e Row Level Security (RLS).
- **Processamento de IA:**
  - **Gemini 2.0 Flash:** Responsável por OCR de alta fidelidade e transcrição estruturada em Markdown.
  - **Perplexity AI:** Curadoria inteligente e extração automática de metadados.
- **Ícones:** [Lucide Vue Next](https://lucide.dev/).

## 🏛️ Funcionalidades Principais

- **Biblioteca Digital Completa:** Navegação por categorias, tipos de obra (Livro, Artigo, LOC, Documento) e séculos.
- **Sistema de Leitura Multi-modal:**
  - **Visualizador de PDF:** Experiência imersiva em tela cheia com suporte a gestos mobile.
  - **Transcrição em Texto:** Leitura fluida de transcrições Markdown para melhor acessibilidade e indexação.
- **Pesquisa Avançada:** Filtros cronológicos, linguísticos e temáticos integrados ao motor de busca vetorial.
- **Painel Administrativo Robusto:**
  - **Batch Actions:** Análise de metadados e atualização de Markdown em massa via Gemini.
  - **Gestão de Acervo:** Fluxo de revisão de sugestões, edição manual de transcrições e geração de capas institucionais.
  - **Otimização de Performance:** Listagens administrativas ultrarrápidas através de seleção cirúrgica de colunas e colunas virtuais (`has_markdown`).

## 🚀 Performance & SEO

- **Estratégia de Cache:** Implementação agressiva de cache via **Nitro/SWR** com invalidação total e automática sempre que o acervo é atualizado no Admin.
- **SEO Avançado:** SSR completo para indexação de transcrições, Sitemap XML dinâmico e metadados Open Graph ricos para compartilhamento social (WhatsApp, Twitter, etc.).
- **Economia de Banda:** Uso de **Computed Columns** no PostgreSQL para verificar status de documentos sem baixar conteúdos pesados.

## 🔒 Arquitetura de Segurança

- **Client-Side:** Protegido por RLS, garantindo que usuários públicos acessem apenas documentos aprovados e publicados.
- **Server-Side:** Integrações sensíveis (IA e Admin) isoladas em rotas de API seguras, utilizando a `SERVICE_ROLE_KEY` para operações privilegiadas.

## 🚀 Como Iniciar

1. **Instalação:**
   ```bash
   npm install
   ```

2. **Configuração:**
   Crie um arquivo `.env` baseado no `.env.example` e preencha as credenciais:
   ```env
   SUPABASE_URL=...
   SUPABASE_KEY=...
   SUPABASE_SERVICE_KEY=...
   PERPLEXITY_API_KEY=...
   GEMINI_API_KEY=...
   ```

3. **Banco de Dados:**
   Execute os scripts SQL na pasta raiz (seguindo a ordem de schema) no seu painel Supabase para configurar as tabelas, funções virtuais e índices de busca.

4. **Desenvolvimento:**
   ```bash
   npm run dev
   ```

---
*Parte da iniciativa [Caminho Anglicano](https://www.caminhoanglicano.com.br/). Ad Majorem Dei Gloriam.*
