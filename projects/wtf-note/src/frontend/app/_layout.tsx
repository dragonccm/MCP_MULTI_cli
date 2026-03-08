import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/stores';
import { getToken } from '../src/utils/storage';
import { COLORS } from '../src/constants';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { loadProfile } = useAuthStore();

  useEffect(() => {
    async function init() {
      const token = await getToken();
      if (token) {
        await loadProfile();
      }
      setIsReady(true);
    }
    init();
  }, [loadProfile]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <AuthGuard>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="transaction/[id]"
          options={{ title: 'Chi tiết giao dịch', presentation: 'card' }}
        />
        <Stack.Screen
          name="transaction/create"
          options={{ title: 'Thêm giao dịch', presentation: 'modal' }}
        />
        <Stack.Screen
          name="transaction/edit"
          options={{ title: 'Sửa giao dịch', presentation: 'modal' }}
        />
        <Stack.Screen
          name="asset/create"
          options={{ title: 'Thêm tài sản', presentation: 'modal' }}
        />
      </Stack>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
