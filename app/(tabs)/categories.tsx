import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useState } from 'react';
import { Wallet, MapPin } from 'lucide-react-native';
import { mockProviders } from '@/data/providers';
import ProviderCard from '@/components/ProviderCard';
import ProviderDetailModal from '@/components/ProviderDetailModal';
import { type Provider } from '@/data/providers';

const categories = [
  { id: 'all', name: 'Tous', color: '#00B14F' },
  { id: 'food', name: 'Restaurant', color: '#FF6B6B' },
  { id: 'beauty', name: 'Beauté', color: '#4ECDC4' },
  { id: 'fastfood', name: 'Fast Food', color: '#45B7D1' },
  { id: 'cafe', name: 'Café', color: '#96CEB4' },
];

export default function CategoriesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Utilisateur connecté avec points
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
        </View>
        <Text style={styles.title}>Catégories</Text>
        <Text style={styles.subtitle}>Découvrez nos prestataires par catégorie</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category.id ? category.color : '#F5F5F5',
              },
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                {
                  color: selectedCategory === category.id ? '#fff' : '#000',
                },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.providersContainer} showsVerticalScrollIndicator={false}>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  providersContainer: {
    flex: 1,
    padding: 20,
  },
  resultsText: {
    fontSize: 16,
    color: '#8E8E8E',
    marginBottom: 15,
  },
  providerCard: {
    marginBottom: 15,
  },
});