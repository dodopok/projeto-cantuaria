-- =====================================================================
-- Segurança: papel de administrador explícito + RLS restrito à curadoria
-- =====================================================================
-- Contexto: hoje qualquer usuário "authenticated" tem acesso total (RLS) e o
-- cadastro de contas no Supabase Auth está aberto. Ou seja, qualquer pessoa que
-- criar e confirmar uma conta vira administradora pelo REST do Supabase.
--
-- Esta migração:
--   1. cria public.is_admin() baseado em app_metadata.role = 'admin' (só a service role altera);
--   2. troca todas as políticas "authenticated"/auth.role() por is_admin();
--   3. liga RLS em video_authors e video_tags (estavam totalmente abertas);
--   4. limita o upload público ao prefixo uploads/ e a 50 MB;
--   5. mantém o histórico de pedidos de remoção ao excluir a obra (FK SET NULL);
--   6. cria document_hash_exists() para o portal de contribuição detectar duplicatas pendentes;
--   7. fixa search_path das funções (aviso do Security Advisor).
--
-- ORDEM DE APLICAÇÃO (importante):
--   a) Rodar a seção 0 com o e-mail da conta de curadoria (marca o papel admin).
--   b) Rodar o restante desta migração.
--   c) Sair e entrar de novo no /admin (o token novo passa a carregar o papel).
--   d) Fazer o deploy do código do PR.
--   e) No painel do Supabase: Authentication → Sign In / Providers → desligar
--      "Allow new users to sign up" (não há usuários públicos no site).
-- =====================================================================

-- 0. Marcar a(s) conta(s) de curadoria como admin  (TROCAR O E-MAIL)
-- update auth.users
--    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
--  where email = 'EMAIL_DA_CURADORIA@exemplo.com';

-- 1. Função de autorização -------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- 2. Políticas das tabelas públicas -----------------------------------------
-- documents
drop policy if exists "Admin full access" on public.documents;
create policy "Admin full access" on public.documents
  for all using (public.is_admin()) with check (public.is_admin());

-- authors / categories / tags
drop policy if exists "Allow Admin Insert/Update Authors" on public.authors;
create policy "Admin full access authors" on public.authors
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Allow Admin Insert/Update Categories" on public.categories;
create policy "Admin full access categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Allow Admin Insert/Update Tags" on public.tags;
create policy "Admin full access tags" on public.tags
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Public can read tags" on public.tags;
create policy "Public can read tags" on public.tags for select using (true);

-- pivôs de documentos (leitura pública necessária para joins com a anon key)
drop policy if exists "Allow Admin Document Authors" on public.document_authors;
create policy "Admin full access document_authors" on public.document_authors
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Public can read document_authors" on public.document_authors;
create policy "Public can read document_authors" on public.document_authors for select using (true);

drop policy if exists "Allow Admin Document Tags" on public.document_tags;
create policy "Admin full access document_tags" on public.document_tags
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Public can read document_tags" on public.document_tags;
create policy "Public can read document_tags" on public.document_tags for select using (true);

-- vídeos e playlists
drop policy if exists "Admin full access videos" on public.videos;
create policy "Admin full access videos" on public.videos
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin full access playlists" on public.playlists;
create policy "Admin full access playlists" on public.playlists
  for all using (public.is_admin()) with check (public.is_admin());

-- 3. RLS nas tabelas pivô de vídeo (estavam sem RLS = leitura e escrita para qualquer um)
alter table public.video_authors enable row level security;
alter table public.video_tags enable row level security;

drop policy if exists "Public can read video_authors" on public.video_authors;
create policy "Public can read video_authors" on public.video_authors for select using (true);
drop policy if exists "Admin full access video_authors" on public.video_authors;
create policy "Admin full access video_authors" on public.video_authors
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read video_tags" on public.video_tags;
create policy "Public can read video_tags" on public.video_tags for select using (true);
drop policy if exists "Admin full access video_tags" on public.video_tags;
create policy "Admin full access video_tags" on public.video_tags
  for all using (public.is_admin()) with check (public.is_admin());

-- 4. Storage ---------------------------------------------------------------
-- Upload público só em documents/uploads/ (portal Contribuir); limite de 50 MB no bucket
update storage.buckets set file_size_limit = 52428800 where id = 'documents';

drop policy if exists "Public Insert Documents" on storage.objects;
create policy "Public Insert Documents" on storage.objects
  for insert with check (bucket_id = 'documents' and (storage.foldername(name))[1] = 'uploads');

drop policy if exists "Admin Insert Covers" on storage.objects;
create policy "Admin Insert Covers" on storage.objects
  for insert with check (bucket_id = 'covers' and public.is_admin());

drop policy if exists "Admin Update Covers" on storage.objects;
create policy "Admin Update Covers" on storage.objects
  for update using (bucket_id = 'covers' and public.is_admin());

drop policy if exists "Admin Delete Objects" on storage.objects;
create policy "Admin Delete Objects" on storage.objects
  for delete using (bucket_id in ('documents', 'covers') and public.is_admin());

-- 5. Histórico de pedidos de remoção --------------------------------------
alter table public.removal_requests drop constraint if exists removal_requests_document_id_fkey;
alter table public.removal_requests
  add constraint removal_requests_document_id_fkey
  foreign key (document_id) references public.documents(id) on delete set null;

alter table public.removal_requests drop constraint if exists removal_requests_video_id_fkey;
alter table public.removal_requests
  add constraint removal_requests_video_id_fkey
  foreign key (video_id) references public.videos(id) on delete set null;

-- 6. Detecção de duplicatas no portal Contribuir ---------------------------
-- A anon key só enxerga documentos publicados; esta função responde só sim/não,
-- sem expor os documentos pendentes.
create or replace function public.document_hash_exists(p_hash text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.documents where file_hash = p_hash);
$$;

revoke all on function public.document_hash_exists(text) from public;
grant execute on function public.document_hash_exists(text) to anon, authenticated, service_role;

-- 7. search_path fixo nas funções existentes -------------------------------
create or replace function public.increment_views(doc_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.documents
     set views_count = coalesce(views_count, 0) + 1
   where id = doc_id and status = 'published';
end;
$$;

-- Só o servidor (service role) incrementa visualizações
revoke all on function public.increment_views(uuid) from public, anon, authenticated;
grant execute on function public.increment_views(uuid) to service_role;

alter function public.has_markdown(public.documents) set search_path = '';
alter function public.update_document_search_metadata() set search_path = public;
