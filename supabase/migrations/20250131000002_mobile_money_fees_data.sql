-- Créer la table des frais Mobile Money
CREATE TABLE IF NOT EXISTS public.mobile_money_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL,
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_amount DECIMAL(10,2) DEFAULT 999999999,
  fee_amount DECIMAL(10,2) NOT NULL,
  country_code CHAR(2) DEFAULT 'CI',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Contrainte unique sur provider et country_code
  UNIQUE(provider, country_code)
);

-- Activer RLS sur la table
ALTER TABLE public.mobile_money_fees ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Mobile Money fees sont lisibles par tous" ON public.mobile_money_fees
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre la modification aux admins seulement
CREATE POLICY "Mobile Money fees modifiables par admins" ON public.mobile_money_fees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insérer les frais Mobile Money pour la Côte d'Ivoire
INSERT INTO public.mobile_money_fees (
  id,
  provider,
  min_amount,
  max_amount,
  fee_amount,
  country_code,
  is_active
) VALUES 
(
  gen_random_uuid(),
  'MTN',
  0,
  999999999,
  175.00,
  'CI',
  true
),
(
  gen_random_uuid(),
  'Orange',
  0,
  999999999,
  125.00,
  'CI',
  true
),
(
  gen_random_uuid(),
  'Moov',
  0,
  999999999,
  100.00,
  'CI',
  true
)
ON CONFLICT (provider, country_code) DO UPDATE SET
  fee_amount = EXCLUDED.fee_amount,
  is_active = EXCLUDED.is_active,
  updated_at = now();
