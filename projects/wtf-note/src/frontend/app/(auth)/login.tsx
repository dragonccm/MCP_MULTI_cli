import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Button, Input } from '../../src/components/ui';
import { useAuthStore } from '../../src/stores';
import { useForm } from '../../src/hooks';
import { loginSchema, type LoginForm } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const form = useForm<LoginForm>(
    { email: '', password: '' },
    loginSchema
  );

  const handleLogin = async () => {
    await form.handleSubmit(async (data) => {
      clearError();
      await login(data.email, data.password);
      router.replace('/(tabs)');
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>WTF</Text>
          <Text style={styles.logoSub}>NOTE</Text>
          <Text style={styles.tagline}>Finance. Tracked. Simply.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>LOG IN</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="you@example.com"
            value={form.values.email}
            onChangeText={(v) => form.setValue('email', v)}
            error={form.errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="Min 8 characters"
            value={form.values.password}
            onChangeText={(v) => form.setValue('password', v)}
            error={form.errors.password}
            secureTextEntry
          />

          <Button
            title={isLoading ? 'Logging in...' : 'Log In'}
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            size="lg"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>No account? </Text>
            <Link href="/(auth)/register" style={styles.link}>
              <Text style={styles.linkText}>REGISTER →</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  logoSub: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.accent,
    letterSpacing: 8,
    marginTop: -8,
  },
  tagline: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOW.brutal,
  },
  formTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    marginBottom: SPACING.lg,
    letterSpacing: 2,
  },
  errorBox: {
    backgroundColor: COLORS.dangerLight,
    borderWidth: BORDER.width,
    borderColor: COLORS.danger,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  link: {},
  linkText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHT.black,
  },
});
