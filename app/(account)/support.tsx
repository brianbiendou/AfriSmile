import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
  Animated,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  CircleHelp,
  Phone,
  Mail,
  Send,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
} from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SupportScreen() {
  // Auth context
  const { user: authUser } = useAuth();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // État pour le formulaire de contact
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });
  
  // État pour les questions fréquentes
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  
  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Questions fréquentes
  const faqs = [
    {
      id: '1',
      question: 'Comment fonctionne le système de points ?',
      answer: 'Chaque fois que vous effectuez un achat, vous recevez des points de fidélité. Ces points peuvent être utilisés pour obtenir des réductions sur vos prochains achats. 1 point équivaut à environ 78.35 FCFA de remise.',
    },
    {
      id: '2',
      question: 'Comment puis-je recharger mon portefeuille ?',
      answer: 'Vous pouvez recharger votre portefeuille via Mobile Money ou carte bancaire. Allez dans la section "Mon Portefeuille", saisissez le montant souhaité, choisissez votre méthode de paiement et suivez les instructions.',
    },
    {
      id: '3',
      question: 'Comment utiliser mon QR code ?',
      answer: 'Présentez votre QR code personnel au moment du paiement chez nos partenaires pour être identifié rapidement et bénéficier de vos avantages personnalisés (réductions, cumul de points).',
    },
    {
      id: '4',
      question: 'Comment contacter un prestataire ?',
      answer: 'Vous pouvez contacter un prestataire directement depuis sa page en utilisant les coordonnées fournies ou en utilisant le bouton de contact. Pour les commandes en cours, utilisez la section "Commandes" pour communiquer avec le prestataire.',
    },
    {
      id: '5',
      question: 'Comment signaler un problème avec une commande ?',
      answer: 'Accédez à votre commande dans la section "Commandes", puis utilisez l\'option "Signaler un problème". Vous pouvez également nous contacter directement via le formulaire de cette page en précisant le numéro de commande concernée.',
    },
  ];
  
  // Gestion de l'expansion des FAQ
  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };
  
  // Envoi du message de contact
  const handleSendMessage = () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs du formulaire');
      return;
    }
    
    // Simulation d'envoi
    Alert.alert(
      'Message envoyé',
      'Nous avons bien reçu votre message et vous répondrons dans les meilleurs délais.',
      [{ text: 'OK' }]
    );
    
    // Réinitialiser le formulaire
    setContactForm({ subject: '', message: '' });
  };
  
  // Appel du support
  const handleCallSupport = () => {
    Linking.openURL('tel:+2250101020304');
  };
  
  // Email au support
  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@afrismile.ci');
  };
  
  // Ouverture du chat
  const handleOpenChat = () => {
    Alert.alert(
      'Chat avec le support',
      'Cette fonctionnalité sera bientôt disponible. En attendant, veuillez nous contacter par téléphone ou email.'
    );
  };
  
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" translucent />
      <Stack.Screen
        options={{
          headerShown: false, // Désactiver le header par défaut
        }}
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header personnalisé qui bouge avec le scroll */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aide & Support</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Animated.View
          style={[styles.content, { opacity: fadeAnim }]}
        >
          {/* Section des options de contact */}
          <View style={styles.contactOptionsContainer}>
            <TouchableOpacity
              style={[styles.contactOption, { backgroundColor: '#E0F2F1' }]}
              onPress={handleCallSupport}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#4ECDC4' }]}>
                <Phone size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactOptionText}>Appeler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.contactOption, { backgroundColor: '#FFF8E1' }]}
              onPress={handleEmailSupport}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#FFD166' }]}>
                <Mail size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactOptionText}>Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.contactOption, { backgroundColor: '#E8F5E9' }]}
              onPress={handleOpenChat}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#00B14F' }]}>
                <MessageSquare size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactOptionText}>Chat</Text>
            </TouchableOpacity>
          </View>
          
          {/* Section FAQ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CircleHelp size={20} color="#00B14F" />
              <Text style={styles.sectionTitle}>Questions fréquentes</Text>
            </View>
            
            {faqs.map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(faq.id)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  {expandedFaq === faq.id ? (
                    <ChevronUp size={20} color="#6B7280" />
                  ) : (
                    <ChevronDown size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
                
                {expandedFaq === faq.id && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </View>
            ))}
          </View>
          
          {/* Section des liens utiles */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ExternalLink size={20} color="#00B14F" />
              <Text style={styles.sectionTitle}>Liens utiles</Text>
            </View>
            
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => Alert.alert('Guide utilisateur', 'Ouverture du guide utilisateur...')}
            >
              <Text style={styles.linkText}>Guide d'utilisation</Text>
              <ChevronDown style={{ transform: [{ rotate: '-90deg' }] }} size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => Alert.alert('Conditions', 'Ouverture des conditions générales...')}
            >
              <Text style={styles.linkText}>Conditions générales d'utilisation</Text>
              <ChevronDown style={{ transform: [{ rotate: '-90deg' }] }} size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => Alert.alert('Politique', 'Ouverture de la politique de confidentialité...')}
            >
              <Text style={styles.linkText}>Politique de confidentialité</Text>
              <ChevronDown style={{ transform: [{ rotate: '-90deg' }] }} size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => Alert.alert('À propos', 'Ouverture des informations à propos de l\'application...')}
            >
              <Text style={styles.linkText}>À propos de AfriSmile</Text>
              <ChevronDown style={{ transform: [{ rotate: '-90deg' }] }} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {/* Section du formulaire de contact */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Send size={20} color="#00B14F" />
              <Text style={styles.sectionTitle}>Nous contacter</Text>
            </View>
            
            <Text style={styles.formDescription}>
              Vous avez une question spécifique ou besoin d'aide ? Envoyez-nous un message et nous vous répondrons dans les meilleurs délais.
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Sujet</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Question sur ma commande #12345"
                value={contactForm.subject}
                onChangeText={(text) => setContactForm({ ...contactForm, subject: text })}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Décrivez votre problème ou votre question en détail..."
                value={contactForm.message}
                onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.submitButtonText}>Envoyer le message</Text>
            </TouchableOpacity>
          </View>
          
          {/* Coordonnées du support */}
          <View style={styles.supportInfoContainer}>
            <Text style={styles.supportInfoTitle}>Assistance téléphonique</Text>
            <Text style={styles.supportInfoText}>
              Du lundi au vendredi, 8h - 18h
            </Text>
            <Text style={styles.supportInfoValue}>+225 01 01 02 03 04</Text>
            
            <Text style={[styles.supportInfoTitle, { marginTop: 15 }]}>Email</Text>
            <Text style={styles.supportInfoValue}>support@afrismile.ci</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  contactOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contactOption: {
    width: '30%',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  contactOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  faqItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  linkText: {
    fontSize: 16,
    color: '#111827',
  },
  formDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#00B14F',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  supportInfoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  supportInfoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 5,
  },
  supportInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  supportInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B14F',
  },
});
