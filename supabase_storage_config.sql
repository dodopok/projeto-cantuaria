-- [ANTERIOR] Tabela de Autores, Categorias, etc... (Mantido)

-- CONFIGURAÇÃO DE STORAGE (Executar no painel SQL do Supabase)

-- 1. Criar Buckets
-- Nota: Buckets geralmente são criados via dashboard ou API, 
-- mas aqui definimos as permissões.

-- Inserir buckets se não existirem
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Segurança para Storage

-- Permitir leitura pública para todos os arquivos (já que a biblioteca é pública)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('documents', 'covers') );

-- Permitir Upload/Update/Delete apenas para usuários autenticados (Admins)
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('documents', 'covers') AND auth.role() = 'authenticated'
);

CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (
  bucket_id IN ('documents', 'covers') AND auth.role() = 'authenticated'
);

CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (
  bucket_id IN ('documents', 'covers') AND auth.role() = 'authenticated'
);

-- ADICIONAL: Tabela de Configurações Globais (opcional)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read settings" ON site_settings FOR SELECT USING (true);
