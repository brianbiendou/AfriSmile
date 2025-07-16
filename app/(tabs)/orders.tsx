import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { Clock, CircleCheck as CheckCircle, Circle as XCircle, X, Wallet, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import CartIcon from '@/components/CartIcon';
import CartModal from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';

const mockOrders = [
  {
    id: '1',
    providerName: 'Chez Tante Marie',
    providerImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    status: 'en_cours',
    items: ['Thiéboudiènne', 'Jus de gingembre'],
    pointsUsed: 9000,
    originalPrice: 4500,
    finalPrice: 3825,
    discount: 15,
    cashback: 10,
    date: '2024-01-15',
    time: '14:30',
    paymentMethod: 'points',
  },
  {
    id: '2',
    providerName: 'Beauty Palace',
    providerImage: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
    status: 'termine',
    items: ['Manucure française', 'Pose gel'],
    pointsUsed: 12800,
    originalPrice: 8000,
    finalPrice: 6400,
    discount: 20,
    cashback: 10,
    date: '2024-01-14',
    time: '16:00',
    paymentMethod: 'points',
  },
  {
    id: '3',
    providerName: 'Pizza Express CI',
    providerImage: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
    status: 'annule',
    items: ['Pizza Margherita', 'Coca Cola'],
    pointsUsed: 0,
    originalPrice: 3200,
    finalPrice: 2880,
    discount: 10,
    cashback: 0,
    date: '2024-01-13',
    time: '19:15',
    paymentMethod: 'restaurant',
  },
];

const userPoints = 15420;

export default function OrdersScreen() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);

  const { cartCount } = useCart();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Clock size={20} color="#FF9500" />;
      case 'termine':
        return <CheckCircle size={20} color="#00B14F" />;
      case 'annule':
        return <XCircle size={20} color="#FF3B30" />;
      default:
        return <Clock size={20} color="#8E8E8E" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_cours':
        return 'En cours';
      case 'termine':
        return 'Terminé';
      case 'annule':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_cours':
        return '#FF9500';
      case 'termine':
        return '#00B14F';
      case 'annule':
        return '#FF3B30';
      default:
        return '#8E8E8E';
    }
  };

  const handleOrderPress = (order: any) => {
    setSelectedOrder(order);
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
            <Text style={styles.pointsText}>{userPoints.toLocaleString()} pts</Text>
          </View>
           
           <CartIcon onPress={() => setCartModalVisible(true)} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contenu scrollable */}
        <View style={styles.scrollContent}>
          <Text style={styles.title}>Mes Commandes</Text>
          <Text style={styles.subtitle}>Suivez vos réservations et achats</Text>
        </View>
        
        <View style={styles.ordersContainer}>
        {mockOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Image source={{ uri: order.providerImage }} style={styles.providerImage} />
              <View style={styles.orderInfo}>
                <Text style={styles.providerName}>{order.providerName}</Text>
                <Text style={styles.orderDate}>
                  {order.date} à {order.time}
                </Text>
                <View style={styles.statusContainer}>
                  {getStatusIcon(order.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
                <Text style={styles.paymentMethod}>
                  {order.paymentMethod === 'points' ? 'Payé en points' : 'Payé au restaurant'}
                </Text>
              </View>
            </View>

            <View style={styles.orderFooter}>
              <View style={styles.pricing}>
                <Text style={styles.pointsUsedText}>
                  {order.pointsUsed > 0 ? `${order.pointsUsed.toLocaleString()} pts utilisés` : 'Aucun point utilisé'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => handleOrderPress(order)}
              >
                <Text style={styles.detailsButtonText}>Détails</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {mockOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Aucune commande</Text>
            <Text style={styles.emptyStateText}>
              Vos commandes et réservations apparaîtront ici
            </Text>
          </View>
        )}
        </View>
      </ScrollView>

      {/* Modal de détails */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de la commande</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <X size={24} color="#8E8E8E" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.orderItemsModal}>
                  <Text style={styles.itemsTitle}>Articles commandés:</Text>
                  {selectedOrder.items.map((item: string, index: number) => (
                    <Text key={index} style={styles.itemModal}>• {item}</Text>
                  ))}
                </View>

                <View style={styles.priceComparison}>
                  <Text style={styles.comparisonTitle}>Informations de paiement</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Méthode de paiement:</Text>
                    <Text style={styles.paymentMethodModal}>
                      {selectedOrder.paymentMethod === 'points' ? 'Points' : 'Paiement au restaurant'}
                    </Text>
                  </View>
                  
                  {selectedOrder.pointsUsed > 0 && (
                    <View style={styles.pointsRow}>
                      <Text style={styles.pointsLabel}>Points utilisés:</Text>
                      <Text style={styles.pointsUsedModal}>
                        {selectedOrder.pointsUsed.toLocaleString()} pts
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Réduction appliquée:</Text>
                    <Text style={styles.discountModal}>
                      -{selectedOrder.discount}%
                    </Text>
                  </View>
                  
                  {selectedOrder.cashback > 0 && (
                    <View style={styles.cashbackRow}>
                      <Text style={styles.cashbackLabel}>Cashback reçu:</Text>
                      <Text style={styles.cashbackModal}>
                        +{selectedOrder.cashback} pts
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
  scrollView: {
    flex: 1,
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
  ordersContainer: {
    flex: 1,
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  orderInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricing: {
    flex: 1,
  },
  pointsUsedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  detailsButton: {
    backgroundColor: '#00B14F',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E8E',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalContent: {
    flex: 1,
  },
  orderItemsModal: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  itemModal: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceComparison: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentMethodModal: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
  },
  pointsUsedModal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  discountModal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  cashbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cashbackLabel: {
    fontSize: 14,
    color: '#666',
  },
  cashbackModal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  // Styles pour la commande en cours
  currentOrderSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  currentOrderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  currentOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  currentOrderInfo: {
    flex: 1,
  },
  currentOrderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  viewCartButton: {
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewCartButtonText: {
    color: '#00B14F',
    fontSize: 12,
    fontWeight: '600',
  },
  cartItemsList: {
    marginBottom: 15,
  },
  cartItemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  cartItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  cartItemProvider: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cartItemCustomizations: {
    fontSize: 11,
    color: '#888',
  },
  cartItemControls: {
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 2,
    marginBottom: 4,
  },
  quantityButton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
  quantityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 8,
  },
  cartItemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 12,
    color: '#00B14F',
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});