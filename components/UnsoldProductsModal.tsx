import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { X, Clock, Percent, ShoppingCart, Plus } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { type ProviderCompat } from '@/data/providers';
import { useCart } from '@/contexts/CartContext';
import { getUnsoldProducts } from '@/lib/products';
import ProductCustomizationModal from '@/components/ProductCustomizationModal';

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

interface UnsoldProductsModalProps {
  visible: boolean;
  onClose: () => void;
  provider: ProviderCompat | null;
  userPoints: number;
  onAddToCart: (product: any, customizations: any[], quantity: number, totalPrice: number) => void;
}

export default function UnsoldProductsModal({ 
  visible, 
  onClose, 
  provider, 
  userPoints,
  onAddToCart 
}: UnsoldProductsModalProps) {
  const [unsoldProducts, setUnsoldProducts] = useState<UnsoldProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      ]).start();
      
      if (provider) {
        loadUnsoldProducts();
      }
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      setUnsoldProducts([]);
      setTimeRemaining({});
    }
  }, [visible, provider]);

  // Timer pour mettre à jour le temps restant
  useEffect(() => {
    if (unsoldProducts.length === 0) return;

    const interval = setInterval(() => {
      const newTimeRemaining: { [key: string]: string } = {};
      
      unsoldProducts.forEach(product => {
        const now = new Date().getTime();
        const expiry = new Date(product.unsold_until).getTime();
        const diff = expiry - now;
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          newTimeRemaining[product.id] = `${hours}h ${minutes}m`;
        } else {
          newTimeRemaining[product.id] = 'Expiré';
        }
      });
      
      setTimeRemaining(newTimeRemaining);
    }, 60000); // Mise à jour chaque minute

    return () => clearInterval(interval);
  }, [unsoldProducts]);

  const loadUnsoldProducts = async () => {
    if (!provider) return;
    
    setLoading(true);
    try {
      const products = await getUnsoldProducts(provider.id);
      setUnsoldProducts(products);
      
      // Calculer le temps restant initial
      const initialTimeRemaining: { [key: string]: string } = {};
      products.forEach(product => {
        const now = new Date().getTime();
        const expiry = new Date(product.unsold_until).getTime();
        const diff = expiry - now;
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          initialTimeRemaining[product.id] = `${hours}h ${minutes}m`;
        } else {
          initialTimeRemaining[product.id] = 'Expiré';
        }
      });
      setTimeRemaining(initialTimeRemaining);
    } catch (error) {
      console.error('Error loading unsold products:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits invendus');
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: UnsoldProduct) => {
    // Convertir le produit invendu au format attendu par le modal de customisation
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      points: product.unsold_price, // Utiliser le prix réduit
      image: product.image_url,
      category: product.category,
    };
    
    setSelectedProduct(formattedProduct);
    setShowCustomization(true);
  };

  const handleQuickAdd = (product: UnsoldProduct) => {
    if (!provider) return;
    
    // Ajout rapide sans customisation
    onAddToCart(
      {
        id: product.id,
        name: product.name,
        description: product.description,
        points: product.unsold_price,
        image: product.image_url,
        category: product.category,
      },
      [], // Pas de customisation
      1, // Quantité 1
      product.unsold_price // Prix total
    );
    
    Alert.alert('Ajouté !', `${product.name} ajouté au panier`);
  };

  const calculateSavings = (originalPrice: number, unsoldPrice: number) => {
    return originalPrice - unsoldPrice;
  };

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
    ]).start(() => {
      onClose();
    });
  };

  return (
    <>
      <Modal
        visible={visible && !showCustomization}
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
                transform: [{ scale: scaleAnim }],
              }
            ]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Percent size={24} color="#FF9500" />
                <Text style={styles.title}>Plats invendus</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.subtitle}>
              <Text style={styles.subtitleText}>
                Profitez de -80% sur les plats restants de {provider?.name}
              </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Chargement des offres...</Text>
                </View>
              ) : unsoldProducts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Percent size={64} color="#E5E5E5" />
                  <Text style={styles.emptyTitle}>Aucun plat invendu</Text>
                  <Text style={styles.emptySubtitle}>
                    Revenez plus tard pour découvrir les offres spéciales
                  </Text>
                </View>
              ) : (
                unsoldProducts.map((product) => {
                  const savings = calculateSavings(product.original_price, product.unsold_price);
                  const isExpired = timeRemaining[product.id] === 'Expiré';
                  
                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={[styles.productCard, isExpired && styles.expiredCard]}
                      onPress={() => !isExpired && handleProductPress(product)}
                      disabled={isExpired}
                    >
                      <Image source={{ uri: product.image_url }} style={styles.productImage} />
                      
                      <View style={styles.productInfo}>
                        <View style={styles.productHeader}>
                          <Text style={styles.productName} numberOfLines={2}>
                            {product.name}
                          </Text>
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-80%</Text>
                          </View>
                        </View>
                        
                        <Text style={styles.productDescription} numberOfLines={2}>
                          {product.description}
                        </Text>
                        
                        <View style={styles.priceContainer}>
                          <Text style={styles.originalPrice}>
                            {product.original_price.toLocaleString()} pts
                          </Text>
                          <Text style={styles.unsoldPrice}>
                            {product.unsold_price.toLocaleString()} pts
                          </Text>
                        </View>
                        
                        <View style={styles.savingsContainer}>
                          <Text style={styles.savingsText}>
                            Économisez {savings.toLocaleString()} pts
                          </Text>
                        </View>
                        
                        <View style={styles.timerContainer}>
                          <Clock size={14} color={isExpired ? "#FF3B30" : "#FF9500"} />
                          <Text style={[
                            styles.timerText,
                            { color: isExpired ? "#FF3B30" : "#FF9500" }
                          ]}>
                            {isExpired ? 'Offre expirée' : `Expire dans ${timeRemaining[product.id] || 'Calcul...'}`}
                          </Text>
                        </View>
                      </View>
                      
                      {!isExpired && (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity 
                            style={styles.quickAddButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleQuickAdd(product);
                            }}
                          >
                            <ShoppingCart size={16} color="#fff" />
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.customizeButton}
                            onPress={() => handleProductPress(product)}
                          >
                            <Plus size={16} color="#FF9500" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Product Customization Modal */}
      <ProductCustomizationModal
        visible={showCustomization}
        onClose={() => {
          setShowCustomization(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAddToCart={onAddToCart}
      />
    </>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  subtitle: {
    backgroundColor: '#FFF8F0',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  subtitleText: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E8E',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  expiredCard: {
    opacity: 0.5,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  unsoldPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  savingsContainer: {
    marginBottom: 8,
  },
  savingsText: {
    fontSize: 12,
    color: '#00B14F',
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  quickAddButton: {
    backgroundColor: '#00B14F',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customizeButton: {
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FF9500',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});