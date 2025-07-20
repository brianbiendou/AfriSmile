/**
 * Système de prix centralisé et modulable
 * Toutes les modifications de prix et de conversion doivent se faire ici
 */

// ====================================
// CONFIGURATION CENTRALE DES PRIX
// ====================================

// Taux de conversion (MODIFICATION ICI AFFECTE TOUT LE SYSTÈME)
export const CONVERSION_RATE = {
  FCFA_TO_POINTS: 85.59,  // 1 FCFA = 85.59 points
  POINTS_TO_FCFA: 0.01168  // 1 point = 0.01168 FCFA
};

// ====================================
// PRIX DES PRODUITS EN FCFA (BASE)
// ====================================
export const PRODUCT_PRICES_FCFA = {
  // Cuisine Africaine
  'thiebboudienne': 5000,           // Thiéboudienne
  'riz_sauce_graine': 4500,        // Riz sauce graine
  'foutou_sauce_claire': 4000,     // Foutou sauce claire
  'attieke_poisson': 5000,         // Attiéké poisson
  'poisson_braise': 6000,          // Poisson braisé
  
  // Boissons
  'jus_gingembre': 1500,           // Jus de gingembre
  'bissap': 1000,                  // Bissap
  'eau_mineral': 500,              // Eau minérale
  
  // Desserts
  'salade_fruits': 2500,           // Salade de fruits
  'beignet': 1000,                 // Beignets
  
  // Services Beauté
  'manucure_simple': 3000,         // Manucure simple
  'manucure_francaise': 4000,      // Manucure française
  'coiffure_femme': 8000,          // Coiffure femme
  'coiffure_homme': 3000,          // Coiffure homme
  'maquillage': 10000,             // Maquillage
  
  // Fast Food
  'burger_simple': 2500,           // Burger simple
  'burger_complet': 4000,          // Burger complet
  'pizza_margherita': 6000,        // Pizza Margherita
  'pizza_4_fromages': 8000,        // Pizza 4 fromages
  'frites': 1500,                  // Frites
  
  // Café & Pâtisserie
  'cafe_noir': 1000,               // Café noir
  'cafe_latte': 1500,              // Café latte
  'croissant': 800,                // Croissant
  'pain_chocolat': 1000,           // Pain au chocolat
  'gateau_chocolat': 2500,         // Gâteau au chocolat
  
  // Customizations
  'option_premium': 500,           // Options premium
  'extra_sauce': 200,              // Sauce supplémentaire
  'extra_legumes': 300,            // Légumes supplémentaires
  'portion_double': 1000,          // Portion double
};

// ====================================
// FONCTIONS DE CONVERSION
// ====================================

/**
 * Convertit un prix FCFA en points
 */
export const fcfaToPoints = (fcfaPrice: number): number => {
  return Math.round(fcfaPrice * CONVERSION_RATE.FCFA_TO_POINTS);
};

/**
 * Convertit des points en FCFA
 */
export const pointsToFcfa = (points: number): number => {
  return Math.round(points * CONVERSION_RATE.POINTS_TO_FCFA);
};

/**
 * Obtient le prix en FCFA pour un produit
 */
export const getProductPriceFcfa = (productKey: string): number => {
  return PRODUCT_PRICES_FCFA[productKey as keyof typeof PRODUCT_PRICES_FCFA] || 0;
};

/**
 * Obtient le prix en points pour un produit
 */
export const getProductPricePoints = (productKey: string): number => {
  const fcfaPrice = getProductPriceFcfa(productKey);
  return fcfaToPoints(fcfaPrice);
};

/**
 * Retourne un objet avec les deux prix (FCFA et points)
 */
export const getProductPrices = (productKey: string) => {
  const fcfaPrice = getProductPriceFcfa(productKey);
  const pointsPrice = fcfaToPoints(fcfaPrice);
  
  return {
    fcfa: fcfaPrice,
    points: pointsPrice,
    fcfaFormatted: `${fcfaPrice.toLocaleString()} FCFA`,
    pointsFormatted: `${pointsPrice.toLocaleString()} pts`
  };
};

// ====================================
// FORMATAGE ET AFFICHAGE
// ====================================

/**
 * Formate les points avec leur équivalent FCFA
 */
export const formatPointsWithFcfa = (points: number): string => {
  const fcfa = pointsToFcfa(points);
  return `${points.toLocaleString()} pts (${fcfa.toLocaleString()} FCFA)`;
};

