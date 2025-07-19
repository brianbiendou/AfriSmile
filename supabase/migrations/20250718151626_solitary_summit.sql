/*
  # Mise à jour du système de points - 1 point = 620 FCFA

  1. Nouvelles fonctions
    - Fonction de conversion points ↔ FCFA
    - Mise à jour des fonctions existantes
    
  2. Mise à jour des données
    - Recalcul de tous les points existants
    - Mise à jour des prix des produits
    - Ajustement des transactions
    
  3. Nouvelles constantes
    - Taux de conversion : 1 point = 620 FCFA
    - Mise à jour des calculs de cashback
*/

-- Fonction de conversion points vers FCFA
CREATE OR REPLACE FUNCTION points_to_fcfa(points_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN points_amount * 620;
END;
$$;

-- Fonction de conversion FCFA vers points
CREATE OR REPLACE FUNCTION fcfa_to_points(fcfa_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN ROUND(fcfa_amount::DECIMAL / 620);
END;
$$;

-- Mise à jour de la fonction update_user_points avec nouveau système
CREATE OR REPLACE FUNCTION update_user_points(user_id_param UUID, points_change INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  current_points INTEGER;
  new_balance INTEGER;
BEGIN
  -- Récupérer les points actuels
  SELECT points INTO current_points
  FROM users
  WHERE id = user_id_param;
  
  -- Calculer le nouveau solde en FCFA
  new_balance := points_to_fcfa(current_points + points_change);
  
  -- Mettre à jour les points et le solde
  UPDATE users
  SET 
    points = current_points + points_change,
    balance = new_balance,
    updated_at = NOW()
  WHERE id = user_id_param;
  
  -- Enregistrer la transaction dans l'historique
  INSERT INTO user_points (user_id, points_change, balance_after, description)
  VALUES (
    user_id_param,
    points_change,
    current_points + points_change,
    CASE 
      WHEN points_change > 0 THEN 'Ajout de points'
      ELSE 'Utilisation de points'
    END
  );
END;
$$;

-- Fonction pour calculer le cashback (10 points par commande)
CREATE OR REPLACE FUNCTION calculate_cashback(order_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Cashback fixe de 10 points par commande
  RETURN 10;
END;
$$;

-- Trigger pour cashback automatique à la livraison
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
      0,
      cashback_points,
      'Cashback commande livrée'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS cashback_on_delivery ON orders;
CREATE TRIGGER cashback_on_delivery
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cashback_on_delivery();

-- Mise à jour des prix des produits existants (conversion FCFA → points)
UPDATE products SET 
  points_price = fcfa_to_points(price),
  unsold_price = CASE 
    WHEN unsold_price IS NOT NULL THEN fcfa_to_points(unsold_price * 620 / 5) -- Prix invendu = 20% du prix normal
    ELSE NULL
  END;

-- Recalculer les soldes de tous les utilisateurs
UPDATE users SET 
  balance = points_to_fcfa(points);

-- Mise à jour des montants des commandes existantes (recalcul en points)
UPDATE orders SET
  total_amount = fcfa_to_points(total_amount * 620), -- Convertir en points
  discount_amount = fcfa_to_points(discount_amount * 620),
  final_amount = fcfa_to_points(final_amount * 620),
  points_used = fcfa_to_points(points_used * 620);

-- Mise à jour des transactions existantes
UPDATE transactions SET
  points_amount = fcfa_to_points(amount);

-- Mise à jour des transactions Kolofap (déjà en points, pas de changement nécessaire)
-- Les montants Kolofap restent en points

-- Fonction pour obtenir le taux de conversion actuel
CREATE OR REPLACE FUNCTION get_conversion_rate()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 620; -- 1 point = 620 FCFA
END;
$$;

-- Vue pour afficher les conversions facilement
CREATE OR REPLACE VIEW user_balances_view AS
SELECT 
  id,
  email,
  first_name,
  last_name,
  points,
  balance,
  points_to_fcfa(points) as calculated_balance,
  points::DECIMAL / (SELECT COUNT(*) FROM orders WHERE user_id = users.id AND status = 'delivered') as avg_points_per_order
FROM users
WHERE is_active = true;

-- Fonction pour les rechargements (FCFA → points)
CREATE OR REPLACE FUNCTION process_recharge(user_id_param UUID, fcfa_amount INTEGER, payment_method TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  points_to_add INTEGER;
BEGIN
  -- Convertir FCFA en points
  points_to_add := fcfa_to_points(fcfa_amount);
  
  -- Ajouter les points
  PERFORM update_user_points(user_id_param, points_to_add);
  
  -- Enregistrer la transaction de rechargement
  INSERT INTO transactions (user_id, type, amount, points_amount, payment_method, description)
  VALUES (
    user_id_param,
    'recharge',
    fcfa_amount,
    points_to_add,
    payment_method::payment_method,
    'Rechargement ' || payment_method
  );
END;
$$;

-- Mise à jour des données de test avec les nouveaux taux
UPDATE users SET 
  points = CASE 
    WHEN email = 'client@test.ci' THEN 25 -- 25 points = 15,500 FCFA
    WHEN email = 'admin@test.ci' THEN 81 -- 81 points = 50,220 FCFA
    WHEN email = 'jean@test.ci' THEN 14 -- 14 points = 8,680 FCFA
    WHEN email = 'aya@test.ci' THEN 20 -- 20 points = 12,400 FCFA
    WHEN email = 'kone@test.ci' THEN 11 -- 11 points = 6,820 FCFA
    ELSE points
  END,
  balance = CASE 
    WHEN email = 'client@test.ci' THEN 15500
    WHEN email = 'admin@test.ci' THEN 50220
    WHEN email = 'jean@test.ci' THEN 8680
    WHEN email = 'aya@test.ci' THEN 12400
    WHEN email = 'kone@test.ci' THEN 6820
    ELSE points_to_fcfa(points)
  END;

-- Commentaire final
COMMENT ON FUNCTION points_to_fcfa IS 'Convertit les points en FCFA (1 point = 620 FCFA)';
COMMENT ON FUNCTION fcfa_to_points IS 'Convertit les FCFA en points (620 FCFA = 1 point)';
COMMENT ON FUNCTION get_conversion_rate IS 'Retourne le taux de conversion actuel (620 FCFA par point)';