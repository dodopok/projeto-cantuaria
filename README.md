# 📖 Projeto Cantuária

O **Projeto Cantuária** é uma plataforma digital centralizada para a preservação e disseminação da produção intelectual, litúrgica e histórica anglicana. Une uma estética acadêmica refinada com tecnologias modernas para oferecer uma experiência de leitura e pesquisa de alto nível.

## 🛠 Stack Tecnológica

- **Frontend & Framework:** [Nuxt 3](https://nuxt.com/) (Vue.js) com SSR para SEO otimizado.
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com foco em tipografia clássica (EB Garamond & Inter).
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL) com Full-Text Search.
- **IA de Curadoria:** [Perplexity AI](https://www.perplexity.ai/) para análise automática de metadados.
- **Ícones:** [Lucide Vue Next](https://lucide.dev/).

## 🏛️ Funcionalidades Principais

- **Biblioteca Digital:** Navegação intuitiva por livros, artigos, revistas e documentos litúrgicos.
- **Leitor Integrado:** Visualizador de documentos (PDF e Texto) com interface focada e modo tela cheia.
- **Pesquisa Avançada:** Busca global por texto, filtros por categoria, tipo de obra e idioma.
- **Portal de Contribuição:** Interface para usuários sugerirem e enviarem documentos para o acervo.
- **Painel Administrativo:** Curadoria de documentos com auxílio de Inteligência Artificial para extração automática de metadados (título, autor, resumo, tags).

## 🔒 Arquitetura de Segurança

O projeto utiliza uma separação rigorosa de privilégios:
- **Client-Side:** Usa a `ANON_KEY` com **Row Level Security (RLS)** ativado, permitindo que usuários públicos acessem apenas documentos aprovados.
- **Server-Side:** Usa a `SERVICE_ROLE_KEY` através de rotas de API seguras (`server/api`) para operações administrativas e integração com IA, garantindo que chaves sensíveis nunca sejam expostas ao navegador.

## 🚀 Como Iniciar

1. **Instalação:**
   ```bash
   npm install
   ```

2. **Configuração:**
   Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais do Supabase e Perplexity:
   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_KEY=sua-anon-key
   SUPABASE_SERVICE_KEY=sua-service-role-key
   PERPLEXITY_API_KEY=sua-api-key
   ```

3. **Banco de Dados:**
   Execute o script `supabase_schema.sql` no painel SQL do seu projeto Supabase para criar as tabelas e índices necessários.

4. **Desenvolvimento:**
   ```bash
   npm run dev
   ```

---
*Ad Majorem Dei Gloriam.*
