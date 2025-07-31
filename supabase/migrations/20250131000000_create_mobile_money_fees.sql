-- Création de la table pour les frais Mobile Money
CREATE TABLE mobile_money_fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE, -- 'mtn', 'orange', 'moov'
  provider_name TEXT NOT NULL, -- Nom d'affichage
  fee_amount DECIMAL(10,2) NOT NULL, -- Montant des frais en FCFA
  min_amount DECIMAL(10,2) DEFAULT 0, -- Montant minimum de transaction
  max_amount DECIMAL(10,2) DEFAULT 1000000, -- Montant maximum de transaction
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des frais par défaut selon les spécifications
INSERT INTO mobile_money_fees (provider, provider_name, fee_amount, min_amount, max_amount) VALUES
('mtn', 'MTN Mobile Money', 175.00, 1.00, 1000000.00),
('orange', 'Orange Money', 125.00, 1.00, 1000000.00),
('moov', 'Moov Money', 100.00, 1.00, 1000000.00);

-- Index pour optimiser les requêtes
CREATE INDEX idx_mobile_money_fees_provider ON mobile_money_fees(provider);
CREATE INDEX idx_mobile_money_fees_active ON mobile_money_fees(is_active);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_mobile_money_fees_updated_at
    BEFORE UPDATE ON mobile_money_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS (Row Level Security) - lecture publique, modification admin seulement
ALTER TABLE mobile_money_fees ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow read access for authenticated users" ON mobile_money_fees
    FOR SELECT TO authenticated USING (true);

-- Politique pour permettre la modification seulement aux admins (à adapter selon votre système)
CREATE POLICY "Allow admin modifications" ON mobile_money_fees
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
