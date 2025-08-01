// Utilitaires de conversion points ↔ FCFA
// Nouveau système : 1 point = 78.359 FCFA | 1 FCFA = 0.01276 points

export const POINTS_TO_FCFA_RATE = 78.359; // 1 point = 78.359 FCFA
export const FCFA_TO_POINTS_RATE = 1 / 78.359; // 1 FCFA = 0.01276 points

/**
 * Convertit les points en FCFA
 * @param points Nombre de points
 * @returns Montant en FCFA (arrondi à 2 décimales)
 */
export const pointsToFcfa = (points: number): number => {
  return Math.round(points * POINTS_TO_FCFA_RATE * 100) / 100;
};

/**
 * Convertit les FCFA en points
 * @param fcfa Montant en FCFA
 * @returns Nombre de points (arrondi à l'entier)
 */
export const fcfaToPoints = (fcfa: number): number => {
  return Math.round(fcfa * FCFA_TO_POINTS_RATE);
};

/**
 * Formate les points avec l'équivalent FCFA (UNIQUEMENT pour le portefeuille)
 * @param points Nombre de points
 * @returns String formatée "X points (Y FCFA)"
 */
export const formatPointsWithFcfa = (points: number): string => {
  const fcfa = pointsToFcfa(points);
  return `${points.toLocaleString()} pts (${fcfa.toLocaleString()} FCFA)`;
};

/**
 * Formate les points sans équivalent FCFA (pour l'affichage général)
 * @param points Nombre de points
 * @returns String formatée "X pts"
 */
export const formatPoints = (points: number): string => {
  return `${points.toLocaleString()} pts`;
};

/**
 * Formate les FCFA avec l'équivalent points
 * @param fcfa Montant en FCFA
 * @returns String formatée "X FCFA (Y points)"
 */
export const formatFcfaWithPoints = (fcfa: number): string => {
  const points = fcfaToPoints(fcfa);
  return `${fcfa.toLocaleString()} FCFA (${points.toLocaleString()} pts)`;
};

/**
 * Calcule le cashback en points (1% du montant de la commande, minimum 1 FCFA)
 * @param orderAmount Montant de la commande en points
 * @returns Nombre de points de cashback
 */
export const calculateCashback = (orderAmount: number): number => {
  const fcfaAmount = pointsToFcfa(orderAmount);
  const cashbackFcfa = Math.max(fcfaAmount * 0.01, 1.0); // 1% minimum 1 FCFA
  return fcfaToPoints(cashbackFcfa);
};

/**
 * Calcule les frais Mobile Money selon le provider
 * @param provider Provider de Mobile Money ('mtn', 'orange', 'moov')
 * @returns Promise avec les frais en FCFA
 * @deprecated Utiliser getFeeByProvider de mobileMoneyFees.ts à la place
 */
export const getMobileMoneyFees = async (provider: 'mtn' | 'orange' | 'moov'): Promise<number> => {
  // Import dynamique pour éviter les dépendances circulaires
  const { getFeeByProvider } = await import('./mobileMoneyFees');
  return getFeeByProvider(provider);
};

/**
 * Valide qu'un montant de rechargement est valide
 * @param fcfaAmount Montant en FCFA
 * @returns true si valide, false sinon
 */
export const isValidRechargeAmount = (fcfaAmount: number): boolean => {
  return fcfaAmount >= 1000; // Minimum 1,000 FCFA
};

/**
 * Calcule la réduction en FCFA basée sur un pourcentage
 * @param originalPrice Prix original en points
 * @param discountPercentage Pourcentage de réduction
 * @returns Montant de la réduction en FCFA
 */
export const calculateDiscountAmount = (originalPrice: number, discountPercentage: number): number => {
  const originalFcfa = pointsToFcfa(originalPrice);
  return Math.round(originalFcfa * (discountPercentage / 100));
};

/**
 * Génère des économies aléatoires pour l'affichage des cartes prestataires
 * @param discountPercentage Pourcentage de réduction du prestataire
 * @returns Montant d'économies en FCFA
 */
export const generateSavingsAmount = (discountPercentage: number): number => {
  const minAmount = 1000;
  const maxAmount = 6000;
  const randomAmount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
  const adjustedAmount = Math.floor(randomAmount * (discountPercentage / 20));
  return Math.floor(adjustedAmount / 10) * 10; // Arrondir à la dizaine
};

/**
 * Formate un montant FCFA de manière robuste pour éviter les problèmes d'affichage
 * Utilise un espace insécable entre le montant et FCFA pour éviter les coupures
 * @param amount Montant en FCFA
 * @returns String formatée avec espace insécable "X.XXX FCFA"
 */
export const formatFcfaAmount = (amount: number): string => {
  // Utilisation d'un espace insécable (\u00A0) pour éviter les coupures de ligne
  return `${amount.toLocaleString()}\u00A0FCFA`;
};

/**
 * Formate un montant points de manière robuste
 * @param points Nombre de points
 * @returns String formatée avec espace insécable "X pts"
 */
export const formatPointsAmount = (points: number): string => {
  // Utilisation d'un espace insécable (\u00A0) pour éviter les coupures de ligne
  return `${points.toLocaleString()}\u00A0pts`;
};

/**
 * Formate les points avec l'équivalent FCFA de manière robuse (UNIQUEMENT pour le portefeuille)
 * @param points Nombre de points
 * @returns String formatée avec espaces insécables
 */
export const formatPointsWithFcfaRobust = (points: number): string => {
  const fcfa = pointsToFcfa(points);
  return `${points.toLocaleString()}\u00A0pts\u00A0(${fcfa.toLocaleString()}\u00A0FCFA)`;
};