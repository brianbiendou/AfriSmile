import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { formatPointsWithFcfa, formatPoints } from '@/utils/pointsConversion';

export default function PointsTestScreen() {
  const { user, updateUserPoints, addUserPoints } = useAuth();

  const handleAddPoints = async (amount: number) => {
    await addUserPoints(amount);
    Alert.alert('Points ajoutés', `+${amount} points ajoutés avec succès !`);
  };

  const handleRemovePoints = async (amount: number) => {
    await updateUserPoints(-amount);
    Alert.alert('Points utilisés', `-${amount} points utilisés avec succès !`);
  };

  const testCashback = async () => {
    await addUserPoints(100); // Nouveau cashback = 100 points
    Alert.alert('Cashback reçu', '+100 points de cashback pour votre commande !');
  };

  const testPurchase = async () => {
    const purchaseAmount = 70; // Prix d'un plat principal
    if (user && user.points >= purchaseAmount) {
      await updateUserPoints(-purchaseAmount);
      Alert.alert('Achat réussi', `Thiéboudiènne acheté pour ${purchaseAmount} points !`);
    } else {
      Alert.alert('Solde insuffisant', 'Pas assez de points pour cet achat');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Test du Système de Points x10</Text>
      
      {/* Affichage du solde actuel */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Solde actuel</Text>
        <Text style={styles.balanceValue}>
          {user ? formatPointsWithFcfa(user.points) : '0 pts'}
        </Text>
        <Text style={styles.balanceSubtext}>
          {user ? `${user.first_name} ${user.last_name}` : 'Non connecté'}
        </Text>
      </View>

      {/* Tests d'ajout de points */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>➕ Ajouter des Points</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.addButton]} onPress={() => handleAddPoints(10)}>
            <Text style={styles.buttonText}>+10 pts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.addButton]} onPress={() => handleAddPoints(50)}>
            <Text style={styles.buttonText}>+50 pts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.addButton]} onPress={() => handleAddPoints(100)}>
            <Text style={styles.buttonText}>+100 pts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tests de retrait de points */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>➖ Utiliser des Points</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.removeButton]} onPress={() => handleRemovePoints(20)}>
            <Text style={styles.buttonText}>-20 pts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.removeButton]} onPress={() => handleRemovePoints(70)}>
            <Text style={styles.buttonText}>-70 pts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.removeButton]} onPress={() => handleRemovePoints(100)}>
            <Text style={styles.buttonText}>-100 pts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tests de scénarios réels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍽️ Scénarios Réels</Text>
        <TouchableOpacity style={[styles.button, styles.scenarioButton]} onPress={testCashback}>
          <Text style={styles.buttonText}>🎁 Cashback Commande</Text>
          <Text style={styles.buttonSubtext}>+100 points</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.scenarioButton]} onPress={testPurchase}>
          <Text style={styles.buttonText}>🍲 Acheter Thiéboudiènne</Text>
          <Text style={styles.buttonSubtext}>-70 points (4,340 FCFA)</Text>
        </TouchableOpacity>
      </View>

      {/* Info système */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ Nouveau Système x10</Text>
        <Text style={styles.infoText}>• 1 point = 62 FCFA</Text>
        <Text style={styles.infoText}>• Cashback = 100 points par commande</Text>
        <Text style={styles.infoText}>• Plats principaux = 70-100 points</Text>
        <Text style={styles.infoText}>• Boissons = 20-30 points</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: '#00B14F',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#00B14F',
  },
  removeButton: {
    backgroundColor: '#FF6B6B',
  },
  scenarioButton: {
    backgroundColor: '#8B5CF6',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
