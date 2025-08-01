import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ArrowLeft, Clock, Percent, Plus, ShoppingCart } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUnsoldProducts } from '@/lib/products';
import { fcfaToPoints } from '@/utils/pointsConversion';

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

export default function UnsoldProductsScreen() {
  const { providerId, returnToModal } = useLocalSearchParams<{ providerId: string; returnToModal?: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [unsoldProducts, setUnsoldProducts] = useState<UnsoldProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});

  // Fonction pour gérer le retour
  const handleBack = () => {
    if (returnToModal === 'true') {
      // Revenir à la page d'accueil et rouvrir le modal du prestataire
      router.replace({
        pathname: '/',
        params: { 
          openProvider: providerId
        }
      });
    } else {
      router.back();
    }
  };

  useEffect(() => {
    if (providerId) {
      loadUnsoldProducts();
    }
  }, [providerId]);

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

    // Calcul initial
    const initialTimeRemaining: { [key: string]: string } = {};
    unsoldProducts.forEach(product => {
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

    return () => clearInterval(interval);
  }, [unsoldProducts]);

  const loadUnsoldProducts = async () => {
    if (!providerId) return;
    
    setLoading(true);
    try {
      const products = await getUnsoldProducts(providerId);
      setUnsoldProducts(products);
    } catch (error) {
      console.error('Erreur lors du chargement des invendus:', error);
      Alert.alert('Erreur', 'Impossible de charger les plats invendus');
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: UnsoldProduct) => {
    // Si le produit peut être ajouté directement au panier (boissons, accompagnements simples)
    const simpleCategories = ['Boissons', 'Accompagnements', 'Desserts'];
    
    if (simpleCategories.includes(product.category)) {
      handleDirectAddToCart(product);
    } else {
      // Sinon, naviguer vers la page de personnalisation
      router.push({
        pathname: '/product-customization/[productId]',
        params: { 
          productId: product.id, 
          providerId: providerId,
          sourceRoute: 'unsold' // Indiquer que l'utilisateur vient de la page invendus
        }
      });
    }
  };

  const handleDirectAddToCart = (product: UnsoldProduct) => {
    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.image_url,
      basePrice: product.unsold_price,
      quantity: 1,
      customizations: [],
      extras: [],
      totalPrice: product.unsold_price,
      providerId: providerId as string,
      providerName: 'Restaurant',
    });
    
    Alert.alert(
      'Ajouté au panier', 
      `${product.name} a été ajouté à votre commande à prix réduit !`,
      [
        {
          text: 'Continuer mes achats',
          style: 'cancel',
          onPress: () => {
            // Rester sur la page des invendus du prestataire
            // Ne rien faire, l'utilisateur reste sur cette page
          }
        },
        {
          text: 'Voir le panier',
          style: 'default',
          onPress: () => {
            router.push('/cart');
          }
        }
      ]
    );
  };

  const renderUnsoldProduct = (product: UnsoldProduct) => {
    const discountPercentage = Math.round(((product.original_price - product.unsold_price) / product.original_price) * 100);
    const isExpired = timeRemaining[product.id] === 'Expiré';
    
    return (
      <TouchableOpacity
        key={product.id}
        style={[styles.productCard, isExpired && styles.expiredCard]}
        onPress={() => !isExpired && handleProductPress(product)}
        disabled={isExpired}
      >
        <Image source={{ uri: product.image_url }} style={styles.productImage} />
        
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{discountPercentage}%</Text>
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>
                {fcfaToPoints(product.unsold_price).toFixed(2)} pts
              </Text>
              <Text style={styles.originalPrice}>
                {fcfaToPoints(product.original_price).toFixed(2)} pts
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.currentPriceFcfa}>
                {product.unsold_price.toLocaleString()} FCFA
              </Text>
              <Text style={styles.originalPriceFcfa}>
                {product.original_price.toLocaleString()} FCFA
              </Text>
            </View>
          </View>
          
          <View style={styles.timeContainer}>
            <Clock size={14} color={isExpired ? '#FF3B30' : '#FF9500'} />
            <Text style={[styles.timeText, isExpired && styles.expiredText]}>
              {isExpired ? 'Expiré' : `Expire dans ${timeRemaining[product.id] || 'Calcul...'}`}
            </Text>
          </View>
        </View>
        
        {!isExpired && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              handleProductPress(product);
            }}
          >
            <Plus size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plats invendus</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Percent size={20} color="#FF9500" />
          <Text style={styles.infoText}>
            Profitez de -80% sur les plats restants de Chez Tante Marie
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des plats invendus...</Text>
          </View>
        ) : unsoldProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingCart size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>Aucun plat invendu</Text>
            <Text style={styles.emptyText}>
              Il n'y a actuellement aucun plat invendu disponible
            </Text>
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {unsoldProducts.map(renderUnsoldProduct)}
          </View>
        )}
      </ScrollView>
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
    paddingTop: 50, // Espace pour éviter le chevauchement avec les notifications
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#8B4000',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  productsContainer: {
    padding: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  expiredCard: {
    opacity: 0.6,
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F5F5F5',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  priceContainer: {
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Aligner à gauche
    alignItems: 'center',
    marginBottom: 2,
    gap: 15, // Petit espace entre les prix verts et rouges
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  currentPriceFcfa: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B14F',
  },
  originalPriceFcfa: {
    fontSize: 14,
    color: '#FF3B30', // Rouge pour les prix barrés
    textDecorationLine: 'line-through',
  },
  originalPrice: {
    fontSize: 14,
    color: '#FF3B30', // Rouge pour les prix barrés
    textDecorationLine: 'line-through',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  expiredText: {
    color: '#FF3B30',
  },
  addButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#00B14F',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
