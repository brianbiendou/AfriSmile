import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { X, Plus, Minus, ShoppingCart, Check, ArrowLeft } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fcfaToPoints, formatFcfaAmount, formatPointsAmount } from '@/utils/pointsConversion';
import { pointsToFcfa } from '@/utils/pointsConversion';
import { getUnsoldProducts } from '@/lib/products';
import { useCart } from '@/contexts/CartContext';
import { getResponsiveTextProps } from '@/utils/responsiveStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  description: string;
  points: number;
  image: string;
  category: string;
}

interface UnsoldProduct {
  id: string;
  name: string;
  description: string;
  original_price: number;
  unsold_price: number;
  image_url: string;
  unsold_until: string;
  category: string;
}

interface Extra {
  id: string;
  name: string;
  price: number; // En FCFA
  image: string;
  description: string;
  selected: boolean;
}

const availableExtras: Extra[] = [
  {
    id: 'drink1',
    name: 'Coca-Cola',
    price: 200,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop',
    description: 'Boisson gazeuse fraîche 33cl',
    selected: false,
  },
  {
    id: 'drink2',
    name: 'Fanta Orange',
    price: 200,
    image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop',
    description: 'Boisson gazeuse à l\'orange 33cl',
    selected: false,
  },
  {
    id: 'drink3',
    name: 'Eau minérale',
    price: 150,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    description: 'Eau minérale naturelle 50cl',
    selected: false,
  },
  {
    id: 'drink4',
    name: 'Jus de bissap',
    price: 250,
    image: 'https://images.unsplash.com/photo-1553787499-6d2b6f6b6c8a?w=400&h=300&fit=crop',
    description: 'Jus naturel de bissap maison 25cl',
    selected: false,
  },
  {
    id: 'dessert1',
    name: 'Banane plantain frite',
    price: 300,
    image: 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&h=300&fit=crop',
    description: 'Bananes plantains douces frites',
    selected: false,
  },
  {
    id: 'dessert2',
    name: 'Fruit de saison',
    price: 200,
    image: 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400&h=300&fit=crop',
    description: 'Mangue, ananas ou papaye selon saison',
    selected: false,
  },
];

