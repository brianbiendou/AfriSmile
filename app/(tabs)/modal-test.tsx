import React from 'react';
import { View, StyleSheet } from 'react-native';
import AllModalsTestSuite from '@/components/AllModalsTestSuite';

export default function ModalTestScreen() {
  const handleClose = () => {
    // Cette fonction ne fait rien car nous sommes dans un onglet
    // Les modales se fermeront d'elles-mêmes
  };

  return (
    <View style={styles.container}>
      <AllModalsTestSuite onClose={handleClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
