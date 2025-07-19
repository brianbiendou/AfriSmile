import React from 'react';
import { View, StyleSheet } from 'react-native';
import ProviderDashboard from '@/components/ProviderDashboard';

export default function ProviderScreen() {
  return (
    <View style={styles.container}>
      <ProviderDashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
