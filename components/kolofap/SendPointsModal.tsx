import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import { X, Send, User, MessageCircle } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { KolofapUser } from '@/types/kolofap';
import { sendPoints, searchUserByGamertag } from '@/lib/kolofap';

interface SendPointsModalProps {
  visible: boolean;
  onClose: () => void;
  kolofapUser: KolofapUser;
  userPoints: number;
  onSuccess: () => void;
}

export default function SendPointsModal({ 
  visible, 
  onClose, 
  kolofapUser, 
  userPoints, 
  onSuccess 
}: SendPointsModalProps) {
  const [gamertag, setGamertag] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<KolofapUser | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
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
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setGamertag('');
    setAmount('');
    setMessage('');
    setFoundUser(null);
  };

  const searchUser = async () => {
    if (!gamertag.trim()) return;
    
    try {
      const user = await searchUserByGamertag(gamertag.trim());
      setFoundUser(user);
      if (!user) {
        Alert.alert('Utilisateur introuvable', 'Aucun utilisateur trouvé avec ce gamertag');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la recherche');
    }
  };

  const handleSend = async () => {
    if (!foundUser) {
      Alert.alert('Erreur', 'Veuillez d\'abord rechercher un utilisateur');
      return;
    }

    if (!amount || parseInt(amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    const pointsAmount = parseInt(amount);
    if (pointsAmount > userPoints) {
      Alert.alert('Solde insuffisant', 'Vous n\'avez pas assez de points');
      return;
    }

    setIsLoading(true);
    
    try {
      await sendPoints({
        sender_id: kolofapUser.id,
        receiver_gamertag: foundUser.gamertag,
        amount: pointsAmount,
        message: message.trim() || undefined,
      });

      Alert.alert(
        'Envoi réussi !',
        `${pointsAmount.toLocaleString()} points envoyés à @${foundUser.gamertag}`,
        [{ text: 'OK', onPress: () => {
          onSuccess();
          onClose();
        }}]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'envoi des points');
    } finally {
      setIsLoading(false);
    }
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
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
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
          <View style={styles.header}>
            <Text style={styles.title}>Envoyer des points</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Balance Info */}
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Solde disponible</Text>
              <Text style={styles.balanceAmount}>
                {userPoints.toLocaleString()} pts
              </Text>
            </View>

            {/* Gamertag Search */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Destinataire</Text>
              <View style={styles.searchContainer}>
                <View style={styles.inputContainer}>
                  <User size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez le gamertag"
                    value={gamertag}
                    onChangeText={setGamertag}
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={searchUser}
                >
                  <Text style={styles.searchButtonText}>Rechercher</Text>
                </TouchableOpacity>
              </View>

              {foundUser && (
                <View style={styles.userFound}>
                  <Text style={styles.userFoundText}>
                    ✅ {foundUser.display_name} (@{foundUser.gamertag})
                  </Text>
                </View>
              )}
            </View>

            {/* Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Montant</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de points"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.pointsLabel}>pts</Text>
              </View>
            </View>

            {/* Message */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Message (optionnel)</Text>
              <View style={styles.inputContainer}>
                <MessageCircle size={20} color="#6B7280" />
                <TextInput
                  style={[styles.input, styles.messageInput]}
                  placeholder="Ajouter un message..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!foundUser || !amount || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!foundUser || !amount || isLoading}
            >
              <Send size={20} color="#fff" />
              <Text style={styles.sendButtonText}>
                {isLoading ? 'Envoi...' : 'Envoyer'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  searchContainer: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  messageInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pointsLabel: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userFound: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  userFoundText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sendButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});