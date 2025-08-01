import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, CreditCard, MapPin, Clock } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useCoupon } from '@/contexts/CouponContext';
import { fcfaToPoints, pointsToFcfa } from '@/utils/pointsConversion';

export default function OrderSummaryPage() {
  const { cartItems, clearCart } = useCart();
  const { globalDiscountPercentage } = useCoupon();

  const formatCustomizations = (customizations: any[]) => {
    if (!customizations || !Array.isArray(customizations)) {
      return '';
    }
    
    return customizations.map(cat => {
      if (cat.selectedOptions && Array.isArray(cat.selectedOptions)) {
        return cat.selectedOptions.map((opt: any) => opt.name).join(', ');
      } else if (cat.options && Array.isArray(cat.options)) {
        return cat.options.map((opt: any) => opt.name).join(', ');
      } else if (cat.name) {
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
    );
  };

  // Fonction pour obtenir le prix correct en points
  const getCorrectPriceInPoints = (item: any) => {
    if (isBeautyProduct(item)) {
      // Les produits beauté sont déjà en points
      return item.totalPrice;
    } else {
      // Les produits alimentaires : si > 1000, c'est probablement en FCFA
      return item.totalPrice > 1000 ? fcfaToPoints(item.totalPrice) : item.totalPrice;
    }
  };

  // Calcul du total corrigé
  const getCorrectTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + getCorrectPriceInPoints(item);
    }, 0);
  };

  const handlePayment = () => {
    // Logique de paiement
    router.push({
      pathname: '/(account)/payment',
      params: { 
        type: 'order',
        amount: getCorrectTotal().toString()
      }
    });
  };

  if (cartItems.length === 0) {
    router.replace('/cart');
    return null;
  }

  const correctTotal = getCorrectTotal();
  const finalTotal = globalDiscountPercentage > 0 
    ? Math.round(correctTotal * (1 - globalDiscountPercentage / 100))
    : correctTotal;

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Récapitulatif de commande",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }} 
      />
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={{ uri: item.productImage }} style={styles.itemImage} />
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.providerName}>{item.providerName}</Text>
                
                {item.customizations.length > 0 && (
                  <Text style={styles.customizations} numberOfLines={3}>
                    {isBeautyProduct(item) 
                      ? `Service de beauté: ${formatCustomizations(item.customizations)}`
                      : formatCustomizations(item.customizations)
                    }
                  </Text>
                )}
                
                <View style={styles.priceQuantityRow}>
                  <Text style={styles.quantity}>Quantité: {item.quantity}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.itemPrice}>
                      {getCorrectPriceInPoints(item).toFixed(0)} pts
                    </Text>
                    <Text style={styles.fcfaPrice}>
                      {pointsToFcfa(getCorrectPriceInPoints(item)).toLocaleString()} FCFA
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Informations de livraison */}
          <View style={styles.deliveryInfo}>
            <Text style={styles.sectionTitle}>Informations de livraison</Text>
            <View style={styles.infoRow}>
              <MapPin size={16} color="#666" />
              <Text style={styles.infoText}>Livraison à domicile</Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={16} color="#666" />
              <Text style={styles.infoText}>Temps estimé: 30-45 min</Text>
            </View>
          </View>
        </ScrollView>

        {/* Résumé des prix */}
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            {globalDiscountPercentage > 0 ? (
              <View style={styles.priceColumn}>
                <Text style={styles.originalPrice}>
                  {correctTotal.toFixed(0)} pts
                </Text>
                <Text style={styles.totalAmount}>
                  {finalTotal} pts
                </Text>
                <Text style={styles.fcfaTotal}>
                  {pointsToFcfa(finalTotal).toLocaleString()} FCFA
                </Text>
                <View style={styles.discountInfo}>
                  <Text style={styles.discountTag}>-{globalDiscountPercentage}%</Text>
                </View>
              </View>
            ) : (
              <View style={styles.priceColumn}>
                <Text style={styles.totalAmount}>
                  {correctTotal.toFixed(0)} pts
                </Text>
                <Text style={styles.fcfaTotal}>
                  {pointsToFcfa(correctTotal).toLocaleString()} FCFA
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.paymentButton} 
            onPress={handlePayment}
          >
            <CreditCard size={18} color="#fff" />
            <Text style={styles.paymentButtonText}>Payer {finalTotal} pts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
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
  orderItem: {
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
    marginBottom: 8,
    lineHeight: 16,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  fcfaPrice: {
    fontSize: 11,
    color: '#999',
  },
  deliveryInfo: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
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
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  fcfaTotal: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
    marginTop: 5,
    overflow: 'hidden',
  },
  discountInfo: {
    alignItems: 'flex-end',
  },
  paymentButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
