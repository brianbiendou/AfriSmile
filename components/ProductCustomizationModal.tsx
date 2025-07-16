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
import { X, Plus, Minus, ShoppingCart } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';

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
}

const mockCustomizations: Customization[] = [
  {
    id: '1',
    name: 'Accompagnements',
    required: true,
    maxSelections: 1,
    options: [
      { id: '1a', name: 'Riz blanc', price: 0, selected: true },
      { id: '1b', name: 'Attiéké', price: 200, selected: false },
      { id: '1c', name: 'Foutou', price: 300, selected: false },
      { id: '1d', name: 'Placali', price: 250, selected: false },
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
      { id: '2c', name: 'Sauce arachide', price: 100, selected: false },
      { id: '2d', name: 'Sauce tomate', price: 0, selected: false },
    ]
  },
  {
    id: '3',
    name: 'Protéines (Optionnel)',
    required: false,
    maxSelections: 3,
    options: [
      { id: '3a', name: 'Poisson fumé', price: 500, selected: false },
      { id: '3b', name: 'Viande de bœuf', price: 800, selected: false },
      { id: '3c', name: 'Poulet', price: 600, selected: false },
      { id: '3d', name: 'Crevettes', price: 1000, selected: false },
    ]
  },
  {
    id: '4',
    name: 'Épices et assaisonnements',
    required: false,
    maxSelections: 5,
    options: [
      { id: '4a', name: 'Piment fort', price: 0, selected: false },
      { id: '4b', name: 'Gingembre', price: 50, selected: false },
      { id: '4c', name: 'Ail', price: 0, selected: false },
      { id: '4d', name: 'Oignon', price: 0, selected: false },
      { id: '4e', name: 'Cube Maggi', price: 25, selected: false },
    ]
  }
];

export default function ProductCustomizationModal({ 
  visible, 
  onClose, 
  product, 
  onAddToCart 
}: ProductCustomizationModalProps) {
  const [customizations, setCustomizations] = useState<Customization[]>(mockCustomizations);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

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
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleClose}
      >
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
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Product Info */}
          <View style={styles.productSection}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
              <Text style={styles.productPrice}>{product.points.toLocaleString()} pts</Text>
            </View>
          </View>

          <ScrollView style={styles.customizationSection} showsVerticalScrollIndicator={false}>
            {customizations.map((category) => (
              <View key={category.id} style={styles.categoryContainer}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {category.required ? 'Obligatoire' : 'Optionnel'}
                    </Text>
                  </View>
                </View>
                
                {category.maxSelections > 1 && (
                  <Text style={styles.categorySubtitle}>
                    Choisissez jusqu'à {category.maxSelections} option{category.maxSelections > 1 ? 's' : ''}
                  </Text>
                )}

                {category.options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionItem,
                      option.selected && styles.optionItemSelected
                    ]}
                    onPress={() => handleOptionToggle(category.id, option.id)}
                  >
                    <View style={styles.optionInfo}>
                      <Text style={[
                        styles.optionName,
                        option.selected && styles.optionNameSelected
                      ]}>
                        {option.name}
                      </Text>
                      {option.price > 0 && (
                        <Text style={styles.optionPrice}>
                          +{option.price.toLocaleString()} FCFA
                        </Text>
                      )}
                    </View>
                    <View style={[
                      styles.optionCheckbox,
                      option.selected && styles.optionCheckboxSelected
                    ]}>
                      {option.selected && <View style={styles.optionCheckboxInner} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Quantity and Add to Cart */}
          <View style={styles.footer}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus size={20} color={quantity <= 1 ? "#ccc" : "#000"} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus size={20} color="#000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.addToCartButton,
                (!canAddToCart() || isAdding) && styles.addToCartButtonDisabled
              ]}
              onPress={handleAddToCart}
              disabled={!canAddToCart() || isAdding}
            >
              <ShoppingCart size={20} color="#fff" />
              <Text style={styles.addToCartText}>
                {isAdding ? 'Ajout...' : `Ajouter • ${calculateTotalPrice().toLocaleString()} pts`}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '95%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  closeButton: {
    padding: 5,
  },
  productSection: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  customizationSection: {
    flex: 1,
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 25,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  categoryBadge: {
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#00B14F',
    fontWeight: '600',
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  optionItemSelected: {
    backgroundColor: '#F0F9F4',
    borderWidth: 1,
    borderColor: '#00B14F',
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  optionNameSelected: {
    color: '#00B14F',
    fontWeight: '600',
  },
  optionPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  optionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCheckboxSelected: {
    borderColor: '#00B14F',
    backgroundColor: '#00B14F',
  },
  optionCheckboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    gap: 15,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 5,
  },
  quantityButton: {
    width: 35,
    height: 35,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 15,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});