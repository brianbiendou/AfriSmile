/*
  # Schéma complet pour l'application de réductions

  1. Tables principales
    - `users` - Utilisateurs/clients
    - `providers` - Prestataires
    - `categories` - Catégories de services
    - `products` - Produits/services des prestataires
    - `orders` - Commandes
    - `order_items` - Articles dans les commandes
    - `cart_items` - Articles dans le panier
    - `transactions` - Transactions financières
    - `reviews` - Avis clients
    - `discounts` - Réductions actives
    - `user_points` - Historique des points
    - `provider_stats` - Statistiques prestataires

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques appropriées pour chaque rôle
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum pour les types d'utilisateurs
CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');

-- Enum pour les statuts de commande
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');

-- Enum pour les types de transaction
CREATE TYPE transaction_type AS ENUM ('recharge', 'payment', 'refund', 'cashback');

-- Enum pour les méthodes de paiement
CREATE TYPE payment_method AS ENUM ('points', 'mtn_money', 'orange_money', 'moov_money', 'cash');

-- Table des utilisateurs (clients et admin)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role user_role DEFAULT 'client',
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  avatar_url text,
  points integer DEFAULT 0,
  balance integer DEFAULT 0,
  location text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des prestataires
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  business_name text NOT NULL,
  owner_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  description text,
  image_url text,
  rating numeric(2,1) DEFAULT 0.0,
  total_reviews integer DEFAULT 0,
  discount_percentage integer DEFAULT 0,
  estimated_time text DEFAULT '30-45 min',
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des produits/services
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id),
  name text NOT NULL,
  description text,
  price integer NOT NULL, -- Prix en FCFA
  points_price integer NOT NULL, -- Prix en points (prix * 2)
  image_url text,
  is_popular boolean DEFAULT false,
  is_available boolean DEFAULT true,
  preparation_time integer DEFAULT 15, -- en minutes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  status order_status DEFAULT 'pending',
  total_amount integer NOT NULL,
  discount_amount integer DEFAULT 0,
  final_amount integer NOT NULL,
  points_used integer DEFAULT 0,
  payment_method payment_method NOT NULL,
  delivery_address text,
  notes text,
  estimated_delivery timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL,
  total_price integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table du panier
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount integer NOT NULL, -- Positif pour crédit, négatif pour débit
  points_amount integer NOT NULL,
  payment_method payment_method,
  description text,
  reference text,
  created_at timestamptz DEFAULT now()
);

-- Table des avis
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Table des réductions actives
CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  percentage integer NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  min_amount integer DEFAULT 0,
  max_discount integer,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table de l'historique des points
CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  points_change integer NOT NULL, -- Positif pour gain, négatif pour dépense
  balance_after integer NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table des statistiques prestataires
CREATE TABLE IF NOT EXISTS provider_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_orders integer DEFAULT 0,
  total_revenue integer DEFAULT 0,
  total_points_earned integer DEFAULT 0,
  average_rating numeric(2,1) DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, date)
);

-- Activation de RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_stats ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les utilisateurs
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Politiques RLS pour les prestataires
CREATE POLICY "Providers can read own data" ON providers
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Providers can update own data" ON providers
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can read active providers" ON providers
  FOR SELECT USING (is_active = true);

-- Politiques RLS pour les catégories
CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT USING (is_active = true);

-- Politiques RLS pour les produits
CREATE POLICY "Anyone can read available products" ON products
  FOR SELECT USING (is_available = true);

CREATE POLICY "Providers can manage own products" ON products
  FOR ALL USING (auth.uid()::text = provider_id::text);

-- Politiques RLS pour les commandes
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Providers can read orders for their business" ON orders
  FOR SELECT USING (auth.uid()::text = provider_id::text);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Politiques RLS pour les articles de commande
CREATE POLICY "Users can read own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id::text = auth.uid()::text
    )
  );

-- Politiques RLS pour le panier
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Politiques RLS pour les transactions
CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Politiques RLS pour les avis
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for own orders" ON reviews
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Politiques RLS pour les réductions
CREATE POLICY "Anyone can read active discounts" ON discounts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage own discounts" ON discounts
  FOR ALL USING (auth.uid()::text = provider_id::text);

-- Politiques RLS pour l'historique des points
CREATE POLICY "Users can read own points history" ON user_points
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Politiques RLS pour les statistiques prestataires
CREATE POLICY "Providers can read own stats" ON provider_stats
  FOR SELECT USING (auth.uid()::text = provider_id::text);

-- Insertion des catégories par défaut
INSERT INTO categories (name, icon, color) VALUES
('Offres', 'percent', '#E53E3E'),
('Restaurant', 'utensils', '#38A169'),
('Beauté', 'sparkles', '#D69E2E'),
('Fast Food', 'zap', '#3182CE'),
('Café', 'coffee', '#805AD5');

-- Insertion de l'utilisateur admin
INSERT INTO users (
  id,
  email,
  password_hash,
  role,
  first_name,
  last_name,
  phone,
  points,
  balance,
  location
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  '$2b$10$dummy.hash.for.admin.password', -- Hash pour '0106-YouDja'
  'admin',
  'Admin',
  'System',
  '+225 07 12 34 56 78',
  15420,
  7710,
  'Cocody, Abidjan'
);

-- Insertion du prestataire de test
INSERT INTO providers (
  id,
  email,
  password_hash,
  business_name,
  owner_name,
  phone,
  address,
  location,
  category,
  description,
  image_url,
  rating,
  discount_percentage,
  is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'prest',
  '$2b$10$dummy.hash.for.provider.password', -- Hash pour '2306-YouDj@@'
  'Chez Tante Marie',
  'Marie Kouassi',
  '+225 05 12 34 56 78',
  'Rue des Jardins, Cocody',
  'Cocody',
  'Cuisine Africaine',
  'Restaurant spécialisé dans la cuisine africaine traditionnelle',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  4.8,
  25,
  true
);

-- Insertion de produits pour le prestataire de test
INSERT INTO products (provider_id, name, description, price, points_price, image_url, is_popular) VALUES
('00000000-0000-0000-0000-000000000002', 'Thiéboudiènne complet', 'Riz au poisson avec légumes traditionnels', 4500, 9000, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', true),
('00000000-0000-0000-0000-000000000002', 'Jus de gingembre frais', 'Boisson rafraîchissante au gingembre', 1000, 2000, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', false),
('00000000-0000-0000-0000-000000000002', 'Poisson braisé', 'Poisson grillé aux épices locales', 4000, 8000, 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg', true),
('00000000-0000-0000-0000-000000000002', 'Attiéké poisson', 'Semoule de manioc avec poisson grillé', 3250, 6500, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', true);

-- Insertion de commandes historiques pour l'admin
INSERT INTO orders (
  id,
  user_id,
  provider_id,
  status,
  total_amount,
  discount_amount,
  final_amount,
  points_used,
  payment_method,
  created_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'delivered',
  4500,
  675,
  3825,
  7650,
  'points',
  '2024-01-15 14:30:00'
);

-- Insertion des articles de commande
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
('00000000-0000-0000-0000-000000000003', (SELECT id FROM products WHERE name = 'Thiéboudiènne complet'), 1, 4500, 4500);

-- Insertion des transactions historiques
INSERT INTO transactions (
  user_id,
  order_id,
  type,
  amount,
  points_amount,
  payment_method,
  description,
  created_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  'payment',
  -3825,
  -7650,
  'points',
  'Paiement commande Chez Tante Marie',
  '2024-01-15 14:30:00'
),
(
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'recharge',
  10000,
  20000,
  'mtn_money',
  'Rechargement MTN Mobile Money',
  '2024-01-14 10:00:00'
);

-- Fonctions utilitaires
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();