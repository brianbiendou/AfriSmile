import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Smile, Zap } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useEffect, useRef } from 'react';

export default function AppSwitcher() {
  const { currentApp, setCurrentApp } = useApp();
  const slideAnim = useRef(new Animated.Value(currentApp === 'afrismile' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: currentApp === 'afrismile' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentApp]);

  const switcherWidth = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.switcherContainer}>
        <Animated.View style={[styles.activeBg, { left: switcherWidth }]} />
        
        <TouchableOpacity
          style={[
            styles.appButton,
            currentApp === 'afrismile' && styles.activeButton
          ]}
          onPress={() => setCurrentApp('afrismile')}
        >
          <Smile size={20} color={currentApp === 'afrismile' ? '#fff' : '#00B14F'} />
          <Text style={[
            styles.appButtonText,
            currentApp === 'afrismile' && styles.activeButtonText
          ]}>
            Afrismile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.appButton,
            currentApp === 'kolofap' && styles.activeButton
          ]}
          onPress={() => setCurrentApp('kolofap')}
        >
          <Zap size={20} color={currentApp === 'kolofap' ? '#fff' : '#6B46C1'} />
          <Text style={[
            styles.appButtonText,
            currentApp === 'kolofap' && styles.activeButtonText
          ]}>
            Kolofap
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    padding: 4,
    position: 'relative',
  },
  activeBg: {
    position: 'absolute',
    top: 4,
    width: '50%',
    height: '85%',
    backgroundColor: '#6B46C1',
    borderRadius: 20,
    zIndex: 1,
  },
  appButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 2,
    gap: 8,
  },
  activeButton: {
    // Style géré par l'animation
  },
  appButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeButtonText: {
    color: '#fff',
  },
});