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
import { X, QrCode, Star, MapPin, ShoppingBag, Plus } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { type Provider } from '@/data/providers';
import { useCart } from '@/contexts/CartContext';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import LoadingScreen from '@/components/LoadingScreen';
import ProductCustomizationModal from '@/components/ProductCustomizationModal';

interface ProviderDetailModalProps {
  visible: boolean;
  onClose: () => void;
  provider: Provider | null;
  userPoints: number;
}

const mockMenuItems = [
  {
    id: '1',
    name: 'Thiéboudiènne complet',
    description: 'Riz au poisson avec légumes traditionnels',
    points: 7000,
    category: 'Plats principaux',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    popular: true,
  },
  {
    id: '2',
    name: 'Jus de gingembre frais',
    description: 'Boisson rafraîchissante au gingembre',
    points: 2000,
    category: 'Boissons',
    image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    popular: false,
  },
  {
    id: '3',
    name: 'Salade de fruits tropicaux',
    description: 'Mélange de fruits frais de saison',
    points: 3000,
    category: 'Desserts',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg',
    popular: true,
  },
  {
    id: '4',
    name: 'Poisson braisé',
    description: 'Poisson grillé aux épices locales',
    points: 8000,
    category: 'Plats principaux',
    image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg',
    popular: false,
  },
  {
    id: '5',
    name: 'Attiéké poisson',
    description: 'Semoule de manioc avec poisson grillé',
    points: 6500,
    category: 'Plats principaux',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    popular: true,
  },
  {
    id: '6',
    name: 'Bissap glacé',
    description: 'Boisson à base d\'hibiscus',
    points: 1500,
    category: 'Boissons',
    image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    popular: false,
  },
];

