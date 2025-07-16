import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Wallet, MapPin, Percent, Utensils, Sparkles, Zap, Coffee } from 'lucide-react-native';
import { mockProviders } from '@/data/providers';
import ProviderCard from '@/components/ProviderCard';
import ProviderDetailModal from '@/components/ProviderDetailModal';
import CartIcon from '@/components/CartIcon';
import CartModal from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';
import { type Provider } from '@/data/providers';

const categories = [
  { 
    id: 'all', 
    name: 'Offres', 
    color: '#E53E3E',
    icon: Percent,
    bgColor: '#FED7D7'
  },
  { 
    id: 'food', 
    name: 'Restaurant', 
    color: '#38A169',
    icon: Utensils,
    bgColor: '#C6F6D5'
  },
  { 
    id: 'beauty', 
    name: 'Beauté', 
    color: '#D69E2E',
    icon: Sparkles,
    bgColor: '#FAF089'
  },
  { 
    id: 'fastfood', 
    name: 'Fast Food', 
    color: '#3182CE',
    icon: Zap,
    bgColor: '#BEE3F8'
  },
  { 
    id: 'cafe', 
    name: 'Café', 
    color: '#805AD5',
    icon: Coffee,
    bgColor: '#E9D8FD'
  },
];

export default function CategoriesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);

  const { cartCount } = useCart();
  const userPoints = 15420;

  const handleProviderPress = (provider: Provider) => {
    setSelectedProvider(provider);
    setDetailModalVisible(true);
  };

  const filteredProviders = selectedCategory === 'all' 
    ? mockProviders 
    : mockProviders.filter(provider => {
        switch (selectedCategory) {
          case 'food':
            return provider.category.includes('Cuisine');
          case 'beauty':
            return provider.category.includes('Beauté') || provider.category.includes('Manucure');
          case 'fastfood':
            return provider.category.includes('Fast Food');
          case 'cafe':
            return provider.category.includes('Café');
          default:
            return true;
        }
      });

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

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
      >
        {/* Contenu scrollable */}
        <View style={styles.scrollContent}>
          <Text style={styles.title}>Catégories</Text>
          <Text style={styles.subtitle}>Découvrez nos prestataires par catégorie</Text>
        </View>
        
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryContainer}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={[
                styles.categoryCircle,
                { 
                  backgroundColor: selectedCategory === category.id ? category.color : category.bgColor,
                  borderWidth: selectedCategory === category.id ? 3 : 0,
                  borderColor: selectedCategory === category.id ? category.color : 'transparent',
                }
              ]}>
                <category.icon 
                  size={28} 
                  color={selectedCategory === category.id ? '#fff' : category.color} 
                />
              </View>
              <Text style={[
                styles.categoryName,
                { 
                  color: selectedCategory === category.id ? category.color : '#000',
                  fontWeight: selectedCategory === category.id ? 'bold' : '500'
                }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.resultsText}>
          {filteredProviders.length} prestataire{filteredProviders.length > 1 ? 's' : ''} trouvé{filteredProviders.length > 1 ? 's' : ''}
        </Text>
        
        {filteredProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onPress={handleProviderPress}
            style={styles.providerCard}
          />
        ))}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E8E',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: 15,
  },
  categoryContainer: {
    alignItems: 'center',
    width: '18%',
    marginBottom: 10,
  },
  categoryCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  scrollView: {
    flex: 1,
  },
  resultsText: {
    paddingHorizontal: 20,
    paddingTop: 15,
    fontSize: 16,
    color: '#8E8E8E',
    marginBottom: 12,
  },
  providerCard: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
});