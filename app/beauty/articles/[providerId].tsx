import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShoppingBag, Plus } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';

// Mock data pour les articles beauté
const mockBeautyProducts = [
  {
    id: '1',
    name: 'Shampoing Hydratant',
    description: 'Shampoing professionnel pour cheveux secs et abîmés',
    points: 32, // 2500 FCFA ÷ 78.359
    fcfaPrice: 2500,
    image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg',
    category: 'Soins Cheveux',
    brand: 'Belle Époque Pro',
    inStock: true
  },
  {
    id: '2',
    name: 'Crème Anti-âge',
    description: 'Crème visage anti-âge aux peptides et vitamine C',
    points: 96, // 7500 FCFA ÷ 78.359
    fcfaPrice: 7500,
    image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg',
    category: 'Soins Visage',
    brand: 'Belle Époque Pro',
    inStock: true
  },
  {
    id: '3',
    name: 'Vernis Semi-Permanent',
    description: 'Vernis gel longue tenue, couleur Rouge Passion',
    points: 25, // 2000 FCFA ÷ 78.359
    fcfaPrice: 2000,
    image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg',
    category: 'Ongles',
    brand: 'Belle Époque Pro',
    inStock: true
  },
  {
    id: '4',
    name: 'Palette Maquillage',
    description: 'Palette 12 couleurs pour un maquillage parfait',
    points: 64, // 5000 FCFA ÷ 78.359
    fcfaPrice: 5000,
    image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg',
    category: 'Maquillage',
    brand: 'Belle Époque Pro',
    inStock: true
  },
  {
    id: '5',
    name: 'Huile Essentielle Argan',
    description: 'Huile pure d\'argan pour cheveux et peau',
    points: 45, // 3500 FCFA ÷ 78.359
    fcfaPrice: 3500,
    image: 'https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg',
    category: 'Soins Cheveux',
    brand: 'Belle Époque Pro',
    inStock: false
  },
  {
    id: '6',
    name: 'Fond de Teint',
    description: 'Fond de teint longue tenue, couvrance modulable',
    points: 77, // 6000 FCFA ÷ 78.359
    fcfaPrice: 6000,
    image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg',
    category: 'Maquillage',
    brand: 'Belle Époque Pro',
    inStock: true
  }
];

export default function BeautyArticlesScreen() {
  const { providerId, returnToModal } = useLocalSearchParams();
  const { addToCart } = useCart();

  // Fonction pour gérer le retour
  const handleBack = () => {
    if (returnToModal === 'true') {
      // Revenir à la page d'accueil et rouvrir le modal du prestataire
      router.replace({
        pathname: '/',
        params: { 
          openProvider: providerId as string
        }
      });
    } else {
      router.back();
    }
  };

  const handleAddToCart = (product: any) => {
    if (!product.inStock) {
      Alert.alert('Produit indisponible', 'Ce produit n\'est actuellement pas en stock.');
      return;
    }

    const cartItemId = addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      basePrice: product.points,
      quantity: 1,
      customizations: [],
      totalPrice: product.points,
      providerId: providerId as string,
      providerName: 'Salon Belle Époque'
    });

    Alert.alert(
      'Produit ajouté !', 
      `${product.name} a été ajouté à votre panier.`,
      [
        {
          text: 'Continuer mes achats',
          style: 'cancel',
          onPress: () => {
            // Rester sur la page des articles beauté du prestataire
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

  const categories = [...new Set(mockBeautyProducts.map(product => product.category))];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Articles Beauté',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Boutique Beauté</Text>
          <Text style={styles.headerSubtitle}>Découvrez nos produits professionnels</Text>
        </View>

        {/* Produits par catégorie */}
        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            
            <View style={styles.productsGrid}>
              {mockBeautyProducts
                .filter(product => product.category === category)
                .map((product) => (
                  <View key={product.id} style={styles.productCard}>
                    <View style={styles.productImageContainer}>
                      <Image source={{ uri: product.image }} style={styles.productImage} />
                      {!product.inStock && (
                        <View style={styles.outOfStockOverlay}>
                          <Text style={styles.outOfStockText}>Rupture</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.productInfo}>
                      <Text style={styles.productBrand}>{product.brand}</Text>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text style={styles.productDescription} numberOfLines={2}>
                        {product.description}
                      </Text>
                      
                      <View style={styles.priceContainer}>
                        <Text style={styles.fcfaPrice}>
                          {product.fcfaPrice.toLocaleString()} FCFA
                        </Text>
                        <Text style={styles.pointsPrice}>
                          {product.points} pts
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        style={[
                          styles.addButton,
                          !product.inStock && styles.disabledButton
                        ]}
                        onPress={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                      >
                        <ShoppingBag size={16} color="#fff" />
                        <Text style={styles.addButtonText}>
                          {product.inStock ? 'Ajouter' : 'Indisponible'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#EC4899',
    padding: 25,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  categorySection: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 15,
    textAlign: 'center',
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#EC4899',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productBrand: {
    fontSize: 12,
    color: '#EC4899',
    fontWeight: '600',
    marginBottom: 5,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
    lineHeight: 18,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: 16,
  },
  priceContainer: {
    marginBottom: 10,
  },
  fcfaPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  pointsPrice: {
    fontSize: 16,
    color: '#EC4899',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#EC4899',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