export default function ProductCustomizationPage() {
  const { productId, providerId, sourceRoute } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [extras, setExtras] = useState<Extra[]>(availableExtras);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  // États pour l'animation d'ajout au panier
  const [showCartAnimation, setShowCartAnimation] = useState(false);
  const cartAnimationValue = useRef(new Animated.Value(0)).current;
  const cartAnimationOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProduct();
  }, [productId, providerId]);

  const loadProduct = async () => {
    if (!productId || !providerId) return;
    
    try {
      const unsoldProducts = await getUnsoldProducts(providerId as string);
      const unsoldProduct = unsoldProducts.find(p => p.id === productId);
      
      if (unsoldProduct) {
        // Convertir UnsoldProduct en Product pour l'interface
        setProduct({
          id: unsoldProduct.id,
          name: unsoldProduct.name,
          description: unsoldProduct.description,
          points: fcfaToPoints(unsoldProduct.unsold_price),
          image: unsoldProduct.image_url,
          category: unsoldProduct.category,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      router.back();
    }
  };

  const handleExtraToggle = (extraId: string) => {
    setExtras(prev => prev.map(extra => 
      extra.id === extraId 
        ? { ...extra, selected: !extra.selected }
        : extra
    ));
  };

  // Animation d'ajout au panier
  const startCartAnimation = () => {
    setShowCartAnimation(true);
    cartAnimationValue.setValue(0);
    cartAnimationOpacity.setValue(1);

    Animated.parallel([
      Animated.timing(cartAnimationValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(cartAnimationOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowCartAnimation(false);
    });
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    const basePrice = product.points;
    const extrasPrice = extras
      .filter(extra => extra.selected)
      .reduce((total, extra) => total + fcfaToPoints(extra.price), 0);
    
    return (basePrice + extrasPrice) * quantity;
  };

  const calculateTotalPriceFcfa = () => {
    if (!product) return 0;
    
    const basePriceFcfa = Math.round(pointsToFcfa(product.points));
    const extrasPriceFcfa = extras
      .filter(extra => extra.selected)
      .reduce((total, extra) => total + extra.price, 0);
    
    return (basePriceFcfa + extrasPriceFcfa) * quantity;
  };

  const handleAddToCart = () => {
    if (!product) return;

    setIsAdding(true);
    
    // Démarrer l'animation d'ajout au panier
    startCartAnimation();
    
    setTimeout(() => {
      const selectedExtras = extras.filter(extra => extra.selected);

      // Convertir les points en FCFA pour le stockage dans le panier
      const priceInFcfa = Math.round(pointsToFcfa(product.points));
      const totalPriceInFcfa = calculateTotalPriceFcfa();

      addToCart({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        basePrice: priceInFcfa,
        quantity: quantity,
        customizations: [],
        extras: selectedExtras.map(extra => ({
          id: extra.id,
          name: extra.name,
          price: extra.price,
          description: extra.description,
          image: extra.image,
          category: 'extras',
        })),
        totalPrice: totalPriceInFcfa,
        providerId: providerId as string,
        providerName: 'Restaurant',
      });
      
      setIsAdding(false);
      
      // Afficher un message de confirmation
      Alert.alert(
        '✅ Ajouté au panier !',
        `${quantity} x ${product.name} ajouté${quantity > 1 ? 's' : ''} à votre panier.`,
        [
          {
            text: 'Continuer mes achats',
            onPress: () => {
              // Déterminer la page d'origine selon le sourceRoute et le providerId
              if (providerId) {
                // Si l'utilisateur vient de la page invendus
                if (sourceRoute === 'unsold') {
                  router.replace({
                    pathname: '/unsold/[providerId]',
                    params: { providerId: providerId as string, returnToModal: 'true' }
                  });
                }
                // Pour les produits beauté, aller vers les services de beauté
                else if (product.category && (
                  product.category.toLowerCase().includes('beauté') || 
                  product.category.toLowerCase().includes('beauty') ||
                  product.category.toLowerCase().includes('soin')
                )) {
                  router.replace({
                    pathname: '/beauty/services/[providerId]',
                    params: { providerId: providerId as string, returnToModal: 'true' }
                  });
                } else {
                  // Pour les produits alimentaires, aller vers la page commande
                  router.replace({
                    pathname: '/order/[providerId]',
                    params: { providerId: providerId as string, returnToModal: 'true' }
                  });
                }
              } else {
                router.back();
              }
            },
            style: 'default'
          },
          {
            text: 'Voir le panier',
            onPress: () => router.push('/cart'),
            style: 'default'
          }
        ]
      );
    }, 800); // Attendre la fin de l'animation
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Contenu principal avec header inclus dans le scroll */}
      <ScrollView style={styles.mainScrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec image de fond */}
        <View style={styles.headerSection}>
          <Image source={{ uri: product.image }} style={styles.backgroundImage} />
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
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

        {/* Contenu principal dans une section */}
        <View style={styles.contentSection}>
          {/* Informations sur le plat */}
          <View style={styles.dishInfoCard}>
            <Text style={styles.dishInfoTitle}>Informations sur le plat</Text>
            <Text style={styles.dishInfoText}>
              ✨ Plat déjà préparé et prêt à être dégusté
            </Text>
            <Text style={styles.dishInfoText}>
              ⏰ Récupération immédiate possible
            </Text>
            <Text style={styles.dishInfoText}>
              💰 Prix spécial invendu avec réduction importante
            </Text>
            <Text style={styles.dishInfoText}>
              🍽️ Accompagnements et sauce déjà inclus dans le plat
            </Text>
          </View>

        {/* Prix détaillé */}
        <View style={styles.priceDetailCard}>
          <Text style={styles.priceDetailTitle}>Détail des prix</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Prix du plat :</Text>
            <View style={styles.priceValues}>
              <Text style={styles.currentPricePoints}>{formatPointsAmount(product.points)}</Text>
              <Text style={[styles.currentPriceFcfa, getResponsiveTextProps('fcfa').style]}
                    numberOfLines={getResponsiveTextProps('fcfa').numberOfLines}
                    ellipsizeMode={getResponsiveTextProps('fcfa').ellipsizeMode}>
                ({formatFcfaAmount(Math.round(pointsToFcfa(product.points)))})
              </Text>
            </View>
          </View>
          
          {/* Affichage du prix total si des extras sont sélectionnés */}
          {extras.some(extra => extra.selected) && (
            <>
              <View style={styles.priceSeparator} />
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Extras :</Text>
                <View style={styles.priceValues}>
                  <Text style={styles.extraPricePoints}>
                    +{formatPointsAmount(extras.filter(e => e.selected).reduce((total, e) => total + fcfaToPoints(e.price), 0))}
                  </Text>
                  <Text style={[styles.extraPriceFcfa, getResponsiveTextProps('fcfa').style]}
                        numberOfLines={getResponsiveTextProps('fcfa').numberOfLines}
                        ellipsizeMode={getResponsiveTextProps('fcfa').ellipsizeMode}>
                    (+{formatFcfaAmount(extras.filter(e => e.selected).reduce((total, e) => total + e.price, 0))})
                  </Text>
                </View>
              </View>
              <View style={styles.priceSeparator} />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total :</Text>
                <View style={styles.priceValues}>
                  <Text style={styles.totalPricePoints}>{formatPointsAmount(calculateTotalPrice())}</Text>
                  <Text style={[styles.totalPriceFcfa, getResponsiveTextProps('fcfa').style]}
                        numberOfLines={getResponsiveTextProps('fcfa').numberOfLines}
                        ellipsizeMode={getResponsiveTextProps('fcfa').ellipsizeMode}>
                    ({formatFcfaAmount(calculateTotalPriceFcfa())})
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Extras disponibles */}
        <View style={styles.extrasSection}>
          <Text style={styles.extrasSectionTitle}>Extras disponibles</Text>
          <Text style={styles.extrasSectionSubtitle}>Ajoutez des boissons ou desserts pour compléter votre commande</Text>
          
          <View style={styles.extrasGrid}>
            {extras.map((extra) => (
              <TouchableOpacity
                key={extra.id}
                style={[
                  styles.extraCard,
                  extra.selected && styles.extraCardSelected
                ]}
                onPress={() => handleExtraToggle(extra.id)}
              >
                <Image source={{ uri: extra.image }} style={styles.extraImage} />
                <View style={styles.extraContent}>
                  <View style={styles.extraInfo}>
                    <Text style={[
                      styles.extraName,
                      extra.selected && styles.extraNameSelected
                    ]}>
                      {extra.name}
                    </Text>
                    <Text style={styles.extraDescription}>{extra.description}</Text>
                    <View style={styles.extraPriceContainer}>
                      <Text style={styles.extraPricePoints}>
                        {formatPointsAmount(fcfaToPoints(extra.price))}
                      </Text>
                      <Text style={[styles.extraPriceFcfaText, getResponsiveTextProps('fcfa').style]}
                            numberOfLines={getResponsiveTextProps('fcfa').numberOfLines}
                            ellipsizeMode={getResponsiveTextProps('fcfa').ellipsizeMode}>
                        ({formatFcfaAmount(extra.price)})
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.extraSelectionIndicator,
                    extra.selected && styles.extraSelectionIndicatorActive
                  ]}>
                    {extra.selected && <Check size={16} color="#fff" />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        </View>
      </ScrollView>

      {/* Footer fixe */}
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
            isAdding && styles.addButtonDisabled
          ]}
          onPress={handleAddToCart}
          disabled={isAdding}
        >
          <ShoppingCart size={20} color="#fff" />
          <Text style={styles.addButtonText}>
            {isAdding ? 'Ajout...' : `Ajouter ${formatPointsAmount(calculateTotalPrice())}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Animation d'ajout au panier */}
      {showCartAnimation && (
        <Animated.View
          style={[
            styles.cartAnimationContainer,
            {
              opacity: cartAnimationOpacity,
              transform: [
                {
                  translateX: cartAnimationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenWidth / 2 - 25, screenWidth - 60],
                  }),
                },
                {
                  translateY: cartAnimationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenHeight - 180, 60],
                  }),
                },
                {
                  scale: cartAnimationValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.2, 0.3],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.cartAnimationBall}>
            <ShoppingCart size={20} color="#fff" />
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // ScrollView principal
  mainScrollView: {
    flex: 1,
  },
  
  // Header avec image de fond
  headerSection: {
    height: 280,
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
    padding: 20,
    paddingTop: 50, // Pour la status bar
    justifyContent: 'space-between',
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productHeader: {
    marginTop: 'auto',
  },
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productDescription: {
    fontSize: 16,
    color: '#f0f0f0',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 12,
  },
  priceBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },

  // Contenu principal
  contentSection: {
    padding: 20,
    paddingBottom: 100, // Pour laisser place au footer fixe
  },
  categoryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  optionNameSelected: {
    color: '#4CAF50',
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  selectionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
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

  // Footer fixe
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  quantitySection: {
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginHorizontal: 24,
    minWidth: 30,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonDisabled: {
    backgroundColor: '#ced4da',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Nouveaux styles pour les informations du plat et extras
  dishInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dishInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  dishInfoText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
  priceDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priceDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  priceValues: {
    alignItems: 'flex-end',
  },
  currentPricePoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  currentPriceFcfa: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
    textDecorationLine: 'line-through',
  },
  extraPricePoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  extraPriceFcfa: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 1,
    textDecorationLine: 'line-through',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  totalPricePoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  totalPriceFcfa: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
    textDecorationLine: 'line-through',
  },
  priceSeparator: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
  },
  extrasSection: {
    marginBottom: 20,
  },
  extrasSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  extrasSectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  extrasGrid: {
    gap: 16,
  },
  extraCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  extraCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  extraImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  extraContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  extraInfo: {
    flex: 1,
  },
  extraName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  extraNameSelected: {
    color: '#4CAF50',
  },
  extraDescription: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 18,
  },
  extraPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  extraPriceFcfaText: {
    fontSize: 12,
    color: '#6c757d',
    textDecorationLine: 'line-through',
  },
  extraSelectionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#dee2e6',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  extraSelectionIndicatorActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },

  // Styles pour l'animation d'ajout au panier
  cartAnimationContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  cartAnimationBall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
