import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Check } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { fcfaToPoints } from '@/utils/pointsConversion';
import { ExtraItem } from '@/data/extras';

const { width } = Dimensions.get('window');

// Types pour les options de personnalisation
interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

interface CustomizationCategory {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number; // 1 pour choix unique, > 1 pour choix multiples
  options: CustomizationOption[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category: string;
  available: boolean;
  providerId: string;
  providerName: string;
  customizations: CustomizationCategory[];
}

export default function ProductCustomizationScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<CustomizationCategory[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<ExtraItem[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  // Fonction pour récupérer les données du produit par ID
  const getProductData = (id: string): Product => {
    // Produits en vedette
    const featuredProducts = [
      {
        id: 'menu-kebab',
        name: 'MENU KEBAB',
        description: 'Menu complet avec kebab, frites et boisson',
        basePrice: 12500,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        category: 'Menus',
      },
      {
        id: 'menu-pain',
        name: 'MENU PAIN ROND + 1 PAIN ROND SEUL',
        description: 'Pain rond traditionnel avec accompagnements',
        basePrice: 17900,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        category: 'Menus',
      },
      {
        id: 'menu-naar',
        name: 'MENU NAAR',
        description: 'Menu spécialité maison avec viande grillée',
        basePrice: 12900,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        category: 'Menus',
      },
    ];

    // Offres spéciales
    const specialOffers = [
      {
        id: 'bebe-tacos',
        name: 'BEBE TACOS KEBAB',
        description: 'Tacos onctueux viande kebab, sauce blanche, sauce maquis fait maison',
        basePrice: 12900,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        category: 'Offres Spéciales',
      },
      {
        id: 'wings',
        name: '2 WINGS FAIT MAISON',
        description: 'Ailes de poulet frit fait maison',
        basePrice: 3900,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        category: 'Offres Spéciales',
      },
    ];

    // Chercher dans les produits vedette et offres spéciales
    const allProducts = [...featuredProducts, ...specialOffers];
    const foundProduct = allProducts.find(p => p.id === id);

    if (foundProduct) {
      return {
        id: foundProduct.id,
        name: foundProduct.name,
        description: foundProduct.description,
        basePrice: foundProduct.basePrice,
        image: foundProduct.image,
        category: foundProduct.category,
        available: true,
        providerId: '1',
        providerName: "K'Labraise",
        customizations: getCustomizationsForProduct(id)
      };
    }

    // Produit par défaut si non trouvé
    return {
      id: id,
      name: 'Attiéké Poisson',
      description: 'Attiéké traditionnel servi avec du poisson braisé et des légumes frais.',
      basePrice: 2500,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      category: 'Plats principaux',
      available: true,
      providerId: '1',
      providerName: 'Chez Tante Marie',
      customizations: getCustomizationsForProduct(id)
    };
  };

  // Fonction pour obtenir les personnalisations selon le produit
  const getCustomizationsForProduct = (productId: string): CustomizationCategory[] => {
    // Personnalisations pour les menus kebab/tacos
    if (productId.includes('kebab') || productId.includes('tacos')) {
      return [
        {
          id: 'sauce',
          name: 'Sauce',
          required: true,
          maxSelections: 1,
          options: [
            { id: 'blanche', name: 'Sauce blanche', price: 0, selected: true },
            { id: 'maquis', name: 'Sauce maquis', price: 0, selected: false },
            { id: 'harissa', name: 'Sauce harissa', price: 0, selected: false },
          ]
        },
        {
          id: 'supplement',
          name: 'Suppléments',
          required: false,
          maxSelections: 3,
          options: [
            { id: 'fromage', name: 'Fromage', price: 300, selected: false },
            { id: 'double_viande', name: 'Double viande', price: 800, selected: false },
            { id: 'legumes', name: 'Légumes extra', price: 200, selected: false },
          ]
        }
      ];
    }

    // Personnalisations pour les autres plats
    return [
      {
        id: 'spice_level',
        name: 'Niveau de piment',
        required: true,
        maxSelections: 1,
        options: [
          { id: 'mild', name: 'Doux', price: 0, selected: true },
          { id: 'medium', name: 'Moyen', price: 0, selected: false },
          { id: 'spicy', name: 'Pimenté', price: 0, selected: false },
        ]
      },
      {
        id: 'extras',
        name: 'Accompagnements supplémentaires',
        required: false,
        maxSelections: 2,
        options: [
          { id: 'rice', name: 'Riz supplémentaire', price: 300, selected: false },
          { id: 'vegetables', name: 'Légumes sautés', price: 400, selected: false },
        ]
      }
    ];
  };

  useEffect(() => {
    if (productId) {
      const productData = getProductData(productId);
      setProduct(productData);
      setCustomizations(productData.customizations);
    }
  }, [productId]);

  // Si le produit n'est pas encore chargé
  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Extras disponibles
  const availableExtras: ExtraItem[] = [
    { 
      id: 'drink', 
      name: 'Boisson (50cl)', 
      description: 'Boisson fraîche de votre choix',
      price: 500, 
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      category: 'boissons'
    },
    { 
      id: 'dessert', 
      name: 'Dessert du jour', 
      description: 'Dessert traditionnel maison',
      price: 800, 
      image: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg',
      category: 'desserts'
    },
    { 
      id: 'bread', 
      name: 'Pain artisanal', 
      description: 'Pain frais cuit au four traditionnel',
      price: 300, 
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      category: 'accompagnements'
    },
  ];

  const handleCustomizationChange = (categoryId: string, optionId: string) => {
    setCustomizations(prev => prev.map(category => {
      if (category.id === categoryId) {
        const updatedOptions = category.options.map(option => {
          if (category.maxSelections === 1) {
            // Choix unique - désélectionner les autres
            return { ...option, selected: option.id === optionId };
          } else {
            // Choix multiples - toggle l'option
            if (option.id === optionId) {
              return { ...option, selected: !option.selected };
            }
            return option;
          }
        });

        // Vérifier le nombre maximum de sélections
        const selectedCount = updatedOptions.filter(opt => opt.selected).length;
        if (selectedCount > category.maxSelections) {
          Alert.alert('Limite atteinte', `Vous ne pouvez sélectionner que ${category.maxSelections} option(s) maximum.`);
          return category;
        }

        return { ...category, options: updatedOptions };
      }
      return category;
    }));
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

  const calculateTotalPrice = () => {
    let total = product.basePrice;

    // Ajouter le prix des customizations
    customizations.forEach(category => {
      category.options.forEach(option => {
        if (option.selected) {
          total += option.price;
        }
      });
    });

    // Ajouter le prix des extras
    selectedExtras.forEach(extra => {
      total += extra.price;
    });

    return total * quantity;
  };

  const validateCustomizations = () => {
    for (const category of customizations) {
      if (category.required) {
        const hasSelection = category.options.some(option => option.selected);
        if (!hasSelection) {
          Alert.alert('Sélection requise', `Veuillez choisir une option pour "${category.name}".`);
          return false;
        }
      }
    }
    return true;
  };

  const addToCartHandler = () => {
    if (!validateCustomizations()) {
      return;
    }

    const customizationsForCart = customizations.map(category => ({
      categoryId: category.id,
      categoryName: category.name,
      selectedOptions: category.options
        .filter(option => option.selected)
        .map(option => ({
          id: option.id,
          name: option.name,
          price: option.price,
        }))
    }));

    const cartItem = {
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      basePrice: product.basePrice,
      quantity: quantity,
      customizations: customizationsForCart,
      extras: selectedExtras,
      totalPrice: calculateTotalPrice(),
      providerId: product.providerId,
      providerName: product.providerName,
    };

    const itemId = addToCart(cartItem);
    
    // Naviguer directement vers la page d'extras
    router.push({
      pathname: '/extras/[productId]',
      params: {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        basePrice: product.basePrice.toString(),
        quantity: quantity.toString(),
        providerId: product.providerId,
        providerName: product.providerName,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personnaliser</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Image et informations du produit */}
        <View style={styles.productHeader}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            <View style={styles.basePriceContainer}>
              <Text style={styles.basePrice}>{fcfaToPoints(product.basePrice).toFixed(2)} pts</Text>
              <Text style={styles.basePriceFcfa}>{product.basePrice} FCFA</Text>
            </View>
          </View>
        </View>

        {/* Customizations */}
        {customizations.map((category) => (
          <View key={category.id} style={styles.customizationSection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>
                {category.name} {category.required && <Text style={styles.required}>*</Text>}
              </Text>
              <Text style={styles.categorySubtitle}>
                {category.maxSelections === 1 ? 'Choisissez 1 option' : `Choisissez jusqu'à ${category.maxSelections} options`}
              </Text>
            </View>
            
            {category.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionItem, option.selected && styles.selectedOption]}
                onPress={() => handleCustomizationChange(category.id, option.id)}
              >
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionName, option.selected && styles.selectedText]}>
                    {option.name}
                  </Text>
                  {option.price > 0 && (
                    <View style={styles.priceContainer}>
                      <Text style={[styles.optionPricePoints, option.selected && styles.selectedText]}>
                        +{fcfaToPoints(option.price).toFixed(2)} pts
                      </Text>
                      <Text style={[styles.optionPriceFcfa, option.selected && styles.selectedText]}>
                        +{option.price} FCFA
                      </Text>
                    </View>
                  )}
                </View>
                <View style={[styles.checkBox, option.selected && styles.checked]}>
                  {option.selected && <Check size={16} color="#fff" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Extras */}
        <View style={styles.extrasSection}>
          <Text style={styles.sectionTitle}>Extras (optionnel)</Text>
          {availableExtras.map((extra) => {
            const isSelected = selectedExtras.some(item => item.id === extra.id);
            return (
              <TouchableOpacity
                key={extra.id}
                style={[styles.extraItem, isSelected && styles.selectedExtra]}
                onPress={() => toggleExtra(extra)}
              >
                {extra.image && (
                  <Image source={{ uri: extra.image }} style={styles.extraImage} />
                )}
                <View style={styles.extraInfo}>
                  <Text style={[styles.extraName, isSelected && styles.selectedText]}>
                    {extra.name}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.extraPricePoints, isSelected && styles.selectedText]}>
                      +{fcfaToPoints(extra.price).toFixed(2)} pts
                    </Text>
                    <Text style={[styles.extraPriceFcfa, isSelected && styles.selectedText]}>
                      +{extra.price} FCFA
                    </Text>
                  </View>
                </View>
                <View style={[styles.checkBox, isSelected && styles.checked]}>
                  {isSelected && <Check size={16} color="#fff" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quantity selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Quantité</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.disabledButton]}
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus size={20} color={quantity <= 1 ? "#ccc" : "#00B14F"} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Plus size={20} color="#00B14F" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom bar with total and add to cart */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            {fcfaToPoints(calculateTotalPrice()).toFixed(2)} pts 
            (FCFA: {calculateTotalPrice().toFixed(0)})
          </Text>
          <Text style={styles.totalPriceFcfa}>{calculateTotalPrice().toFixed(0)} FCFA</Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={addToCartHandler}>
          <ShoppingCart size={20} color="#fff" />
          <Text style={styles.addToCartText}>Ajouter au panier</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Augmenté pour éviter le chevauchement avec la zone de notification
    backgroundColor: '#fff',
    marginBottom: 0,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  productHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  productInfo: {
    gap: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  basePrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00B14F',
  },
  customizationSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  categoryHeader: {
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  required: {
    color: '#FF3B30',
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedOption: {
    backgroundColor: '#E8F5E8',
    borderColor: '#00B14F',
    borderWidth: 1,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  optionPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectedText: {
    color: '#00B14F',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#00B14F',
    borderColor: '#00B14F',
  },
  extrasSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedExtra: {
    backgroundColor: '#E8F5E8',
    borderColor: '#00B14F',
    borderWidth: 1,
  },
  extraImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  extraInfo: {
    flex: 1,
  },
  extraName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  extraPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  couponsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  quantitySection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00B14F',
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#ccc',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    minWidth: 40,
    textAlign: 'center',
  },
  spacer: {
    height: 100,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 15,
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B14F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  optionPricePoints: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  optionPriceFcfa: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  extraPricePoints: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  extraPriceFcfa: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  basePriceContainer: {
    alignItems: 'flex-start',
  },
  basePriceFcfa: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  totalPriceFcfa: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
