/*
  # Création des tables pour Kolofap - Système de transfert de points

  1. Nouvelles Tables
    - `kolofap_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key vers users)
      - `gamertag` (text, unique)
      - `display_name` (text)
      - `avatar_url` (text, optionnel)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `points_transactions`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key vers kolofap_users)
      - `receiver_id` (uuid, foreign key vers kolofap_users)
      - `amount` (integer)
      - `type` (enum: transfer, request, payment)
      - `status` (enum: pending, completed, cancelled, rejected)
      - `message` (text, optionnel)
      - `reference` (text, optionnel)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `points_requests`
      - `id` (uuid, primary key)
      - `requester_id` (uuid, foreign key vers kolofap_users)
      - `target_id` (uuid, foreign key vers kolofap_users)
      - `amount` (integer)
      - `message` (text, optionnel)
      - `status` (enum: pending, accepted, rejected, cancelled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `kolofap_contacts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key vers kolofap_users)
      - `contact_user_id` (uuid, foreign key vers kolofap_users)
      - `contact_gamertag` (text)
      - `contact_display_name` (text)
      - `is_favorite` (boolean)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques pour que les utilisateurs ne voient que leurs propres données
    - Politiques pour les transactions entre utilisateurs

  3. Fonctions
    - Fonction pour mettre à jour updated_at automatiquement
    - Triggers pour les timestamps
*/

-- Types énumérés pour Kolofap
CREATE TYPE transaction_type_kolofap AS ENUM ('transfer', 'request', 'payment');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'rejected');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- Table des utilisateurs Kolofap
CREATE TABLE IF NOT EXISTS kolofap_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  gamertag text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des transactions de points
CREATE TABLE IF NOT EXISTS points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES kolofap_users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES kolofap_users(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  type transaction_type_kolofap NOT NULL,
  status transaction_status DEFAULT 'pending',
  message text,
  reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des demandes de points
CREATE TABLE IF NOT EXISTS points_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES kolofap_users(id) ON DELETE CASCADE,
  target_id uuid REFERENCES kolofap_users(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  message text,
  status request_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des contacts Kolofap
CREATE TABLE IF NOT EXISTS kolofap_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES kolofap_users(id) ON DELETE CASCADE,
  contact_user_id uuid REFERENCES kolofap_users(id) ON DELETE CASCADE,
  contact_gamertag text NOT NULL,
  contact_display_name text NOT NULL,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, contact_user_id)
);

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_kolofap_users_user_id ON kolofap_users(user_id);
CREATE INDEX IF NOT EXISTS idx_kolofap_users_gamertag ON kolofap_users(gamertag);
CREATE INDEX IF NOT EXISTS idx_points_transactions_sender ON points_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_receiver ON points_transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_requests_requester ON points_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_points_requests_target ON points_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_kolofap_contacts_user ON kolofap_contacts(user_id);

-- Enable RLS
ALTER TABLE kolofap_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE kolofap_contacts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour kolofap_users
CREATE POLICY "Users can read own kolofap profile"
  ON kolofap_users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own kolofap profile"
  ON kolofap_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create kolofap profile"
  ON kolofap_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can search other kolofap users"
  ON kolofap_users
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Politiques RLS pour points_transactions
CREATE POLICY "Users can read own transactions"
  ON points_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kolofap_users 
      WHERE (id = sender_id OR id = receiver_id) 
      AND user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create transactions as sender"
  ON points_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kolofap_users 
      WHERE id = sender_id 
      AND user_id::text = auth.uid()::text
    )
  );

-- Politiques RLS pour points_requests
CREATE POLICY "Users can read own requests"
  ON points_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kolofap_users 
      WHERE (id = requester_id OR id = target_id) 
      AND user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create requests"
  ON points_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kolofap_users 
      WHERE id = requester_id 
      AND user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update requests they received"
  ON points_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kolofap_users 
      WHERE id = target_id 
      AND user_id::text = auth.uid()::text
    )
  );

-- Politiques RLS pour kolofap_contacts
CREATE POLICY "Users can manage own contacts"
  ON kolofap_contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kolofap_users 
      WHERE id = user_id 
      AND user_id::text = auth.uid()::text
    )
  );

-- Triggers pour updated_at
CREATE TRIGGER update_kolofap_users_updated_at
  BEFORE UPDATE ON kolofap_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_points_transactions_updated_at
  BEFORE UPDATE ON points_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_points_requests_updated_at
  BEFORE UPDATE ON points_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();