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

-- Insérer les utilisateurs de test (seulement s'ils n'existent pas déjà)
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
  'a1b2c3d4-5e6f-7a8b-9c0d-123456789abc',
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
  'b2c3d4e5-6f7a-8b9c-0d1e-23456789abcd',
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
ON CONFLICT (email) DO NOTHING;

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
  'c3d4e5f6-7a8b-9c0d-1e2f-3456789abcde',
  'a1b2c3d4-5e6f-7a8b-9c0d-123456789abc',
  'marie_gamer',
  'Marie K.',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
),
(
  'd4e5f6a7-8b9c-0d1e-2f3a-456789abcdef',
  'b2c3d4e5-6f7a-8b9c-0d1e-23456789abcd',
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
  'e5f6a7b8-9c0d-1e2f-3a4b-56789abcdef0',
  'f6a7b8c9-0d1e-2f3a-4b5c-6789abcdef01',
  'john_doe',
  'John Doe',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
),
(
  'a7b8c9d0-1e2f-3a4b-5c6d-789abcdef012',
  'b8c9d0e1-2f3a-4b5c-6d7e-89abcdef0123',
  'sarah_k',
  'Sarah Koné',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
),
(
  'c9d0e1f2-3a4b-5c6d-7e8f-9abcdef01234',
  'd0e1f2a3-4b5c-6d7e-8f9a-bcdef0123456',
  'alex_ci',
  'Alex Kouassi',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
),
(
  'e1f2a3b4-5c6d-7e8f-9ab0-cdef01234567',
  'f2a3b4c5-6d7e-8f9a-b0c1-def012345678',
  'fatou_ba',
  'Fatou Ba',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  true
),
(
  'a3b4c5d6-7e8f-9ab0-c1d2-ef0123456789',
  'b4c5d6e7-8f9a-b0c1-d2e3-f01234567890',
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
  'c5d6e7f8-9ab0-c1d2-e3f4-123456789abc',
  'a1b2c3d4-5e6f-7a8b-9c0d-123456789abc',
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
  'd6e7f8a9-b0c1-d2e3-f4a5-23456789abcd',
  'a1b2c3d4-5e6f-7a8b-9c0d-123456789abc',
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
  'e7f8a9b0-c1d2-e3f4-a5b6-3456789abcde',
  'c5d6e7f8-9ab0-c1d2-e3f4-123456789abc',
  (SELECT id FROM products LIMIT 1),
  1,
  4250,
  4250
),
(
  'f8a9b0c1-d2e3-f4a5-b6c7-456789abcdef',
  'd6e7f8a9-b0c1-d2e3-f4a5-23456789abcd',
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
  'a9b0c1d2-e3f4-a5b6-c7d8-56789abcdef0',
  'c3d4e5f6-7a8b-9c0d-1e2f-3456789abcde',
  'e5f6a7b8-9c0d-1e2f-3a4b-56789abcdef0',
  1000,
  'transfer',
  'completed',
  'Merci pour le service',
  now() - interval '30 minutes'
),
(
  'b0c1d2e3-f4a5-b6c7-d8e9-6789abcdef01',
  'a7b8c9d0-1e2f-3a4b-5c6d-789abcdef012',
  'c3d4e5f6-7a8b-9c0d-1e2f-3456789abcde',
  2500,
  'transfer',
  'completed',
  'Remboursement restaurant',
  now() - interval '1 day'
),
(
  'c1d2e3f4-a5b6-c7d8-e9f0-789abcdef012',
  'c3d4e5f6-7a8b-9c0d-1e2f-3456789abcde',
  'c9d0e1f2-3a4b-5c6d-7e8f-9abcdef01234',
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
  'd2e3f4a5-b6c7-d8e9-f0a1-89abcdef0123',
  'e5f6a7b8-9c0d-1e2f-3a4b-56789abcdef0',
  'c3d4e5f6-7a8b-9c0d-1e2f-3456789abcde',
  3000,
  'Demande pour achat groupé',
  'pending',
  now() - interval '30 minutes'
),
(
  'e3f4a5b6-c7d8-e9f0-a1b2-9abcdef01234',
  'c3d4e5f6-7a8b-9c0d-1e2f-3456789abcde',
  'a7b8c9d0-1e2f-3a4b-5c6d-789abcdef012',
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
  'f4a5b6c7-d8e9-f0a1-b2c3-abcdef012345',
  'c3d4e5f6-7a8b-9c0d-1e2f-3456789abcde',
  'e5f6a7b8-9c0d-1e2f-3a4b-56789abcdef0',
  'john_doe',
  'John Doe',
  true
),
(
  'a5b6c7d8-e9f0-a1b2-c3d4-bcdef0123456',
  'c3d4e5f6-7a8b-9c0d-1e2f-3456789abcde',
  'a7b8c9d0-1e2f-3a4b-5c6d-789abcdef012',
  'sarah_k',
  'Sarah Koné',
  false
),
(
  'b6c7d8e9-f0a1-b2c3-d4e5-cdef01234567',
  'c3d4e5f6-7a8b-9c0d-1e2f-3456789abcde',
  'c9d0e1f2-3a4b-5c6d-7e8f-9abcdef01234',
  'alex_ci',
  'Alex Kouassi',
  true
),
(
  'c7d8e9f0-a1b2-c3d4-e5f6-def012345678',
  'c3d4e5f6-7a8b-9c0d-1e2f-3456789abcde',
  'e1f2a3b4-5c6d-7e8f-9ab0-cdef01234567',
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
  'd8e9f0a1-b2c3-d4e5-f6a7-ef0123456789',
  'a1b2c3d4-5e6f-7a8b-9c0d-123456789abc',
  'recharge',
  10000,
  20000,
  'mtn_money',
  'Rechargement MTN Mobile Money',
  now() - interval '3 days'
),
(
  'e9f0a1b2-c3d4-e5f6-a7b8-f012345678ab',
  'a1b2c3d4-5e6f-7a8b-9c0d-123456789abc',
  'payment',
  -4250,
  -4250,
  'points',
  'Paiement chez Chez Tante Marie',
  now() - interval '2 hours'
),
(
  'f0a1b2c3-d4e5-f6a7-b8c9-0123456789bc',
  'a1b2c3d4-5e6f-7a8b-9c0d-123456789abc',
  'cashback',
  0,
  10,
  'points',
  'Cashback commande',
  now() - interval '2 hours'
)
ON CONFLICT (id) DO NOTHING;