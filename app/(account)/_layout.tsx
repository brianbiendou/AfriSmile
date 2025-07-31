import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#00B14F',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animation: 'slide_from_right',
      }}
    />
  );
}
