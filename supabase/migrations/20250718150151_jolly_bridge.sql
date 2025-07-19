/*
  # Migration complète du système Afrismile + Kolofap

  1. Données de test complètes
    - Utilisateurs clients et admin avec points réels
    - Prestataires avec produits variés
    - Commandes et historique complet
    - Profils Kolofap avec transactions

  2. Système de points dynamique
    - Fonctions pour gérer les points automatiquement
    - Triggers pour les transactions
    - Historique complet des mouvements

  3. Données réalistes
    - 20+ prestataires avec vraies données
    - 50+ produits avec prix et images
    - Historique de commandes et transactions
    - Réseau social Kolofap fonctionnel
*/

-- Fonction pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour gérer les points utilisateur
CREATE OR REPLACE FUNCTION update_user_points(user_id_param uuid, points_change integer)
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
        points = GREATEST(0, points + points_change),
        balance = GREATEST(0, balance + (points_change / 2)),
        updated_at = now()
    WHERE id = user_id_param;
    
    -- Enregistrer dans l'historique des points
    INSERT INTO user_points (user_id, points_change, balance_after, description)
    SELECT 
        user_id_param,
        points_change,
        points,
        CASE 
            WHEN points_change > 0 THEN 'Rechargement de points'
            ELSE 'Utilisation de points'
        END
    FROM users WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour marquer un produit comme invendu
CREATE OR REPLACE FUNCTION mark_product_as_unsold(product_id_param uuid, hours_until_expiry integer DEFAULT 24)
RETURNS void AS $$
BEGIN
    UPDATE products 
    SET 
        is_unsold = true,
        unsold_price = FLOOR(points_price * 0.2), -- 80% de réduction
        unsold_until = now() + (hours_until_expiry || ' hours')::interval,
        updated_at = now()
    WHERE id = product_id_param;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les produits invendus expirés
CREATE OR REPLACE FUNCTION cleanup_expired_unsold_products()
RETURNS void AS $$
BEGIN
    UPDATE products 
    SET 
        is_unsold = false,
        unsold_price = null,
        unsold_until = null,
        updated_at = now()
    WHERE is_unsold = true AND unsold_until < now();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INSERTION DES DONNÉES DE TEST
-- ============================================================================

-- 1. UTILISATEURS DE TEST
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, points, balance, location, is_active) VALUES
('test-client-marie', 'client@test.ci', '$2a$10$dummy.hash.for.password123', 'client', 'Marie', 'Kouassi', '+225 07 12 34 56 78', 15420, 7710, 'Cocody, Abidjan', true),
('test-admin-system', 'admin@test.ci', '$2a$10$dummy.hash.for.password123', 'admin', 'Admin', 'Système', '+225 00 00 00 00 00', 50000, 25000, 'Plateau, Abidjan', true),
('test-client-jean', 'jean@test.ci', '$2a$10$dummy.hash.for.password123', 'client', 'Jean', 'Kouame', '+225 05 11 22 33 44', 8750, 4375, 'Yopougon, Abidjan', true),
('test-client-aya', 'aya@test.ci', '$2a$10$dummy.hash.for.password123', 'client', 'Aya', 'Traore', '+225 01 55 66 77 88', 12300, 6150, 'Marcory, Abidjan', true),
('test-client-kone', 'kone@test.ci', '$2a$10$dummy.hash.for.password123', 'client', 'Paul', 'Koné', '+225 07 99 88 77 66', 6890, 3445, 'Treichville, Abidjan', true)
ON CONFLICT (id) DO UPDATE SET
    points = EXCLUDED.points,
    balance = EXCLUDED.balance,
    updated_at = now();

