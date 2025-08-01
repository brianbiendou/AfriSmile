import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { X, Plus, Minus, ShoppingCart, Check } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';
import { fcfaToPoints } from '@/utils/pointsConversion';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  description: string;
  points: number;
  image: string;
  category: string;
}

interface Customization {
  id: string;
  name: string;
  options: {
    id: string;
    name: string;
    price: number;
    selected: boolean;
  }[];
  required: boolean;
  maxSelections: number;
}

interface ProductCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, customizations: any[], quantity: number, totalPrice: number) => void;
  fullScreen?: boolean;
}

const mockCustomizations: Customization[] = [
  {
    id: '1',
    name: 'Accompagnements',
    required: true,
    maxSelections: 1,
    options: [
      { id: '1a', name: 'Riz blanc', price: 0, selected: true },
      { id: '1b', name: 'Attiéké', price: 1, selected: false }, // 1 point (100 FCFA ÷ 78.359)
      { id: '1c', name: 'Foutou', price: 1, selected: false }, // 1 point 
      { id: '1d', name: 'Placali', price: 1, selected: false }, // 1 point
    ]
  },
  {
    id: '2',
    name: 'Sauce',
    required: true,
    maxSelections: 1,
    options: [
      { id: '2a', name: 'Sauce graine', price: 0, selected: true },
      { id: '2b', name: 'Sauce claire', price: 0, selected: false },
      { id: '2c', name: 'Sauce arachide', price: 1, selected: false }, // 1 point
      { id: '2d', name: 'Sauce tomate', price: 0, selected: false },
    ]
  },
  {
    id: '3',
    name: 'Protéines (Optionnel)',
    required: false,
    maxSelections: 3,
    options: [
      { id: '3a', name: 'Poisson fumé', price: 1, selected: false }, // 1 point
      { id: '3b', name: 'Viande de bœuf', price: 3, selected: false }, // 3 points (200 FCFA ÷ 78.359)
      { id: '3c', name: 'Poulet', price: 1, selected: false }, // 1 point
      { id: '3d', name: 'Crevettes', price: 3, selected: false }, // 3 points
    ]
  },
  {
    id: '4',
    name: 'Épices et assaisonnements',
    required: false,
    maxSelections: 5,
    options: [
      { id: '4a', name: 'Piment fort', price: 0, selected: false },
      { id: '4b', name: 'Gingembre', price: 0, selected: false },
      { id: '4c', name: 'Ail', price: 0, selected: false },
      { id: '4d', name: 'Oignon', price: 0, selected: false },
      { id: '4e', name: 'Cube Maggi', price: 0, selected: false },
    ]
  }
];

