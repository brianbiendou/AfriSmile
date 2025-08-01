-- =========================================
-- CORRECTION DES POLITIQUES RLS POUR L'INSCRIPTION
-- =========================================

-- 1. Vérifier l'état actuel des politiques
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'providers');

-- 2. Supprimer les politiques restrictives existantes
DROP POLICY IF EXISTS "Users can only view own data" ON users;
DROP POLICY IF EXISTS "Users can only insert own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;

-- 3. Créer les nouvelles politiques pour la table users
-- Politique pour permettre l'inscription publique
CREATE POLICY "Allow public user registration" ON users
FOR INSERT 
TO public
WITH CHECK (true);

-- Politique pour que les utilisateurs voient leurs propres données
CREATE POLICY "Users can view own data" ON users
FOR SELECT 
TO authenticated
USING (auth.uid() = id::uuid);

-- Politique pour que les utilisateurs mettent à jour leurs propres données
CREATE POLICY "Users can update own data" ON users
FOR UPDATE 
TO authenticated
USING (auth.uid() = id::uuid)
WITH CHECK (auth.uid() = id::uuid);

-- 4. Vérifier/corriger les politiques pour la table providers
DROP POLICY IF EXISTS "Providers can only view own data" ON providers;
DROP POLICY IF EXISTS "Providers can only insert own data" ON providers;

-- Politique pour permettre l'inscription des prestataires
CREATE POLICY "Allow public provider registration" ON providers
FOR INSERT 
TO public
WITH CHECK (true);

-- Politique pour que les prestataires voient leurs propres données
CREATE POLICY "Providers can view own data" ON providers
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id::uuid);

-- Politique pour que les prestataires mettent à jour leurs propres données
CREATE POLICY "Providers can update own data" ON providers
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id::uuid)
WITH CHECK (auth.uid() = user_id::uuid);

-- 5. S'assurer que RLS est activé
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- 6. Vérifier les nouvelles politiques
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename IN ('users', 'providers')
ORDER BY tablename, cmd;
