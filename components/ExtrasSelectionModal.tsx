import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { X, Check, ChevronRight } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';
import CheckoutModal from './CheckoutModal';

interface ExtraItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ExtrasSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: (selectedExtras: ExtraItem[]) => void;
  extras: ExtraItem[];
  fullScreen?: boolean; // Propriété optionnelle pour afficher en plein écran
}

export default function ExtrasSelectionModal({
  visible,
  onClose,
  onContinue,
  extras,
  fullScreen = false // Valeur par défaut : false
}: ExtrasSelectionModalProps) {
  const [selectedExtras, setSelectedExtras] = useState<ExtraItem[]>([]);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const responsiveStyles = useResponsiveModalStyles(fullScreen);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Calcul du prix total des extras
  const extrasTotalPrice = selectedExtras.reduce((total, extra) => total + extra.price, 0);

  useEffect(() => {
    if (visible) {
      setSelectedExtras([]);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleContinue = () => {
    // Ajouter les extras sélectionnés et afficher directement le modal de paiement
    onContinue(selectedExtras);
    setCheckoutModalVisible(true);
    // Ne pas fermer le modal principal immédiatement
    // handleClose() sera appelé quand le checkout est terminé
  };

  const toggleExtra = (extra: ExtraItem) => {
    setSelectedExtras(prev => {
      const isSelected = prev.some(item => item.id === extra.id);
      if (isSelected) {
        return prev.filter(item => item.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const handleCheckoutClose = () => {
    setCheckoutModalVisible(false);
    handleClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={responsiveStyles.overlay} 
        activeOpacity={1} 
        onPress={fullScreen ? undefined : handleClose} // Ne ferme pas en mode plein écran
      >
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            },
            // Appliquer les styles responsifs en fonction de fullScreen
            {
              width: responsiveStyles.container.width as any, // Conversion pour éviter l'erreur de type
              maxWidth: responsiveStyles.container.maxWidth,
              maxHeight: responsiveStyles.container.maxHeight,
              borderRadius: responsiveStyles.container.borderRadius,
              shadowColor: responsiveStyles.container.shadowColor,
              shadowOffset: responsiveStyles.container.shadowOffset,
              shadowOpacity: responsiveStyles.container.shadowOpacity,
              shadowRadius: responsiveStyles.container.shadowRadius,
              elevation: responsiveStyles.container.elevation,
              ...(fullScreen && { height: '100%' }) // Ajouter height: 100% si fullScreen est true
            }
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Ajoutez des extras</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              Améliorez votre commande avec ces extras délicieux
            </Text>

            <View style={styles.extrasList}>
              {extras.map(extra => {
                const isSelected = selectedExtras.some(item => item.id === extra.id);
                return (
                  <TouchableOpacity
                    key={extra.id}
                    style={[
                      styles.extraItem,
                      isSelected && styles.selectedExtraItem
                    ]}
                    onPress={() => toggleExtra(extra)}
                  >
                    <View style={styles.extraImageContainer}>
                      <Image 
                        source={{ uri: extra.image }} 
                        style={styles.extraImage}
                        resizeMode="cover"
                      />
                      {isSelected && (
                        <View style={styles.checkMarkContainer}>
                          <Check size={16} color="#FFF" />
                        </View>
                      )}
                    </View>
                    <View style={styles.extraInfo}>
                      <Text style={styles.extraName}>{extra.name}</Text>
                      <Text style={styles.extraDescription} numberOfLines={2}>
                        {extra.description}
                      </Text>
                      <Text style={styles.extraPrice}>+{extra.price} pts</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Total extras</Text>
              <Text style={styles.priceValue}>
                {extrasTotalPrice > 0 ? `+${extrasTotalPrice} pts` : '0 pts'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continuer</Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
    
    <CheckoutModal 
      visible={checkoutModalVisible}
      onClose={handleCheckoutClose}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  extrasList: {
    gap: 15,
  },
  extraItem: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  selectedExtraItem: {
    borderColor: '#00B14F',
    backgroundColor: '#F0F9F4',
  },
  extraImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 15,
    position: 'relative',
  },
  extraImage: {
    width: '100%',
    height: '100%',
  },
  checkMarkContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#00B14F',
    borderRadius: 50,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraInfo: {
    flex: 1,
  },
  extraName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  extraDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  extraPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00B14F',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  continueButton: {
    backgroundColor: '#00B14F',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  continueButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
});
