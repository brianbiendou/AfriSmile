/*
  # Mise à jour du système de points - Multiplication par 10

  Changement : 1 point = 62 FCFA (au lieu de 620 FCFA)
  
  1. Mise à jour des fonctions de conversion
    - points_to_fcfa : 1 point = 62 FCFA
    - fcfa_to_points : 62 FCFA = 1 point
    - calculate_cashback : 100 points par commande
    
  2. Multiplication des points existants par 10
    - Points utilisateurs × 10
    - Prix des produits × 10
    - Montants des transactions × 10
    
  3. Mise à jour des fonctions utilitaires
    - Nouveau taux de conversion : 62
    - Recalcul des soldes
*/

-- 1. MISE À JOUR DES FONCTIONS DE CONVERSION

-- Fonction de conversion points vers FCFA (nouveau taux : 62)
CREATE OR REPLACE FUNCTION points_to_fcfa(points_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN points_amount * 62;
END;
$$;

-- Fonction de conversion FCFA vers points (nouveau taux : 62)
CREATE OR REPLACE FUNCTION fcfa_to_points(fcfa_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN ROUND(fcfa_amount::DECIMAL / 62);
END;
$$;

-- Fonction pour obtenir le taux de conversion actuel
CREATE OR REPLACE FUNCTION get_conversion_rate()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 62; -- 1 point = 62 FCFA
END;
$$;

-- Fonction pour calculer le cashback (100 points par commande)
CREATE OR REPLACE FUNCTION calculate_cashback(order_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Cashback fixe de 100 points par commande
  RETURN 100;
END;
$$;

-- 2. MULTIPLICATION DES POINTS EXISTANTS PAR 10

-- Multiplier les points des utilisateurs par 10
UPDATE users SET 
  points = points * 10,
  balance = points_to_fcfa(points * 10),
  updated_at = NOW()
WHERE points > 0;

-- Multiplier les prix des produits par 10
UPDATE products SET 
  price = price * 10,
  updated_at = NOW()
WHERE price > 0;

-- Multiplier les prix des customizations par 10
UPDATE customizations SET 
  price = price * 10,
  updated_at = NOW()
WHERE price > 0;

-- Multiplier les montants des commandes par 10
UPDATE orders SET
  total_amount = total_amount * 10,
  discount_amount = discount_amount * 10,
  final_amount = final_amount * 10,
  points_used = points_used * 10,
  delivery_fee = delivery_fee * 10,
  updated_at = NOW()
WHERE total_amount > 0;

-- Multiplier les montants des transactions par 10
UPDATE transactions SET
  points_amount = points_amount * 10,
  updated_at = NOW()
WHERE points_amount > 0;

-- Multiplier les montants dans l'historique des points par 10
UPDATE user_points SET
  points_change = points_change * 10,
  balance_after = balance_after * 10,
  updated_at = NOW()
WHERE points_change != 0;

-- Multiplier les montants des transactions Kolofap par 10
UPDATE kolofap_transactions SET
  amount = amount * 10,
  updated_at = NOW()
WHERE amount > 0;

-- 3. MISE À JOUR DES VALEURS SPÉCIFIQUES

-- Mise à jour des comptes de test avec les nouvelles valeurs
UPDATE users SET 
  points = CASE 
    WHEN email = 'client@test.ci' THEN 550 -- 550 points = 34,100 FCFA
    WHEN email = 'admin@test.ci' THEN 810 -- 810 points = 50,220 FCFA
    WHEN email = 'jean@test.ci' THEN 140 -- 140 points = 8,680 FCFA
    WHEN email = 'aya@test.ci' THEN 200 -- 200 points = 12,400 FCFA
    WHEN email = 'kone@test.ci' THEN 110 -- 110 points = 6,820 FCFA
    ELSE points
  END,
  balance = CASE 
    WHEN email = 'client@test.ci' THEN 34100
    WHEN email = 'admin@test.ci' THEN 50220
    WHEN email = 'jean@test.ci' THEN 8680
    WHEN email = 'aya@test.ci' THEN 12400
    WHEN email = 'kone@test.ci' THEN 6820
    ELSE points_to_fcfa(points)
  END,
  updated_at = NOW()
WHERE email IN ('client@test.ci', 'admin@test.ci', 'jean@test.ci', 'aya@test.ci', 'kone@test.ci');

-- 4. RECALCUL DES SOLDES POUR TOUS LES UTILISATEURS

-- Recalculer les soldes de tous les utilisateurs avec le nouveau taux
UPDATE users SET 
  balance = points_to_fcfa(points),
  updated_at = NOW();

-- 5. MISE À JOUR DE LA VUE DES SOLDES

-- Vue pour afficher les conversions avec le nouveau taux
CREATE OR REPLACE VIEW user_balances_view AS
SELECT 
  id,
  email,
  first_name,
  last_name,
  points,
  balance,
  points_to_fcfa(points) as calculated_balance,
  CASE 
    WHEN (SELECT COUNT(*) FROM orders WHERE user_id = users.id AND status = 'delivered') > 0 
    THEN points::DECIMAL / (SELECT COUNT(*) FROM orders WHERE user_id = users.id AND status = 'delivered')
    ELSE 0 
  END as avg_points_per_order
FROM users
WHERE is_active = true;

-- 6. COMMENTAIRES DE DOCUMENTATION

COMMENT ON FUNCTION points_to_fcfa IS 'Convertit les points en FCFA (1 point = 62 FCFA)';
COMMENT ON FUNCTION fcfa_to_points IS 'Convertit les FCFA en points (62 FCFA = 1 point)';
COMMENT ON FUNCTION get_conversion_rate IS 'Retourne le taux de conversion actuel (62 FCFA par point)';
COMMENT ON FUNCTION calculate_cashback IS 'Calcule le cashback (100 points fixes par commande)';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration terminée : Système de points mis à jour (1 point = 62 FCFA)';
  RAISE NOTICE 'Tous les points existants ont été multipliés par 10';
  RAISE NOTICE 'Cashback mis à jour : 100 points par commande';
END
$$;
