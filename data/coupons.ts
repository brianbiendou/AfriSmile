// Données pour les coupons de réduction
export interface Coupon {
  code: string;
  description: string;
  discount: number; // Pourcentage de réduction
  expiryDate: string;
  minPurchase?: number; // Achat minimum en points pour appliquer le coupon
  maxDiscount?: number; // Montant maximum de la réduction en points
  requiresPremium?: boolean; // Indique si l'abonnement premium est requis pour ce coupon
  minUserPoints?: number; // Points minimum consommés par l'utilisateur pour accéder à ce coupon
}

// Liste des coupons disponibles
export const availableCoupons: Coupon[] = [
  // Coupons de base (5%) - accessibles à tous les utilisateurs
  {
    code: 'BASIC5',
    description: 'Réduction immédiate de 5% sur votre commande',
    discount: 5,
    expiryDate: '2025-12-31',
  },
  {
    code: 'WELCOME5',
    description: 'Code de bienvenue avec 5% de réduction',
    discount: 5,
    expiryDate: '2025-12-31',
    minPurchase: 10,
  },
  
  // Coupons intermédiaires (10%) - pour utilisateurs ayant consommé 60 points ou plus
  {
    code: 'FIDELE10',
    description: 'Réduction de 10% pour clients fidèles',
    discount: 10,
    expiryDate: '2025-09-15',
    minUserPoints: 60,
  },
  
  // Coupons premium supérieurs (20% et 25%) - requiert un panier > 100 points ET un abonnement premium
  {
    code: 'PREMIUM20',
    description: 'Réduction premium exclusive de 20%',
    discount: 20,
    expiryDate: '2025-08-30',
    minPurchase: 100,
    requiresPremium: true,
  },
  {
    code: 'FIDELITE',
    description: 'Code de fidélité pour les clients réguliers',
    discount: 25,
    expiryDate: '2025-10-30',
    minPurchase: 60,
  },
  {
    code: 'PROMO5',
    description: 'Réduction de 5% sur tout le panier',
    discount: 5,
    expiryDate: '2025-12-31',
    minPurchase: 0,
  },
  {
    code: 'PREMIUM10',
    description: 'Réduction de 10% pour les membres Premium',
    discount: 10,
    expiryDate: '2025-12-31',
    minPurchase: 0,
    requiresPremium: true,
  }
];

/**
 * Vérifie si un coupon est valide
 * @param code Code du coupon
 * @param totalPoints Total des points de la commande
 * @param userTotalPoints Points totaux consommés par l'utilisateur (pour les coupons de fidélité)
 * @param isPremium Indique si l'utilisateur est premium
 * @returns Le coupon s'il est valide, null sinon
 */
export const validateCoupon = (
  code: string,
  totalPoints: number,
  userTotalPoints: number = 0,
  isPremium: boolean = false
): Coupon | null => {
  const coupon = availableCoupons.find(c => c.code === code.toUpperCase());
  
  // Vérifier si le coupon existe
  if (!coupon) return null;
  
  // Vérifier la date d'expiration
  if (new Date() > new Date(coupon.expiryDate)) return null;
  
  // Vérifier le montant d'achat minimum
  if (coupon.minPurchase && totalPoints < coupon.minPurchase) return null;
  
  // Vérifier si l'utilisateur a consommé suffisamment de points pour ce coupon
  if (coupon.minUserPoints && userTotalPoints < coupon.minUserPoints) return null;
  
  // Vérifier si l'utilisateur est premium si requis
  if (coupon.requiresPremium && !isPremium) return null;
  
  return coupon;
};

/**
 * Calcule le montant de la réduction
 * @param coupon Coupon à appliquer
 * @param originalPrice Prix original en points
 * @returns Montant de la réduction en points
 */
export const calculateDiscount = (coupon: Coupon, originalPrice: number): number => {
  const discountAmount = originalPrice * (coupon.discount / 100);
  
  // Appliquer le plafond de réduction si défini
  if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
    return coupon.maxDiscount;
  }
  
  return discountAmount;
};
