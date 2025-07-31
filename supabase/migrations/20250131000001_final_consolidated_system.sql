/*
  # Migration finale consolidée - Système de points AfriSmile + Kolofap
  
  Taux de conversion final : 1 point = 78.359 FCFA (cohérent avec pointsConversion.ts)
  
  1. Fonctions de conversion unifiées
  2. Structure complète de base de données
  3. Données de test réalistes
  4. Système Mobile Money avec frais
  5. Intégration Kolofap
*/

-- ============================================================================
-- 1. FONCTIONS DE CONVERSION POINTS ↔ FCFA (TAUX FINAL: 78.359)
-- ============================================================================

-- Fonction de conversion points vers FCFA (1 point = 78.359 FCFA)
CREATE OR REPLACE FUNCTION points_to_fcfa(points_amount INTEGER)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN ROUND(points_amount * 78.359, 2);
END;
$$;

-- Fonction de conversion FCFA vers points (78.359 FCFA = 1 point)
CREATE OR REPLACE FUNCTION fcfa_to_points(fcfa_amount DECIMAL)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN ROUND(fcfa_amount / 78.359);
END;
$$;

-- Fonction pour obtenir le taux de conversion actuel
CREATE OR REPLACE FUNCTION get_conversion_rate()
RETURNS DECIMAL(10,3)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 78.359; -- 1 point = 78.359 FCFA
END;
$$;

-- Fonction pour calculer le cashback (1% du montant, minimum 1 FCFA)
CREATE OR REPLACE FUNCTION calculate_cashback(order_amount_points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  fcfa_amount DECIMAL(10,2);
  cashback_fcfa DECIMAL(10,2);
BEGIN
  fcfa_amount := points_to_fcfa(order_amount_points);
  cashback_fcfa := GREATEST(fcfa_amount * 0.01, 1.0); -- 1% minimum 1 FCFA
  RETURN fcfa_to_points(cashback_fcfa);
END;
$$;

-- ============================================================================
-- 2. STRUCTURE DE BASE DE DONNÉES COMPLÈTE
-- ============================================================================

-- Table des utilisateurs (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'provider', 'admin')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des prestataires
CREATE TABLE IF NOT EXISTS providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  estimated_time TEXT DEFAULT '30-45 min',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  category_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Prix en points
  image_url TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  is_unsold BOOLEAN DEFAULT false,
  unsold_price INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  total_amount INTEGER NOT NULL, -- Montant total en points
  discount_amount INTEGER DEFAULT 0,
  final_amount INTEGER NOT NULL,
  points_used INTEGER NOT NULL,
  delivery_fee INTEGER DEFAULT 0,
  payment_method TEXT DEFAULT 'points' CHECK (payment_method IN ('points', 'mtn_money', 'orange_money', 'moov_money')),
  delivery_address TEXT,
  notes TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des éléments de commande
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL, -- Prix unitaire en points
  total_price INTEGER NOT NULL, -- Prix total en points
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('recharge', 'payment', 'refund', 'cashback')),
  amount DECIMAL(10,2) NOT NULL, -- Montant en FCFA
  points_amount INTEGER NOT NULL, -- Montant en points
  payment_method TEXT CHECK (payment_method IN ('points', 'mtn_money', 'orange_money', 'moov_money', 'cash')),
  description TEXT,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des avis
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. INTÉGRATION KOLOFAP
-- ============================================================================