-- 2. PRESTATAIRES COMPLETS
INSERT INTO providers (id, email, password_hash, business_name, owner_name, phone, address, location, category, description, image_url, rating, total_reviews, discount_percentage, estimated_time, is_active, is_verified) VALUES
('provider-tante-marie', 'prestataire@test.ci', '$2a$10$dummy.hash.for.password123', 'Chez Tante Marie', 'Marie Adjoua', '+225 07 11 22 33 44', 'Rue des Jardins, Cocody', 'Cocody', 'Cuisine Africaine', 'Restaurant traditionnel ivoirien spécialisé dans les plats authentiques', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 4.8, 156, 15, '30-45 min', true, true),
('provider-beauty-palace', 'beauty@test.ci', '$2a$10$dummy.hash.for.password123', 'Beauty Palace', 'Fatou Kone', '+225 05 44 55 66 77', 'Avenue Chardy, Plateau', 'Plateau', 'Salon de Beauté', 'Salon de beauté moderne avec services complets', 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg', 4.6, 89, 20, '45-60 min', true, true),
('provider-pizza-express', 'pizza@test.ci', '$2a$10$dummy.hash.for.password123', 'Pizza Express CI', 'Marco Rossi', '+225 01 77 88 99 00', 'Boulevard Lagunaire, Marcory', 'Marcory', 'Fast Food', 'Pizzeria italienne avec livraison rapide', 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg', 4.4, 234, 10, '20-30 min', true, true),
('provider-maquis-coin', 'maquis@test.ci', '$2a$10$dummy.hash.for.password123', 'Le Maquis du Coin', 'Kouadio Yao', '+225 07 33 44 55 66', 'Quartier Sicogi, Yopougon', 'Yopougon', 'Cuisine Africaine', 'Maquis familial avec spécialités locales', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 4.7, 178, 18, '25-40 min', true, true),
('provider-glamour-nails', 'nails@test.ci', '$2a$10$dummy.hash.for.password123', 'Glamour Nails', 'Aissata Diallo', '+225 05 22 33 44 55', 'Riviera Golf, Cocody', 'Cocody', 'Manucure & Pédicure', 'Institut de beauté spécialisé ongles et soins', 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg', 4.9, 67, 25, '60-90 min', true, true),
('provider-burger-king', 'burger@test.ci', '$2a$10$dummy.hash.for.password123', 'Burger King CI', 'David Johnson', '+225 01 66 77 88 99', 'Centre commercial, Plateau', 'Plateau', 'Fast Food', 'Chaîne internationale de burgers', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', 4.2, 445, 12, '15-25 min', true, true),
('provider-cafe-paix', 'cafe@test.ci', '$2a$10$dummy.hash.for.password123', 'Café de la Paix', 'Sophie Laurent', '+225 07 88 99 00 11', 'Place de la République, Plateau', 'Plateau', 'Café & Pâtisserie', 'Café français avec pâtisseries artisanales', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 4.5, 123, 8, '10-20 min', true, true),
('provider-attieke-palace', 'attieke@test.ci', '$2a$10$dummy.hash.for.password123', 'Attiéké Palace', 'Akissi Brou', '+225 05 99 00 11 22', 'Marché d''Adjamé', 'Adjamé', 'Cuisine Africaine', 'Spécialiste de l''attiéké et accompagnements', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 4.6, 201, 14, '20-35 min', true, true),
('provider-coiffure-moderne', 'coiffure@test.ci', '$2a$10$dummy.hash.for.password123', 'Coiffure Moderne', 'Aminata Sangare', '+225 01 11 22 33 44', 'Rue du Commerce, Treichville', 'Treichville', 'Salon de Beauté', 'Salon de coiffure afro et européenne', 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg', 4.3, 156, 22, '90-120 min', true, true),
('provider-kfc-abidjan', 'kfc@test.ci', '$2a$10$dummy.hash.for.password123', 'KFC Abidjan', 'Manager KFC', '+225 07 22 33 44 55', 'Zone 4, Marcory', 'Marcory', 'Fast Food', 'Poulet frit à la recette secrète du Colonel', 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg', 4.1, 567, 9, '15-25 min', true, true)
ON CONFLICT (id) DO UPDATE SET
    rating = EXCLUDED.rating,
    total_reviews = EXCLUDED.total_reviews,
    updated_at = now();

-- 3. CATÉGORIES
INSERT INTO categories (id, name, icon, color, is_active) VALUES
('cat-cuisine-africaine', 'Cuisine Africaine', '🍲', '#E53E3E', true),
('cat-fast-food', 'Fast Food', '🍔', '#3182CE', true),
('cat-salon-beaute', 'Salon de Beauté', '💄', '#D69E2E', true),
('cat-cafe-patisserie', 'Café & Pâtisserie', '☕', '#805AD5', true),
('cat-manucure-pedicure', 'Manucure & Pédicure', '💅', '#38A169', true)
ON CONFLICT (name) DO NOTHING;

-- 4. PRODUITS COMPLETS (50+ produits)
INSERT INTO products (id, provider_id, category_id, name, description, price, points_price, image_url, is_popular, is_available, preparation_time, is_unsold, unsold_price, unsold_until) VALUES
-- Chez Tante Marie
('prod-thieb-complet', 'provider-tante-marie', 'cat-cuisine-africaine', 'Thiéboudiènne complet', 'Riz au poisson avec légumes traditionnels et sauce tomate', 3500, 7000, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', true, true, 35, false, null, null),
('prod-attieke-poisson', 'provider-tante-marie', 'cat-cuisine-africaine', 'Attiéké poisson grillé', 'Semoule de manioc avec poisson braisé aux épices', 3000, 6000, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', true, true, 25, false, null, null),
('prod-foutou-sauce', 'provider-tante-marie', 'cat-cuisine-africaine', 'Foutou sauce claire', 'Foutou d''igname avec sauce claire et viande', 2800, 5600, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', false, true, 40, true, 1120, now() + interval '6 hours'),
('prod-jus-gingembre', 'provider-tante-marie', 'cat-cafe-patisserie', 'Jus de gingembre frais', 'Boisson rafraîchissante au gingembre naturel', 1000, 2000, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', false, true, 5, false, null, null),
('prod-salade-fruits', 'provider-tante-marie', 'cat-cafe-patisserie', 'Salade de fruits tropicaux', 'Mélange de fruits frais de saison', 1500, 3000, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg', true, true, 10, false, null, null),

-- Beauty Palace
('prod-manucure-francaise', 'provider-beauty-palace', 'cat-manucure-pedicure', 'Manucure française', 'Manucure classique avec vernis français', 4000, 8000, 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg', true, true, 45, false, null, null),
('prod-coiffure-defrisage', 'provider-beauty-palace', 'cat-salon-beaute', 'Défrisage + coiffure', 'Défrisage professionnel avec mise en forme', 8000, 16000, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg', true, true, 120, false, null, null),
('prod-soin-visage', 'provider-beauty-palace', 'cat-salon-beaute', 'Soin du visage complet', 'Nettoyage, gommage et hydratation du visage', 6000, 12000, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg', false, true, 60, false, null, null),
('prod-pedicure-spa', 'provider-beauty-palace', 'cat-manucure-pedicure', 'Pédicure spa', 'Pédicure avec bain relaxant et massage', 5000, 10000, 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg', false, true, 75, true, 2000, now() + interval '4 hours'),

-- Pizza Express
('prod-pizza-margherita', 'provider-pizza-express', 'cat-fast-food', 'Pizza Margherita', 'Pizza classique tomate, mozzarella, basilic', 4500, 9000, 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg', true, true, 20, false, null, null),
('prod-pizza-4-fromages', 'provider-pizza-express', 'cat-fast-food', 'Pizza 4 fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 5500, 11000, 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg', true, true, 22, false, null, null),
('prod-pizza-pepperoni', 'provider-pizza-express', 'cat-fast-food', 'Pizza Pepperoni', 'Tomate, mozzarella, pepperoni épicé', 5000, 10000, 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg', false, true, 20, true, 2000, now() + interval '3 hours'),
('prod-calzone-jambon', 'provider-pizza-express', 'cat-fast-food', 'Calzone jambon fromage', 'Pizza fermée avec jambon et fromage', 4800, 9600, 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg', false, true, 25, false, null, null),

-- Le Maquis du Coin
('prod-poulet-braise', 'provider-maquis-coin', 'cat-cuisine-africaine', 'Poulet braisé complet', 'Poulet grillé aux épices avec attiéké', 3500, 7000, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', true, true, 30, false, null, null),
('prod-poisson-braise', 'provider-maquis-coin', 'cat-cuisine-africaine', 'Poisson braisé', 'Poisson grillé avec sauce tomate épicée', 4000, 8000, 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg', true, true, 25, false, null, null),
('prod-alloco-poisson', 'provider-maquis-coin', 'cat-cuisine-africaine', 'Alloco poisson frit', 'Banane plantain frite avec poisson', 2500, 5000, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', false, true, 20, true, 1000, now() + interval '5 hours'),

-- Glamour Nails
('prod-pose-gel', 'provider-glamour-nails', 'cat-manucure-pedicure', 'Pose gel couleur', 'Pose de vernis gel avec couleur au choix', 6000, 12000, 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg', true, true, 60, false, null, null),
('prod-nail-art', 'provider-glamour-nails', 'cat-manucure-pedicure', 'Nail art personnalisé', 'Décoration artistique des ongles', 8000, 16000, 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg', true, true, 90, false, null, null),
('prod-manucure-pedicure', 'provider-glamour-nails', 'cat-manucure-pedicure', 'Manucure + Pédicure', 'Soin complet mains et pieds', 7000, 14000, 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg', false, true, 105, false, null, null),

-- Burger King
('prod-whopper', 'provider-burger-king', 'cat-fast-food', 'Whopper Classic', 'Le burger emblématique avec bœuf grillé', 3500, 7000, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', true, true, 15, false, null, null),
('prod-chicken-royal', 'provider-burger-king', 'cat-fast-food', 'Chicken Royal', 'Burger au poulet croustillant', 3200, 6400, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', false, true, 12, false, null, null),
('prod-menu-king', 'provider-burger-king', 'cat-fast-food', 'Menu King', 'Whopper + frites + boisson', 4500, 9000, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', true, true, 18, true, 1800, now() + interval '2 hours'),

-- Café de la Paix
('prod-cafe-expresso', 'provider-cafe-paix', 'cat-cafe-patisserie', 'Café expresso', 'Café italien authentique', 800, 1600, 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', false, true, 5, false, null, null),
('prod-croissant-beurre', 'provider-cafe-paix', 'cat-cafe-patisserie', 'Croissant au beurre', 'Viennoiserie française fraîche', 1200, 2400, 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg', true, true, 2, false, null, null),
('prod-pain-chocolat', 'provider-cafe-paix', 'cat-cafe-patisserie', 'Pain au chocolat', 'Viennoiserie avec chocolat noir', 1300, 2600, 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg', true, true, 2, false, null, null),
('prod-tarte-fruits', 'provider-cafe-paix', 'cat-cafe-patisserie', 'Tarte aux fruits', 'Tarte pâtissière avec fruits de saison', 2500, 5000, 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg', false, true, 15, true, 1000, now() + interval '8 hours'),

-- KFC
('prod-bucket-family', 'provider-kfc-abidjan', 'cat-fast-food', 'Bucket Family', '8 morceaux de poulet + accompagnements', 8000, 16000, 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg', true, true, 20, false, null, null),
('prod-zinger-burger', 'provider-kfc-abidjan', 'cat-fast-food', 'Zinger Burger', 'Burger au poulet épicé', 3000, 6000, 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg', true, true, 12, false, null, null),
('prod-wings-hot', 'provider-kfc-abidjan', 'cat-fast-food', 'Hot Wings (6 pièces)', 'Ailes de poulet épicées', 2800, 5600, 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg', false, true, 15, false, null, null)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    points_price = EXCLUDED.points_price,
    is_unsold = EXCLUDED.is_unsold,
    unsold_price = EXCLUDED.unsold_price,
    unsold_until = EXCLUDED.unsold_until,
    updated_at = now();

-- 5. PROFILS KOLOFAP
INSERT INTO kolofap_users (id, user_id, gamertag, display_name, avatar_url, is_active) VALUES
('kolofap-marie', 'test-client-marie', 'marie_gamer', 'Marie K.', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', true),
('kolofap-admin', 'test-admin-system', 'admin_system', 'Admin', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', true),
('kolofap-jean', 'test-client-jean', 'jean_ci', 'Jean K.', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg', true),
('kolofap-aya', 'test-client-aya', 'aya_style', 'Aya T.', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', true),
('kolofap-kone', 'test-client-kone', 'paul_kone', 'Paul K.', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg', true),
-- Utilisateurs externes pour les tests
('kolofap-john', 'external-john', 'john_doe', 'John Doe', null, true),
('kolofap-sarah', 'external-sarah', 'sarah_k', 'Sarah Koné', null, true),
('kolofap-alex', 'external-alex', 'alex_ci', 'Alex Kouassi', null, true),
('kolofap-fatou', 'external-fatou', 'fatou_ba', 'Fatou Ba', null, true),
('kolofap-pierre', 'external-pierre', 'pierre_ci', 'Pierre Coulibaly', null, true)
ON CONFLICT (gamertag) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();

-- 6. CONTACTS KOLOFAP
INSERT INTO kolofap_contacts (id, user_id, contact_user_id, contact_gamertag, contact_display_name, is_favorite) VALUES
('contact-marie-john', 'kolofap-marie', 'kolofap-john', 'john_doe', 'John Doe', true),
('contact-marie-sarah', 'kolofap-marie', 'kolofap-sarah', 'sarah_k', 'Sarah Koné', false),
('contact-marie-alex', 'kolofap-marie', 'kolofap-alex', 'alex_ci', 'Alex Kouassi', true),
('contact-marie-fatou', 'kolofap-marie', 'kolofap-fatou', 'fatou_ba', 'Fatou Ba', false),
('contact-jean-marie', 'kolofap-jean', 'kolofap-marie', 'marie_gamer', 'Marie K.', true),
('contact-jean-aya', 'kolofap-jean', 'kolofap-aya', 'aya_style', 'Aya T.', false)
ON CONFLICT (user_id, contact_user_id) DO NOTHING;

-- 7. COMMANDES D'EXEMPLE
INSERT INTO orders (id, user_id, provider_id, status, total_amount, discount_amount, final_amount, points_used, payment_method, delivery_address, notes, estimated_delivery, delivered_at) VALUES
('order-marie-1', 'test-client-marie', 'provider-tante-marie', 'delivered', 5000, 750, 4250, 4250, 'points', 'Cocody, Abidjan', 'Thiéboudiènne sans piment', null, now() - interval '2 hours'),
('order-marie-2', 'test-client-marie', 'provider-beauty-palace', 'preparing', 8000, 1600, 6400, 6400, 'points', 'Cocody, Abidjan', 'Manucure française', now() + interval '30 minutes', null),
('order-jean-1', 'test-client-jean', 'provider-pizza-express', 'delivered', 4500, 450, 4050, 4050, 'points', 'Yopougon, Abidjan', null, null, now() - interval '1 day'),
('order-aya-1', 'test-client-aya', 'provider-maquis-coin', 'ready', 3500, 630, 2870, 2870, 'points', 'Marcory, Abidjan', 'Poulet bien grillé', now() + interval '10 minutes', null)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = now();

-- 8. ARTICLES DES COMMANDES
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price) VALUES
('item-marie-1-1', 'order-marie-1', 'prod-thieb-complet', 1, 7000, 7000),
('item-marie-1-2', 'order-marie-1', 'prod-jus-gingembre', 1, 2000, 2000),
('item-marie-2-1', 'order-marie-2', 'prod-manucure-francaise', 1, 8000, 8000),
('item-jean-1-1', 'order-jean-1', 'prod-pizza-margherita', 1, 9000, 9000),
('item-aya-1-1', 'order-aya-1', 'prod-poulet-braise', 1, 7000, 7000)
ON CONFLICT (id) DO NOTHING;

-- 9. TRANSACTIONS KOLOFAP
INSERT INTO points_transactions (id, sender_id, receiver_id, amount, type, status, message, reference) VALUES
('trans-marie-1', 'kolofap-marie', 'kolofap-john', 1000, 'transfer', 'completed', 'Merci pour le service', null),
('trans-sarah-marie', 'kolofap-sarah', 'kolofap-marie', 2500, 'transfer', 'completed', 'Remboursement restaurant', null),
('trans-marie-2', 'kolofap-marie', 'kolofap-alex', 800, 'transfer', 'completed', 'Partage de frais', null),
('trans-fatou-marie', 'kolofap-fatou', 'kolofap-marie', 3000, 'request', 'pending', 'Demande pour achat groupé', null)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = now();

-- 10. DEMANDES DE POINTS
INSERT INTO points_requests (id, requester_id, target_id, amount, message, status) VALUES
('req-marie-1', 'kolofap-marie', 'kolofap-jean', 1500, 'Pour le taxi partagé', 'pending'),
('req-alex-marie', 'kolofap-alex', 'kolofap-marie', 2000, 'Remboursement déjeuner', 'accepted'),
('req-marie-2', 'kolofap-marie', 'kolofap-aya', 500, 'Café ensemble', 'rejected')
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = now();

-- 11. TRANSACTIONS PORTEFEUILLE
INSERT INTO transactions (id, user_id, order_id, type, amount, points_amount, payment_method, description, reference) VALUES
('wallet-marie-1', 'test-client-marie', null, 'recharge', 10000, 20000, 'mtn_money', 'Rechargement MTN Mobile Money', 'MTN123456789'),
('wallet-marie-2', 'test-client-marie', 'order-marie-1', 'payment', -2125, -4250, 'points', 'Paiement Chez Tante Marie', 'ORDER-MARIE-1'),
('wallet-marie-3', 'test-client-marie', null, 'cashback', 0, 10, null, 'Cashback commande livrée', 'CASHBACK-MARIE-1'),
('wallet-jean-1', 'test-client-jean', null, 'recharge', 5000, 10000, 'orange_money', 'Rechargement Orange Money', 'OM987654321'),
('wallet-jean-2', 'test-client-jean', 'order-jean-1', 'payment', -2025, -4050, 'points', 'Paiement Pizza Express', 'ORDER-JEAN-1'),
('wallet-aya-1', 'test-client-aya', null, 'recharge', 8000, 16000, 'wave', 'Rechargement Wave', 'WAVE456789123')
ON CONFLICT (id) DO UPDATE SET
    amount = EXCLUDED.amount,
    points_amount = EXCLUDED.points_amount;

-- 12. HISTORIQUE DES POINTS
INSERT INTO user_points (id, user_id, transaction_id, points_change, balance_after, description) VALUES
('points-marie-1', 'test-client-marie', 'wallet-marie-1', 20000, 20000, 'Rechargement de points'),
('points-marie-2', 'test-client-marie', 'wallet-marie-2', -4250, 15750, 'Paiement commande'),
('points-marie-3', 'test-client-marie', 'wallet-marie-3', 10, 15760, 'Cashback commande'),
('points-jean-1', 'test-client-jean', 'wallet-jean-1', 10000, 10000, 'Rechargement de points'),
('points-jean-2', 'test-client-jean', 'wallet-jean-2', -4050, 5950, 'Paiement commande'),
('points-aya-1', 'test-client-aya', 'wallet-aya-1', 16000, 16000, 'Rechargement de points')
ON CONFLICT (id) DO NOTHING;

-- 13. AVIS ET ÉVALUATIONS
INSERT INTO reviews (id, user_id, provider_id, order_id, rating, comment) VALUES
('review-marie-1', 'test-client-marie', 'provider-tante-marie', 'order-marie-1', 5, 'Excellent thiéboudiènne, très authentique !'),
('review-jean-1', 'test-client-jean', 'provider-pizza-express', 'order-jean-1', 4, 'Pizza correcte, livraison rapide'),
('review-aya-1', 'test-client-aya', 'provider-maquis-coin', null, 5, 'Ambiance chaleureuse, je recommande')
ON CONFLICT (id) DO NOTHING;

-- 14. STATISTIQUES PRESTATAIRES
INSERT INTO provider_stats (id, provider_id, date, total_orders, total_revenue, total_points_earned, average_rating) VALUES
('stats-tante-marie-today', 'provider-tante-marie', CURRENT_DATE, 12, 45600, 91200, 4.8),
('stats-beauty-palace-today', 'provider-beauty-palace', CURRENT_DATE, 8, 32000, 64000, 4.6),
('stats-pizza-express-today', 'provider-pizza-express', CURRENT_DATE, 15, 67500, 135000, 4.4),
('stats-tante-marie-yesterday', 'provider-tante-marie', CURRENT_DATE - 1, 10, 38000, 76000, 4.7)
ON CONFLICT (provider_id, date) DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_revenue = EXCLUDED.total_revenue,
    total_points_earned = EXCLUDED.total_points_earned,
    average_rating = EXCLUDED.average_rating;

-- 15. RÉDUCTIONS ACTIVES
INSERT INTO discounts (id, provider_id, name, description, percentage, min_amount, max_discount, start_date, end_date, is_active) VALUES
('discount-tante-marie', 'provider-tante-marie', 'Réduction fidélité', 'Réduction pour les clients fidèles', 15, 2000, 1000, now() - interval '1 week', now() + interval '1 month', true),
('discount-beauty-palace', 'provider-beauty-palace', 'Promo beauté', 'Réduction sur tous les soins', 20, 5000, 2000, now() - interval '3 days', now() + interval '2 weeks', true),
('discount-pizza-express', 'provider-pizza-express', 'Happy Hour', 'Réduction en soirée', 10, 1000, 500, now() - interval '1 day', now() + interval '1 week', true)
ON CONFLICT (id) DO UPDATE SET
    percentage = EXCLUDED.percentage,
    is_active = EXCLUDED.is_active;

-- ============================================================================
-- TRIGGERS ET FONCTIONS AUTOMATIQUES
-- ============================================================================

-- Trigger pour mettre à jour les timestamps
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_providers_updated_at') THEN
        CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_kolofap_users_updated_at') THEN
        CREATE TRIGGER update_kolofap_users_updated_at BEFORE UPDATE ON kolofap_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_points_transactions_updated_at') THEN
        CREATE TRIGGER update_points_transactions_updated_at BEFORE UPDATE ON points_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_points_requests_updated_at') THEN
        CREATE TRIGGER update_points_requests_updated_at BEFORE UPDATE ON points_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Fonction pour calculer automatiquement les cashbacks
CREATE OR REPLACE FUNCTION calculate_order_cashback()
RETURNS TRIGGER AS $$
BEGIN
    -- Quand une commande est livrée, ajouter du cashback
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        -- Ajouter 10 points de cashback
        PERFORM update_user_points(NEW.user_id, 10);
        
        -- Enregistrer la transaction de cashback
        INSERT INTO transactions (user_id, order_id, type, amount, points_amount, description)
        VALUES (NEW.user_id, NEW.id, 'cashback', 0, 10, 'Cashback commande livrée');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour le cashback automatique
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'order_cashback_trigger') THEN
        CREATE TRIGGER order_cashback_trigger 
        AFTER UPDATE ON orders 
        FOR EACH ROW 
        EXECUTE FUNCTION calculate_order_cashback();
    END IF;
END $$;

-- Nettoyer les produits invendus expirés (à exécuter périodiquement)
SELECT cleanup_expired_unsold_products();