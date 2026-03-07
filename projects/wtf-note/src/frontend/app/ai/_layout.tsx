import { Stack } from 'expo-router';
import React from 'react';
import { COLORS } from '../../src/theme';

export default function AILayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '900', fontSize: 16 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    />
  );
}
