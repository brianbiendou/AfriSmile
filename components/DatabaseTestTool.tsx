import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Database, Wifi, WifiOff, CircleCheck as CheckCircle, Circle as XCircle, RefreshCw, X } from 'lucide-react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getProviders } from '@/lib/providers';
import { getUserOrders } from '@/lib/orders';
import { getKolofapUser } from '@/lib/kolofap';
import { useAuth } from '@/contexts/AuthContext';

interface DatabaseTestToolProps {
  visible: boolean;
  onClose: () => void;
}

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
  duration?: number;
}

export default function DatabaseTestTool({ visible, onClose }: DatabaseTestToolProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const { user } = useAuth();

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testConnection = async (): Promise<boolean> => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      const duration = Date.now() - startTime;
      
      if (error) {
        addTestResult({
          name: 'Connexion Supabase',
          status: 'error',
          message: `Erreur: ${error.message}`,
          duration
        });
        setConnectionStatus('disconnected');
        return false;
      }

      addTestResult({
        name: 'Connexion Supabase',
        status: 'success',
        message: 'Connexion établie avec succès',
        duration
      });
      setConnectionStatus('connected');
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        name: 'Connexion Supabase',
        status: 'error',
        message: `Erreur de connexion: ${error}`,
        duration
      });
      setConnectionStatus('disconnected');
      return false;
    }
  };

  const testUsersTable = async () => {
    const startTime = Date.now();
    try {
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .limit(5);

      const duration = Date.now() - startTime;

      if (error) {
        addTestResult({
          name: 'Table Users',
          status: 'error',
          message: `Erreur: ${error.message}`,
          duration
        });
        return;
      }

      addTestResult({
        name: 'Table Users',
        status: 'success',
        message: `${count} utilisateurs trouvés, ${data?.length} récupérés`,
        data: data?.slice(0, 3),
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        name: 'Table Users',
        status: 'error',
        message: `Erreur: ${error}`,
        duration
      });
    }
  };

  const testProvidersTable = async () => {
    const startTime = Date.now();
    try {
      const { data, error, count } = await supabase
        .from('providers')
        .select('*', { count: 'exact' })
        .limit(5);

      const duration = Date.now() - startTime;

      if (error) {
        addTestResult({
          name: 'Table Providers',
          status: 'error',
          message: `Erreur: ${error.message}`,
          duration
        });
        return;
      }

      addTestResult({
        name: 'Table Providers',
        status: 'success',
        message: `${count} prestataires trouvés, ${data?.length} récupérés`,
        data: data?.slice(0, 3),
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        name: 'Table Providers',
        status: 'error',
        message: `Erreur: ${error}`,
        duration
      });
    }
  };

  const testProductsTable = async () => {
    const startTime = Date.now();
    try {
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .limit(5);

      const duration = Date.now() - startTime;

      if (error) {
        addTestResult({
          name: 'Table Products',
          status: 'error',
          message: `Erreur: ${error.message}`,
          duration
        });
        return;
      }

      addTestResult({
        name: 'Table Products',
        status: 'success',
        message: `${count} produits trouvés, ${data?.length} récupérés`,
        data: data?.slice(0, 3),
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        name: 'Table Products',
        status: 'error',
        message: `Erreur: ${error}`,
        duration
      });
    }
  };

  const testOrdersTable = async () => {
    const startTime = Date.now();
    try {
      const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .limit(5);

      const duration = Date.now() - startTime;

      if (error) {
        addTestResult({
          name: 'Table Orders',
          status: 'error',
          message: `Erreur: ${error.message}`,
          duration
        });
        return;
      }

      addTestResult({
        name: 'Table Orders',
        status: 'success',
        message: `${count} commandes trouvées, ${data?.length} récupérées`,
        data: data?.slice(0, 3),
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        name: 'Table Orders',
        status: 'error',
        message: `Erreur: ${error}`,
        duration
      });
    }
  };

  const testKolofapTables = async () => {
    const startTime = Date.now();
    try {
      const { data, error, count } = await supabase
        .from('kolofap_users')
        .select('*', { count: 'exact' })
        .limit(5);

      const duration = Date.now() - startTime;

      if (error) {
        addTestResult({
          name: 'Tables Kolofap',
          status: 'error',
          message: `Erreur: ${error.message}`,
          duration
        });
        return;
      }

      addTestResult({
        name: 'Tables Kolofap',
        status: 'success',
        message: `${count} utilisateurs Kolofap trouvés`,
        data: data?.slice(0, 3),
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        name: 'Tables Kolofap',
        status: 'error',
        message: `Erreur: ${error}`,
        duration
      });
    }
  };

  const testLibFunctions = async () => {
    const startTime = Date.now();
    try {
      const providers = await getProviders();
      const duration = Date.now() - startTime;

      addTestResult({
        name: 'Fonctions Lib',
        status: 'success',
        message: `getProviders() retourne ${providers.length} prestataires`,
        data: providers.slice(0, 2),
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        name: 'Fonctions Lib',
        status: 'error',
        message: `Erreur dans getProviders(): ${error}`,
        duration
      });
    }
  };

  const testUserAuth = async () => {
    const startTime = Date.now();
    try {
      // Test de la session Supabase Auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const duration = Date.now() - startTime;

      if (sessionError) {
        addTestResult({
          name: 'Authentification',
          status: 'error',
          message: `Erreur session: ${sessionError.message}`,
          duration
        });
        return;
      }

      if (session) {
        addTestResult({
          name: 'Authentification Supabase',
          status: 'success',
          message: `Utilisateur connecté: ${session.user.email}`,
          data: { userId: session.user.id, email: session.user.email },
          duration
        });
      } else {
        // Pas de session Supabase, mais on peut tester les utilisateurs de test
        addTestResult({
          name: 'Authentification Supabase',
          status: 'success',
          message: 'Pas de session Supabase (normal pour les comptes de test)',
          duration
        });
      }

      // Test des utilisateurs de test dans la base
      const testUsersStartTime = Date.now();
      const { data: testUsers, error: testUsersError } = await supabase
        .from('users')
        .select('email, first_name, last_name, points, role')
        .in('email', ['client@test.ci', 'admin@test.ci']);

      const testUsersDuration = Date.now() - testUsersStartTime;

      if (testUsersError) {
        addTestResult({
          name: 'Utilisateurs de test',
          status: 'error',
          message: `Erreur: ${testUsersError.message}`,
          duration: testUsersDuration
        });
      } else {
        addTestResult({
          name: 'Utilisateurs de test',
          status: testUsers && testUsers.length > 0 ? 'success' : 'error',
          message: testUsers && testUsers.length > 0 
            ? `${testUsers.length} utilisateurs de test trouvés`
            : 'Aucun utilisateur de test trouvé - exécutez la migration',
          data: testUsers,
          duration: testUsersDuration
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        name: 'Authentification',
        status: 'error',
        message: `Erreur auth: ${error}`,
        duration
      });
    }
  };

  const testEnvironmentVariables = async () => {
    const startTime = Date.now();
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const duration = Date.now() - startTime;

    if (supabaseUrl && supabaseKey) {
      addTestResult({
        name: 'Variables d\'environnement',
        status: 'success',
        message: 'URL et clé Supabase configurées',
        data: {
          url: supabaseUrl.substring(0, 30) + '...',
          keyLength: supabaseKey.length
        },
        duration
      });
    } else {
      addTestResult({
        name: 'Variables d\'environnement',
        status: 'error',
        message: 'Variables Supabase manquantes',
        duration
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();

    addTestResult({
      name: 'Début des tests',
      status: 'pending',
      message: 'Lancement de la suite de tests...'
    });

    // Tests séquentiels
    await testEnvironmentVariables();
    const connectionOk = await testConnection();
    
    if (connectionOk) {
      await testUsersTable();
      await testProvidersTable();
      await testProductsTable();
      await testOrdersTable();
      await testKolofapTables();
      await testLibFunctions();
      await testUserAuth();
    }

    // Test final de synthèse
    const successCount = testResults.filter(r => r.status === 'success').length;
    const errorCount = testResults.filter(r => r.status === 'error').length;
    
    addTestResult({
      name: 'Tests terminés',
      status: 'success',
      message: `Suite complétée: ${successCount} succès, ${errorCount} erreurs`
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} color="#00B14F" />;
      case 'error':
        return <XCircle size={16} color="#FF3B30" />;
      case 'pending':
        return <RefreshCw size={16} color="#FF9500" />;
      default:
        return <RefreshCw size={16} color="#8E8E8E" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#00B14F';
      case 'error': return '#FF3B30';
      case 'pending': return '#FF9500';
      default: return '#8E8E8E';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Database size={24} color="#00B14F" />
              <Text style={styles.title}>Test Base de Données</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#8E8E8E" />
            </TouchableOpacity>
          </View>

          {/* Status Bar */}
          <View style={styles.statusBar}>
            <View style={styles.connectionStatus}>
              {connectionStatus === 'connected' ? (
                <Wifi size={20} color="#00B14F" />
              ) : connectionStatus === 'disconnected' ? (
                <WifiOff size={20} color="#FF3B30" />
              ) : (
                <RefreshCw size={20} color="#8E8E8E" />
              )}
              <Text style={[
                styles.connectionText,
                { color: connectionStatus === 'connected' ? '#00B14F' : connectionStatus === 'disconnected' ? '#FF3B30' : '#8E8E8E' }
              ]}>
                {connectionStatus === 'connected' ? 'Connecté' : connectionStatus === 'disconnected' ? 'Déconnecté' : 'Inconnu'}
              </Text>
            </View>
            
            {user && (
              <Text style={styles.userInfo}>
                {user.first_name} ({user.points} pts = {(user.points * 620).toLocaleString()} FCFA)
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#00B14F' }]}
              onPress={runAllTests}
              disabled={isRunning}
            >
              <RefreshCw size={20} color="#fff" />
              <Text style={styles.actionButtonText}>
                {isRunning ? 'Tests en cours...' : 'Lancer tous les tests'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
              onPress={clearResults}
            >
              <X size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Effacer</Text>
            </TouchableOpacity>
          </View>

          {/* Test Results */}
          <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
            {testResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultTitle}>
                    {getStatusIcon(result.status)}
                    <Text style={[styles.resultName, { color: getStatusColor(result.status) }]}>
                      {result.name}
                    </Text>
                  </View>
                  {result.duration && (
                    <Text style={styles.resultDuration}>{result.duration}ms</Text>
                  )}
                </View>
                
                <Text style={styles.resultMessage}>{result.message}</Text>
                
                {result.data && (
                  <View style={styles.resultData}>
                    <Text style={styles.dataTitle}>Données:</Text>
                    <Text style={styles.dataContent}>
                      {JSON.stringify(result.data, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {testResults.length === 0 && (
              <View style={styles.emptyState}>
                <Database size={48} color="#E5E5E5" />
                <Text style={styles.emptyTitle}>Aucun test lancé</Text>
                <Text style={styles.emptySubtitle}>
                  Cliquez sur "Lancer tous les tests" pour commencer
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
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
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
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
    borderBottomColor: '#F5F5F5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 15,
  },
  resultItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultDuration: {
    fontSize: 12,
    color: '#8E8E8E',
    fontFamily: 'monospace',
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultData: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00B14F',
  },
  dataTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00B14F',
    marginBottom: 5,
  },
  dataContent: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DatabaseTestTool

export default DatabaseTestTool