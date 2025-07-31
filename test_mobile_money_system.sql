-- Script de validation du système Mobile Money
-- Vérifier que la table mobile_money_fees est créée et contient les données

-- 1. Vérifier l'existence de la table
SELECT 'Table mobile_money_fees existe' as status
FROM information_schema.tables 
WHERE table_name = 'mobile_money_fees';

-- 2. Vérifier les données
SELECT 
  provider,
  provider_name,
  fee_amount,
  is_active
FROM mobile_money_fees 
ORDER BY provider;

-- 3. Tester la fonction de conversion de points
SELECT 
  'Test conversion points' as test,
  points_to_fcfa(100) as "100_points_en_fcfa",
  fcfa_to_points(1000) as "1000_fcfa_en_points";

-- 4. Simuler le calcul des frais + conversion
WITH test_transaction AS (
  SELECT 
    'MTN' as provider,
    1000 as montant_fcfa,
    fcfa_to_points(1000) as points_equivalents
)
SELECT 
  t.provider,
  t.montant_fcfa,
  t.points_equivalents,
  mmf.fee_amount as frais_mobile_money,
  (t.montant_fcfa + mmf.fee_amount) as total_avec_frais
FROM test_transaction t
JOIN mobile_money_fees mmf ON LOWER(mmf.provider) = LOWER(t.provider)
WHERE mmf.is_active = true;
