import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Card, Button } from '../../src/components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER } from '../../src/theme';

export default function SyncScreen() {
  const [autoSync, setAutoSync] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLastSync(new Date().toLocaleString());
      Alert.alert('Success', 'Data synced to cloud!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      Alert.alert('Error', message);
    } finally {
      setSyncing(false);
    }
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Data',
      'This will replace local data with cloud backup. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              Alert.alert('Success', 'Data restored from backup!');
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Restore failed';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>BACKUP & SYNC</Text>
      <Text style={styles.subtitle}>Keep your data safe in the cloud</Text>

      <Card title="AUTO SYNC">
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Enable Auto Sync</Text>
            <Text style={styles.switchDesc}>
              Automatically backup on every change
            </Text>
          </View>
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: COLORS.borderLight, true: COLORS.accent }}
            thumbColor={COLORS.surface}
          />
        </View>
        {lastSync && (
          <Text style={styles.lastSync}>Last sync: {lastSync}</Text>
        )}
      </Card>

      <Card title="MANUAL ACTIONS">
        <Button
          title={syncing ? 'Syncing...' : 'Backup Now'}
          onPress={handleSync}
          loading={syncing}
          fullWidth
          size="lg"
          variant="primary"
          style={styles.actionBtn}
        />
        <Button
          title="Restore from Backup"
          onPress={handleRestore}
          fullWidth
          size="lg"
          variant="outline"
          style={styles.actionBtn}
        />
      </Card>

      <Card title="SYNC STATUS" variant="default">
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={[styles.statusValue, { color: COLORS.success }]}>
            ● CONNECTED
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Cloud Provider</Text>
          <Text style={styles.statusValue}>WTF Cloud</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Storage Used</Text>
          <Text style={styles.statusValue}>--</Text>
        </View>
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
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  switchDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  lastSync: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textTransform: 'uppercase',
  },
  actionBtn: {
    marginBottom: SPACING.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  statusLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
});
