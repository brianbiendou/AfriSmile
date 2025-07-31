-- Migration d'urgence pour insérer les frais Mobile Money
-- Cette migration sera appliquée manuellement

BEGIN;

-- Supprimer les données existantes au cas où
DELETE FROM mobile_money_fees;

-- Insérer les frais Mobile Money
INSERT INTO mobile_money_fees (provider, provider_name, fee_amount, min_amount, max_amount, is_active) VALUES
('mtn', 'MTN Mobile Money', 175.00, 1.00, 1000000.00, true),
('orange', 'Orange Money', 125.00, 1.00, 1000000.00, true),
('moov', 'Moov Money', 100.00, 1.00, 1000000.00, true);

-- Vérifier que les données ont été insérées
SELECT 
  'Insertion réussie!' as status,
  provider_name,
  fee_amount || ' FCFA' as frais
FROM mobile_money_fees 
ORDER BY provider;

COMMIT;
