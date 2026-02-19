-- 1. Permissões para AUTORES
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Admin Insert/Update Authors" ON authors;
CREATE POLICY "Allow Admin Insert/Update Authors" ON authors 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Permissões para CATEGORIAS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Admin Insert/Update Categories" ON categories;
CREATE POLICY "Allow Admin Insert/Update Categories" ON categories 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Permissões para TAGS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Admin Insert/Update Tags" ON tags;
CREATE POLICY "Allow Admin Insert/Update Tags" ON tags 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Permissões para Tabelas Pivot (Relacionamentos)
ALTER TABLE document_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Admin Document Authors" ON document_authors 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Admin Document Tags" ON document_tags 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