-- Table des profils Kolofap
CREATE TABLE IF NOT EXISTS kolofap_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des transactions Kolofap
CREATE TABLE IF NOT EXISTS kolofap_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES kolofap_profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES kolofap_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Montant en points
  message TEXT,
  transaction_type TEXT DEFAULT 'transfer' CHECK (transaction_type IN ('transfer', 'tip', 'payment')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. DÉCLENCHEURS ET FONCTIONS AUTOMATIQUES
-- ============================================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Déclencheurs pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kolofap_profiles_updated_at BEFORE UPDATE ON kolofap_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour automatiquement le solde en FCFA
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
    NEW.balance = points_to_fcfa(NEW.points);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Déclencheur pour maintenir la cohérence points/balance
CREATE TRIGGER update_user_balance_trigger 
    BEFORE INSERT OR UPDATE OF points ON users 
    FOR EACH ROW EXECUTE FUNCTION update_user_balance();

-- ============================================================================
-- 5. DONNÉES DE TEST RÉALISTES
-- ============================================================================

-- Utilisateurs de test avec points cohérents (78.359 FCFA/point)
INSERT INTO users (id, email, role, first_name, last_name, phone, points, location) VALUES
('00000000-0000-0000-0000-000000000001', 'client@test.ci', 'client', 'Marie', 'Kouassi', '+225 07 12 34 56 78', 550, 'Cocody, Abidjan'),
('00000000-0000-0000-0000-000000000002', 'admin@test.ci', 'admin', 'Admin', 'Système', '+225 05 55 55 55 55', 810, 'Plateau, Abidjan'),
('00000000-0000-0000-0000-000000000003', 'jean@test.ci', 'provider', 'Jean', 'Traoré', '+225 01 23 45 67 89', 140, 'Treichville, Abidjan'),
('00000000-0000-0000-0000-000000000004', 'aya@test.ci', 'client', 'Aya', 'Diabaté', '+225 07 98 76 54 32', 200, 'Yopougon, Abidjan'),
('00000000-0000-0000-0000-000000000005', 'kone@test.ci', 'client', 'Kone', 'Mamadou', '+225 05 11 22 33 44', 110, 'Adjamé, Abidjan')
ON CONFLICT (email) DO UPDATE SET
  points = EXCLUDED.points,
  balance = points_to_fcfa(EXCLUDED.points),
  updated_at = NOW();

-- Profils Kolofap correspondants
INSERT INTO kolofap_profiles (user_id, username, display_name, bio) VALUES
('00000000-0000-0000-0000-000000000001', 'marie_gamer', 'Marie K.', 'Passionnée de jeux et de bonne bouffe ! 🎮🍽️'),
('00000000-0000-0000-0000-000000000002', 'admin_system', 'Admin AfriSmile', 'Administrateur système AfriSmile'),
('00000000-0000-0000-0000-000000000003', 'jean_chef', 'Chef Jean', 'Cuisinier traditionnel, spécialité ivoirienne'),
('00000000-0000-0000-0000-000000000004', 'aya_foodie', 'Aya D.', 'Food blogger, toujours à la recherche de nouveaux goûts'),
('00000000-0000-0000-0000-000000000005', 'kone_mamad', 'Kone M.', 'Étudiant, fan de street food')
ON CONFLICT (username) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Prestataire de test
INSERT INTO providers (user_id, business_name, owner_name, phone, address, location, category, description, discount_percentage, rating, total_reviews) VALUES
('00000000-0000-0000-0000-000000000003', 'Chez Jean - Cuisine Traditionnelle', 'Jean Traoré', '+225 01 23 45 67 89', '15 Rue des Maquis, Treichville', 'Treichville, Abidjan', 'Restaurant', 'Spécialités ivoiriennes authentiques, ambiance chaleureuse', 10, 4.5, 23)
ON CONFLICT DO NOTHING;

-- Produits de test avec prix en points cohérents
INSERT INTO products (provider_id, name, description, price, is_popular) VALUES
((SELECT id FROM providers WHERE user_id = '00000000-0000-0000-0000-000000000003'), 'Thiéboudiènne', 'Riz au poisson traditionnel avec légumes', 7, true),
((SELECT id FROM providers WHERE user_id = '00000000-0000-0000-0000-000000000003'), 'Attiéké-Poisson', 'Attiéké avec poisson grillé et sauce tomate', 6, true),
((SELECT id FROM providers WHERE user_id = '00000000-0000-0000-0000-000000000003'), 'Jus de Gingembre', 'Jus de gingembre frais fait maison', 2, false),
((SELECT id FROM providers WHERE user_id = '00000000-0000-0000-0000-000000000003'), 'Alloco', 'Bananes plantains frites avec sauce piment', 3, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. INDICES POUR PERFORMANCE
-- ============================================================================

-- Indices sur les tables principales
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);
CREATE INDEX IF NOT EXISTS idx_providers_location ON providers(location);
CREATE INDEX IF NOT EXISTS idx_products_provider_id ON products(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_kolofap_profiles_username ON kolofap_profiles(username);

-- ============================================================================
-- 7. POLITIQUES DE SÉCURITÉ RLS
-- ============================================================================

-- Activer RLS sur les tables sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Politiques de base (à adapter selon vos besoins)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- 8. VUES UTILES
-- ============================================================================

-- Vue des soldes utilisateurs avec conversions
CREATE OR REPLACE VIEW user_balances_view AS
SELECT 
  id,
  email,
  first_name,
  last_name,
  points,
  balance,
  points_to_fcfa(points) as calculated_balance_fcfa,
  ROUND(points * 78.359, 2) as manual_balance_check
FROM users
WHERE is_active = true;

-- ============================================================================
-- COMMENTAIRES ET DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION points_to_fcfa IS 'Convertit les points en FCFA (1 point = 78.359 FCFA)';
COMMENT ON FUNCTION fcfa_to_points IS 'Convertit les FCFA en points (78.359 FCFA = 1 point)';
COMMENT ON FUNCTION get_conversion_rate IS 'Retourne le taux de conversion actuel (78.359 FCFA par point)';
COMMENT ON FUNCTION calculate_cashback IS 'Calcule le cashback (1% du montant, minimum 1 FCFA)';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration finale terminée avec succès !';
  RAISE NOTICE 'Taux de conversion : 1 point = 78.359 FCFA';
  RAISE NOTICE 'Base de données AfriSmile + Kolofap opérationnelle';
  RAISE NOTICE 'Données de test chargées avec des valeurs cohérentes';
END
$$;
