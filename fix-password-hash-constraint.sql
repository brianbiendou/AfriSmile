-- =========================================
-- CORRECTION DE LA CONTRAINTE PASSWORD_HASH
-- =========================================

-- Option 1: Rendre password_hash nullable (RECOMMANDÉ)
-- Car Supabase Auth gère déjà les mots de passe
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Option 2: Supprimer complètement la colonne password_hash (Alternative)
-- ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Vérifier la structure de la table après modification
\d users;
