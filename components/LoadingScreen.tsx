import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  visible: boolean;
  onComplete: () => void;
}

export default function LoadingScreen({ visible, onComplete }: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 300);

    const timeout = setTimeout(() => {
      onComplete();
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Skeleton rectangles like in the image */}
        <View style={styles.skeletonLarge} />
        <View style={styles.skeletonMedium} />
        <View style={styles.skeletonSmall} />
        <View style={styles.skeletonButton} />
        <View style={styles.skeletonSmall} />
        
        <View style={styles.skeletonGrid}>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </View>
        
        <View style={styles.skeletonLarge} />
        <View style={styles.skeletonMedium} />
        <View style={styles.skeletonSmall} />
        
        <Text style={styles.loadingText}>Chargement{dots}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
  },
  skeletonLarge: {
    height: 80,
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
    marginBottom: 15,
  },
  skeletonMedium: {
    height: 50,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 12,
    width: '70%',
  },
  skeletonSmall: {
    height: 30,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
    marginBottom: 10,
    width: '50%',
  },
  skeletonButton: {
    height: 45,
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
    marginBottom: 20,
    width: '60%',
  },
  skeletonGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  skeletonCard: {
    flex: 1,
    height: 120,
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#8E8E8E',
    marginTop: 20,
    fontWeight: '500',
  },
});