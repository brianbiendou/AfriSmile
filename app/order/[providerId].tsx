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
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus, Truck, Package, Users, Star, Clock, MapPin, Percent } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { fcfaToPoints, formatFcfaAmount, formatPointsAmount } from '@/utils/pointsConversion';
import { getResponsiveTextProps } from '@/utils/responsiveStyles';

const { width } = Dimensions.get('window');

// Types pour les produits
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  isFeatured?: boolean;
  discount?: number;
}

// Types pour les offres
interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount: number;
  image: string;
  badge: string;
  badgeColor: string;
}

export default function OrderScreen() {
  const { providerId, returnToModal } = useLocalSearchParams<{ providerId: string; returnToModal?: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup' | 'group'>('delivery');

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

  // Données d'exemple pour le prestataire (à remplacer par des données réelles)
  const provider = {
    id: providerId,
    name: "K'Labraise",
    emoji: '🥩',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    rating: 4.6,
    reviewCount: 240,
    deliveryFee: 549,
    distance: '10.2 km',
    estimatedTime: '40 min',
    location: 'Cocody',
    category: 'Cuisine Africaine',
    description: 'Frais de livraison',
    loyalCustomers: '370+ clients fidèles',
    paymentMethods: 'Paiement par UpDéjeuner et Ticket Restaurant accepté',
  };

  // Produits en vedette
  const featuredProducts: Product[] = [
    {
      id: 'menu-kebab',
      name: 'MENU KEBAB',
      description: 'Menu complet avec kebab, frites et boisson',
      price: 12500,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      category: 'Menus',
      available: true,
      isFeatured: true,
      discount: 11,
    },
    {
      id: 'menu-pain',
      name: 'MENU PAIN ROND + 1 PAIN ROND SEUL',
      description: 'Pain rond traditionnel avec accompagnements',
      price: 17900,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      category: 'Menus',
      available: true,
      isFeatured: true,
      discount: 7,
    },
    {
      id: 'menu-naar',
      name: 'MENU NAAR',
      description: 'Menu spécialité maison avec viande grillée',
      price: 12900,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      category: 'Menus',
      available: true,
      isFeatured: true,
    },
  ];

  // Offres spéciales
  const specialOffers: Offer[] = [
    {
      id: 'bebe-tacos',
      title: 'BEBE TACOS KEBAB',
      description: 'Tacos onctueux viande kebab, sauce blanche, sauce maquis fait maison',
      price: 12900,
      originalPrice: 14500,
      discount: 11,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      badge: '1 acheté = 1 offert',
      badgeColor: '#FF4444',
    },
    {
      id: 'wings',
      title: '2 WINGS FAIT MAISON',
      description: 'Ailes de poulet frit fait maison',
      price: 3900,
      discount: 100,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      badge: '1 acheté = 1 offert',
      badgeColor: '#FF4444',
    },
  ];

  // Sections de menu organisées par catégories
  const menuSections = [
    {
      id: 'drinks',
      title: 'Boissons',
      emoji: '🥤',
      items: [
        {
          id: 'cola',
          name: 'Coca Cola 33cl',
          description: 'Boisson gazeuse rafraîchissante',
          price: 800,
          image: 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg',
        },
        {
          id: 'bissap',
          name: 'Bissap Maison',
          description: 'Jus de bissap traditionnel fait maison',
          price: 1200,
          image: 'https://images.pexels.com/photos/4062926/pexels-photo-4062926.jpeg',
        },
        {
          id: 'gingembre',
          name: 'Jus de Gingembre',
          description: 'Boisson épicée traditionnelle au gingembre',
          price: 1000,
          image: 'https://images.pexels.com/photos/4062926/pexels-photo-4062926.jpeg',
        },
      ]
    },
    {
      id: 'desserts',
      title: 'Desserts',
      emoji: '🍰',
      items: [
        {
          id: 'degue',
          name: 'Dègue aux Fruits',
          description: 'Dessert traditionnel au mil avec fruits frais',
          price: 1500,
          image: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg',
        },
        {
          id: 'banane-frite',
          name: 'Banane Frite',
          description: 'Bananes plantain frites avec sucre cannelle',
          price: 1200,
          image: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg',
        },
        {
          id: 'cake-chocolat',
          name: 'Cake au Chocolat',
          description: 'Gâteau au chocolat maison',
          price: 2000,
          image: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg',
        },
      ]
    },
    {
      id: 'entrees',
      title: 'Entrées',
      emoji: '🥗',
      items: [
        {
          id: 'salade-avocat',
          name: 'Salade d\'Avocat',
          description: 'Salade fraîche avec avocats, tomates et vinaigrette',
          price: 2500,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        },
        {
          id: 'allocos',
          name: 'Allocos',
          description: 'Bananes plantain frites avec sauce pimentée',
          price: 1800,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        },
        {
          id: 'beignets',
          name: 'Beignets de Crevettes',
          description: 'Beignets croustillants aux crevettes fraîches',
          price: 3500,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        },
      ]
    },
    {
      id: 'plats-principaux',
      title: 'Plats Principaux',
      emoji: '🍽️',
      items: [
        {
          id: 'attieke-poisson',
          name: 'Attiéké Poisson Braisé',
          description: 'Attiéké traditionnel avec poisson braisé et légumes',
          price: 4500,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        },
        {
          id: 'foutou-arachide',
          name: 'Foutou Sauce Arachide',
          description: 'Foutou plantain avec sauce d\'arachide et viande',
          price: 5000,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        },
        {
          id: 'riz-gras',
          name: 'Riz au Gras',
          description: 'Riz cuisiné avec viande et légumes',
          price: 4000,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        },
        {
          id: 'kedjenou',
          name: 'Kédjenou de Poulet',
          description: 'Poulet mijoté aux légumes dans sa sauce',
          price: 5500,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        },
      ]
    },
    {
      id: 'accompagnements',
      title: 'Accompagnements',
      emoji: '🍞',
      items: [
        {
          id: 'pain-traditionnel',
          name: 'Pain Traditionnel',
          description: 'Pain artisanal cuit au feu de bois',
          price: 500,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        },
        {
          id: 'riz-blanc',
          name: 'Riz Blanc',
          description: 'Riz blanc nature parfumé',
          price: 1000,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        },
        {
          id: 'frites-patates',
          name: 'Frites de Patates Douces',
          description: 'Frites croustillantes de patates douces',
          price: 1500,
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        },
      ]
    },
  ];

  const handleOfferPress = (offerId: string) => {
    // Les offres spéciales nécessitent une personnalisation
    router.push({
      pathname: '/product/[productId]',
      params: { productId: offerId }
    });
  };

  const handleMenuItemPress = (itemId: string, sectionId: string) => {
    // Déterminer si l'article nécessite une personnalisation ou peut être ajouté directement
    const simpleCategories = ['drinks', 'desserts', 'accompagnements'];
    
    if (simpleCategories.includes(sectionId)) {
      // Articles simples : ajouter directement au panier
      const section = menuSections.find(s => s.id === sectionId);
      const item = section?.items.find(i => i.id === itemId);
      
      if (item) {
        // Ajouter l'article au panier
        addToCart({
          productId: item.id,
          productName: item.name,
          productImage: item.image,
          basePrice: item.price,
          quantity: 1,
          customizations: [],
          extras: [],
          totalPrice: item.price,
          providerId: providerId as string,
          providerName: 'Restaurant' // Vous pouvez récupérer le vrai nom du provider
        });
        
        // Afficher un message de confirmation
        Alert.alert(
          'Ajouté au panier', 
          `${item.name} a été ajouté à votre commande`,
          [
            {
              text: 'Continuer mes achats',
              style: 'cancel',
              onPress: () => {
                // Rester sur la page des commandes du prestataire
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
      }
    } else {
      // Articles complexes : naviguer vers la page de personnalisation
      router.push({
        pathname: '/product/[productId]',
        params: { productId: itemId }
      });
    }
  };

  const handleProductPress = (product: Product) => {
    // Naviguer vers la page de personnalisation du produit
    router.push({
      pathname: '/product/[productId]',
      params: { productId: product.id }
    });
  };

  const handleDeliveryModeChange = (mode: 'delivery' | 'pickup' | 'group') => {
    setDeliveryMode(mode);
    
    switch (mode) {
      case 'delivery':
        Alert.alert('Mode Livraison', 'Livraison à domicile sélectionnée');
        break;
      case 'pickup':
        Alert.alert('Mode À emporter', 'Récupération au restaurant sélectionnée');
        break;
      case 'group':
        Alert.alert('Commande Groupe', 'Commande de groupe activée - Fonctionnalité à venir');
        break;
    }
  };

  const renderFeaturedProduct = (product: Product, index: number) => (
    <TouchableOpacity 
      key={product.id} 
      style={[styles.featuredProductCard, index % 3 !== 2 && styles.featuredProductMargin]}
      onPress={() => handleProductPress(product)}
    >
      <Image source={{ uri: product.image }} style={styles.featuredProductImage} />
      {product.discount && (
        <View style={styles.featuredDiscountBadge}>
          <Text style={styles.featuredDiscountText}>Le n°{index + 1} le plus acheté</Text>
        </View>
      )}
      <View style={styles.featuredProductInfo}>
        <Text style={styles.featuredProductName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.featuredPriceContainer}>
          <Text style={styles.featuredProductPrice}>{formatPointsAmount(fcfaToPoints(product.price))}</Text>
          <Text style={[styles.featuredProductPriceFcfa, getResponsiveTextProps('fcfa').style]}
                numberOfLines={getResponsiveTextProps('fcfa').numberOfLines}
                ellipsizeMode={getResponsiveTextProps('fcfa').ellipsizeMode}>
            {formatFcfaAmount(product.price)}
          </Text>
          {product.discount && (
            <View style={styles.featuredDiscountContainer}>
              <Percent size={12} color="#00B14F" />
              <Text style={styles.featuredDiscountPercent}>{product.discount}% ({Math.round(product.price * product.discount / 100)})</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity 
        style={styles.featuredAddButton}
        onPress={(e) => {
          e.stopPropagation();
          handleProductPress(product);
        }}
      >
        <Plus size={16} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderOffer = (offer: Offer) => (
    <View key={offer.id} style={styles.offerCard}>
      <View style={styles.offerInfo}>
        <Text style={styles.offerTitle}>{offer.title}</Text>
        <Text style={styles.offerPrice}>{formatPointsAmount(fcfaToPoints(offer.price))}</Text>
        <Text style={[styles.offerPriceFcfa, getResponsiveTextProps('fcfa').style]}
              numberOfLines={getResponsiveTextProps('fcfa').numberOfLines}
              ellipsizeMode={getResponsiveTextProps('fcfa').ellipsizeMode}>
          {formatFcfaAmount(offer.price)}
        </Text>
        {offer.originalPrice && (
          <Text style={styles.offerOriginalPrice}>{formatPointsAmount(fcfaToPoints(offer.originalPrice))}</Text>
        )}
        <View style={styles.offerDiscountContainer}>
          <Percent size={12} color="#00B14F" />
          <Text style={styles.offerDiscountText}>{offer.discount}% ({Math.round((offer.originalPrice || offer.price) * offer.discount / 100)})</Text>
        </View>
        <Text style={styles.offerDescription}>{offer.description}</Text>
        <View style={styles.offerBadge}>
          <Text style={styles.offerBadgeText}>{offer.badge}</Text>
        </View>
      </View>
      <View style={styles.offerImageContainer}>
        <Image source={{ uri: offer.image }} style={styles.offerImage} />
        <TouchableOpacity 
          style={styles.offerAddButton}
          onPress={() => Alert.alert('Offre', `${offer.title} ajoutée au panier`)}
        >
          <Plus size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Commander</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Restaurant Banner */}
        <View style={styles.restaurantBanner}>
          <Image source={{ uri: provider.image }} style={styles.restaurantImage} />
        </View>

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{provider.name} {provider.emoji}</Text>
          <View style={styles.restaurantStats}>
            <View style={styles.statItem}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.statText}>{provider.rating}</Text>
              <Text style={styles.statSubtext}>({provider.reviewCount}+)</Text>
            </View>
            <Text style={styles.statSeparator}>•</Text>
            <Text style={styles.statText}>{provider.description}: {provider.deliveryFee.toLocaleString()} FCFA</Text>
            <Text style={styles.statSeparator}>•</Text>
            <Text style={styles.statText}>{provider.distance}</Text>
          </View>
          <Text style={styles.paymentInfo}>{provider.paymentMethods}</Text>
          <Text style={styles.hoursInfo}>Appuyez pour consulter les horaires, les informations, etc.</Text>
          <Text style={styles.loyaltyInfo}>{provider.loyalCustomers}</Text>
        </View>

        {/* Delivery Mode Buttons */}
        <View style={styles.deliveryModeContainer}>
          <TouchableOpacity 
            style={[styles.deliveryModeButton, deliveryMode === 'delivery' && styles.activeModeButton]}
            onPress={() => handleDeliveryModeChange('delivery')}
          >
            <Truck size={16} color={deliveryMode === 'delivery' ? '#000' : '#666'} />
            <Text style={[styles.deliveryModeText, deliveryMode === 'delivery' && styles.activeModeText]}>
              Livraison
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.deliveryModeButton, deliveryMode === 'pickup' && styles.activeModeButton]}
            onPress={() => handleDeliveryModeChange('pickup')}
          >
            <Package size={16} color={deliveryMode === 'pickup' ? '#000' : '#666'} />
            <Text style={[styles.deliveryModeText, deliveryMode === 'pickup' && styles.activeModeText]}>
              À emporter
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.deliveryModeButton, deliveryMode === 'group' && styles.activeModeButton]}
            onPress={() => handleDeliveryModeChange('group')}
          >
            <Users size={16} color={deliveryMode === 'group' ? '#000' : '#666'} />
            <Text style={[styles.deliveryModeText, deliveryMode === 'group' && styles.activeModeText]}>
              Commande groupe
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Info */}
        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryInfoItem}>
            <Text style={styles.deliveryInfoTitle}>{provider.description}: {provider.deliveryFee.toLocaleString()} FCFA</Text>
            <Text style={styles.deliveryInfoSubtitle}>Autres frais</Text>
          </View>
          <View style={styles.deliveryInfoItem}>
            <Text style={styles.deliveryInfoTitle}>{provider.estimatedTime}</Text>
            <Text style={styles.deliveryInfoSubtitle}>Au plus tôt</Text>
          </View>
        </View>

        {/* Featured Products Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles en vedette</Text>
          <View style={styles.featuredGrid}>
            {featuredProducts.map((product, index) => renderFeaturedProduct(product, index))}
          </View>
        </View>

        {/* Offres Spéciales Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Offres Spéciales</Text>
          <View style={styles.verticalOffersContainer}>
            {specialOffers.map((offer) => (
              <TouchableOpacity
                key={offer.id}
                style={styles.verticalOfferCard}
                onPress={() => handleOfferPress(offer.id)}
              >
                <Image source={{ uri: offer.image }} style={styles.verticalOfferImage} />
                
                {offer.badge && (
                  <View style={[styles.offerBadge, { backgroundColor: offer.badgeColor }]}>
                    <Text style={styles.offerBadgeText}>{offer.badge}</Text>
                  </View>
                )}
                
                <View style={styles.verticalOfferContent}>
                  <Text style={styles.verticalOfferTitle}>{offer.title}</Text>
                  <Text style={styles.verticalOfferDescription} numberOfLines={2}>
                    {offer.description}
                  </Text>
                  
                  <View style={styles.verticalOfferPriceContainer}>
                    <Text style={styles.verticalOfferPrice}>{formatPointsAmount(fcfaToPoints(offer.price))}</Text>
                    <Text style={[styles.verticalOfferPriceFcfa, getResponsiveTextProps('fcfa').style]}
                          numberOfLines={getResponsiveTextProps('fcfa').numberOfLines}
                          ellipsizeMode={getResponsiveTextProps('fcfa').ellipsizeMode}>
                      {formatFcfaAmount(offer.price)}
                    </Text>
                    {offer.originalPrice && (
                      <Text style={styles.verticalOfferOriginalPrice}>{formatPointsAmount(fcfaToPoints(offer.originalPrice))}</Text>
                    )}
                    {offer.discount && (
                      <Text style={styles.verticalOfferDiscount}>-{offer.discount}%</Text>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.offerAddButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleOfferPress(offer.id);
                  }}
                >
                  <Text style={styles.offerAddButtonText}>+</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.emoji} {section.title}</Text>
            
            <View style={styles.menuItemsContainer}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item.id, section.id)}
                >
                  <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                  
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.menuItemPrice}>{formatPointsAmount(fcfaToPoints(item.price))}</Text>
                      <Text style={[styles.menuItemPriceFcfa, getResponsiveTextProps('fcfa').style]}
                            numberOfLines={getResponsiveTextProps('fcfa').numberOfLines}
                            ellipsizeMode={getResponsiveTextProps('fcfa').ellipsizeMode}>
                        {formatFcfaAmount(item.price)}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.menuAddButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleMenuItemPress(item.id, section.id);
                    }}
                  >
                    <Text style={styles.menuAddButtonText}>+</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: '#fff',
    marginBottom: 0,
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
  restaurantBanner: {
    height: 200,
    backgroundColor: '#fff',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  restaurantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  statSubtext: {
    fontSize: 14,
    color: '#666',
  },
  statSeparator: {
    marginHorizontal: 8,
    color: '#666',
  },
  paymentInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  hoursInfo: {
    fontSize: 14,
    color: '#0066CC',
    marginBottom: 8,
  },
  loyaltyInfo: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
  },
  deliveryModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  deliveryModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  activeModeButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#00B14F',
  },
  deliveryModeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeModeText: {
    color: '#000',
    fontWeight: '600',
  },
  deliveryInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 8,
    borderBottomColor: '#F0F0F0',
  },
  deliveryInfoItem: {
    flex: 1,
  },
  deliveryInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  deliveryInfoSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  featuredProductCard: {
    width: (width - 48) / 3,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  featuredProductMargin: {
    marginRight: 8,
  },
  featuredProductImage: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  featuredDiscountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#00B14F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredDiscountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  featuredProductInfo: {
    padding: 8,
    paddingBottom: 40,
  },
  featuredProductName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    lineHeight: 16,
  },
  featuredPriceContainer: {
    gap: 2,
  },
  featuredProductPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  featuredProductPriceFcfa: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  featuredDiscountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  featuredDiscountPercent: {
    fontSize: 10,
    color: '#00B14F',
    fontWeight: '600',
  },
  featuredAddButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Styles pour les offres spéciales verticales
  verticalOffersContainer: {
    marginTop: 12,
    gap: 12,
    paddingHorizontal: 20,
  },
  verticalOfferCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verticalOfferImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
    position: 'relative',
  },
  verticalOfferContent: {
    flex: 1,
    marginLeft: 12,
  },
  verticalOfferTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  verticalOfferDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  verticalOfferPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verticalOfferPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  verticalOfferPriceFcfa: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  verticalOfferOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  verticalOfferDiscount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF4444',
  },
  offerAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  offerAddButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Styles pour les offres horizontales (conservés pour référence)
  horizontalOffers: {
    marginTop: 12,
  },
  horizontalOfferCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalOfferImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  offerBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
    maxWidth: 70,
  },
  offerBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  horizontalOfferContent: {
    padding: 12,
  },
  horizontalOfferTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  horizontalOfferDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  horizontalOfferPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  horizontalOfferPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  horizontalOfferOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  horizontalOfferDiscount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF4444',
  },

  // Styles pour les sections de menu
  menuItemsContainer: {
    marginTop: 12,
    gap: 12,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 16,
  },
  menuItemPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  menuAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  menuAddButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

  offerCard: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  offerInfo: {
    flex: 1,
    paddingRight: 16,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  offerPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 2,
  },
  offerPriceFcfa: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  offerOriginalPrice: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  offerDiscountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  offerDiscountText: {
    fontSize: 12,
    color: '#00B14F',
    fontWeight: '600',
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  offerBadgeAlternate: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offerBadgeTextAlternate: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  offerImageContainer: {
    width: 120,
    height: 80,
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  menuItemPriceFcfa: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
});
