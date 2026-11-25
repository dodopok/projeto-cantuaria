-- =====================================================================
-- Transcrição em partes (Claude) + busca no texto transcrito
-- =====================================================================
-- Depende de 20261125120000_seguranca_admin.sql (public.is_admin()).
--
-- 1. Tabela transcription_chunks: cada faixa de páginas transcrita separadamente,
--    permitindo retomar, reprocessar só o que falhou e auditar custo/modelo.
-- 2. Colunas de acompanhamento em documents (páginas, status, modelo, data).
-- 3. search_vector passa a incluir a transcrição (antes só title/summary/content_text,
--    e content_text está vazio em quase todo o acervo: a busca não achava o texto das obras).
--    Pesos: título (A), autores/tags e resumo (B), corpo (D). O corpo é limitado a
--    300 mil caracteres por causa do limite de tamanho do tsvector.
-- =====================================================================

-- 1. Partes da transcrição ---------------------------------------------------
create table if not exists public.transcription_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  page_from integer not null,
  page_to integer not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'error')),
  markdown text,
  model text,
  input_tokens integer,
  output_tokens integer,
  error text,
  attempts integer not null default 0,
  updated_at timestamptz not null default now(),
  check (page_from >= 1 and page_to >= page_from),
  unique (document_id, page_from)
);

create index if not exists idx_transcription_chunks_document on public.transcription_chunks(document_id, page_from);

alter table public.transcription_chunks enable row level security;
drop policy if exists "Admin full access transcription_chunks" on public.transcription_chunks;
create policy "Admin full access transcription_chunks" on public.transcription_chunks
  for all using (public.is_admin()) with check (public.is_admin());

-- 2. Acompanhamento no documento --------------------------------------------
alter table public.documents
  add column if not exists page_count integer,
  add column if not exists transcription_status text
    check (transcription_status in ('processing', 'complete', 'partial', 'error')),
  add column if not exists transcription_model text,
  add column if not exists transcribed_at timestamptz;

comment on column public.documents.content_markdown is 'Transcrição integral em Markdown (Claude, por faixas de páginas; ver transcription_chunks)';

-- 3. Busca incluindo a transcrição -----------------------------------------
drop index if exists public.idx_documents_search;
alter table public.documents drop column if exists search_vector;
alter table public.documents add column search_vector tsvector generated always as (
  setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('portuguese', coalesce(search_metadata, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce(summary, '')), 'B') ||
  setweight(to_tsvector('portuguese', left(coalesce(nullif(content_text, ''), content_markdown, ''), 300000)), 'D')
) stored;
create index idx_documents_search on public.documents using gin (search_vector);
