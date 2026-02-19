-- Site versions for rollback
CREATE TABLE IF NOT EXISTS site_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage site versions" ON site_versions
  FOR ALL USING (auth.role() = authenticated);
