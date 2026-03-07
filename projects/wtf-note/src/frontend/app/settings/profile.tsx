import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Button, Input, Card } from '../../src/components/ui';
import { useAuthStore } from '../../src/stores';
import { authService } from '../../src/services';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER } from '../../src/theme';

export default function ProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.profileName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        profileName: name,
        email,
      });
      updateUser(updated);
      Alert.alert('Success', 'Profile updated!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.profileName ?? 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <Input
          label="Display Name"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button
          title={saving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
        />
      </Card>
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
  avatarRow: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    backgroundColor: COLORS.primary,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textInverse,
  },
});
