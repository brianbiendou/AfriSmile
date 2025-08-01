import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ArrowLeft, Clock, CircleCheck, MapPin, Wallet, Calendar, User } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrdersContext';
import { formatPoints } from '@/utils/pointsConversion';

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams();
  const { user } = useAuth();
  const { orders } = useOrders();
  
  // Trouver la commande correspondante dans les données réelles
  const order = orders.find(order => order.id === orderId);
  
  if (!order) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {/* Header sous la zone de notifications - pas dans SafeAreaView */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de la commande</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Commande non trouvée</Text>
          <Text style={styles.errorSubtext}>
            Cette commande n'existe plus ou a été supprimée.
          </Text>
        </View>
      </View>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
      case 'preparing':
        return <Clock size={20} color="#FF9500" />;
      case 'ready':
      case 'delivered':
        return <CircleCheck size={20} color="#00B14F" />;
      default:
        return <Clock size={20} color="#8E8E8E" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      ready: 'Prête',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return statusMap[status as keyof typeof statusMap] || status;
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

  const formatCustomizations = (customizations: any[]) => {
    return customizations.map(cat => 
      cat.selectedOptions.map((opt: any) => opt.name).join(', ')
    ).join(' • ');
  };

  const formatBookingDetails = (item: any) => {
    if (!item.bookingDate || !item.bookingTime) return null;

    const bookingDate = new Date(item.bookingDate);
    const formattedDate = bookingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <View style={styles.bookingDetails}>
        <View style={styles.bookingRow}>
          <Calendar size={14} color="#00B14F" />
          <Text style={styles.bookingText}>{formattedDate}</Text>
        </View>
        <View style={styles.bookingRow}>
          <Clock size={14} color="#00B14F" />
          <Text style={styles.bookingText}>{item.bookingTime}</Text>
        </View>
        {item.serviceType && (
          <View style={styles.bookingRow}>
            <User size={14} color="#00B14F" />
            <Text style={styles.bookingText}>{item.serviceType}</Text>
          </View>
        )}
      </View>
    );
  };

  const isBeautyProduct = (item: any) => {
    return item.bookingDate && item.bookingTime;
  };

  const { date, time } = formatOrderDate(order.createdAt);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header sous la zone de notifications - pas dans SafeAreaView */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la commande</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statut de la commande */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              {getStatusIcon(order.status)}
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {getStatusText(order.status)}
              </Text>
            </View>
            <Text style={styles.orderNumber}>Commande #{order.id}</Text>
          </View>
          <Text style={styles.orderDate}>{date} à {time}</Text>
        </View>

        {/* Informations de livraison */}
        <View style={styles.deliveryCard}>
          <Text style={styles.cardTitle}>Informations de livraison</Text>
          <View style={styles.deliveryInfo}>
            <MapPin size={18} color="#00B14F" />
            <Text style={styles.deliveryText}>{order.deliveryAddress}</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Wallet size={18} color="#00B14F" />
            <Text style={styles.deliveryText}>Paiement : {order.paymentMethod === 'points' ? 'Points' : order.paymentMethod.toUpperCase()}</Text>
          </View>
        </View>

        {/* Articles commandés */}
        <View style={styles.itemsCard}>
          <Text style={styles.cardTitle}>Articles commandés</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item.productImage }} style={styles.itemImage} />
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.providerName}>{item.providerName}</Text>
                
                {item.customizations && item.customizations.length > 0 && (
                  <Text style={styles.customizations} numberOfLines={2}>
                    {formatCustomizations(item.customizations)}
                  </Text>
                )}
                
                {item.extras && item.extras.length > 0 && (
                  <Text style={styles.extras} numberOfLines={2}>
                    Extras: {item.extras.map(extra => extra.name || 'Extra').join(', ')}
                  </Text>
                )}

                {/* Détails de réservation pour les services de beauté */}
                {isBeautyProduct(item) && formatBookingDetails(item)}
                
                <View style={styles.itemFooter}>
                  <Text style={styles.quantity}>Qté: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>{item.totalPrice.toLocaleString()} pts</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Récapitulatif des coûts */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Récapitulatif</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total articles</Text>
            <Text style={styles.summaryValue}>{order.totalAmount.toLocaleString()} pts</Text>
          </View>
          {order.discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Réduction ({order.discountPercentage}%)</Text>
              <Text style={styles.summaryValue}>-{order.discountAmount.toLocaleString()} pts</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total payé</Text>
            <Text style={styles.totalValue}>{order.finalAmount.toLocaleString()} pts</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight || 0, // Ajouter l'espace pour la barre d'état
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#fff',
    // Le header sera sous la zone de notifications grâce au paddingTop du container
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  orderNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  deliveryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  itemsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  customizations: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    lineHeight: 16,
  },
  extras: {
    fontSize: 12,
    color: '#2F855A',
    marginBottom: 6,
    lineHeight: 16,
    fontWeight: '500',
  },
  bookingDetails: {
    backgroundColor: '#F0F9F4',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00B14F',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookingText: {
    fontSize: 12,
    color: '#2F855A',
    marginLeft: 6,
    fontWeight: '500',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
