-- Tabela para solicitações de remoção (Take-down notices)
CREATE TABLE IF NOT EXISTS removal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE removal_requests ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode inserir (para o público solicitar)
CREATE POLICY "Anyone can insert removal requests" ON removal_requests
  FOR INSERT WITH CHECK (true);

-- Política: Apenas admin pode ver e gerenciar
CREATE POLICY "Admins can view and manage removal requests" ON removal_requests
  FOR ALL TO service_role USING (true);
