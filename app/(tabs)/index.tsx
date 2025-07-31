import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
  Alert,
  FlatList
} from 'react-native';
import { Search, MapPin, Star, Wallet } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import ProviderCard from '@/components/ProviderCard';
import ProviderDetailModal from '@/components/ProviderDetailModal';
import CartIcon from '@/components/CartIcon';
import CartModal from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';
import ReconnectionStatus from '@/components/ReconnectionStatus';
import { getProviders, subscribeToProviders } from '@/lib/providers';
import { convertProviderToCompat, type ProviderCompat } from '@/data/providers';
import { useAuth } from '@/contexts/AuthContext';
import { formatPointsWithFcfa } from '@/utils/pointsConversion';
import { formatPoints } from '@/utils/pointsConversion';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { showCart } = useLocalSearchParams<{ showCart?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderCompat | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [providers, setProviders] = useState<ProviderCompat[]>([
    {
      id: '1',
      name: 'Chez Tante Marie',
      category: 'Cuisine Africaine',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      rating: 4.8,
      estimatedTime: '30-45 min',
      location: 'Cocody',
      discount: 15,
    },
    {
      id: '2',
      name: 'Beauty Palace',
      category: 'Salon de Beauté',
      image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
      rating: 4.6,
      estimatedTime: '45-60 min',
      location: 'Plateau',
      discount: 20,
    },
    {
      id: '3',
      name: 'Pizza Express CI',
      category: 'Fast Food',
      image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
      rating: 4.4,
      estimatedTime: '20-30 min',
      location: 'Marcory',
      discount: 10,
    },
    {
      id: '4',
      name: 'Le Maquis du Coin',
      category: 'Cuisine Africaine',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      rating: 4.7,
      estimatedTime: '25-40 min',
      location: 'Yopougon',
      discount: 18,
    },
    {
      id: '5',
      name: 'Glamour Nails',
      category: 'Manucure & Pédicure',
      image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg',
      rating: 4.9,
      estimatedTime: '60-90 min',
      location: 'Cocody',
      discount: 25,
    },
    {
      id: '6',
      name: 'Burger King CI',
      category: 'Fast Food',
      image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
      rating: 4.2,
      estimatedTime: '15-25 min',
      location: 'Plateau',
      discount: 12,
    },
    {
      id: '7',
      name: 'Café de la Paix',
      category: 'Café & Pâtisserie',
      image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
      rating: 4.5,
      estimatedTime: '10-20 min',
      location: 'Plateau',
      discount: 8,
    },
    {
      id: '8',
      name: 'Attiéké Palace',
      category: 'Cuisine Africaine',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      rating: 4.6,
      estimatedTime: '20-35 min',
      location: 'Adjamé',
      discount: 14,
    },
    {
      id: '9',
      name: 'Coiffure Moderne',
      category: 'Salon de Beauté',
      image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
      rating: 4.3,
      estimatedTime: '90-120 min',
      location: 'Treichville',
      discount: 22,
    },
    {
      id: '10',
      name: 'KFC Abidjan',
      category: 'Fast Food',
      image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg',
      rating: 4.1,
      estimatedTime: '15-25 min',
      location: 'Marcory',
      discount: 9,
    },
    {
      id: '11',
      name: 'Pâtisserie Royale',
      category: 'Café & Pâtisserie',
      image: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg',
      rating: 4.8,
      estimatedTime: '5-15 min',
      location: 'Cocody',
      discount: 16,
    },
    {
      id: '12',
      name: 'Chez Mama Adjoua',
      category: 'Cuisine Africaine',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      rating: 4.9,
      estimatedTime: '35-50 min',
      location: 'Abobo',
      discount: 20,
    },
    {
      id: '13',
      name: 'Spa Wellness',
      category: 'Salon de Beauté',
      image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg',
      rating: 4.7,
      estimatedTime: '120-180 min',
      location: 'Cocody',
      discount: 30,
    },
    {
      id: '14',
      name: 'Dominos Pizza',
      category: 'Fast Food',
      image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
      rating: 4.0,
      estimatedTime: '25-35 min',
      location: 'Plateau',
      discount: 11,
    },
    {
      id: '15',
      name: 'Boulangerie du Quartier',
      category: 'Café & Pâtisserie',
      image: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg',
      rating: 4.4,
      estimatedTime: '5-10 min',
      location: 'Yopougon',
      discount: 7,
    },
    {
      id: '16',
      name: 'Restaurant Ivoirien',
      category: 'Cuisine Africaine',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      rating: 4.5,
      estimatedTime: '30-45 min',
      location: 'Treichville',
      discount: 17,
    },
    {
      id: '17',
      name: 'Nails Art Studio',
      category: 'Manucure & Pédicure',
      image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg',
      rating: 4.6,
      estimatedTime: '45-75 min',
      location: 'Plateau',
      discount: 23,
    },
    {
      id: '18',
      name: 'Quick Burger',
      category: 'Fast Food',
      image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
      rating: 3.9,
      estimatedTime: '10-20 min',
      location: 'Adjamé',
      discount: 13,
    },
    {
      id: '19',
      name: 'Café Littéraire',
      category: 'Café & Pâtisserie',
      image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
      rating: 4.7,
      estimatedTime: '15-25 min',
      location: 'Cocody',
      discount: 10,
    },
    {
      id: '20',
      name: 'Maquis Traditionnel',
      category: 'Cuisine Africaine',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      rating: 4.8,
      estimatedTime: '40-55 min',
      location: 'Abobo',
      discount: 19,
    },
  ]);
  const [loading, setLoading] = useState(false);
  
  const { cartCount } = useCart();
  const { user } = useAuth();

  // Points de l'utilisateur connecté
  const userPoints = user?.points || 0;

  // Fonction pour rendre une bannière
  const renderBannerItem = ({ item }: { item: typeof bannerAds[0] }) => (
    <View style={styles.bannerContainer}>
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
      />
      <View style={[styles.bannerOverlay, { backgroundColor: item.backgroundColor }]}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  useEffect(() => {
    // Pas de chargement depuis la base de données - utiliser les données statiques
  }, []);

  // Gérer l'ouverture automatique du panier
  useEffect(() => {
    if (showCart === 'true') {
      setCartModalVisible(true);
    }
  }, [showCart]);

  // Défilement automatique des bannières
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        
        // Si on arrive à la fin des bannières originales, on revient au début sans animation
        if (nextIndex >= 5) { // 5 bannières originales
          // Défiler vers la première bannière dupliquée d'abord
          if (bannerFlatListRef.current) {
            bannerFlatListRef.current.scrollToIndex({
              index: 5, // Index de la première bannière dupliquée
              animated: true,
            });
          }
          
          // Puis revenir au début après un court délai
          setTimeout(() => {
            if (bannerFlatListRef.current) {
              bannerFlatListRef.current.scrollToIndex({
                index: 0,
                animated: false, // Pas d'animation pour éviter le saut visuel
              });
            }
          }, 300);
          
          return 0;
        } else {
          // Défiler normalement vers la bannière suivante
          if (bannerFlatListRef.current) {
            bannerFlatListRef.current.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          }
          return nextIndex;
        }
      });
    }, 3000); // Défilement toutes les 3 secondes

    return () => clearInterval(interval);
  }, []); // Pas de dépendance pour éviter les problèmes

  const handleProviderPress = (provider: ProviderCompat) => {
    try {
      // Vérification de validité du provider
      if (!provider || !provider.id) {
        console.error('Provider invalide:', provider);
        Alert.alert('Erreur', 'Informations du prestataire invalides. Veuillez réessayer.');
        return;
      }
      
      console.log('Provider sélectionné:', provider.id, provider.name);
      
      // On défini d'abord le provider et ouvre immédiatement le modal
      setSelectedProvider(provider);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Erreur lors de la sélection du prestataire:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ouverture du prestataire. Veuillez réessayer.');
    }
  };

  const categories = [
    { name: 'Tous', emoji: '🏪', color: '#00B14F', filter: 'all' },
    { name: 'Fast Food', emoji: '🍔', color: '#FF6B6B', filter: 'fastfood' },
    { name: 'Beauté', emoji: '💄', color: '#4ECDC4', filter: 'beauty' },
    { name: 'Pizza', emoji: '🍕', color: '#45B7D1', filter: 'pizza' },
    { name: 'Café', emoji: '☕', color: '#96CEB4', filter: 'cafe' },
  ];

  // Données des bannières publicitaires
  const originalBannerAds = [
    {
      id: '1',
      title: 'Jusqu\'à -30% sur vos plats préférés',
      subtitle: 'Découvrez nos offres exclusives',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    {
      id: '2',
      title: 'Livraison gratuite dès 5000 FCFA',
      subtitle: 'Profitez de nos services premium',
      image: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg',
      backgroundColor: 'rgba(0, 177, 79, 0.7)'
    },
    {
      id: '3',
      title: 'Nouveaux salons de beauté',
      subtitle: 'Réservez votre séance dès maintenant',
      image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
      backgroundColor: 'rgba(78, 205, 196, 0.7)'
    },
    {
      id: '4',
      title: 'Menu du jour à partir de 2500 FCFA',
      subtitle: 'Saveurs authentiques de la Côte d\'Ivoire',
      image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg',
      backgroundColor: 'rgba(255, 107, 107, 0.7)'
    },
    {
      id: '5',
      title: 'Cashback doublé ce weekend !',
      subtitle: 'Gagnez plus de points sur vos achats',
      image: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg',
      backgroundColor: 'rgba(150, 206, 180, 0.7)'
    }
  ];

  // Créer un tableau infini en dupliquant les bannières
  const bannerAds = [
    ...originalBannerAds,
    ...originalBannerAds.map(banner => ({
      ...banner,
      id: banner.id + '_duplicate'
    }))
  ];

  // État pour le carousel des bannières
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerFlatListRef = useRef<FlatList>(null);

  const handleCategoryPress = (filter: string) => {
    setSelectedCategory(filter);
  };

  const getFilteredProviders = () => {
    if (selectedCategory === 'all') {
      return providers;
    }
    
    return providers.filter(provider => {
      switch (selectedCategory) {
        case 'fastfood':
          return provider.category.includes('Fast Food');
        case 'beauty':
          return provider.category.includes('Beauté') || provider.category.includes('Manucure');
        case 'pizza':
          return provider.name.toLowerCase().includes('pizza');
        case 'cafe':
          return provider.category.includes('Café');
        default:
          return true;
      }
    });
  };

  const featuredProviders = providers.slice(0, 4);
  const filteredProviders = getFilteredProviders();

  return (
    <View style={styles.container}>
      {/* Status de reconnexion automatique */}
      <ReconnectionStatus 
        onReconnectSuccess={() => {
          console.log('✅ Utilisateur reconnecté avec succès');
        }}
      />

      {/* Header fixe */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.locationContainer}>
            <MapPin size={20} color="#00B14F" />
            <Text style={styles.locationText}>Cocody, Abidjan</Text>
          </View>
          
          <View style={styles.pointsContainer}>
            <Wallet size={18} color="#00B14F" />
            <Text style={styles.pointsText}>{formatPoints(userPoints)}</Text>
          </View>
          
          <CartIcon onPress={() => setCartModalVisible(true)} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contenu scrollable */}
        <View style={styles.scrollContent}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#8E8E8E" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher restaurants, salons..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8E8E8E"
            />
          </View>
        </View>
        {/* Featured Banner Carousel */}
        <FlatList
          ref={bannerFlatListRef}
          data={bannerAds}
          renderItem={renderBannerItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          snapToAlignment="center"
          decelerationRate="fast"
          style={styles.bannerCarousel}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            // Convertir l'index du carousel infini vers l'index des bannières originales
            const realIndex = newIndex % 5; // 5 bannières originales
            setCurrentBannerIndex(realIndex);
          }}
        />
        
        {/* Indicateurs de pages (dots) */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3, 4].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentBannerIndex ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories populaires</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map((category, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.categoryCard, 
                  { 
                    backgroundColor: selectedCategory === category.filter ? category.color : category.color,
                    opacity: selectedCategory === category.filter ? 1 : 0.8,
                    transform: selectedCategory === category.filter ? [{ scale: 1.05 }] : [{ scale: 1 }]
                  }
                ]}
                onPress={() => handleCategoryPress(category.filter)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Providers - Only show if "Tous" is selected */}
        {selectedCategory === 'all' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommandés pour vous</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onPress={handleProviderPress}
                  style={styles.featuredCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filtered Providers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'Tous les prestataires' : `${categories.find(c => c.filter === selectedCategory)?.name}`}
          </Text>
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onPress={handleProviderPress}
              style={styles.fullWidthCard}
            />
          ))}
        </View>
      </ScrollView>

      {/* Afficher le modal seulement si un provider valide est sélectionné */}
      {selectedProvider && selectedProvider.id && detailModalVisible && (
        <ProviderDetailModal
          visible={detailModalVisible} 
          onClose={() => {
            try {
              // Fermer le modal d'abord
              setDetailModalVisible(false);
              
              // Augmenter le délai pour s'assurer que les animations sont terminées
              setTimeout(() => {
                // Réinitialiser le provider sélectionné après fermeture complète
                setSelectedProvider(null);
              }, 500);
            } catch (error) {
              console.error('Erreur lors de la fermeture du modal:', error);
              // Nettoyage en cas d'erreur
              setDetailModalVisible(false);
              setSelectedProvider(null);
            }
          }}
          provider={selectedProvider}
          userPoints={userPoints}
        />
      )}

      <CartModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
        onCheckout={() => {
          setCartModalVisible(false);
          setCheckoutModalVisible(true);
        }}
      />

      <CheckoutModal
        visible={checkoutModalVisible}
        onClose={() => setCheckoutModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 5, // Réduit de 45 à 5 pour réduire l'espace avec le sélecteur d'application
    paddingHorizontal: 20,
    paddingBottom: 10,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 5, // Réduit de 10 à 5 pour réduire l'espace avec la zone de recherche
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  scrollContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10, // Réduit de 20 à 10 pour réduire l'espace avec la zone de recherche
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8, // Réduit de 12 à 8 pour réduire la hauteur
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  bannerContainer: {
    width: width - 40, // Largeur de l'écran moins les marges (20 de chaque côté)
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 150,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  categoriesContainer: {
    paddingLeft: 20,
  },
  categoryCard: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuredCard: {
    width: width * 0.42, // Réduit de 40% : 0.7 * 0.6 = 0.42
    marginLeft: 20,
  },
  bannerCarousel: {
    height: 150,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#00B14F',
  },
  inactiveDot: {
    backgroundColor: '#E5E5E5',
  },
  fullWidthCard: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E8E',
  },
});