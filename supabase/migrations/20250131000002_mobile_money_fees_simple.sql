-- Simple insertion des frais Mobile Money dans la table existante
-- (en supposant que la structure de table est définie dans la migration principale)

-- Vider d'abord la table si elle existe
DELETE FROM public.mobile_money_fees WHERE provider IN ('MTN', 'Orange', 'Moov');

-- Insérer les frais Mobile Money pour la Côte d'Ivoire
INSERT INTO public.mobile_money_fees (
  provider_name,
  fee_amount,
  is_active
) VALUES 
(
  'MTN',
  175.00,
  true
),
(
  'Orange',
  125.00,
  true
),
(
  'Moov',
  100.00,
  true
);
