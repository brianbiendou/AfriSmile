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
import { X, Download, User, MessageCircle } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { KolofapUser } from '@/types/kolofap';
import { requestPoints, searchUserByGamertag } from '@/lib/kolofap';
import { useResponsiveModalStyles } from '@/hooks/useResponsiveDimensions';

interface RequestPointsModalProps {
  visible: boolean;
  onClose: () => void;
  kolofapUser: KolofapUser;
  onSuccess: () => void;
}

export default function RequestPointsModal({ 
  visible, 
  onClose, 
  kolofapUser, 
  onSuccess 
}: RequestPointsModalProps) {
  const [gamertag, setGamertag] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<KolofapUser | null>(null);

  const responsiveStyles = useResponsiveModalStyles();
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

  // Vérifier si le formulaire est valide
  const isFormValid = foundUser && amount && parseInt(amount) > 0 && message.trim().length > 0;

  const searchUser = async () => {
    if (!gamertag.trim()) return;
    
    try {
      // Simulation de recherche d'utilisateur
      const mockUsers = [
        { id: 'user-1', gamertag: 'john_doe', display_name: 'John Doe', user_id: 'user-1', avatar_url: null, is_active: true, created_at: '', updated_at: '' },
        { id: 'user-2', gamertag: 'sarah_k', display_name: 'Sarah Koné', user_id: 'user-2', avatar_url: null, is_active: true, created_at: '', updated_at: '' },
        { id: 'user-3', gamertag: 'alex_ci', display_name: 'Alex Kouassi', user_id: 'user-3', avatar_url: null, is_active: true, created_at: '', updated_at: '' },
        { id: 'user-4', gamertag: 'fatou_ba', display_name: 'Fatou Ba', user_id: 'user-4', avatar_url: null, is_active: true, created_at: '', updated_at: '' },
        { id: 'user-5', gamertag: 'pierre_ci', display_name: 'Pierre Coulibaly', user_id: 'user-5', avatar_url: null, is_active: true, created_at: '', updated_at: '' },
      ];
      
      const foundUser = mockUsers.find(u => u.gamertag.toLowerCase() === gamertag.trim().toLowerCase());
      setFoundUser(foundUser ? {
        ...foundUser,
        avatar_url: foundUser.avatar_url || undefined
      } : null);
      
      if (!foundUser) {
        Alert.alert('Utilisateur introuvable', 'Aucun utilisateur trouvé avec ce gamertag. Essayez: john_doe, sarah_k, alex_ci, fatou_ba, pierre_ci');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la recherche');
    }
  };

  const handleRequest = async () => {
    if (!foundUser) {
      Alert.alert('Erreur', 'Veuillez d\'abord rechercher un utilisateur');
      return;
    }

    if (!amount || parseInt(amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    const pointsAmount = parseInt(amount);
    setIsLoading(true);
    
    try {
      // Simulation de demande de points
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation d'attente

      Alert.alert(
        'Demande envoyée !',
        `Demande de ${pointsAmount.toLocaleString()} points envoyée à @${foundUser.gamertag}`,
        [{ text: 'OK', onPress: () => {
          onSuccess();
          onClose();
        }}]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'envoi de la demande');
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
        style={responsiveStyles.overlay} 
        activeOpacity={1} 
        onPress={() => {}} // Empêche la fermeture sur clic overlay
      >
        <Animated.View 
          style={[
            styles.container,
            {
              width: responsiveStyles.container.maxWidth,
              maxHeight: responsiveStyles.container.maxHeight,
              borderRadius: responsiveStyles.container.borderRadius,
              shadowColor: responsiveStyles.container.shadowColor,
              shadowOffset: responsiveStyles.container.shadowOffset,
              shadowOpacity: responsiveStyles.container.shadowOpacity,
              shadowRadius: responsiveStyles.container.shadowRadius,
              elevation: responsiveStyles.container.elevation,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => e.stopPropagation()}
        >
          <View style={responsiveStyles.header}>
            <Text style={responsiveStyles.title}>Demander des points</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Envoyez une demande de points à un autre utilisateur. Il pourra accepter ou refuser votre demande.
              </Text>
            </View>

            {/* Gamertag Search */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À qui demander</Text>
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
              <Text style={styles.sectionTitle}>Montant demandé</Text>
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
              <Text style={styles.sectionTitle}>Raison de la demande</Text>
              <View style={styles.inputContainer}>
                <MessageCircle size={20} color="#6B7280" />
                <TextInput
                  style={[styles.input, styles.messageInput]}
                  placeholder="Expliquez pourquoi vous demandez ces points..."
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
                styles.requestButton,
                (!isFormValid || isLoading) && styles.requestButtonDisabled
              ]}
              onPress={handleRequest}
              disabled={!isFormValid || isLoading}
            >
              <Download size={20} color="#fff" />
              <Text style={styles.requestButtonText}>
                {isLoading ? 'Envoi...' : 'Envoyer la demande'}
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
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
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
    color: '#06B6D4',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#06B6D4',
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
  requestButton: {
    backgroundColor: '#06B6D4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  requestButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
    transform: [{ scale: 0.98 }],
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});