export default function ProviderDetailModal({ visible, onClose, provider, userPoints }: ProviderDetailModalProps) {
  const [showQR, setShowQR] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qrTimer, setQrTimer] = useState(10);
  
  const { addToCart } = useCart();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowLoading(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      scrollY.setValue(0);
      setShowLoading(false);
      setShowQR(false);
      setShowMenu(false);
    }
  }, [visible]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQR && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer((prev) => prev - 1);
      }, 1000);
    } else if (qrTimer === 0) {
      setQrTimer(10);
    }
    return () => clearInterval(interval);
  }, [showQR, qrTimer]);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  const handleShowQR = () => {
    setShowQR(true);
    setQrTimer(10);
  };

  const handleCloseQR = () => {
    setShowQR(false);
    setQrTimer(10);
  };

  const handleShowMenu = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleProductPress = (product: any) => {
    setSelectedProduct(product);
    setShowCustomization(true);
  };

  const handleAddToCart = (product: any, customizations: any[], quantity: number, totalPrice: number) => {
    if (!provider) return;
    
    addToCart({
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
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowQR(false);
      setShowMenu(false);
      setShowCustomization(false);
      setSelectedProduct(null);
      setQrTimer(10);
      scrollY.setValue(0);
      onClose();
    });
  };

  const handleAddItem = (item: any) => {
    Alert.alert('Ajouté', `${item.name} ajouté au panier`);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );
  
  if (!provider) return null;

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
        visible={visible && !showQR && !showMenu}
        transparent={true}
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableOpacity 
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            }
          ]}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View 
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => e.stopPropagation()}
          >
            <LoadingScreen 
              visible={showLoading} 
              onComplete={handleLoadingComplete} 
            />
            
            {!showLoading && (
              <>
                <View style={styles.header}>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <X size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.headerImageContainer}>
                  <Animated.Image
                    source={{ uri: provider.image }} 
                    style={[
                      styles.headerImage,
                      {
                        transform: [{ translateY: headerImageTransform }],
                      }
                    ]} 
                  />
                </View>
                
                <Animated.ScrollView 
                  style={styles.content} 
                  showsVerticalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                >
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.providerCategory}>{provider.category}</Text>
                    
                    <View style={styles.infoRow}>
                      <View style={styles.rating}>
                        <Star size={16} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.ratingText}>{provider.rating}</Text>
                      </View>
                      
                      <View style={styles.location}>
                        <MapPin size={16} color="#8E8E8E" />
                        <Text style={styles.locationText}>{provider.location}</Text>
                      </View>
                      
                      <View style={styles.discount}>
                        <Text style={styles.discountText}>-{provider.discount}%</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.estimatedTime}>Temps estimé: {provider.estimatedTime}</Text>
                  </View>

                  {/* Action Buttons - Vertical Layout */}
                  <View style={styles.actionSection}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#00B14F' }]} 
                      onPress={handleShowQR}
                    >
                      <QrCode size={24} color="#fff" />
                      <Text style={styles.actionButtonText}>Profitez de la réduction</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]} 
                      onPress={handleShowMenu}
                    >
                      <ShoppingBag size={24} color="#fff" />
                      <Text style={styles.actionButtonText}>Commander à domicile</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.ScrollView>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* QR Code Modal - Overlay avec flou */}
      <Modal
        visible={showQR}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseQR}
      >
        <TouchableOpacity 
          style={styles.qrOverlay}
          activeOpacity={1}
          onPress={handleCloseQR}
        >
          {/* Page floutée en arrière-plan */}
          <View style={[styles.blurredBackground, { opacity: 0.3 }]}>
            <Image source={{ uri: provider.image }} style={styles.headerImage} />
            <View style={styles.content}>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerCategory}>{provider.category}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.qrContainer}>
            <TouchableOpacity onPress={handleCloseQR} style={styles.qrCloseButton}>
              <X size={28} color="#fff" />
            </TouchableOpacity>
            
            <View 
              style={styles.qrContent}
              onStartShouldSetResponder={() => true}
              onResponderGrant={(e) => e.stopPropagation()}
            >
              <Text style={styles.qrTitle}>Code de réduction</Text>
              <Text style={styles.qrSubtitle}>
                Faites scanner ce code par le serveur ou le restaurant pour profiter de la réduction sur votre addition
              </Text>
              
              <QRCodeDisplay 
                provider={provider} 
                timer={qrTimer}
                onExpire={handleCloseQR}
              />
              
              <Text style={styles.qrDiscountInfo}>
                Réduction de {provider.discount}% applicable sur votre commande
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu Modal - Overlay avec flou */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={handleCloseMenu}
        >
          {/* Page floutée en arrière-plan */}
          <View style={[styles.blurredBackground, { opacity: 0.3 }]}>
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
                          <Text style={styles.popularPoints}>
                            {item.points.toLocaleString()} pts
                          </Text>
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
                              <Text style={styles.menuItemPoints}>
                                {item.points.toLocaleString()} pts
                              </Text>
                              <Text style={styles.originalPrice}>
                                {Math.round(item.points * 1.2).toLocaleString()} pts
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
        </TouchableOpacity>
      </Modal>

      {/* Product Customization Modal */}
      <ProductCustomizationModal
        visible={showCustomization}
        onClose={() => {
          setShowCustomization(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 350,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
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
    height: 150,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: 150,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  providerInfo: {
    marginBottom: 30,
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  providerCategory: {
    fontSize: 16,
    color: '#8E8E8E',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#8E8E8E',
  },
  discount: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionSection: {
    gap: 15,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#8E8E8E',
    fontWeight: '500',
  },
  // QR Modal Styles
  qrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurredBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  qrContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    zIndex: 10,
  },
  qrCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  qrContent: {
    alignItems: 'center',
    width: '100%',
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  qrDiscountInfo: {
    fontSize: 16,
    color: '#00B14F',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
  // Menu Modal Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '95%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  menuItemPoints: {
    fontSize: 18,
    color: '#00B14F',
    fontWeight: 'bold',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
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
});