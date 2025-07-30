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
import { getProviders, getProvidersByCategory } from '@/lib/providers';
import { convertProviderToCompat, type ProviderCompat } from '@/data/providers';
import ProviderCard from '@/components/ProviderCard';
import ProviderDetailModal from '@/components/ProviderDetailModal';
import CartIcon from '@/components/CartIcon';
import CartModal from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatPointsWithFcfa } from '@/utils/pointsConversion';
import { formatPoints } from '@/utils/pointsConversion';

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
  const [selectedProvider, setSelectedProvider] = useState<ProviderCompat | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
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
  }, [selectedCategory]);

  const handleProviderPress = (provider: ProviderCompat) => {
    setSelectedProvider(provider);
    setDetailModalVisible(true);
  };

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
            <Text style={styles.pointsText}>{formatPoints(userPoints)}</Text>
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

        {(() => {
          const filteredCount = providers.filter(provider => {
            if (selectedCategory === 'all') return true;
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
          }).length;
          
          return (
            <Text style={styles.resultsText}>
              {loading ? 'Chargement...' : `${filteredCount} prestataire${filteredCount > 1 ? 's' : ''} trouvé${filteredCount > 1 ? 's' : ''}`}
            </Text>
          );
        })()}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des prestataires...</Text>
          </View>
        ) : (
          providers.filter(provider => {
            if (selectedCategory === 'all') return true;
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
          }).map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onPress={handleProviderPress}
            style={styles.providerCard}
          />
          ))
        )}
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
    paddingTop: 5, // Réduit de 45 à 5 pour réduire l'espace avec le sélecteur d'application
    paddingHorizontal: 20,
    paddingBottom: 5, // Réduit de 10 à 5 pour réduire l'espace avec le contenu principal
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 5, // Réduit de 10 à 5 pour réduire l'espace avec le contenu principal
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
    paddingTop: 10, // Réduit de 20 à 10 pour réduire l'espace avec le header
    paddingBottom: 10, // Réduit de 20 à 10 pour réduire l'espace avec les catégories
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
    paddingVertical: 10, // Réduit de 20 à 10 pour réduire l'espace
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E8E',
  },
});