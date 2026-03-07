import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Card } from '../../src/components/ui';
import { useAuthStore } from '../../src/stores';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';

interface MenuItem {
  icon: string;
  label: string;
  sublabel: string;
  onPress: () => void;
  color?: string;
}

export default function MoreScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
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

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'AI & ANALYTICS',
      items: [
        {
          icon: '🤖',
          label: 'AI Spending Insights',
          sublabel: 'Smart analysis of your spending',
          onPress: () => router.push('/ai/insights'),
        },
        {
          icon: '💡',
          label: 'Budget Recommendations',
          sublabel: 'AI-suggested budget limits',
          onPress: () => router.push('/ai/budget-recommendations'),
        },
        {
          icon: '📈',
          label: 'Net Worth Projection',
          sublabel: '1/5/10 year forecasts',
          onPress: () => router.push('/ai/projections'),
        },
        {
          icon: '📊',
          label: 'Spending Analytics',
          sublabel: 'Charts and breakdown',
          onPress: () => router.push('/settings/analytics'),
        },
        {
          icon: '💰',
          label: 'Budget Tracking',
          sublabel: 'Monthly budget progress',
          onPress: () => router.push('/settings/budgets'),
        },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        {
          icon: '👤',
          label: 'Profile',
          sublabel: user?.email ?? 'Manage your account',
          onPress: () => router.push('/settings/profile'),
        },
        {
          icon: '💱',
          label: 'Currency & Language',
          sublabel: user?.currencyPreference ?? 'VND',
          onPress: () => router.push('/settings/currency'),
        },
        {
          icon: '📂',
          label: 'Categories',
          sublabel: 'Manage transaction categories',
          onPress: () => router.push('/settings/categories'),
        },
        {
          icon: '📤',
          label: 'Export Data',
          sublabel: 'CSV / Excel export',
          onPress: () => router.push('/settings/export'),
        },
        {
          icon: '📥',
          label: 'Import Data',
          sublabel: 'Import from CSV',
          onPress: () => router.push('/settings/import'),
        },
        {
          icon: '☁️',
          label: 'Backup & Sync',
          sublabel: 'Cloud backup settings',
          onPress: () => router.push('/settings/sync'),
        },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        {
          icon: '🚪',
          label: 'Logout',
          sublabel: 'Sign out of your account',
          onPress: handleLogout,
          color: COLORS.danger,
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.profileName ?? 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.userName}>{user?.profileName ?? 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
        </View>
      </View>

      {menuSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuContent}>
                <Text
                  style={[
                    styles.menuLabel,
                    item.color ? { color: item.color } : undefined,
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={styles.menuSub}>{item.sublabel}</Text>
              </View>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Text style={styles.version}>WTF Note v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
    ...SHADOW.brutal,
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textInverse,
  },
  userName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
  },
  userEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: 4,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  menuSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  menuArrow: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
  },
  version: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
