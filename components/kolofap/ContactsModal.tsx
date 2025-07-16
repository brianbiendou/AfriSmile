import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { X, Users, Plus, Search, Star } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { KolofapUser, Contact } from '@/types/kolofap';
import { getContacts, addContact } from '@/lib/kolofap';

interface ContactsModalProps {
  visible: boolean;
  onClose: () => void;
  kolofapUser: KolofapUser;
}

export default function ContactsModal({ 
  visible, 
  onClose, 
  kolofapUser 
}: ContactsModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newGamertag, setNewGamertag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

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
      loadContacts();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      setShowAddForm(false);
      setNewGamertag('');
      setSearchQuery('');
    }
  }, [visible]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const userContacts = await getContacts(kolofapUser.id);
      setContacts(userContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newGamertag.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un gamertag');
      return;
    }

    try {
      const contact = await addContact(kolofapUser.id, newGamertag.trim());
      setContacts(prev => [...prev, contact]);
      setNewGamertag('');
      setShowAddForm(false);
      Alert.alert('Succès', 'Contact ajouté avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Utilisateur introuvable ou déjà dans vos contacts');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.contact_display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.contact_gamertag.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Text style={styles.title}>Mes Contacts</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowAddForm(!showAddForm)}
              >
                <Plus size={20} color="#8B5CF6" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            {/* Add Contact Form */}
            {showAddForm && (
              <View style={styles.addForm}>
                <Text style={styles.addFormTitle}>Ajouter un contact</Text>
                <View style={styles.addFormRow}>
                  <TextInput
                    style={styles.addInput}
                    placeholder="Gamertag de l'utilisateur"
                    value={newGamertag}
                    onChangeText={setNewGamertag}
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    style={styles.addConfirmButton}
                    onPress={handleAddContact}
                  >
                    <Text style={styles.addConfirmText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Search */}
            <View style={styles.searchContainer}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher dans mes contacts..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Contacts List */}
            <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Chargement...</Text>
                </View>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <View key={contact.id} style={styles.contactItem}>
                    <View style={styles.contactAvatar}>
                      <Users size={24} color="#8B5CF6" />
                    </View>
                    
                    <View style={styles.contactInfo}>
                      <View style={styles.contactHeader}>
                        <Text style={styles.contactName}>
                          {contact.contact_display_name}
                        </Text>
                        {contact.is_favorite && (
                          <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        )}
                      </View>
                      <Text style={styles.contactGamertag}>
                        @{contact.contact_gamertag}
                      </Text>
                    </View>
                    
                    <TouchableOpacity style={styles.contactAction}>
                      <Text style={styles.contactActionText}>Envoyer</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Users size={48} color="#D1D5DB" />
                  <Text style={styles.emptyStateTitle}>
                    {searchQuery ? 'Aucun contact trouvé' : 'Aucun contact'}
                  </Text>
                  <Text style={styles.emptyStateText}>
                    {searchQuery 
                      ? 'Essayez avec un autre terme de recherche'
                      : 'Ajoutez des contacts pour transférer des points plus facilement'
                    }
                  </Text>
                </View>
              )}
            </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 8,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  addForm: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  addFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  addFormRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#fff',
  },
  addConfirmButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  contactsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  contactGamertag: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  contactAction: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contactActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});