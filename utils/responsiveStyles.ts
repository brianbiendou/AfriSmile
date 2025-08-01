import { Dimensions, Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Styles responsifs pour l'affichage des montants FCFA et points
 * Résout les problèmes d'affichage sur différents appareils
 */

export const getResponsivePriceStyles = () => {
  const isSmallScreen = screenWidth < 380;
  const isMediumScreen = screenWidth >= 380 && screenWidth < 420;
  
  return {
    // Style pour les prix principaux (FCFA)
    priceText: {
      fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : 16,
      fontWeight: 'bold' as const,
      flexShrink: 0, // Empêche la compression du texte
      minWidth: 'auto' as const,
      textAlign: 'right' as const,
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
    },
    
    // Style pour les prix FCFA avec espace garanti
    fcfaText: {
      fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : 14,
      fontWeight: '600' as const,
      flexShrink: 0, // Empêche la compression
      flexWrap: 'nowrap' as const,
      includeFontPadding: false,
      textAlign: 'right' as const,
    },
    
    // Style pour les prix barrés
    strikethroughText: {
      fontSize: isSmallScreen ? 11 : isMediumScreen ? 12 : 13,
      textDecorationLine: 'line-through' as const,
      flexShrink: 0,
      includeFontPadding: false,
      opacity: 0.7,
    },
    
    // Conteneur pour les prix (évite les coupures)
    priceContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexShrink: 0,
      minWidth: isSmallScreen ? 80 : 90, // Largeur minimale garantie
    },
    
    // Style pour les totaux importants
    totalText: {
      fontSize: isSmallScreen ? 16 : isMediumScreen ? 18 : 20,
      fontWeight: 'bold' as const,
      flexShrink: 0,
      includeFontPadding: false,
      textAlign: 'right' as const,
    },
  };
};

/**
 * Composant Text robuste pour les montants FCFA
 * Gère automatiquement la responsivité et évite les coupures
 */
export const getResponsiveTextProps = (type: 'price' | 'fcfa' | 'strikethrough' | 'total' = 'fcfa') => {
  const styles = getResponsivePriceStyles();
  
  return {
    numberOfLines: 1,
    ellipsizeMode: 'clip' as const, // Coupe proprement si vraiment nécessaire
    adjustsFontSizeToFit: Platform.OS === 'ios', // Ajuste la taille sur iOS si nécessaire
    minimumFontScale: 0.8, // Réduit au maximum de 20% la taille
    style: styles[type === 'price' ? 'priceText' : type === 'strikethrough' ? 'strikethroughText' : type === 'total' ? 'totalText' : 'fcfaText'],
  };
};

/**
 * Utilitaire pour créer des layouts de prix robustes
 */
export const createPriceLayout = () => {
  const styles = getResponsivePriceStyles();
  
  return {
    container: styles.priceContainer,
    text: styles.fcfaText,
  };
};
