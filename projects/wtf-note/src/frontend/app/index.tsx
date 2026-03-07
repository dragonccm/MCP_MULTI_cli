import { Redirect } from 'expo-router';
import React from 'react';
import { useAuthStore } from '../src/stores';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