export default function ProductCustomizationModal({ 
  visible, 
  onClose, 
  product, 
  onAddToCart,
  fullScreen = false // Valeur par défaut : false
}: ProductCustomizationModalProps) {
  const [customizations, setCustomizations] = useState<Customization[]>(mockCustomizations);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const responsiveStyles = useResponsiveModalStyles(fullScreen);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
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
      setQuantity(1);
      setIsAdding(false);
      // Reset customizations
      setCustomizations(mockCustomizations.map(cat => ({
        ...cat,
        options: cat.options.map((opt, index) => ({
          ...opt,
          selected: index === 0 && cat.required // Select first option for required categories
        }))
      })));
    }
  }, [visible]);

  const handleOptionToggle = (categoryId: string, optionId: string) => {
    setCustomizations(prev => prev.map(category => {
      if (category.id !== categoryId) return category;

      const selectedCount = category.options.filter(opt => opt.selected).length;
      
      return {
        ...category,
        options: category.options.map(option => {
          if (option.id === optionId) {
            // Pour les catégories à sélection unique (radio buttons)
            if (category.maxSelections === 1) {
              // Si l'option est déjà sélectionnée et que c'est obligatoire, ne pas désélectionner
              if (category.required && option.selected) {
                return option;
              }
              // Sinon, sélectionner cette option
              return { ...option, selected: true };
            } else {
              // Pour les catégories à sélections multiples (checkboxes)
              // If trying to select and already at max, don't allow
              if (!option.selected && selectedCount >= category.maxSelections) {
                return option;
              }
              // If required category and trying to deselect the only selected option
              if (category.required && option.selected && selectedCount === 1) {
                return option;
              }
              return { ...option, selected: !option.selected };
            }
          }
          // For single selection categories (radio buttons), deselect others when selecting new one
          if (category.maxSelections === 1 && option.id !== optionId) {
            return { ...option, selected: false };
          }
          return option;
        })
      };
    }));
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    const basePrice = product.points;
    const customizationPrice = customizations.reduce((total, category) => {
      return total + category.options
        .filter(option => option.selected)
        .reduce((catTotal, option) => catTotal + option.price, 0);
    }, 0);
    
    return (basePrice + customizationPrice) * quantity;
  };

  const canAddToCart = () => {
    return customizations.every(category => {
      if (!category.required) return true;
      return category.options.some(option => option.selected);
    });
  };

  const handleAddToCart = () => {
    if (!product || !canAddToCart()) return;

    setIsAdding(true);
    
    // Animation d'ajout
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      const selectedCustomizations = customizations.map(category => ({
        categoryId: category.id,
        categoryName: category.name,
        selectedOptions: category.options.filter(opt => opt.selected)
      })).filter(cat => cat.selectedOptions.length > 0);

      onAddToCart(product, selectedCustomizations, quantity, calculateTotalPrice());
      setIsAdding(false);
      onClose();
    }, 500);
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
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

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
            }
          ]}
        >
          {/* Header avec image de fond */}
          <View style={styles.headerSection}>
            <Image source={{ uri: product.image }} style={styles.backgroundImage} />
            <View style={styles.headerOverlay}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.productPrice}>{product.points} pts</Text>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>Prix réduit</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Contenu principal */}
          <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
            {customizations.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: category.required ? '#FFF3CD' : '#E8F5E8' }
                  ]}>
                    <Text style={[
                      styles.categoryBadgeText,
                      { color: category.required ? '#B8860B' : '#4CAF50' }
                    ]}>
                      {category.required ? 'Obligatoire' : 'Optionnel'}
                    </Text>
                  </View>
                </View>
                
                {category.maxSelections > 1 && (
                  <Text style={styles.categorySubtitle}>
                    Sélectionnez jusqu'à {category.maxSelections} option{category.maxSelections > 1 ? 's' : ''}
                  </Text>
                )}

                <View style={styles.optionsGrid}>
                  {category.options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        option.selected && styles.optionCardSelected
                      ]}
                      onPress={() => handleOptionToggle(category.id, option.id)}
                    >
                      <View style={styles.optionContent}>
                        <View style={styles.optionLeft}>
                          <Text style={[
                            styles.optionName,
                            option.selected && styles.optionNameSelected
                          ]}>
                            {option.name}
                          </Text>
                          {option.price > 0 && (
                            <Text style={styles.optionPrice}>
                              +{fcfaToPoints(option.price).toFixed(1)} pts
                            </Text>
                          )}
                        </View>
                        <View style={[
                          styles.selectionIndicator,
                          option.selected && styles.selectionIndicatorActive
                        ]}>
                          {option.selected && <Check size={16} color="#fff" />}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer moderne */}
          <View style={styles.footer}>
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantité</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.quantityBtn, quantity <= 1 && styles.quantityBtnDisabled]}
                  onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus size={18} color={quantity <= 1 ? "#ccc" : "#000"} />
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Plus size={18} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                (!canAddToCart() || isAdding) && styles.addButtonDisabled
              ]}
              onPress={handleAddToCart}
              disabled={!canAddToCart() || isAdding}
            >
              <ShoppingCart size={20} color="#fff" />
              <Text style={styles.addButtonText}>
                {isAdding ? 'Ajout...' : `Ajouter ${calculateTotalPrice()} pts`}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: screenWidth * 0.95,
    maxHeight: screenHeight * 0.9,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  
  // Header avec image de fond
  headerSection: {
    height: 180, // Réduire la hauteur pour mobile
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16, // Réduire le padding
    justifyContent: 'space-between',
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 36, // Réduire la taille
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productHeader: {
    marginTop: 'auto',
  },
  productName: {
    fontSize: 20, // Réduire pour mobile
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productDescription: {
    fontSize: 14, // Réduire pour mobile
    color: '#f0f0f0',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18, // Réduire pour mobile
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  priceBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },

  // Contenu principal
  contentSection: {
    flex: 1,
    padding: 16, // Réduire le padding
    maxHeight: screenHeight * 0.4, // Limiter la hauteur pour laisser place aux boutons
  },
  categoryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12, // Réduire les coins
    padding: 16, // Réduire le padding
    marginBottom: 12, // Réduire l'espacement
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Réduire l'espacement
  },
  categoryTitle: {
    fontSize: 16, // Réduire pour mobile
    fontWeight: 'bold',
    color: '#212529',
  },
  categoryBadge: {
    paddingHorizontal: 8, // Réduire le padding
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryBadgeText: {
    fontSize: 10, // Réduire la taille
    fontWeight: '600',
  },
  categorySubtitle: {
    fontSize: 12, // Réduire pour mobile
    color: '#6c757d',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  optionsGrid: {
    gap: 8, // Réduire l'espacement
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 10, // Réduire les coins
    padding: 12, // Réduire le padding
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Réduire l'ombre
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLeft: {
    flex: 1,
  },
  optionName: {
    fontSize: 14, // Réduire pour mobile
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2, // Réduire l'espacement
  },
  optionNameSelected: {
    color: '#4CAF50',
  },
  optionPrice: {
    fontSize: 12, // Réduire pour mobile
    fontWeight: '600',
    color: '#4CAF50',
  },
  selectionIndicator: {
    width: 24, // Réduire la taille
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dee2e6',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },

  // Footer fixe et compact
  footer: {
    padding: 16, // Réduire le padding
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  quantitySection: {
    marginBottom: 12, // Réduire l'espacement
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 14, // Réduire la taille
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
    textAlign: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 6, // Réduire le padding
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quantityBtn: {
    width: 36, // Réduire la taille
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  quantityBtnDisabled: {
    backgroundColor: '#e9ecef',
    borderColor: '#ced4da',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginHorizontal: 20, // Réduire l'espacement
    minWidth: 25,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 14, // Réduire le padding
    borderRadius: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: '#ced4da',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16, // Réduire la taille
    fontWeight: 'bold',
  },
});