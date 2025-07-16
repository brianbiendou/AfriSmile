import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Plus, Package, TrendingUp, Users, Settings, LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import LogoutModal from '@/components/LogoutModal';

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { logout, provider } = useAuth();

  const stats = [
    { label: 'Commandes aujourd\'hui', value: '12', icon: Package, color: '#00B14F' },
    { label: 'Revenus du jour', value: '45,600 FCFA', icon: TrendingUp, color: '#FF9800' },
    { label: 'Clients actifs', value: '156', icon: Users, color: '#2196F3' },
  ];

  const products = [
    { id: 1, name: 'Attiéké Poisson', price: '2,500 FCFA', stock: 'En stock', sales: 8 },
    { id: 2, name: 'Riz Sauce Graine', price: '3,000 FCFA', stock: 'En stock', sales: 5 },
    { id: 3, name: 'Foutou Sauce Claire', price: '2,800 FCFA', stock: 'Rupture', sales: 3 },
  ];

  const orders = [
    { id: 1, customer: 'Kouassi Jean', items: 'Attiéké Poisson x2', amount: '5,000 FCFA', status: 'En préparation' },
    { id: 2, customer: 'Aya Marie', items: 'Riz Sauce Graine x1', amount: '3,000 FCFA', status: 'Prêt' },
    { id: 3, customer: 'Koné Paul', items: 'Foutou x1, Attiéké x1', amount: '5,300 FCFA', status: 'Livré' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En préparation': return '#FF9800';
      case 'Prêt': return '#00B14F';
      case 'Livré': return '#4CAF50';
      default: return '#757575';
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  const renderProducts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mes Produits</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
      
      {products.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Text style={[styles.productStock, { color: product.stock === 'En stock' ? '#00B14F' : '#F44336' }]}>
              {product.stock}
            </Text>
          </View>
          <View style={styles.productStats}>
            <Text style={styles.productSales}>{product.sales} vendus</Text>
            <TouchableOpacity style={styles.editButton}>
              <Settings size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderOrders = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Commandes Récentes</Text>
      
      {orders.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.customerName}>{order.customer}</Text>
            <Text style={styles.orderAmount}>{order.amount}</Text>
          </View>
          <Text style={styles.orderItems}>{order.items}</Text>
          <View style={styles.orderFooter}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bonjour,</Text>
          <Text style={styles.businessName}>Chez Tante Marie</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color="#666" />
        </TouchableOpacity>
    </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
              Produits
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
              Commandes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'products' ? renderProducts() : renderOrders()}
      </ScrollView>
      
      <LogoutModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
        userName={provider?.business_name || 'Prestataire'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#00B14F',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B14F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    fontWeight: '500',
  },
  productStats: {
    alignItems: 'flex-end',
    gap: 8,
  },
  productSales: {
    fontSize: 12,
    color: '#666',
  },
  editButton: {
    padding: 4,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});