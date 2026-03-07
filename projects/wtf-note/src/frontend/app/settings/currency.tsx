import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Button } from '../../src/components/ui';
import { useAuthStore } from '../../src/stores';
import { authService } from '../../src/services';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER } from '../../src/theme';

const CURRENCIES = [
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'KRW', name: 'Korean Won', symbol: '₩' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
];

export default function CurrencyScreen() {
  const { user, updateUser } = useAuthStore();
  const [selected, setSelected] = useState(user?.currencyPreference ?? 'VND');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile({ currencyPreference: selected });
      updateUser(updated);
      Alert.alert('Success', 'Currency updated!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card title="SELECT CURRENCY">
        {CURRENCIES.map((cur) => (
          <TouchableOpacity
            key={cur.code}
            style={[
              styles.currencyItem,
              selected === cur.code && styles.currencySelected,
            ]}
            onPress={() => setSelected(cur.code)}
          >
            <Text style={styles.currencySymbol}>{cur.symbol}</Text>
            <View style={styles.currencyInfo}>
              <Text style={styles.currencyCode}>{cur.code}</Text>
              <Text style={styles.currencyName}>{cur.name}</Text>
            </View>
            {selected === cur.code && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </Card>

      <Button
        title={saving ? 'Saving...' : 'Save Currency'}
        onPress={handleSave}
        loading={saving}
        fullWidth
        size="lg"
      />
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
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  currencySelected: {
    backgroundColor: COLORS.surfaceAlt,
  },
  currencySymbol: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    width: 40,
    textAlign: 'center',
  },
  currencyInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  currencyCode: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  currencyName: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  checkmark: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.accent,
  },
});
