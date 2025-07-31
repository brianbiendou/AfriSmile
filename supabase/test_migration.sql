-- Script de test pour valider la migration finale
-- À exécuter après la migration pour vérifier la cohérence

-- 1. Vérifier les fonctions de conversion
SELECT 'Test conversion points vers FCFA' as test, points_to_fcfa(100) as result, '7835.9 FCFA attendu' as expected;
SELECT 'Test conversion FCFA vers points' as test, fcfa_to_points(783.59) as result, '10 points attendus' as expected;
SELECT 'Test taux de conversion' as test, get_conversion_rate() as result, '78.359 attendu' as expected;

-- 2. Vérifier les utilisateurs de test
SELECT 
  email,
  points,
  balance,
  points_to_fcfa(points) as calculated_balance,
  CASE 
    WHEN ABS(balance - points_to_fcfa(points)) < 0.01 THEN 'OK'
    ELSE 'ERREUR'
  END as balance_check
FROM users 
WHERE email LIKE '%@test.ci'
ORDER BY email;

-- 3. Vérifier les profils Kolofap
SELECT 
  kp.username,
  u.email,
  kp.display_name
FROM kolofap_profiles kp
JOIN users u ON kp.user_id = u.id
WHERE u.email LIKE '%@test.ci'
ORDER BY u.email;

-- 4. Vérifier les prestataires
SELECT 
  p.business_name,
  u.email,
  p.discount_percentage,
  p.is_active
FROM providers p
JOIN users u ON p.user_id = u.id
WHERE u.email LIKE '%@test.ci';

-- 5. Vérifier les produits avec prix cohérents
SELECT 
  pr.name,
  pr.price as price_points,
  points_to_fcfa(pr.price) as price_fcfa,
  p.business_name
FROM products pr
JOIN providers p ON pr.provider_id = p.id
ORDER BY pr.price;

-- 6. Vérifier les frais Mobile Money
SELECT 
  provider,
  provider_name,
  fee_amount,
  is_active
FROM mobile_money_fees
ORDER BY fee_amount;

-- 7. Calculer quelques exemples de cashback
SELECT 
  'Commande 10 points' as scenario,
  calculate_cashback(10) as cashback_points,
  points_to_fcfa(calculate_cashback(10)) as cashback_fcfa;

SELECT 
  'Commande 100 points' as scenario,
  calculate_cashback(100) as cashback_points,
  points_to_fcfa(calculate_cashback(100)) as cashback_fcfa;

-- 8. Résumé des conversions importantes
SELECT 
  '1 point = ' || get_conversion_rate() || ' FCFA' as taux_principal,
  '550 points = ' || points_to_fcfa(550) || ' FCFA' as exemple_marie,
  '175 FCFA frais MTN = ' || fcfa_to_points(175) || ' points' as frais_mtn_points;
