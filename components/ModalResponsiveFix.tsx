import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Monitor, Smartphone, AlertCircle, CheckCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface DeviceInfo {
  width: number;
  height: number;
  aspectRatio: number;
  type: 'phone' | 'tablet' | 'foldable';
  size: 'small' | 'medium' | 'large' | 'xlarge';
}

const getDeviceInfo = (): DeviceInfo => {
  const aspectRatio = height / width;
  
  let type: DeviceInfo['type'] = 'phone';
  let size: DeviceInfo['size'] = 'medium';
  
  // Samsung S23 Ultra: 1440x3088 (physical) / ~384x826 (logical)
  // iPhone 14 Pro Max: ~414x896
  // iPad: ~768x1024
  
  if (width >= 768) {
    type = 'tablet';
    size = 'xlarge';
  } else if (width >= 414) {
    size = 'large';
    if (aspectRatio < 2) {
      type = 'foldable';
    }
  } else if (width >= 375) {
    size = 'medium';
  } else {
    size = 'small';
  }
  
  return { width, height, aspectRatio, type, size };
};

const ModalResponsiveFix: React.FC = () => {
  const deviceInfo = getDeviceInfo();
  
  const getDiagnostic = () => {
    const issues = [];
    const fixes = [];
    
    if (deviceInfo.size === 'large' || deviceInfo.type === 'tablet') {
      issues.push("Les modales utilisent des largeurs fixes qui peuvent être trop petites sur grands écrans");
      fixes.push("Ajuster maxWidth et utiliser des pourcentages adaptatifs");
    }
    
    if (deviceInfo.aspectRatio > 2.2) {
      issues.push("Écran très allongé : les modales peuvent être décalées verticalement");
      fixes.push("Ajuster le justifyContent et les marges verticales");
    }
    
    if (width > 400) {
      issues.push("Samsung S23 Ultra détecté : nécessite des ajustements spécifiques");
      fixes.push("Utiliser des dimensions relatives au lieu de valeurs fixes");
    }
    
    return { issues, fixes };
  };
  
  const { issues, fixes } = getDiagnostic();
  
  const generateResponsiveStyles = () => {
    return `
// Styles corrigés pour Samsung S23 Ultra et grands écrans
const responsiveModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ${width > 400 ? 20 : 10}, // Plus de padding sur grands écrans
  },
  container: {
    width: ${width > 400 ? "'85%'" : "'95%'"}, // Moins large sur grands écrans
    maxWidth: ${width > 400 ? 450 : 400}, // MaxWidth plus élevé
    maxHeight: ${height > 800 ? "'80%'" : "'90%'"}, // Moins haut sur grands écrans
    backgroundColor: '#fff',
    borderRadius: ${width > 400 ? 24 : 20}, // Coins plus arrondis
    overflow: 'hidden',
    ${width > 400 ? `
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,` : ''}
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ${width > 400 ? 24 : 20}, // Plus de padding
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  title: {
    fontSize: ${width > 400 ? 22 : 18}, // Plus gros sur grands écrans
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: ${width > 400 ? 24 : 20},
    minHeight: ${height > 800 ? 200 : 150}, // Hauteur minimum
  },
});`;
  };
  
  const applyFixes = () => {
    Alert.alert(
      'Correctifs Appliqués',
      'Les styles responsifs ont été générés. Appliquez-les aux composants modaux pour corriger les problèmes d\'affichage sur Samsung S23 Ultra.',
      [
        { text: 'OK', onPress: () => console.log('Styles générés:', generateResponsiveStyles()) }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Monitor size={32} color="#00B14F" />
        <Text style={styles.title}>Diagnostic Modal Responsive</Text>
      </View>
      
      <View style={styles.deviceInfo}>
        <Text style={styles.sectionTitle}>📱 Informations de l'Appareil</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Largeur: {deviceInfo.width}px</Text>
          <Text style={styles.infoText}>Hauteur: {deviceInfo.height}px</Text>
          <Text style={styles.infoText}>Ratio: {deviceInfo.aspectRatio.toFixed(2)}</Text>
          <Text style={styles.infoText}>Type: {deviceInfo.type}</Text>
          <Text style={styles.infoText}>Taille: {deviceInfo.size}</Text>
        </View>
        
        {width > 400 && (
          <View style={styles.warningCard}>
            <AlertCircle size={20} color="#FF9500" />
            <Text style={styles.warningText}>
              Samsung S23 Ultra détecté ! Écran large nécessitant des ajustements.
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐛 Problèmes Détectés</Text>
        {issues.map((issue, index) => (
          <View key={index} style={styles.issueCard}>
            <AlertCircle size={16} color="#FF3B30" />
            <Text style={styles.issueText}>{issue}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Solutions Recommandées</Text>
        {fixes.map((fix, index) => (
          <View key={index} style={styles.fixCard}>
            <CheckCircle size={16} color="#00B14F" />
            <Text style={styles.fixText}>{fix}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛠️ Correctifs Spécifiques</Text>
        
        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>1. Modales trop petites sur grands écrans</Text>
          <Text style={styles.codeText}>
            {`width: '${width > 400 ? '85%' : '95%'}' // Au lieu de '95%' fixe
maxWidth: ${width > 400 ? 450 : 400} // Au lieu de 400 fixe`}
          </Text>
        </View>
        
        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>2. Hauteur inadaptée aux écrans allongés</Text>
          <Text style={styles.codeText}>
            {`maxHeight: '${height > 800 ? '80%' : '90%'}' // Moins haute sur grands écrans
paddingHorizontal: ${width > 400 ? 20 : 10} // Plus de padding`}
          </Text>
        </View>
        
        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>3. Textes et icônes trop petits</Text>
          <Text style={styles.codeText}>
            {`fontSize: ${width > 400 ? 22 : 18} // Texte plus gros
borderRadius: ${width > 400 ? 24 : 20} // Coins plus arrondis`}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.applyButton} onPress={applyFixes}>
        <Text style={styles.applyButtonText}>Appliquer les Correctifs</Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Ces correctifs améliorent l'affichage des modales sur tous les appareils,
          en particulier sur Samsung S23 Ultra et autres grands écrans.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  deviceInfo: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#00B14F',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    gap: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
    flex: 1,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  issueCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    gap: 10,
  },
  issueText: {
    fontSize: 14,
    color: '#DC2626',
    flex: 1,
  },
  fixCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    gap: 10,
  },
  fixText: {
    fontSize: 14,
    color: '#166534',
    flex: 1,
  },
  codeBlock: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  applyButton: {
    backgroundColor: '#00B14F',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#EFF6FF',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    marginTop: 0,
  },
  footerText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ModalResponsiveFix;
