/*
  # Refonte complète du système de points - 1 FCFA = 85.59 points

  Nouveau système :
  - 1 FCFA = 85.59 points
  - 1 point = 0.01168 FCFA (1/85.59)
  
  1. Mise à jour des fonctions de conversion
    - points_to_fcfa : 1 point = 0.01168 FCFA
    - fcfa_to_points : 1 FCFA = 85.59 points
    - calculate_cashback : Nouveau calcul proportionnel
    
  2. Recalcul de tous les points existants
    - Conversion des soldes utilisateurs
    - Ajustement des prix produits
    - Mise à jour des transactions
    
  3. Nouveau système de prix cohérent
    - Prix réalistes en points
    - Système plus intuitif
*/

-- 1. MISE À JOUR DES FONCTIONS DE CONVERSION

-- Fonction de conversion points vers FCFA (nouveau taux : 0.01168)
CREATE OR REPLACE FUNCTION points_to_fcfa(points_amount INTEGER)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN ROUND(points_amount * 0.01168, 2);
END;
$$;

-- Fonction de conversion FCFA vers points (nouveau taux : 85.59)
CREATE OR REPLACE FUNCTION fcfa_to_points(fcfa_amount DECIMAL)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN ROUND(fcfa_amount * 85.59);
END;
$$;

-- Fonction pour obtenir le taux de conversion actuel
CREATE OR REPLACE FUNCTION get_conversion_rate()
RETURNS DECIMAL(10,5)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 0.01168; -- 1 point = 0.01168 FCFA
END;
$$;

-- Fonction pour obtenir le taux FCFA vers points
CREATE OR REPLACE FUNCTION get_fcfa_to_points_rate()
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 85.59; -- 1 FCFA = 85.59 points
END;
$$;