/**
 * Formate un prix FCFA barré avec le prix en points
 */
export const formatProductPrice = (productKey: string) => {
  const prices = getProductPrices(productKey);
  return {
    originalPrice: prices.fcfaFormatted,    // Prix barré en FCFA
    currentPrice: prices.pointsFormatted,   // Prix en vert en points
    fcfaValue: prices.fcfa,
    pointsValue: prices.points
  };
};

// ====================================
// DONNÉES DES PRODUITS AVEC PRIX
// ====================================

export const PRODUCTS_WITH_PRICES = [
  // Cuisine Africaine
  {
    id: '1',
    name: 'Thiéboudienne',
    key: 'thiebboudienne',
    description: 'Riz au poisson, légumes et sauce tomate',
    category: 'Plats principaux',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    popular: true,
    ...getProductPrices('thiebboudienne')
  },
  {
    id: '2',
    name: 'Riz sauce graine',
    key: 'riz_sauce_graine',
    description: 'Riz accompagné de sauce graine traditionnelle',
    category: 'Plats principaux',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    popular: true,
    ...getProductPrices('riz_sauce_graine')
  },
  {
    id: '3',
    name: 'Attiéké Poisson',
    key: 'attieke_poisson',
    description: 'Attiéké accompagné de poisson grillé',
    category: 'Plats principaux',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    popular: true,
    ...getProductPrices('attieke_poisson')
  },
  {
    id: '4',
    name: 'Jus de gingembre frais',
    key: 'jus_gingembre',
    description: 'Boisson rafraîchissante au gingembre',
    category: 'Boissons',
    image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    popular: false,
    ...getProductPrices('jus_gingembre')
  },
  {
    id: '5',
    name: 'Salade de fruits tropicaux',
    key: 'salade_fruits',
    description: 'Mélange de fruits frais de saison',
    category: 'Desserts',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg',
    popular: true,
    ...getProductPrices('salade_fruits')
  },
  {
    id: '6',
    name: 'Poisson braisé',
    key: 'poisson_braise',
    description: 'Poisson frais grillé aux épices',
    category: 'Plats principaux',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    popular: true,
    ...getProductPrices('poisson_braise')
  },
  
  // Services Beauté
  {
    id: '7',
    name: 'Manucure Simple',
    key: 'manucure_simple',
    description: 'Manucure classique avec vernis',
    category: 'Beauté',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
    popular: true,
    ...getProductPrices('manucure_simple')
  },
  {
    id: '8',
    name: 'Manucure Française',
    key: 'manucure_francaise',
    description: 'Manucure française classique',
    category: 'Beauté',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
    popular: true,
    ...getProductPrices('manucure_francaise')
  },
  {
    id: '9',
    name: 'Coiffure Femme',
    key: 'coiffure_femme',
    description: 'Coiffure et brushing pour femme',
    category: 'Beauté',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
    popular: true,
    ...getProductPrices('coiffure_femme')
  },
  
  // Fast Food
  {
    id: '10',
    name: 'Burger Complet',
    key: 'burger_complet',
    description: 'Burger avec steak, salade, tomate, fromage',
    category: 'Fast Food',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    popular: true,
    ...getProductPrices('burger_complet')
  },
  {
    id: '11',
    name: 'Pizza Margherita',
    key: 'pizza_margherita',
    description: 'Pizza classique tomate, mozzarella, basilic',
    category: 'Fast Food',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    popular: true,
    ...getProductPrices('pizza_margherita')
  },
  
  // Café & Pâtisserie
  {
    id: '12',
    name: 'Café Latte',
    key: 'cafe_latte',
    description: 'Café au lait crémeux',
    category: 'Café',
    image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    popular: true,
    ...getProductPrices('cafe_latte')
  },
  {
    id: '13',
    name: 'Gâteau au chocolat',
    key: 'gateau_chocolat',
    description: 'Délicieux gâteau au chocolat fait maison',
    category: 'Desserts',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg',
    popular: true,
    ...getProductPrices('gateau_chocolat')
  }
];

// ====================================
// EXPORT POUR UTILISATION GLOBALE
// ====================================

export default {
  CONVERSION_RATE,
  PRODUCT_PRICES_FCFA,
  fcfaToPoints,
  pointsToFcfa,
  getProductPriceFcfa,
  getProductPricePoints,
  getProductPrices,
  formatPointsWithFcfa,
  formatProductPrice,
  PRODUCTS_WITH_PRICES
};
