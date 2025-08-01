import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Plus, Minus, ShoppingBag, CreditCard, Calendar, Clock } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useCoupon } from '@/contexts/CouponContext';
import { fcfaToPoints, pointsToFcfa } from '@/utils/pointsConversion';

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { globalDiscountPercentage } = useCoupon();

  const formatCustomizations = (customizations: any[]) => {
    if (!customizations || !Array.isArray(customizations)) {
      return '';
    }
    
    return customizations.map(cat => {
      // Vérifier si c'est la nouvelle structure avec selectedOptions
      if (cat.selectedOptions && Array.isArray(cat.selectedOptions)) {
        return cat.selectedOptions.map((opt: any) => opt.name).join(', ');
      }
      // Ancienne structure avec options directes
      else if (cat.options && Array.isArray(cat.options)) {
        return cat.options.map((opt: any) => opt.name).join(', ');
      }
      // Structure simple avec juste le nom
      else if (cat.name) {
        return cat.name;
      }
      return '';
    }).filter(str => str.length > 0).join(' • ');
  };

  // Fonction pour déterminer si c'est un produit beauté
  const isBeautyProduct = (item: any) => {
    return item.customizations.some((c: any) => 
      c.categoryId === 'booking' || 
      c.categoryName?.toLowerCase().includes('beauté') ||
      c.categoryName?.toLowerCase().includes('service de beauté')
    ) || item.serviceType;
  };

  // Fonction pour formater les détails de réservation
  const formatBookingDetails = (item: any) => {
    if (item.bookingDate && item.bookingTime) {
      const date = new Date(item.bookingDate);
      const formattedDate = date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
      return {
        date: formattedDate,
        time: item.bookingTime,
        serviceType: item.serviceType
      };
    }
    return null;
  };

  // Fonction pour convertir le prix affiché correctement
  const getDisplayPrice = (item: any) => {
    if (isBeautyProduct(item)) {
      // Les produits beauté sont déjà en points
      return item.totalPrice.toFixed(0);
    } else {
      // Les produits alimentaires peuvent être en FCFA, les convertir
      const priceInPoints = item.totalPrice > 1000 ? fcfaToPoints(item.totalPrice) : item.totalPrice;
      return priceInPoints.toFixed(0);
    }
  };

  // Calcul du total corrigé
  const getCorrectTotal = () => {
    return cartItems.reduce((total, item) => {
      if (isBeautyProduct(item)) {
        return total + item.totalPrice;
      } else {
        const priceInPoints = item.totalPrice > 1000 ? fcfaToPoints(item.totalPrice) : item.totalPrice;
        return total + priceInPoints;
      }
    }, 0);
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        
        {/* Header */}
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight || 0 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Mon Panier</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyCart}>
          <ShoppingBag size={64} color="#E5E5E5" />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez des articles pour commencer votre commande
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const correctTotal = getCorrectTotal();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight || 0 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Mon Panier ({cartItems.length})</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {cartItems.map((item) => {
            const bookingDetails = formatBookingDetails(item);
            const isBeauty = isBeautyProduct(item);
            
            return (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.productImage }} style={styles.itemImage} />
                
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.providerName}>{item.providerName}</Text>
                  
                  {/* Affichage spécial pour les réservations beauté */}
                  {isBeauty && bookingDetails ? (
                    <View style={styles.bookingDetailsContainer}>
                      <View style={styles.bookingIconRow}>
                        <View style={styles.bookingIcon}>
                          <Calendar size={14} color="#8B5CF6" />
                        </View>
                        <Text style={styles.bookingDate}>{bookingDetails.date}</Text>
                      </View>
                      <View style={styles.bookingIconRow}>
                        <View style={styles.bookingIcon}>
                          <Clock size={14} color="#8B5CF6" />
                        </View>
                        <Text style={styles.bookingTime}>Rendez-vous à {bookingDetails.time}</Text>
                      </View>
                      <View style={styles.bookingBadge}>
                        <Text style={styles.bookingBadgeText}>🏪 Réservation salon</Text>
                      </View>
                    </View>
                  ) : (
                    item.customizations.length > 0 && (
                      <Text style={styles.customizations} numberOfLines={2}>
                        {formatCustomizations(item.customizations)}
                      </Text>
                    )
                  )}
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.itemPrice}>
                      {getDisplayPrice(item)} pts
                    </Text>
                    <Text style={styles.itemPriceFcfa}>
                      {pointsToFcfa(parseFloat(getDisplayPrice(item))).toLocaleString()} FCFA
                    </Text>
                  </View>
                </View>

                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => item.quantity <= 1 ? removeFromCart(item.id) : updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} color="#000" />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Footer avec total et bouton checkout */}
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.totalPriceContainer}>
              {globalDiscountPercentage > 0 ? (
                <>
                  <View style={styles.priceRow}>
                    <Text style={styles.originalPrice}>
                      {correctTotal.toFixed(0)} pts
                    </Text>
                    <Text style={styles.originalPriceFcfa}>
                      {pointsToFcfa(correctTotal).toLocaleString()} FCFA
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.totalAmount}>
                      {Math.round(correctTotal * (1 - globalDiscountPercentage / 100))} pts
                    </Text>
                    <Text style={styles.totalAmountFcfa}>
                      {pointsToFcfa(Math.round(correctTotal * (1 - globalDiscountPercentage / 100))).toLocaleString()} FCFA
                    </Text>
                  </View>
                  <View style={styles.discountInfo}>
                    <Text style={styles.discountTag}>-{globalDiscountPercentage}%</Text>
                    <Text style={styles.discountAmount}>
                      Économie: -{Math.round(correctTotal * (globalDiscountPercentage / 100))} pts
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.priceRow}>
                  <Text style={styles.totalAmount}>
                    {correctTotal.toFixed(0)} pts
                  </Text>
                  <Text style={styles.totalAmountFcfa}>
                    {pointsToFcfa(correctTotal).toLocaleString()} FCFA
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.checkoutButton} 
            onPress={handleCheckout}
          >
            <CreditCard size={18} color="#fff" />
            <Text style={styles.checkoutButtonText}>Passer la commande</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  customizations: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    lineHeight: 16,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemPriceFcfa: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    backgroundColor: '#fff',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 5,
  },
  discountTag: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 5,
    overflow: 'hidden',
  },
  discountInfo: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
  discountAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B14F',
    marginTop: 2,
  },
  checkoutButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  totalPriceContainer: {
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalAmountFcfa: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  originalPriceFcfa: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  // Styles pour les détails de réservation beauté
  bookingDetailsContainer: {
    backgroundColor: '#F8F4FF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  bookingIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bookingDate: {
    fontSize: 13,
    color: '#4C1D95',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookingTime: {
    fontSize: 13,
    color: '#4C1D95',
    fontWeight: '600',
  },
  bookingBadge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  bookingBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
