import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
  Alert
} from 'react-native';
import { Search, MapPin, Star, Wallet } from 'lucide-react-native';
import { useState } from 'react';
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
import { useEffect } from 'react';
import { formatPointsWithFcfa } from '@/utils/pointsConversion';
import { formatPoints } from '@/utils/pointsConversion';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
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

  useEffect(() => {
    // Pas de chargement depuis la base de données - utiliser les données statiques
  }, []);

  const handleProviderPress = (provider: ProviderCompat) => {
    try {
      // Vérification de validité du provider
      if (!provider || !provider.id) {
        console.error('Provider invalide:', provider);
        Alert.alert('Erreur', 'Informations du prestataire invalides. Veuillez réessayer.');
        return;
      }
      
      console.log('Provider sélectionné:', provider.id, provider.name);
      
      // On défini d'abord le provider
      setSelectedProvider(provider);
      
      // Puis on ouvre le modal avec un petit délai pour éviter les problèmes d'animation
      setTimeout(() => {
        // Vérification supplémentaire avant d'ouvrir le modal
        setDetailModalVisible(true);
      }, 200);
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
        {/* Featured Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Jusqu'à -30% sur vos plats préférés</Text>
            <Text style={styles.bannerSubtitle}>Découvrez nos offres exclusives</Text>
          </View>
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
    margin: 20,
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