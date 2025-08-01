import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { X, Star, MapPin, ShoppingBag, Plus } from 'lucide-react-native';
import { Clock, Percent } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from 'expo-router';
import { type ProviderCompat } from '@/data/providers';
import { useCart } from '@/contexts/CartContext';

import LoadingScreen from '@/components/LoadingScreen';
import ProductCustomizationModal from '@/components/ProductCustomizationModal';
import ExtrasSelectionModal from '@/components/ExtrasSelectionModal';
import pricingSystem from '@/utils/pricingSystem';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';
import { mockExtras } from '@/data/extras';
import { eventService, APP_EVENTS } from '@/utils/eventService';

// Fonction utilitaire pour détecter les prestataires de beauté
const isBeautyProvider = (category: string | undefined): boolean => {
  if (!category) return false;
  const categoryLower = category.toLowerCase();
  return (
    categoryLower.includes('beauté') ||
    categoryLower.includes('manucure') ||
    categoryLower.includes('pédicure') ||
    categoryLower === 'salon de beauté' ||
    categoryLower.includes('coiffure') ||
    categoryLower.includes('spa') ||
    categoryLower.includes('nail')
  );
};

interface ProviderDetailModalProps {
  visible: boolean;
  onClose: () => void;
  provider: ProviderCompat | null;
  userPoints: number;
}

// Utiliser les données du système de prix centralisé
const mockMenuItems = [
  {
    id: '1',
    name: 'Thiéboudienne',
    description: 'Riz au poisson, légumes et sauce tomate',
    points: 64, // 5000 FCFA ÷ 78.359 = 64 points
    category: 'Plats principaux',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    popular: true,
    fcfaFormatted: '5,000 FCFA',
    pointsFormatted: '64 pts'
  },
  {
    id: '2',
    name: 'Riz sauce graine',
    description: 'Riz accompagné de sauce graine traditionnelle',
    points: 57, // 4500 FCFA ÷ 78.359 = 57 points
    category: 'Plats principaux',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    popular: true,
    fcfaFormatted: '4,500 FCFA',
    pointsFormatted: '57 pts'
  },
  {
    id: '3',
    name: 'Jus de gingembre frais',
    description: 'Boisson rafraîchissante au gingembre',
    points: 19, // 1500 FCFA ÷ 78.359 = 19 points
    category: 'Boissons',
    image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    popular: false,
    fcfaFormatted: '1,500 FCFA',
    pointsFormatted: '19 pts'
  },
  {
    id: '4',
    name: 'Attiéké Poisson',
    description: 'Attiéké accompagné de poisson grillé',
    points: 64, // 5000 FCFA ÷ 78.359 = 64 points
    category: 'Plats principaux',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    popular: true,
    fcfaFormatted: '5,000 FCFA',
    pointsFormatted: '64 pts'
  }
];

