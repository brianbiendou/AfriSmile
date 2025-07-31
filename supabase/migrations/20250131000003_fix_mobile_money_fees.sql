-- Ajouter la colonne country_code à la table mobile_money_fees si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mobile_money_fees' 
        AND column_name = 'country_code'
    ) THEN
        ALTER TABLE public.mobile_money_fees 
        ADD COLUMN country_code CHAR(2) DEFAULT 'CI';
    END IF;
END $$;

-- Ajouter une contrainte unique sur provider et country_code si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'mobile_money_fees' 
        AND constraint_name = 'mobile_money_fees_provider_country_code_key'
    ) THEN
        ALTER TABLE public.mobile_money_fees 
        ADD CONSTRAINT mobile_money_fees_provider_country_code_key 
        UNIQUE(provider, country_code);
    END IF;
END $$;

-- Insérer les frais Mobile Money pour la Côte d'Ivoire
INSERT INTO public.mobile_money_fees (
  provider,
  fee_amount,
  country_code,
  is_active
) VALUES 
(
  'MTN',
  175.00,
  'CI',
  true
),
(
  'Orange',
  125.00,
  'CI',
  true
),
(
  'Moov',
  100.00,
  'CI',
  true
)
ON CONFLICT (provider, country_code) DO UPDATE SET
  fee_amount = EXCLUDED.fee_amount,
  is_active = EXCLUDED.is_active,
  updated_at = now();
