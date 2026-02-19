-- 1. Garantir que os buckets existem e são públicos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Limpar políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Covers" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Covers" ON storage.objects;
DROP POLICY IF EXISTS "Public Select Covers" ON storage.objects;

-- 3. Políticas para o Bucket 'documents' (Leitura e Upload Públicos)
-- Permite que qualquer um veja os PDFs
CREATE POLICY "Public Select Documents" ON storage.objects 
FOR SELECT USING (bucket_id = 'documents');

-- Permite que qualquer um envie novos documentos (Portal de Contribuição)
CREATE POLICY "Public Insert Documents" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'documents');

-- 4. Políticas para o Bucket 'covers' (Leitura Pública, Escrita Restrita ao Admin)
-- Permite que o site exiba as capas para todos
CREATE POLICY "Public Select Covers" ON storage.objects 
FOR SELECT USING (bucket_id = 'covers');

-- Permite APENAS usuários logados (Admin) subir capas
CREATE POLICY "Admin Insert Covers" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'covers' AND auth.role() = 'authenticated'
);

-- Permite APENAS usuários logados (Admin) atualizar capas
CREATE POLICY "Admin Update Covers" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'covers' AND auth.role() = 'authenticated'
);

-- 5. Política de Deleção Global para o Admin
CREATE POLICY "Admin Delete Objects" ON storage.objects 
FOR DELETE USING (auth.role() = 'authenticated');
