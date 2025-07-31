-- Réinsertion des frais Mobile Money pour être sûr
INSERT INTO mobile_money_fees (provider, provider_name, fee_amount, min_amount, max_amount) VALUES
('mtn', 'MTN Mobile Money', 175.00, 1.00, 1000000.00),
('orange', 'Orange Money', 125.00, 1.00, 1000000.00),
('moov', 'Moov Money', 100.00, 1.00, 1000000.00)
ON CONFLICT (provider) DO UPDATE SET
  fee_amount = EXCLUDED.fee_amount,
  provider_name = EXCLUDED.provider_name,
  updated_at = NOW();
