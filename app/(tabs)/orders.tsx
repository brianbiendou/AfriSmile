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
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, subscribeToUserOrders } from '@/lib/orders';
import { useEffect } from 'react';
import CartIcon from '@/components/CartIcon';
import CartModal from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';
import { Order } from '@/types/database';
import { formatPointsWithFcfa } from '@/utils/pointsConversion';
import { formatPoints } from '@/utils/pointsConversion';

export default function OrdersScreen() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [orders, setOrders] = useState([
    {
      id: '1',
      user_id: 'default-user',
      provider_id: '1',
      status: 'delivered',
      total_amount: 64, // 5000 FCFA en nouveaux points
      discount_amount: 13, // 20% de réduction  
      final_amount: 51, // Montant final
      points_used: 51,
      payment_method: 'points',
      delivery_address: 'Cocody, Abidjan',
      notes: null,
      estimated_delivery: null,
      delivered_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2h
      updated_at: new Date().toISOString(),
      providers: {
        business_name: 'Chez Tante Marie',
        image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
      }
    },
    {
      id: '2',
      user_id: 'default-user',
      provider_id: '2',
      status: 'preparing',
      total_amount: 856000, // Équivalent 10000 FCFA (salon de beauté)
      discount_amount: 171200, // 20% de réduction
      final_amount: 684800, // Montant final
      points_used: 684800,
      payment_method: 'points',
      delivery_address: 'Cocody, Abidjan',
      notes: 'Manucure française',
      estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Dans 30min
      delivered_at: null,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Il y a 30min
      updated_at: new Date().toISOString(),
      providers: {
        business_name: 'Beauty Palace',
        image_url: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg'
      }
    }
  ]);
  const [loading, setLoading] = useState(false);

  const { cartCount } = useCart();
  const { user } = useAuth();
  
  // Points de l'utilisateur connecté
  const userPoints = user?.points || 0;

  useEffect(() => {
    // Pas de chargement depuis la base de données - utiliser les données statiques
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
      case 'preparing':
        return <Clock size={20} color="#FF9500" />;
      case 'ready':
      case 'delivered':
        return <CheckCircle size={20} color="#00B14F" />;
      case 'cancelled':
        return <XCircle size={20} color="#FF3B30" />;
      default:
        return <Clock size={20} color="#8E8E8E" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmé';
      case 'preparing':
        return 'En préparation';
      case 'ready':
        return 'Prêt';
      case 'delivered':
        return 'Livré';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
      case 'preparing':
        return '#FF9500';
      case 'ready':
      case 'delivered':
        return '#00B14F';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E8E';
    }
  };

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
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
            <Text style={styles.pointsText}>{formatPoints(userPoints)}</Text>
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des commandes...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Aucune commande</Text>
            <Text style={styles.emptyStateText}>Vos commandes apparaîtront ici</Text>
          </View>
        ) : (
          orders.map((order) => {
            const { date, time } = formatOrderDate(order.created_at);
            const providerName = order.providers?.business_name || 'Prestataire';
            const providerImage = order.providers?.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
            
            // Calculer les détails de la commande
            const discountPercentage = Math.round((order.discount_amount / order.total_amount) * 100);
            const cashbackPoints = Math.max(Math.round(order.final_amount * 0.01 * 85.59), 85); // 1% du montant, minimum 85 points (1 FCFA)
            
            return (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Image source={{ uri: providerImage }} style={styles.providerImage} />
              <View style={styles.orderInfo}>
                <Text style={styles.providerName}>{providerName}</Text>
                <Text style={styles.orderDate}>
                  {date} à {time}
                </Text>
                <View style={styles.statusContainer}>
                  {getStatusIcon(order.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
                <Text style={styles.paymentMethod}>
                  {order.payment_method === 'points' ? 'Payé en points' : 'Payé au restaurant'}
                </Text>
              </View>
            </View>

            <View style={styles.orderFooter}>
              <View style={styles.pricing}>
                <Text style={styles.pointsUsedText}>
                  {order.points_used > 0 ? `${order.points_used.toLocaleString()} pts utilisés` : 'Aucun point utilisé'}
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
            );
          })
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
                {/* Articles commandés */}
                <View style={styles.orderItemsModal}>
                  <Text style={styles.itemsTitle}>Articles commandés:</Text>
                  {selectedOrder.id === '1' ? (
                    <>
                      <Text style={styles.itemModal}>• Thiéboudiènne</Text>
                      <Text style={styles.itemModal}>• Jus de gingembre</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.itemModal}>• Manucure française</Text>
                      <Text style={styles.itemModal}>• Pose de vernis</Text>
                    </>
                  )}
                </View>

                <View style={styles.priceComparison}>
                  <Text style={styles.comparisonTitle}>Informations de paiement</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Méthode de paiement:</Text>
                    <Text style={[styles.paymentMethodModal, { color: '#8B5CF6', fontWeight: 'bold' }]}>
                      Points
                    </Text>
                  </View>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Points utilisés:</Text>
                    <Text style={[styles.pointsUsedModal, { color: '#10B981', fontWeight: 'bold' }]}>
                      {selectedOrder.points_used.toLocaleString()} pts
                    </Text>
                  </View>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Réduction appliquée:</Text>
                    <Text style={[styles.discountModal, { color: '#EF4444', fontWeight: 'bold' }]}>
                      -{Math.round((selectedOrder.discount_amount / selectedOrder.total_amount) * 100)}%
                    </Text>
                  </View>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Cashback reçu:</Text>
                    <Text style={[styles.cashbackModal, { color: '#10B981', fontWeight: 'bold' }]}>
                      +{Math.max(Math.round(selectedOrder.final_amount * 0.01 * 85.59), 85).toLocaleString()} pts
                    </Text>
                  </View>
                </View>

                {/* Résumé des économies */}
                <View style={styles.savingsSection}>
                  <Text style={styles.savingsTitle}>💰 Vos économies</Text>
                  <View style={styles.savingsRow}>
                    <Text style={styles.savingsLabel}>Montant économisé:</Text>
                    <Text style={styles.savingsAmount}>
                      {selectedOrder.discount_amount.toLocaleString()} FCFA
                    </Text>
                  </View>
                  <View style={styles.savingsRow}>
                    <Text style={styles.savingsLabel}>Points gagnés:</Text>
                    <Text style={styles.savingsPoints}>+{Math.max(Math.round(selectedOrder.final_amount * 0.01 * 85.59), 85).toLocaleString()} pts</Text>
                  </View>
                </View>

                {/* Informations de livraison */}
                <View style={styles.deliverySection}>
                  <Text style={styles.deliveryTitle}>📍 Livraison</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Adresse:</Text>
                    <Text style={styles.deliveryText}>
                      {selectedOrder.delivery_address || 'Cocody, Abidjan'}
                    </Text>
                  </View>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Statut:</Text>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedOrder.status) }]}>
                      {getStatusText(selectedOrder.status)}
                    </Text>
                  </View>
                  
                  {selectedOrder.delivered_at && (
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Livré le:</Text>
                      <Text style={styles.deliveryText}>
                        {formatOrderDate(selectedOrder.delivered_at).date} à {formatOrderDate(selectedOrder.delivered_at).time}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10, // Réduit de 20 à 10 pour réduire l'espace avec le header
    paddingBottom: 10, // Réduit de 20 à 10 pour réduire l'espace
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
    fontWeight: 'bold', // Fusionné: conserve le fontWeight le plus récent
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E8E',
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
    color: '#EF4444',
  },
  cashbackModal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  savingsSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 10,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  savingsLabel: {
    fontSize: 14,
    color: '#166534',
  },
  savingsAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  savingsPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  deliverySection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 10,
  },
  deliveryText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
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