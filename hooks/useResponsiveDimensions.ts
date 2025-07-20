import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ResponsiveDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  isLargeScreen: boolean;
  isTablet: boolean;
  isSamsungS23Ultra: boolean;
}

export const useResponsiveDimensions = (): ResponsiveDimensions => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result: { window: ScaledSize; screen: ScaledSize }) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const { width, height } = screenData;
  const aspectRatio = height / width;
  
  // Détection des types d'écrans
  const isLargeScreen = width > 400;
  const isTablet = width >= 768;
  const isSamsungS23Ultra = width > 380 && width < 420 && aspectRatio > 2.1;

  return {
    width,
    height,
    aspectRatio,
    isLargeScreen,
    isTablet,
    isSamsungS23Ultra,
  };
};

// Hook pour styles de modal responsifs
export const useResponsiveModalStyles = () => {
  const dimensions = useResponsiveDimensions();
  const { isLargeScreen, isTablet, isSamsungS23Ultra, height } = dimensions;
  
  // Déterminer les styles en fonction de la taille d'écran
  const modalWidth = isTablet ? '70%' : (isLargeScreen || isSamsungS23Ultra) ? '85%' : '95%';
  const modalMaxWidth = isTablet ? 600 : (isLargeScreen || isSamsungS23Ultra) ? 450 : 400;
  const modalPadding = isTablet ? 28 : (isLargeScreen || isSamsungS23Ultra) ? 24 : 20;
  const modalBorderRadius = isTablet ? 28 : (isLargeScreen || isSamsungS23Ultra) ? 24 : 20;
  const titleFontSize = isTablet ? 24 : (isLargeScreen || isSamsungS23Ultra) ? 22 : 18;
  const modalMaxHeight = Math.floor(height * 0.8); // Conversion en nombre pour Animated.View
  
  return {
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: isLargeScreen ? 20 : 10,
    },
    container: {
      width: modalWidth,
      maxWidth: modalMaxWidth,
      maxHeight: modalMaxHeight, // Nombre au lieu de string
      backgroundColor: '#fff',
      borderRadius: modalBorderRadius,
      overflow: 'hidden' as const,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: isLargeScreen ? 10 : 4 },
      shadowOpacity: isLargeScreen ? 0.25 : 0.2,
      shadowRadius: isLargeScreen ? 20 : 8,
      elevation: isLargeScreen ? 10 : 5,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: modalPadding,
      borderBottomWidth: 1,
      borderBottomColor: '#F5F5F5',
    },
    title: {
      fontSize: titleFontSize,
      fontWeight: 'bold' as const,
      color: '#000',
    },
    content: {
      padding: modalPadding,
    },
    closeButton: {
      padding: 8,
      borderRadius: modalBorderRadius / 4,
      backgroundColor: isLargeScreen ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
    },
  };
};

// Utilitaire pour les dimensions de carte
export const useResponsiveCardStyles = () => {
  const dimensions = useResponsiveDimensions();
  const { isLargeScreen, isTablet } = dimensions;
  
  return {
    cardPadding: isTablet ? 25 : isLargeScreen ? 20 : 15,
    cardBorderRadius: isTablet ? 20 : isLargeScreen ? 16 : 12,
    cardMargin: isTablet ? 20 : isLargeScreen ? 15 : 10,
    titleFontSize: isTablet ? 20 : isLargeScreen ? 18 : 16,
    subtitleFontSize: isTablet ? 18 : isLargeScreen ? 16 : 14,
    bodyFontSize: isTablet ? 16 : isLargeScreen ? 15 : 14,
    iconSize: isTablet ? 28 : isLargeScreen ? 24 : 20,
  };
};

export default useResponsiveDimensions;
