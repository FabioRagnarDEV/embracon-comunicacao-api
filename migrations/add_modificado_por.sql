-- Adicionar coluna modificado_por na tabela comunicados_oficiais
-- Execute este script no SQL Editor do Supabase

ALTER TABLE comunicados_oficiais
ADD COLUMN IF NOT EXISTS modificado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL;

-- Índice para performance nas queries com JOIN
CREATE INDEX IF NOT EXISTS idx_comunicados_modificado_por ON comunicados_oficiais(modificado_por);
