-- [STORAGE CONFIG] - Atualizado para permitir contribuições públicas

-- 1. Permitir que QUALQUER UM envie arquivos para o bucket 'documents'
-- Isso é necessário para o portal de contribuição pública.
-- Filtramos pelo bucket_id para manter o bucket 'covers' privado apenas para o admin.

DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;

CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documents'
);

-- 2. Manter leitura pública (necessário para o leitor de PDF funcionar)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (
  bucket_id IN ('documents', 'covers')
);

-- 3. Edição e Deletar continuam restritos ao Admin logado
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (
  auth.role() = 'authenticated'
);

-- [TABELA DOCUMENTS] - Também precisamos de política para o INSERT público no banco
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert suggestions" ON documents;
CREATE POLICY "Public can insert suggestions" ON documents
  FOR INSERT WITH CHECK (status = 'pending');