-- Fonction pour calculer le cashback (proportionnel au montant de la commande)
CREATE OR REPLACE FUNCTION calculate_cashback(order_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  fcfa_amount DECIMAL;
  cashback_fcfa DECIMAL;
BEGIN
  -- Convertir le montant de commande en FCFA
  fcfa_amount := points_to_fcfa(order_amount);
  
  -- Cashback de 1% du montant en FCFA, minimum 1 FCFA
  cashback_fcfa := GREATEST(fcfa_amount * 0.01, 1.0);
  
  -- Convertir le cashback en points
  RETURN fcfa_to_points(cashback_fcfa);
END;
$$;

-- 2. MISE À JOUR DES PRIX ET CONVERSION DES DONNÉES EXISTANTES

-- Nouveau système de prix réalistes basé sur les valeurs FCFA réelles
-- Thiéboudiènne: 5000 FCFA = 427,950 points ≈ 428,000 points
-- Jus: 500 FCFA = 42,795 points ≈ 43,000 points
-- Desserts: 1500 FCFA = 128,385 points ≈ 128,000 points

-- Mise à jour des prix des produits existants avec le nouveau système
UPDATE products SET 
  points_price = CASE 
    WHEN LOWER(name) LIKE '%thiéboudiènne%' OR LOWER(name) LIKE '%attieke%' THEN 428000 -- 5000 FCFA
    WHEN LOWER(name) LIKE '%poisson%' AND LOWER(name) LIKE '%braise%' THEN 513600 -- 6000 FCFA
    WHEN LOWER(name) LIKE '%jus%' OR LOWER(name) LIKE '%bissap%' OR LOWER(name) LIKE '%boisson%' THEN 42800 -- 500 FCFA
    WHEN LOWER(name) LIKE '%salade%' OR LOWER(name) LIKE '%dessert%' THEN 128400 -- 1500 FCFA
    WHEN LOWER(name) LIKE '%foutou%' THEN 342400 -- 4000 FCFA
    WHEN LOWER(name) LIKE '%pizza%' THEN 428000 -- 5000 FCFA
    WHEN LOWER(name) LIKE '%burger%' THEN 342400 -- 4000 FCFA
    WHEN LOWER(name) LIKE '%manucure%' OR LOWER(name) LIKE '%coiffure%' THEN 856000 -- 10000 FCFA
    WHEN LOWER(name) LIKE '%massage%' THEN 1284000 -- 15000 FCFA
    WHEN LOWER(name) LIKE '%café%' OR LOWER(name) LIKE '%expresso%' THEN 21400 -- 250 FCFA
    WHEN LOWER(name) LIKE '%croissant%' OR LOWER(name) LIKE '%pain%' THEN 17100 -- 200 FCFA
    ELSE fcfa_to_points(5.0) -- Défaut: 5 FCFA = 428 points
  END;

-- Mise à jour des prix invendus (20% du prix normal)
UPDATE products SET 
  unsold_price = CASE 
    WHEN unsold_price IS NOT NULL THEN ROUND(points_price * 0.2)
    ELSE NULL
  END;

-- 3. CONVERSION DES SOLDES UTILISATEURS

-- Méthode de conversion progressive des points utilisateurs existants
-- On suppose que les points actuels étaient basés sur l'ancien système (1 point = 62 FCFA)
-- Donc on les convertit d'abord en FCFA puis en nouveaux points

UPDATE users SET 
  points = CASE 
    -- Comptes de test avec des montants cohérents
    WHEN email = 'client@test.ci' THEN fcfa_to_points(50.0) -- 50 FCFA = 4,279 points
    WHEN email = 'admin@test.ci' THEN fcfa_to_points(200.0) -- 200 FCFA = 17,118 points
    WHEN email = 'jean@test.ci' THEN fcfa_to_points(30.0) -- 30 FCFA = 2,567 points
    WHEN email = 'aya@test.ci' THEN fcfa_to_points(75.0) -- 75 FCFA = 6,419 points
    WHEN email = 'kone@test.ci' THEN fcfa_to_points(25.0) -- 25 FCFA = 2,139 points
    -- Pour les autres utilisateurs, convertir depuis l'ancien système
    ELSE fcfa_to_points(points * 62.0 / 85.59) -- Conversion proportionnelle
  END,
  balance = CASE 
    WHEN email = 'client@test.ci' THEN 50.0
    WHEN email = 'admin@test.ci' THEN 200.0
    WHEN email = 'jean@test.ci' THEN 30.0
    WHEN email = 'aya@test.ci' THEN 75.0
    WHEN email = 'kone@test.ci' THEN 25.0
    ELSE points_to_fcfa(fcfa_to_points(points * 62.0 / 85.59))
  END,
  updated_at = NOW()
WHERE email IN ('client@test.ci', 'admin@test.ci', 'jean@test.ci', 'aya@test.ci', 'kone@test.ci')
   OR points > 0;

-- 4. MISE À JOUR DES TRANSACTIONS ET COMMANDES

-- Convertir les montants des transactions existantes
UPDATE transactions SET
  points_amount = fcfa_to_points(points_amount * 62.0 / 85.59),
  updated_at = NOW()
WHERE points_amount > 0;

-- Convertir les montants des commandes existantes
UPDATE orders SET
  total_amount = fcfa_to_points(total_amount * 62.0 / 85.59),
  discount_amount = fcfa_to_points(discount_amount * 62.0 / 85.59),
  final_amount = fcfa_to_points(final_amount * 62.0 / 85.59),
  points_used = fcfa_to_points(points_used * 62.0 / 85.59),
  updated_at = NOW()
WHERE total_amount > 0 OR points_used > 0;

-- 5. RECALCUL DES SOLDES POUR TOUS LES UTILISATEURS

-- Recalculer les soldes de tous les utilisateurs avec le nouveau taux
UPDATE users SET 
  balance = points_to_fcfa(points),
  updated_at = NOW();

-- 6. MISE À JOUR DE LA VUE DES SOLDES

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

-- 7. TRIGGER POUR CASHBACK AUTOMATIQUE AVEC NOUVEAU CALCUL

-- Mise à jour du trigger pour utiliser le nouveau calcul de cashback
CREATE OR REPLACE FUNCTION trigger_cashback_on_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  cashback_points INTEGER;
BEGIN
  -- Si le statut passe à 'delivered'
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    cashback_points := calculate_cashback(NEW.final_amount);
    
    -- Ajouter le cashback
    PERFORM update_user_points(NEW.user_id, cashback_points);
    
    -- Enregistrer la transaction de cashback
    INSERT INTO transactions (user_id, order_id, type, amount, points_amount, description)
    VALUES (
      NEW.user_id,
      NEW.id,
      'cashback',
      points_to_fcfa(cashback_points),
      cashback_points,
      'Cashback commande livrée (1%)'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Réappliquer le trigger
DROP TRIGGER IF EXISTS cashback_on_delivery ON orders;
CREATE TRIGGER cashback_on_delivery
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cashback_on_delivery();

-- 8. COMMENTAIRES DE DOCUMENTATION

COMMENT ON FUNCTION points_to_fcfa IS 'Convertit les points en FCFA (1 point = 0.01168 FCFA)';
COMMENT ON FUNCTION fcfa_to_points IS 'Convertit les FCFA en points (1 FCFA = 85.59 points)';
COMMENT ON FUNCTION get_conversion_rate IS 'Retourne le taux de conversion actuel (0.01168 FCFA par point)';
COMMENT ON FUNCTION get_fcfa_to_points_rate IS 'Retourne le taux FCFA vers points (85.59 points par FCFA)';
COMMENT ON FUNCTION calculate_cashback IS 'Calcule le cashback (1% du montant de la commande)';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration terminée : Système de points refondé (1 FCFA = 85.59 points)';
  RAISE NOTICE 'Nouveau taux : 1 point = 0.01168 FCFA';
  RAISE NOTICE 'Cashback : 1%% du montant de la commande';
  RAISE NOTICE 'Prix réalistes : Thiéboudiènne = 428,000 points (5000 FCFA)';
END
$$;
