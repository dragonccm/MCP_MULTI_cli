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
import { registerSchema, type RegisterInput } from '../../src/utils';
import { useAuthStore } from '../../src/stores';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthStore();

  const form = useForm<typeof registerSchema>({
    schema: registerSchema,
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    onSubmit: async (values: RegisterInput) => {
      await register(values.name, values.email, values.password);
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
          <Text style={styles.title}>Tạo tài khoản</Text>
        </View>

        <View style={styles.card}>
          <BrutalInput
            label="Họ tên"
            placeholder="Nguyễn Văn A"
            value={form.values.name}
            onChangeText={(v) => form.setValue('name', v)}
            error={form.errors.name}
            autoComplete="name"
          />

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
            placeholder="Tối thiểu 8 ký tự"
            value={form.values.password}
            onChangeText={(v) => form.setValue('password', v)}
            error={form.errors.password}
            secureTextEntry
          />

          <BrutalInput
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={form.values.confirmPassword}
            onChangeText={(v) => form.setValue('confirmPassword', v)}
            error={form.errors.confirmPassword}
            secureTextEntry
          />

          {form.submitError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {form.submitError}</Text>
            </View>
          )}

          <BrutalButton
            title="Đăng ký"
            onPress={form.handleSubmit}
            loading={form.isSubmitting}
            fullWidth
            size="lg"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <Link href="/(auth)/login" style={styles.link}>
              Đăng nhập
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
    marginBottom: SPACING.xxl,
  },
  logo: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '900',
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.widthThick,
    borderColor: COLORS.border,
    borderRadius: BORDER.radiusLg,
    padding: SPACING.xxl,
    ...SHADOW.brutalLg,
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
