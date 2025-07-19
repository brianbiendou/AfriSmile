/*
  # Setup complet des utilisateurs de test

  1. Utilisateurs de test
    - Client test (Marie Kouassi) avec 15,420 points
    - Admin test (Admin Système) avec 50,000 points
    - Prestataire test déjà existant

  2. Profils Kolofap
    - marie_gamer pour le client test
    - admin_system pour l'admin

  3. Données de test
    - Commandes d'exemple
    - Transactions Kolofap
    - Contacts Kolofap

  4. Sécurité
    - Politiques RLS respectées
    - Données cohérentes
*/

-- Insérer les utilisateurs de test
INSERT INTO public.users (
  id,
  email,
  password_hash,
  role,
  first_name,
  last_name,
  phone,
  points,
  balance,
  location,
  is_active
) VALUES 
(
  'test-client-marie-id',
  'client@test.ci',
  '$2a$10$dummy.hash.for.password123',
  'client',
  'Marie',
  'Kouassi',
  '+225 07 12 34 56 78',
  15420,
  7710,
  'Cocody, Abidjan',
  true
),
(
  'test-admin-system-id',
  'admin@test.ci',
  '$2a$10$dummy.hash.for.password123',
  'admin',
  'Admin',
  'Système',
  '+225 00 00 00 00 00',
  50000,
  25000,
  'Plateau, Abidjan',
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  points = EXCLUDED.points,
  balance = EXCLUDED.balance,
  location = EXCLUDED.location,
  updated_at = now();

-- Créer les profils Kolofap
INSERT INTO public.kolofap_users (
  id,
  user_id,
  gamertag,
  display_name,
  avatar_url,
  is_active
) VALUES 
(
  'kolofap-marie-id',
  'test-client-marie-id',
  'marie_gamer',
  'Marie K.',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
),
(
  'kolofap-admin-id',
  'test-admin-system-id',
  'admin_system',
  'Admin S.',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
)
ON CONFLICT (gamertag) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = now();

-- Ajouter quelques utilisateurs Kolofap supplémentaires pour les tests
INSERT INTO public.kolofap_users (
  id,
  user_id,
  gamertag,
  display_name,
  avatar_url,
  is_active
) VALUES 
(
  'kolofap-john-id',
  'fake-user-john-id',
  'john_doe',
  'John Doe',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
),
(
  'kolofap-sarah-id',
  'fake-user-sarah-id',
  'sarah_k',
  'Sarah Koné',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
),
(
  'kolofap-alex-id',
  'fake-user-alex-id',
  'alex_ci',
  'Alex Kouassi',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
),
(
  'kolofap-fatou-id',
  'fake-user-fatou-id',
  'fatou_ba',
  'Fatou Ba',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
),
(
  'kolofap-pierre-id',
  'fake-user-pierre-id',
  'pierre_ci',
  'Pierre Coulibaly',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
)
ON CONFLICT (gamertag) DO NOTHING;

-- Créer quelques commandes de test
INSERT INTO public.orders (
  id,
  user_id,
  provider_id,
  status,
  total_amount,
  discount_amount,
  final_amount,
  points_used,
  payment_method,
  delivery_address,
  notes,
  estimated_delivery,
  delivered_at,
  created_at
) VALUES 
(
  'test-order-1',
  'test-client-marie-id',
  (SELECT id FROM providers WHERE email = 'prestataire@test.ci' LIMIT 1),
  'delivered',
  5000,
  750,
  4250,
  4250,
  'points',
  'Cocody, Abidjan',
  'Thiéboudiènne complet',
  null,
  now() - interval '1 hour',
  now() - interval '2 hours'
),
(
  'test-order-2',
  'test-client-marie-id',
  (SELECT id FROM providers WHERE email = 'prestataire@test.ci' LIMIT 1),
  'preparing',
  8000,
  1600,
  6400,
  6400,
  'points',
  'Cocody, Abidjan',
  'Menu beauté complet',
  now() + interval '30 minutes',
  null,
  now() - interval '30 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- Créer des articles de commande
INSERT INTO public.order_items (
  id,
  order_id,
  product_id,
  quantity,
  unit_price,
  total_price
) VALUES 
(
  'test-item-1',
  'test-order-1',
  (SELECT id FROM products LIMIT 1),
  1,
  4250,
  4250
),
(
  'test-item-2',
  'test-order-2',
  (SELECT id FROM products LIMIT 1 OFFSET 1),
  1,
  6400,
  6400
)
ON CONFLICT (id) DO NOTHING;

-- Créer des transactions Kolofap de test
INSERT INTO public.points_transactions (
  id,
  sender_id,
  receiver_id,
  amount,
  type,
  status,
  message,
  created_at
) VALUES 
(
  'test-transaction-1',
  'kolofap-marie-id',
  'kolofap-john-id',
  1000,
  'transfer',
  'completed',
  'Merci pour le service',
  now() - interval '30 minutes'
),
(
  'test-transaction-2',
  'kolofap-sarah-id',
  'kolofap-marie-id',
  2500,
  'transfer',
  'completed',
  'Remboursement restaurant',
  now() - interval '1 day'
),
(
  'test-transaction-3',
  'kolofap-marie-id',
  'kolofap-alex-id',
  800,
  'transfer',
  'completed',
  'Partage de frais',
  now() - interval '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- Créer des demandes de points de test
INSERT INTO public.points_requests (
  id,
  requester_id,
  target_id,
  amount,
  message,
  status,
  created_at
) VALUES 
(
  'test-request-1',
  'kolofap-john-id',
  'kolofap-marie-id',
  3000,
  'Demande pour achat groupé',
  'pending',
  now() - interval '30 minutes'
),
(
  'test-request-2',
  'kolofap-marie-id',
  'kolofap-sarah-id',
  1500,
  'Aide pour transport',
  'accepted',
  now() - interval '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- Créer des contacts Kolofap
INSERT INTO public.kolofap_contacts (
  id,
  user_id,
  contact_user_id,
  contact_gamertag,
  contact_display_name,
  is_favorite
) VALUES 
(
  'test-contact-1',
  'kolofap-marie-id',
  'kolofap-john-id',
  'john_doe',
  'John Doe',
  true
),
(
  'test-contact-2',
  'kolofap-marie-id',
  'kolofap-sarah-id',
  'sarah_k',
  'Sarah Koné',
  false
),
(
  'test-contact-3',
  'kolofap-marie-id',
  'kolofap-alex-id',
  'alex_ci',
  'Alex Kouassi',
  true
),
(
  'test-contact-4',
  'kolofap-marie-id',
  'kolofap-fatou-id',
  'fatou_ba',
  'Fatou Ba',
  false
)
ON CONFLICT (user_id, contact_user_id) DO NOTHING;

-- Créer des transactions de points pour l'historique
INSERT INTO public.transactions (
  id,
  user_id,
  type,
  amount,
  points_amount,
  payment_method,
  description,
  created_at
) VALUES 
(
  'test-trans-1',
  'test-client-marie-id',
  'recharge',
  10000,
  20000,
  'mtn_money',
  'Rechargement MTN Mobile Money',
  now() - interval '3 days'
),
(
  'test-trans-2',
  'test-client-marie-id',
  'payment',
  -4250,
  -4250,
  'points',
  'Paiement chez Chez Tante Marie',
  now() - interval '2 hours'
),
(
  'test-trans-3',
  'test-client-marie-id',
  'cashback',
  0,
  10,
  'points',
  'Cashback commande',
  now() - interval '2 hours'
)
ON CONFLICT (id) DO NOTHING;