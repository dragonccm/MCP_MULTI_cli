import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../src/theme';
import { BrutalButton, BrutalCard, BrutalInput } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { ApiError } from '../../src/services/api';

export default function RegisterScreen(): React.JSX.Element {
  const router = useRouter();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!displayName.trim()) errs['displayName'] = 'Name is required';
    if (!email.trim()) errs['email'] = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs['email'] = 'Invalid email format';
    if (!password.trim()) errs['password'] = 'Password is required';
    else if (password.length < 8) errs['password'] = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errs['confirmPassword'] = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email.trim(), password, displayName.trim());
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>WTF</Text>
          <Text style={styles.subtitle}>Where&apos;s The Finance?</Text>
        </View>

        <BrutalCard variant="elevated">
          <Text style={styles.title}>Create Account</Text>

          <BrutalInput
            label="Display Name"
            placeholder="Your name"
            value={displayName}
            onChangeText={setDisplayName}
            error={errors['displayName']}
            autoFocus
          />

          <BrutalInput
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            error={errors['email']}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <BrutalInput
            label="Password"
            placeholder="Min 8 characters"
            value={password}
            onChangeText={setPassword}
            error={errors['password']}
            secureTextEntry
          />

          <BrutalInput
            label="Confirm Password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors['confirmPassword']}
            secureTextEntry
          />

          <BrutalButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
          />
        </BrutalCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="link"
            accessibilityLabel="Go to login"
          >
            <Text style={styles.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xxl,
    justifyContent: 'center',
    flexGrow: 1,
    gap: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: typography.fontSize.display,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});
