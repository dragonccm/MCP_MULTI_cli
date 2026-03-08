import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, BORDER, SHADOW } from '../../src/constants';
import { BrutalButton, BrutalInput } from '../../src/components/ui';
import { useForm } from '../../src/hooks';
import { loginSchema, type LoginInput } from '../../src/utils';
import { useAuthStore } from '../../src/stores';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();

  const form = useForm<typeof loginSchema>({
    schema: loginSchema,
    initialValues: { email: '', password: '' },
    onSubmit: async (values: LoginInput) => {
      await login(values.email, values.password);
      router.replace('/(tabs)');
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.title}>WTF Note</Text>
          <Text style={styles.subtitle}>Quản lý tài chính thông minh</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Đăng nhập</Text>

          <BrutalInput
            label="Email"
            placeholder="your@email.com"
            value={form.values.email}
            onChangeText={(v) => form.setValue('email', v)}
            error={form.errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <BrutalInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={form.values.password}
            onChangeText={(v) => form.setValue('password', v)}
            error={form.errors.password}
            secureTextEntry
            autoComplete="password"
          />

          {form.submitError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {form.submitError}</Text>
            </View>
          )}

          <BrutalButton
            title="Đăng nhập"
            onPress={form.handleSubmit}
            loading={form.isSubmitting}
            fullWidth
            size="lg"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <Link href="/(auth)/register" style={styles.link}>
              Đăng ký ngay
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.display,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.widthThick,
    borderColor: COLORS.border,
    borderRadius: BORDER.radiusLg,
    padding: SPACING.xxl,
    ...SHADOW.brutalLg,
  },
  cardTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xl,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: BORDER.radius,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  link: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