export default function ProviderDetailModal({ visible, onClose, provider, userPoints }: ProviderDetailModalProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showExtrasSelection, setShowExtrasSelection] = useState(false);
  const [currentCartItemId, setCurrentCartItemId] = useState<string | null>(null);
  
  const { addToCart, updateItemExtras } = useCart();
  const responsiveStyles = useResponsiveModalStyles();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && provider) {
      setShowLoading(true);
      
      // Timeout de sécurité pour s'assurer que le contenu s'affiche
      const safetyTimeout = setTimeout(() => {
        setShowLoading(false);
      }, 1000); // 1 seconde maximum pour le loading
      
      // Création d'une animation sécurisée avec vérifications
      try {
        const sequence = Animated.sequence([
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.02, // Réduire l'effet de rebond pour éviter les problèmes
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]);
        
        // Démarrage sécurisé de l'animation
        sequence.start(() => {
          // S'assurer que le loading se termine après l'animation
          clearTimeout(safetyTimeout);
          setTimeout(() => {
            setShowLoading(false);
          }, 100);
        });
      } catch (error) {
        console.error('Erreur d\'animation (ouverture):', error);
        // S'assurer que le loading se termine même en cas d'erreur
        clearTimeout(safetyTimeout);
        setShowLoading(false);
      }
      
      // Nettoyer le timeout si le composant se démonte
      return () => {
        clearTimeout(safetyTimeout);
      };
    } else {
      // Animation de fermeture plus douce
      try {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Réinitialiser les valeurs d'animation de manière sécurisée
          try {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);
            scrollY.setValue(0);
          } catch (animError) {
            console.error('Erreur lors de la réinitialisation des animations:', animError);
          }
          
          setShowLoading(false);
          setShowMenu(false);
        });
      } catch (error) {
        console.error('Erreur d\'animation (fermeture):', error);
        setShowLoading(false);
        setShowMenu(false);
      }
    }
  }, [visible, provider]);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  const handleShowMenu = () => {
    if (provider?.id) {
      // Fermer le modal d'abord
      onClose();
      // Naviguer vers la page de commande avec les paramètres
      router.push({
        pathname: '/order/[providerId]',
        params: { providerId: provider.id }
      });
    }
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleShowUnsoldProducts = () => {
    // Fermer le modal actuel et naviguer vers la page des invendus
    onClose();
    router.push({
      pathname: '/unsold/[providerId]',
      params: { providerId: provider?.id || '' }
    });
  };

  const handleShowBooking = () => {
    // Fermer le modal actuel et naviguer vers la page de sélection des services beauté
    onClose();
    router.push({
      pathname: '/beauty/services/[providerId]',
      params: { providerId: provider?.id || '' }
    });
  };

  const handleShowArticles = () => {
    // Fermer le modal actuel et naviguer vers la page des articles beauté
    onClose();
    router.push({
      pathname: '/beauty/articles/[providerId]',
      params: { providerId: provider?.id || '' }
    });
  };

  const handleProductPress = (product: any) => {
    setSelectedProduct(product);
    setShowCustomization(true);
  };

  const handleAddToCart = (product: any, customizations: any[], quantity: number, totalPrice: number) => {
    if (!provider) return;
    
    // Ajouter au panier et récupérer l'ID généré
    const cartItemId = addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      basePrice: product.points,
      quantity,
      customizations,
      totalPrice,
      providerId: provider.id,
      providerName: provider.name
    });
    
    // Stocker l'ID pour l'utiliser avec les extras
    setCurrentCartItemId(cartItemId);
    
    // Afficher le modal de sélection des extras
    setShowExtrasSelection(true);
  };
  
  const handleExtrasSelected = (selectedExtras: any[]) => {
    if (currentCartItemId) {
      // Mettre à jour l'élément du panier avec les extras sélectionnés
      updateItemExtras(currentCartItemId, selectedExtras);
      
      // Afficher une alerte avec options pour continuer vers le panier ou rester sur la page
      Alert.alert(
        'Produit ajouté au panier', 
        'Votre produit et les extras ont été ajoutés au panier.',
        [
          {
            text: 'Continuer mes achats',
            style: 'cancel',
            onPress: () => {
              setShowExtrasSelection(false);
              setCurrentCartItemId(null);
            }
          },
          {
            text: 'Voir mon panier',
            style: 'default',
            onPress: () => {
              setShowExtrasSelection(false);
              setCurrentCartItemId(null);
              // Fermer ce modal et ouvrir la page du panier
              onClose();
              // Naviguer vers la page du panier
              setTimeout(() => {
                router.push('/cart');
              }, 300);
            }
          }
        ]
      );
    }
  };
  
  const handleExtrasClose = () => {
    setShowExtrasSelection(false);
    setCurrentCartItemId(null);
  };

  const handleClose = () => {
    // Animation de fermeture avec effet de rétrécissement
    try {
      const closeAnimation = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]);
      
      closeAnimation.start(() => {
        // Réinitialisation des états
        setShowMenu(false);
        setShowCustomization(false);
        setSelectedProduct(null);
        
        // Réinitialisation des animations de manière sécurisée
        try {
          scrollY.setValue(0);
        } catch (animError) {
          console.error('Erreur lors de la réinitialisation de scrollY:', animError);
        }
        
        // Fermer le modal
        onClose();
      });
    } catch (error) {
      console.error('Erreur lors de la fermeture du modal:', error);
      // Fermer le modal même en cas d'erreur
      onClose();
    }
  };

  const handleAddItem = (item: any) => {
    Alert.alert('Ajouté', `${item.name} ajouté au panier`);
  };

  // Création de handleScroll de manière plus sécurisée
  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      try {
        const { contentOffset } = event.nativeEvent;
        if (contentOffset && scrollY) {
          scrollY.setValue(contentOffset.y);
        }
      } catch (error) {
        console.error('Erreur lors du défilement:', error);
      }
    },
    [scrollY]
  );
  
  // Vérification de sécurité améliorée
  if (!visible || !provider || !provider.id) {
    if (visible && (!provider || !provider.id)) {
      console.error('Tentative d\'ouverture du modal sans provider valide:', provider);
      // Fermeture automatique après un court délai si le provider est invalide
      setTimeout(() => {
        onClose();
      }, 100);
    }
    return null;
  }

  const categories = [...new Set(mockMenuItems.map(item => item.category))];
  const popularItems = mockMenuItems.filter(item => item.popular);

  // Animation de parallaxe pour l'image
  const headerImageTransform = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -75],
    extrapolate: 'clamp',
  });
  
  return (
    <>
      {/* Modal principale du prestataire */}
      <Modal
        visible={visible && !showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Animated.View 
          style={[
            responsiveStyles.overlay,
            {
              opacity: fadeAnim,
              backgroundColor: 'rgba(0,0,0,0.5)', // Fond semi-transparent
              justifyContent: 'center', // Centrage vertical
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.container,
              {
                width: '85%', // Prend 85% de la largeur de l'écran (légèrement réduit)
                maxWidth: 450, // Taille maximale réduite
                borderRadius: 20, // Coins légèrement moins arrondis
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                alignSelf: 'center', // Centrage horizontal
                maxHeight: '65%', // Limite la hauteur à 65% de l'écran (plus compact)
                marginVertical: 30, // Marge réduite
              }
            ]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => e.stopPropagation()}
          >
            <LoadingScreen 
              visible={showLoading} 
              onComplete={handleLoadingComplete} 
            />
            
            {!showLoading && provider && (
              <>
                {/* Bouton de fermeture dans le coin du modal */}
                <TouchableOpacity onPress={handleClose} style={styles.closeButtonTopLeft}>
                  <X size={20} color="#fff" />
                </TouchableOpacity>

                {/* Image d'en-tête */}
                <View style={styles.headerCircleContainer}>
                  <View style={styles.headerCircleImageContainer}>
                    <Image
                      source={{ uri: provider.image }} 
                      style={styles.headerCircleImage}
                    />
                    {/* Badge de promotion sur l'image */}
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>-{provider.discount}%</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.modalContent}>
                  {/* Informations du prestataire - Version simplifiée */}
                  <View style={styles.providerInfoCompact}>
                    <Text style={[styles.providerNameCompact, { fontSize: responsiveStyles.title.fontSize }]}>
                      {provider.name}
                    </Text>
                    
                    <View style={styles.ratingRow}>
                      <Star size={14} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.ratingTextCompact}>{provider.rating}</Text>
                      <Text style={styles.providerCategoryCompact}> • {provider.category}</Text>
                    </View>
                    
                    <View style={styles.locationRow}>
                      <MapPin size={14} color="#555" />
                      <Text style={styles.locationTextCompact}>{provider.location}</Text>
                    </View>
                    
                    <View style={styles.deliveryRow}>
                      <Clock size={14} color="#4A90E2" />
                      <Text style={styles.deliveryText}>Livraison en {provider.estimatedTime}</Text>
                    </View>
                  </View>

                  {/* Séparateur décoratif */}
                  <View style={styles.separator} />

                  {/* Action Buttons - Vertical Layout avec style amélioré - Centré */}
                  <View style={styles.actionSectionCentered}>
                    {isBeautyProvider(provider.category) ? (
                      <>
                        <TouchableOpacity 
                          style={[
                            styles.actionButtonCentered, 
                            { 
                              backgroundColor: '#8B5CF6',
                            }
                          ]} 
                          onPress={handleShowBooking}
                        >
                          <Text style={styles.actionButtonEmojiCentered}>💄</Text>
                          <Text style={styles.actionButtonTextCentered}>Réserver</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[
                            styles.actionButtonCentered, 
                            { 
                              backgroundColor: '#EC4899',
                            }
                          ]} 
                          onPress={handleShowArticles}
                        >
                          <Text style={styles.actionButtonEmojiCentered}>💎</Text>
                          <Text style={styles.actionButtonTextCentered}>Articles</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity 
                          style={[
                            styles.actionButtonCentered, 
                            { 
                              backgroundColor: '#FF6B6B',
                            }
                          ]} 
                          onPress={handleShowMenu}
                        >
                          <ShoppingBag size={18} color="#fff" strokeWidth={2} />
                          <Text style={styles.actionButtonTextCentered}>Commander</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[
                            styles.actionButtonCentered, 
                            { 
                              backgroundColor: '#FF9500',
                            }
                          ]} 
                          onPress={handleShowUnsoldProducts}
                        >
                          <Text style={styles.actionButtonEmojiCentered}>🔥</Text>
                          <Text style={styles.actionButtonTextCentered}>Invendus</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Menu Modal - Overlay avec flou */}
      <Modal
        visible={showMenu}
        transparent={false}
        animationType="slide"
        onRequestClose={handleCloseMenu}
      >
        <View 
          style={styles.menuOverlay}
        >
          {/* Page floutée en arrière-plan */}
          <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff' }, { opacity: 0.3 }]}>
            <Image source={{ uri: provider.image }} style={styles.headerImage} />
            <View style={styles.content}>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerCategory}>{provider.category}</Text>
              </View>
            </View>
          </View>

          <View style={styles.menuContainer}>
            {/* Header avec image */}
            <View style={styles.menuHeaderContainer}>
              <Image source={{ uri: provider.image }} style={styles.menuHeaderImage} />
              <TouchableOpacity 
                style={styles.menuBackButton} 
                onPress={handleCloseMenu}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Animated.ScrollView 
              style={styles.menuContent} 
              showsVerticalScrollIndicator={false}
              onStartShouldSetResponder={() => true}
              onResponderGrant={(e) => e.stopPropagation()}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
            >
              {/* Informations du prestataire */}
              <Animated.View style={[
                styles.menuProviderInfo,
                {
                  transform: [{
                    translateY: scrollY.interpolate({
                      inputRange: [0, 100],
                      outputRange: [0, -50],
                      extrapolate: 'clamp',
                    })
                  }],
                  opacity: scrollY.interpolate({
                    inputRange: [0, 80, 120],
                    outputRange: [1, 0.8, 0.3],
                    extrapolate: 'clamp',
                  })
                }
              ]}>
                <Text style={styles.menuProviderName}>{provider.name}</Text>
                <Text style={styles.menuProviderCategory}>{provider.category}</Text>
                
                <View style={styles.menuInfoRow}>
                  <View style={styles.rating}>
                    <Star size={16} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.ratingText}>{provider.rating}</Text>
                  </View>
                  
                  <View style={styles.location}>
                    <MapPin size={16} color="#8E8E8E" />
                    <Text style={styles.locationText}>{provider.location}</Text>
                  </View>
                  
                  <Text style={styles.estimatedTime}>{provider.estimatedTime}</Text>
                </View>

                <View style={styles.discountBanner}>
                  <Text style={styles.discountBannerText}>
                    🎉 {provider.discount}% de réduction sur votre commande
                  </Text>
                </View>
              </Animated.View>

              {/* Articles populaires */}
              {popularItems.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Articles populaires</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {popularItems.map((item) => (
                      <TouchableOpacity 
                        key={item.id} 
                        style={styles.popularCard}
                        onPress={() => handleProductPress(item)}
                        activeOpacity={0.7}
                      >
                        <Image source={{ uri: item.image }} style={styles.popularImage} />
                        <View style={styles.popularInfo}>
                          <Text style={styles.popularName} numberOfLines={2}>
                            {item.name}
                          </Text>
                          <View style={styles.popularPriceContainer}>
                            <Text style={styles.popularOriginalPrice}>
                              {item.fcfaFormatted}
                            </Text>
                            <Text style={styles.popularPoints}>
                              {item.pointsFormatted}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          style={styles.addButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleProductPress(item);
                          }}
                        >
                          <Plus size={20} color="#00B14F" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Menu par catégories */}
              {categories.map((category) => (
                <View key={category} style={styles.section}>
                  <Text style={styles.sectionTitle}>{category}</Text>
                  {mockMenuItems
                    .filter(item => item.category === category)
                    .map((item) => (
                      <TouchableOpacity 
                        key={item.id} 
                        style={styles.menuItem}
                        onPress={() => handleProductPress(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.menuItemContent}>
                          <View style={styles.menuItemInfo}>
                            <Text style={styles.menuItemName}>{item.name}</Text>
                            
                            <View style={styles.priceContainer}>
                              <Text style={styles.originalPrice}>
                                {item.fcfaFormatted}
                              </Text>
                              <Text style={styles.menuItemPoints}>
                                {item.pointsFormatted}
                              </Text>
                            </View>
                            
                            <Text style={styles.menuItemDescription} numberOfLines={2}>
                              {item.description}
                            </Text>
                            
                            {item.popular && (
                              <View style={styles.discountBadge}>
                                <Text style={styles.discountBadgeText}>-20%</Text>
                              </View>
                            )}
                          </View>
                          
                          <View style={styles.menuItemImageContainer}>
                            <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                            <TouchableOpacity 
                              style={styles.addButtonLarge}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleProductPress(item);
                              }}
                            >
                              <Plus size={20} color="#000" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              ))}
            </Animated.ScrollView>
          </View>
        </View>
      </Modal>

      {/* Product Customization Modal - Mode plein écran */}
      <ProductCustomizationModal
        visible={showCustomization}
        onClose={() => {
          setShowCustomization(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        fullScreen={true} // Activation du mode plein écran
      />
      
      {/* Extras Selection Modal - Mode plein écran */}
      <ExtrasSelectionModal
        visible={showExtrasSelection}
        onClose={handleExtrasClose}
        onContinue={handleExtrasSelected}
        extras={mockExtras}
        fullScreen={true} // Activation du mode plein écran
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Fond semi-transparent
    justifyContent: 'center', // Alignement au centre
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 450,
    backgroundColor: '#fff',
    borderRadius: 20, // Coins moins arrondis
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 12, // Ombre légèrement réduite
  },
  header: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  headerImageContainer: {
    height: 220, // Image plus haute pour un meilleur impact visuel
    overflow: 'hidden',
    position: 'relative', // Pour positionner le gradient
  },
  headerImage: {
    width: '100%',
    height: 220,
  },
  content: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30, // Effet carte avec coins arrondis en haut
    borderTopRightRadius: 30,
    marginTop: -40, // Chevauchement avec l'image
  },
  providerInfo: {
    marginBottom: 30,
    paddingTop: 5, // Espacement supplémentaire
    paddingHorizontal: 10, // Marge horizontale uniforme
  },
  providerName: {
    fontSize: 28, // Légèrement plus grand
    fontWeight: '800', // Extra bold pour plus d'impact
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: 0.3, // Légère augmentation de l'espacement des lettres pour l'élégance
    textShadowColor: 'rgba(0, 0, 0, 0.05)', // Ombre très subtile
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  providerCategory: {
    fontSize: 17,
    color: '#555555',
    marginBottom: 20, // Plus d'espace avant la ligne d'info
    fontWeight: '600', // Semi-bold pour un meilleur contraste
    opacity: 0.8, // Légèrement plus doux
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribution égale des éléments
    backgroundColor: '#F8F9FA', // Fond légèrement plus clair
    borderRadius: 16,
    padding: 16,
    marginBottom: 24, // Plus d'espace avant le temps estimé
    borderWidth: 1, 
    borderColor: '#EAEAEA', // Bordure subtile
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6', // Fond jaune clair pour l'étoile
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEEBA', // Bordure subtile assortie
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#000',
    fontWeight: '700', // Bold pour mettre en valeur
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF', // Fond bleu très pâle
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE', // Bordure subtile assortie
  },
  locationText: {
    marginLeft: 5,
    fontSize: 15,
    color: '#3B82F6', // Bleu plus visible
    fontWeight: '600', // Semi-bold pour une meilleure lisibilité
  },
  discount: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)', // Bordure claire pour plus d'effet
    shadowColor: '#FF6B6B', // Ombre de la même couleur pour un effet halo
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900', // Extra bold pour plus d'impact
    letterSpacing: 0.7, // Espacement des lettres pour meilleure lisibilité
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Ombre pour plus de profondeur
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionSection: {
    gap: 16,
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 12, // Légèrement plus grande marge
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18, // Plus haut pour une meilleure touche
    borderRadius: 16, // Plus arrondi pour un look moderne
    gap: 12, // Plus d'espace entre l'icône et le texte
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8, // Effet d'élévation pour un aspect 3D subtil
    marginBottom: 14, // Augmente l'espace entre les boutons
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', // Bordure subtile pour plus d'élégance
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700', // Bold
    letterSpacing: 0.5, // Espacement des lettres pour l'élégance
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Ombre légère sur le texte
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionButtonEmoji: {
    fontSize: 26, // Plus grand pour plus d'impact
    color: '#fff',
    marginRight: 4, // Ajuste légèrement la position de l'emoji
  },
  estimatedTime: {
    fontSize: 15,
    color: '#4A90E2',
    fontWeight: '600', // Semi-bold pour une meilleure lisibilité
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 12,
    alignSelf: 'flex-start', // S'adapte à la taille du contenu
    marginBottom: 20, // Espacement avant les boutons d'action
  },
  // Menu Modal Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  menuContainer: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    backgroundColor: '#fff',
    borderRadius: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
  menuHeaderContainer: {
    position: 'relative',
    height: 200,
  },
  menuHeaderImage: {
    width: '100%',
    height: '100%',
  },
  menuBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  menuContent: {
    flex: 1,
  },
  menuProviderInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuProviderName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  menuProviderCategory: {
    fontSize: 16,
    color: '#8E8E8E',
    marginBottom: 15,
  },
  menuInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 15,
  },
  discountBanner: {
    backgroundColor: '#F0F9F4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00B14F',
  },
  discountBannerText: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  popularCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  popularImage: {
    width: '100%',
    height: 100,
  },
  popularInfo: {
    padding: 12,
  },
  popularName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  popularPriceContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  popularOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  popularPoints: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 15,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  menuItemInfo: {
    flex: 1,
    paddingRight: 15,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 2,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  menuItemPoints: {
    fontSize: 18,
    color: '#00B14F',
    fontWeight: 'bold',
  },
  menuItemImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  addButtonLarge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  discountBadge: {
    backgroundColor: '#E53E3E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Nouveaux styles pour le modal compact
  headerCircleContainer: {
    alignItems: 'center',
    paddingTop: 5, // Réduit de 20 à 5
    paddingBottom: 5, // Réduit de 10 à 5
  },
  headerCircleImageContainer: {
    width: 90, // Taille réduite
    height: 90, // Taille réduite
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 3, // Bordure plus fine
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    position: 'relative', // Pour positionner les éléments absolus
  },
  closeButtonTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  headerCircleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12, // Plus petit
    fontWeight: '700',
  },
  modalContent: {
    padding: 10, // Réduit de 15 à 10
    paddingBottom: 20,
  },
  providerInfoCompact: {
    alignItems: 'center',
    marginBottom: 8, // Réduit de 10 à 8
  },
  providerNameCompact: {
    fontSize: 20, // Police plus petite
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 5, // Marge réduite
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5, // Réduit la marge
  },
  ratingTextCompact: {
    fontSize: 14, // Plus petit
    fontWeight: '700',
    color: '#000',
    marginLeft: 3, // Moins d'espace
  },
  providerCategoryCompact: {
    fontSize: 14, // Plus petit
    color: '#555',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5, // Réduit la marge
  },
  locationTextCompact: {
    marginLeft: 5, // Moins d'espace
    fontSize: 13, // Plus petit
    color: '#555',
    fontWeight: '500',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryText: {
    marginLeft: 5, // Moins d'espace
    fontSize: 13, // Plus petit
    color: '#4A90E2',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 10, // Réduit la marge
    width: '70%',
    alignSelf: 'center',
  },
  actionSectionCentered: {
    gap: 10, // Réduit l'écart
    alignItems: 'center',
    marginTop: 5, // Réduit la marge
    flexDirection: 'row', // Les boutons côte à côte
    justifyContent: 'space-between', // Espace entre les boutons
    paddingHorizontal: 10, // Marge horizontale
  },
  actionButtonCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // Moins de hauteur
    paddingHorizontal: 16, // Moins de largeur
    borderRadius: 12,
    gap: 8, // Moins d'espace
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    flex: 1, // Occupe l'espace disponible
    marginHorizontal: 5, // Marge entre boutons
  },
  actionButtonTextCentered: {
    color: '#fff',
    fontSize: 14, // Plus petit
    fontWeight: '700',
    letterSpacing: 0.2, // Moins d'espace
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButtonEmojiCentered: {
    fontSize: 18, // Plus petit
    color: '#fff',
  },
});