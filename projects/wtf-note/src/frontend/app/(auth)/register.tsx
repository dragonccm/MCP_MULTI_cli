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
import { registerSchema, type RegisterForm } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuthStore();
  const form = useForm<RegisterForm>(
    { profileName: '', email: '', password: '', confirmPassword: '' },
    registerSchema
  );

  const handleRegister = async () => {
    await form.handleSubmit(async (data) => {
      clearError();
      await register(data.email, data.password, data.profileName);
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
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>REGISTER</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Name"
            placeholder="Your display name"
            value={form.values.profileName}
            onChangeText={(v) => form.setValue('profileName', v)}
            error={form.errors.profileName}
            autoCapitalize="words"
          />

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

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={form.values.confirmPassword}
            onChangeText={(v) => form.setValue('confirmPassword', v)}
            error={form.errors.confirmPassword}
            secureTextEntry
          />

          <Button
            title={isLoading ? 'Creating...' : 'Create Account'}
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            size="lg"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Have an account? </Text>
            <Link href="/(auth)/login" style={styles.link}>
              <Text style={styles.linkText}>LOG IN →</Text>
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
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  logoSub: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.accent,
    letterSpacing: 8,
    marginTop: -6,
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
