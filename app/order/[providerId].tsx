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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Clock, MapPin } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

// Types pour les produits
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export default function OrderScreen() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Données d'exemple pour le prestataire (à remplacer par des données réelles)
  const provider = {
    id: providerId,
    name: 'Chez Tante Marie',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    rating: 4.8,
    estimatedTime: '30-45 min',
    location: 'Cocody',
    category: 'Cuisine Africaine',
    description: 'Restaurant de cuisine africaine authentique avec des plats traditionnels ivoiriens.',
  };

  // Produits d'exemple (à remplacer par des données réelles)
  const products: Product[] = [
    {
      id: '1',
      name: 'Attiéké Poisson',
      description: 'Attiéké traditionnel servi avec du poisson braisé et des légumes',
      price: 2500,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      category: 'Plats principaux',
      available: true,
    },
    {
      id: '2',
      name: 'Foutou Sauce Arachide',
      description: 'Foutou plantain avec sauce arachide et viande de bœuf',
      price: 3000,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      category: 'Plats principaux',
      available: true,
    },
    {
      id: '3',
      name: 'Riz Gras',
      description: 'Riz cuisiné avec des légumes et du poisson fumé',
      price: 2000,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      category: 'Plats principaux',
      available: true,
    },
    {
      id: '4',
      name: 'Bangui',
      description: 'Boisson traditionnelle à base de gingembre',
      price: 500,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      category: 'Boissons',
      available: true,
    },
  ];

  const updateQuantity = (productId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change)
    }));
  };

  const handleProductPress = (product: Product) => {
    // Naviguer vers la page de personnalisation du produit
    router.push({
      pathname: '/product/[productId]',
      params: { productId: product.id }
    });
  };

  const addProductToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      basePrice: product.price,
      quantity: quantity,
      customizations: [],
      extras: [],
      totalPrice: product.price * quantity,
      providerId: provider.id!,
      providerName: provider.name,
    });
    
    Alert.alert(
      'Produit ajouté',
      `${product.name} (x${quantity}) a été ajouté au panier`,
      [{ text: 'OK' }]
    );
  };

  const renderProduct = (product: Product) => {
    const quantity = quantities[product.id] || 0;

    return (
      <TouchableOpacity 
        key={product.id} 
        style={styles.productCard}
        onPress={() => handleProductPress(product)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <Text style={styles.productPrice}>{product.price.toLocaleString()} FCFA</Text>
          
          <View style={styles.productActions}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                handleProductPress(product);
              }}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Commander</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Provider Info */}
        <View style={styles.providerSection}>
          <Image source={{ uri: provider.image }} style={styles.providerImage} />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <View style={styles.providerDetails}>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rating}>{provider.rating}</Text>
              </View>
              <View style={styles.timeContainer}>
                <Clock size={16} color="#666" />
                <Text style={styles.estimatedTime}>{provider.estimatedTime}</Text>
              </View>
              <View style={styles.locationContainer}>
                <MapPin size={16} color="#666" />
                <Text style={styles.location}>{provider.location}</Text>
              </View>
            </View>
            <Text style={styles.providerDescription}>{provider.description}</Text>
          </View>
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {products.map(renderProduct)}
        </View>
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
    paddingTop: 50, // Augmenté pour éviter le chevauchement avec la zone de notification
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  providerSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  providerImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 15,
  },
  providerInfo: {
    alignItems: 'flex-start',
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  providerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  providerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  productsSection: {
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 20,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
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
    lineHeight: 18,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 10,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    minWidth: 20,
    textAlign: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B14F',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  customizeButton: {
    backgroundColor: '#00B14F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  customizeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00B14F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
