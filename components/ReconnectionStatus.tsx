import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Wifi, WifiOff, RefreshCw, User } from 'lucide-react-native';
import { getReconnectionInfo, canAutoReconnect, performAutoReconnect } from '@/utils/autoReconnect';
import { useAuth } from '@/contexts/AuthContext';

interface ReconnectionStatusProps {
  onReconnectSuccess?: () => void;
}

export default function ReconnectionStatus({ onReconnectSuccess }: ReconnectionStatusProps) {
  const [reconnectionInfo, setReconnectionInfo] = useState<any>(null);
  const [canReconnect, setCanReconnect] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  const { user, login } = useAuth();

  useEffect(() => {
    checkReconnectionStatus();
  }, []);

  useEffect(() => {
    if (showStatus) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showStatus]);

  const checkReconnectionStatus = async () => {
    try {
      // Si l'utilisateur est déjà connecté, ne pas afficher
      if (user && user.id !== 'default-user') {
        setShowStatus(false);
        return;
      }

      const info = await getReconnectionInfo();
      const canAutoReconnect = await canReconnect();

      if (info && canAutoReconnect) {
        setReconnectionInfo(info);
        setCanReconnect(true);
        setShowStatus(true);
      } else {
        setShowStatus(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de reconnexion:', error);
      setShowStatus(false);
    }
  };

  const handleReconnect = async () => {
    if (!reconnectionInfo) return;
    
    setIsReconnecting(true);
    try {
      const result = await performAutoReconnect();
      
      if (result.success) {
        console.log('✅ Reconnexion automatique réussie');
        setShowStatus(false);
        onReconnectSuccess?.();
      } else {
        console.log('❌ Échec de la reconnexion automatique');
        // Essayer une connexion manuelle avec les identifiants de test
        const success = await login(reconnectionInfo.email, 'password123');
        if (success) {
          setShowStatus(false);
          onReconnectSuccess?.();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la reconnexion:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  const dismissStatus = () => {
    setShowStatus(false);
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'récemment';
    }
  };

  if (!showStatus || !reconnectionInfo) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <WifiOff size={20} color="#FF6B6B" />
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>Session interrompue</Text>
            <Text style={styles.subtitle}>
              Dernière connexion : {reconnectionInfo.email}
            </Text>
            <Text style={styles.timestamp}>
              {formatLastLogin(reconnectionInfo.lastLoginTime)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.reconnectButton}
            onPress={handleReconnect}
            disabled={isReconnecting}
          >
            {isReconnecting ? (
              <RefreshCw size={16} color="#fff" />
            ) : (
              <Wifi size={16} color="#fff" />
            )}
            <Text style={styles.reconnectButtonText}>
              {isReconnecting ? 'Reconnexion...' : 'Reconnecter'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dismissButton}
            onPress={dismissStatus}
          >
            <Text style={styles.dismissButtonText}>Plus tard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  reconnectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B14F',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  reconnectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dismissButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});
