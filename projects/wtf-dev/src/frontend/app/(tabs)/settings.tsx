import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderWidth, borderRadius, shadows } from '../../src/theme';
import { BrutalCard, BrutalButton } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingsItem({ icon, label, value, onPress }: SettingsItemProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={20} color={colors.accent} />
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {value && <Text style={styles.itemValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen(): React.JSX.Element {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const displayName = user?.displayName ?? 'WTF User';
  const displayEmail = user?.email ?? 'user@wtf.finance';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Profile */}
        <BrutalCard>
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{displayEmail}</Text>
            </View>
          </View>
        </BrutalCard>

        {/* General */}
        <Text style={styles.sectionTitle}>General</Text>
        <BrutalCard noPadding>
          <SettingsItem icon="cash-outline" label="Default Currency" value="VND" />
          <SettingsItem icon="language-outline" label="Language" value="English" />
          <SettingsItem icon="notifications-outline" label="Notifications" value="On" />
        </BrutalCard>

        {/* Data */}
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        <BrutalCard noPadding>
          <SettingsItem icon="cloud-upload-outline" label="Backup Data" />
          <SettingsItem icon="cloud-download-outline" label="Restore Data" />
          <SettingsItem icon="trash-outline" label="Clear All Data" />
        </BrutalCard>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <BrutalCard noPadding>
          <SettingsItem icon="information-circle-outline" label="App Version" value="1.0.0" />
          <SettingsItem icon="document-text-outline" label="Terms of Service" />
          <SettingsItem icon="shield-checkmark-outline" label="Privacy Policy" />
        </BrutalCard>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>WTF Finance</Text>
          <Text style={styles.appInfoSub}>Where&apos;s The Finance?</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0 · Refined Light Brutalism</Text>
        </View>

        {/* Logout */}
        <BrutalButton
          title="Log Out"
          onPress={handleLogout}
          variant="danger"
          fullWidth
        />

        <View style={styles.footer} />
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
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textInverse,
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  itemValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appInfoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  appInfoSub: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  appInfoVersion: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  footer: {
    height: spacing.xxxl,
  },
});
