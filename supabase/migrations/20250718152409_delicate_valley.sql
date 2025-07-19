/*
  # Ajustement des points utilisateur et prix des produits

  1. Mise à jour des points
    - Marie Kouassi : 55 points
    - Autres utilisateurs : ajustés proportionnellement
  
  2. Prix des produits
    - Division par 1000 pour plus de cohérence
    - Thiéboudiènne : 7 points au lieu de 7000
    - Jus de gingembre : 2 points au lieu de 2000
    
  3. Cohérence générale
    - Prix plus réalistes en points
    - Système plus simple à comprendre
*/

-- Mise à jour des points des utilisateurs
UPDATE users SET points = 55 WHERE email = 'client@test.ci';
UPDATE users SET points = 80 WHERE email = 'admin@test.ci';
UPDATE users SET points = 14 WHERE email = 'jean@test.ci';
UPDATE users SET points = 20 WHERE email = 'aya@test.ci';
UPDATE users SET points = 11 WHERE email = 'kone@test.ci';

-- Division des prix des produits par 1000 pour plus de cohérence
UPDATE products SET points_price = ROUND(points_price / 1000.0) WHERE points_price >= 1000;

-- S'assurer qu'aucun produit n'a un prix de 0
UPDATE products SET points_price = 1 WHERE points_price = 0;

-- Mise à jour des prix invendus (80% de réduction)
UPDATE products 
SET unsold_price = ROUND(points_price * 0.2) 
WHERE is_unsold = true AND unsold_price IS NOT NULL;

-- S'assurer qu'aucun prix invendu n'est de 0
UPDATE products SET unsold_price = 1 WHERE is_unsold = true AND unsold_price = 0;

-- Mise à jour des commandes existantes pour cohérence
UPDATE orders SET 
  total_amount = ROUND(total_amount / 1000.0),
  discount_amount = ROUND(discount_amount / 1000.0),
  final_amount = ROUND(final_amount / 1000.0),
  points_used = ROUND(points_used / 1000.0)
WHERE total_amount >= 1000;

-- Mise à jour des articles de commande
UPDATE order_items SET 
  unit_price = ROUND(unit_price / 1000.0),
  total_price = ROUND(total_price / 1000.0)
WHERE unit_price >= 1000;

-- Mise à jour des transactions de points Kolofap (garder les montants actuels car déjà cohérents)
-- Pas de changement nécessaire pour points_transactions

-- Mise à jour des transactions de rechargement
UPDATE transactions SET 
  points_amount = ROUND(points_amount / 1000.0)
WHERE points_amount >= 1000;