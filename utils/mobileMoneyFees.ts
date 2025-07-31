import { supabase } from '../lib/supabase';

export interface MobileMoneyFee {
  id: string;
  provider: 'mtn' | 'orange' | 'moov';
  provider_name: string;
  fee_amount: number;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Récupère tous les frais Mobile Money actifs
 */
export const getMobileMoneyFees = async (): Promise<MobileMoneyFee[]> => {
  try {
    const { data, error } = await supabase
      .from('mobile_money_fees')
      .select('*')
      .eq('is_active', true)
      .order('provider');

    if (error) {
      console.error('Erreur lors de la récupération des frais Mobile Money:', error);
      // Retourner les frais par défaut en cas d'erreur
      return getDefaultFees();
    }

    return data || getDefaultFees();
  } catch (error) {
    console.error('Erreur lors de la récupération des frais Mobile Money:', error);
    return getDefaultFees();
  }
};

/**
 * Récupère les frais pour un provider spécifique
 */
export const getFeeByProvider = async (provider: 'mtn' | 'orange' | 'moov'): Promise<number> => {
  // En mode développement, utiliser directement les valeurs par défaut
  if (__DEV__) {
    return getDefaultFeeByProvider(provider);
  }

  try {
    const { data, error } = await supabase
      .from('mobile_money_fees')
      .select('fee_amount')
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.warn(`Frais non trouvés pour ${provider}, utilisation des valeurs par défaut`);
      return getDefaultFeeByProvider(provider);
    }

    return data.fee_amount;
  } catch (error) {
    console.error(`Erreur lors de la récupération des frais pour ${provider}:`, error);
    return getDefaultFeeByProvider(provider);
  }
};

/**
 * Met à jour les frais pour un provider (fonction admin)
 */
export const updateMobileMoneyFee = async (
  provider: 'mtn' | 'orange' | 'moov',
  feeAmount: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('mobile_money_fees')
      .update({ fee_amount: feeAmount })
      .eq('provider', provider);

    if (error) {
      console.error(`Erreur lors de la mise à jour des frais pour ${provider}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des frais pour ${provider}:`, error);
    return false;
  }
};

/**
 * Crée un nouveau provider de frais (fonction admin)
 */
export const createMobileMoneyFee = async (
  provider: 'mtn' | 'orange' | 'moov',
  providerName: string,
  feeAmount: number,
  minAmount: number = 1.00,
  maxAmount: number = 1000000.00
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('mobile_money_fees')
      .insert([{
        provider,
        provider_name: providerName,
        fee_amount: feeAmount,
        min_amount: minAmount,
        max_amount: maxAmount,
        is_active: true
      }]);

    if (error) {
      console.error(`Erreur lors de la création des frais pour ${provider}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Erreur lors de la création des frais pour ${provider}:`, error);
    return false;
  }
};

/**
 * Valeurs par défaut en cas d'erreur de base de données
 */
const getDefaultFees = (): MobileMoneyFee[] => {
  return [
    {
      id: 'default-mtn',
      provider: 'mtn',
      provider_name: 'MTN Mobile Money',
      fee_amount: 175.00,
      min_amount: 1.00,
      max_amount: 1000000.00,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'default-orange',
      provider: 'orange',
      provider_name: 'Orange Money',
      fee_amount: 125.00,
      min_amount: 1.00,
      max_amount: 1000000.00,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'default-moov',
      provider: 'moov',
      provider_name: 'Moov Money',
      fee_amount: 100.00,
      min_amount: 1.00,
      max_amount: 1000000.00,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

/**
 * Frais par défaut par provider
 */
const getDefaultFeeByProvider = (provider: 'mtn' | 'orange' | 'moov'): number => {
  const defaultFees = {
    mtn: 175.00,
    orange: 125.00,
    moov: 100.00
  };
  return defaultFees[provider];
};

/**
 * Formate l'affichage des frais
 */
export const formatFee = (amount: number): string => {
  return `+${amount.toFixed(0)} FCFA de frais`;
};

/**
 * Calcule le total avec frais
 */
export const calculateTotalWithFees = (amount: number, provider: 'mtn' | 'orange' | 'moov'): Promise<number> => {
  return getFeeByProvider(provider).then(fee => amount + fee);
};
