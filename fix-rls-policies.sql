-- Script pour vérifier et corriger les politiques RLS
-- Exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les politiques existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 2. Supprimer les anciennes politiques restrictives (si nécessaire)
-- DROP POLICY IF EXISTS "Users can only view own data" ON users;
-- DROP POLICY IF EXISTS "Users can only insert own data" ON users;

-- 3. Créer une politique permettant l'auto-inscription
CREATE POLICY "Allow public user registration" ON users
FOR INSERT 
TO public
WITH CHECK (true);

-- 4. Politique pour que les utilisateurs voient leurs propres données
CREATE POLICY "Users can view own data" ON users
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 5. Politique pour que les utilisateurs mettent à jour leurs propres données
CREATE POLICY "Users can update own data" ON users
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Vérifier que RLS est activé
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
