import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout(): React.JSX.Element {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="assets/add"
          options={{
            headerShown: true,
            title: 'Add Asset',
            presentation: 'modal',
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { fontWeight: '700', color: colors.text },
          }}
        />
        <Stack.Screen
          name="assets/[id]"
          options={{
            headerShown: true,
            title: 'Asset Details',
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { fontWeight: '700', color: colors.text },
          }}
        />
        <Stack.Screen
          name="transactions/add"
          options={{
            headerShown: true,
            title: 'Add Transaction',
            presentation: 'modal',
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { fontWeight: '700', color: colors.text },
          }}
        />
        <Stack.Screen
          name="budgets/index"
          options={{
            headerShown: true,
            title: 'Budgets',
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { fontWeight: '700', color: colors.text },
          }}
        />
        <Stack.Screen
          name="budgets/add"
          options={{
            headerShown: true,
            title: 'Create Budget',
            presentation: 'modal',
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { fontWeight: '700', color: colors.text },
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
