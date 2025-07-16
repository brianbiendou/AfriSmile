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

const mockOrders = [
  {
    id: '1',
    providerName: 'Chez Tante Marie',
    providerImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    status: 'en_cours',
    items: ['Thiéboudiènne', 'Jus de gingembre'],
    pointsUsed: 9000,
    originalPrice: 4500,
    finalPrice: 3825, // Avec réduction de 15%
    discount: 15,
    cashback: 10,
    date: '2024-01-15',
    time: '14:30',
  },
  {
    id: '2',
    providerName: 'Beauty Palace',
    providerImage: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
    status: 'termine',
    items: ['Manucure française', 'Pose gel'],
    pointsUsed: 12800,
    originalPrice: 8000,
    finalPrice: 6400, // Avec réduction de 20%
    discount: 20,
    cashback: 10,
    date: '2024-01-14',
    time: '16:00',
  },
  {
    id: '3',
    providerName: 'Pizza Express CI',
    providerImage: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
    status: 'annule',
    items: ['Pizza Margherita', 'Coca Cola'],
    pointsUsed: 0,
    originalPrice: 3200,
    finalPrice: 2880, // Avec réduction de 10%
    discount: 10,
    cashback: 0,
    date: '2024-01-13',
    time: '19:15',
  },
];

// Utilisateur connecté avec points
const userPoints = 15420;

export default function OrdersScreen() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

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
        <Text style={styles.title}>Mes Commandes</Text>
        <Text style={styles.subtitle}>Suivez vos réservations et achats</Text>
      </View>

      <ScrollView style={styles.ordersContainer} showsVerticalScrollIndicator={false}>
        {mockOrders.map((order) => (
          <TouchableOpacity 
            key={order.id} 
            style={styles.orderCard}
            onPress={() => handleOrderPress(order)}
          >
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
              </View>
            </View>

            <View style={styles.orderItems}>
              {order.items.map((item, index) => (
                <Text key={index} style={styles.itemText}>
                  • {item}
                </Text>
              ))}
            </View>

            <View style={styles.orderFooter}>
              <View style={styles.pricing}>
                <Text style={styles.discountText}>
                  Réduction: -{order.discount}%
                </Text>
                <Text style={styles.pointsUsedText}>
                  Points utilisés: {order.pointsUsed.toLocaleString()} pts
                </Text>
                {order.cashback > 0 && (
                  <Text style={styles.cashbackText}>
                    Cashback: +{order.cashback} pts
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Détails</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {mockOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Aucune commande</Text>
            <Text style={styles.emptyStateText}>
              Vos commandes et réservations apparaîtront ici
            </Text>
          </View>
        )}
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
                <View style={styles.priceComparison}>
                  <Text style={styles.comparisonTitle}>Comparaison des prix</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Prix sans l'application:</Text>
                    <Text style={styles.originalPriceModal}>
                      {selectedOrder.originalPrice.toLocaleString()} FCFA
                    </Text>
                  </View>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Prix avec réduction ({selectedOrder.discount}%):</Text>
                    <Text style={styles.finalPriceModal}>
                      {selectedOrder.finalPrice.toLocaleString()} FCFA
                    </Text>
                  </View>
                  
                  <View style={styles.savingsRow}>
                    <Text style={styles.savingsLabel}>Économies réalisées:</Text>
                    <Text style={styles.savingsAmount}>
                      {(selectedOrder.originalPrice - selectedOrder.finalPrice).toLocaleString()} FCFA
                    </Text>
                  </View>
                  
                  <View style={styles.pointsRow}>
                    <Text style={styles.pointsLabel}>Points utilisés:</Text>
                    <Text style={styles.pointsUsedModal}>
                      {selectedOrder.pointsUsed.toLocaleString()} pts
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

                <View style={styles.orderItemsModal}>
                  <Text style={styles.itemsTitle}>Articles commandés:</Text>
                  {selectedOrder.items.map((item: string, index: number) => (
                    <Text key={index} style={styles.itemModal}>• {item}</Text>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 15,
    paddingLeft: 10,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  pricing: {
    flex: 1,
  },
  discountText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    marginBottom: 2,
  },
  pointsUsedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 2,
  },
  cashbackText: {
    fontSize: 12,
    color: '#00B14F',
    fontWeight: '600',
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
  priceComparison: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
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
  originalPriceModal: {
    fontSize: 14,
    color: '#8E8E8E',
    textDecorationLine: 'line-through',
  },
  finalPriceModal: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  savingsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  savingsAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
  orderItemsModal: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
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
});