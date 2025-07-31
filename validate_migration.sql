-- Script de validation complète de la migration
-- Ce script vérifie que toutes les migrations ont été appliquées correctement

-- ============================================================================
-- 1. VÉRIFICATION DES TABLES CRÉÉES
-- ============================================================================

\echo '🔍 VÉRIFICATION DES TABLES:'
SELECT 
  table_name,
  'Créée ✅' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'providers', 'products', 'orders', 'mobile_money_fees')
ORDER BY table_name;

-- ============================================================================
-- 2. VÉRIFICATION DES FRAIS MOBILE MONEY
-- ============================================================================

\echo ''
\echo '💰 FRAIS MOBILE MONEY:'
SELECT 
  provider,
  provider_name,
  fee_amount || ' FCFA' as frais,
  CASE 
    WHEN is_active THEN 'Actif ✅'
    ELSE 'Inactif ❌'
  END as statut
FROM mobile_money_fees 
ORDER BY provider;

-- ============================================================================
-- 3. TEST DES FONCTIONS DE CONVERSION
-- ============================================================================

\echo ''
\echo '🔄 FONCTIONS DE CONVERSION:'
SELECT 
  'points_to_fcfa(100)' as fonction,
  points_to_fcfa(100) || ' FCFA' as resultat,
  CASE 
    WHEN points_to_fcfa(100) = 7835.9 THEN 'Correct ✅'
    ELSE 'Erreur ❌'
  END as validation;

SELECT 
  'fcfa_to_points(1000)' as fonction,
  fcfa_to_points(1000) || ' points' as resultat,
  CASE 
    WHEN fcfa_to_points(1000) BETWEEN 12.7 AND 12.8 THEN 'Correct ✅'
    ELSE 'Erreur ❌'
  END as validation;

-- ============================================================================
-- 4. VÉRIFICATION DES MIGRATIONS APPLIQUÉES
-- ============================================================================

\echo ''
\echo '📝 MIGRATIONS APPLIQUÉES:'
SELECT 
  version,
  name,
  'Appliquée ✅' as status
FROM supabase_migrations.schema_migrations 
ORDER BY version;

-- ============================================================================
-- 5. TEST D'INTÉGRATION COMPLET
-- ============================================================================

\echo ''
\echo '🧪 TEST D\'INTÉGRATION:'
WITH transaction_test AS (
  SELECT 
    'MTN' as provider_test,
    5000 as montant_fcfa,
    fcfa_to_points(5000) as points_equivalents
),
fees_test AS (
  SELECT 
    fee_amount as frais_mtn
  FROM mobile_money_fees 
  WHERE provider = 'mtn' AND is_active = true
)
SELECT 
  t.provider_test as provider,
  t.montant_fcfa as montant,
  f.frais_mtn as frais,
  (t.montant_fcfa + f.frais_mtn) as total_avec_frais,
  t.points_equivalents as points_equivalents,
  CASE 
    WHEN f.frais_mtn = 175 THEN 'Frais MTN corrects ✅'
    ELSE 'Erreur frais MTN ❌'
  END as validation_frais
FROM transaction_test t, fees_test f;

-- ============================================================================
-- 6. RÉSUMÉ FINAL
-- ============================================================================

\echo ''
\echo '📊 RÉSUMÉ FINAL:'
SELECT 
  '🎉 SYSTÈME MOBILE MONEY' as composant,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM mobile_money_fees WHERE is_active = true
    ) = 3 THEN 'OPÉRATIONNEL ✅'
    ELSE 'PROBLÈME ❌'
  END as statut;
