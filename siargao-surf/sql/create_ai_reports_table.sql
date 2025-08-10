-- Table pour stocker les rapports AI avec cache intelligent
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_name TEXT NOT NULL,
  spot_id UUID REFERENCES spots(id),
  locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'fr')),
  
  -- Données du rapport AI
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  verdict TEXT CHECK (verdict IN ('GO', 'CONDITIONAL', 'NO-GO')),
  
  -- Métadonnées pour le cache
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Conditions qui ont généré ce rapport (pour détecter les changements)
  conditions_hash TEXT,
  
  -- Index pour performance
  UNIQUE(spot_name, locale)
);

-- Index pour optimiser les requêtes par spot et date
CREATE INDEX IF NOT EXISTS idx_ai_reports_spot_updated 
ON ai_reports(spot_name, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_reports_expires 
ON ai_reports(expires_at);

-- Fonction pour nettoyer les anciens rapports expirés
CREATE OR REPLACE FUNCTION cleanup_expired_ai_reports()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM ai_reports 
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Trigger pour auto-update du timestamp
CREATE OR REPLACE FUNCTION update_ai_reports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_ai_reports_updated_at
  BEFORE UPDATE ON ai_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_reports_updated_at();