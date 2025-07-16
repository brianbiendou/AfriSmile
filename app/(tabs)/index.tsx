import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput,
  Dimensions 
} from 'react-native';
import { Search, MapPin, Star, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import ProviderCard from '@/components/ProviderCard';
import ProviderDetailModal from '@/components/ProviderDetailModal';
import CartIcon from '@/components/CartIcon';
import CartModal from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';
import { mockProviders, type Provider } from '@/data/providers';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  
  const { cartCount } = useCart();

  // Utilisateur connecté avec points
  const userPoints = 15420;

  const handleProviderPress = (provider: Provider) => {
    setSelectedProvider(provider);
    setDetailModalVisible(true);
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
      return mockProviders;
    }
    
    return mockProviders.filter(provider => {
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

  const featuredProviders = mockProviders.slice(0, 3);
  const filteredProviders = getFilteredProviders();

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.locationContainer}>
            <MapPin size={20} color="#00B14F" />
            <Text style={styles.locationText}>Cocody, Abidjan</Text>
          </View>
          
          <View style={styles.pointsContainer}>
            <Wallet size={18} color="#00B14F" />
            <Text style={styles.pointsText}>{userPoints.toLocaleString()} pts</Text>
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

      <ProviderDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        provider={selectedProvider}
        userPoints={userPoints}
      />

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
    paddingTop: 45,
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
    marginBottom: 10,
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
    paddingTop: 20,
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
    paddingVertical: 12,
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
    width: width * 0.7,
    marginLeft: 20,
  },
  fullWidthCard: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
});