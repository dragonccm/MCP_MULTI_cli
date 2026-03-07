import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Card, Button, Chip } from '../../src/components/ui';
import { Input } from '../../src/components/ui';
import { dashboardService } from '../../src/services/data';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';

type ExportFormat = 'csv' | 'excel';

export default function ExportScreen() {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = async () => {
    setExporting(true);
    try {
      const params: Record<string, string> = { format };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      await dashboardService.getSpendingAnalytics(params);
      Alert.alert('Success', `Data exported as ${format.toUpperCase()}! Check your downloads.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      Alert.alert('Error', message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>EXPORT DATA</Text>
      <Text style={styles.subtitle}>Download your financial data</Text>

      <Card title="FORMAT">
        <View style={styles.formatRow}>
          <Button
            title="CSV"
            onPress={() => setFormat('csv')}
            variant={format === 'csv' ? 'primary' : 'outline'}
            style={styles.formatBtn}
          />
          <Button
            title="Excel"
            onPress={() => setFormat('excel')}
            variant={format === 'excel' ? 'primary' : 'outline'}
            style={styles.formatBtn}
          />
        </View>
      </Card>

      <Card title="DATE RANGE (OPTIONAL)">
        <Input
          label="Start Date"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
        />
        <Input
          label="End Date"
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD"
          containerStyle={styles.endDateInput}
        />
      </Card>

      <Card title="INCLUDED DATA">
        <Text style={styles.dataItem}>✓ All transactions</Text>
        <Text style={styles.dataItem}>✓ Debt records & payments</Text>
        <Text style={styles.dataItem}>✓ Asset portfolio</Text>
        <Text style={styles.dataItem}>✓ Budget settings</Text>
        <Text style={styles.dataItem}>✓ Categories</Text>
      </Card>

      <Button
        title={exporting ? 'Exporting...' : 'Export Now'}
        onPress={handleExport}
        loading={exporting}
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
  formatRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  formatBtn: {
    flex: 1,
  },
  endDateInput: {
    marginTop: SPACING.sm,
  },
  dataItem: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
});
