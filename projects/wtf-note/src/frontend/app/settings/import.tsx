import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Card, Button, EmptyState } from '../../src/components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';

interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  columns: string[];
}

export default function ImportScreen() {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);

  const handleSelectFile = async () => {
    // File picker would go here; show preview simulation
    setPreview({
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      columns: [],
    });
    Alert.alert('Info', 'File picker not available in this environment. Use the API to import CSV data.');
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      Alert.alert('Success', `Imported ${preview.validRows} transactions!`);
      setPreview(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed';
      Alert.alert('Error', message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>IMPORT DATA</Text>
      <Text style={styles.subtitle}>Import transactions from CSV file</Text>

      <Card title="SUPPORTED FORMATS">
        <Text style={styles.formatItem}>• CSV (.csv)</Text>
        <Text style={styles.formatItem}>• Bank statement export</Text>
        <Text style={styles.formatHint}>
          File must include: date, amount, type (income/expense), and optional category/note columns
        </Text>
      </Card>

      <Button
        title="Select CSV File"
        onPress={handleSelectFile}
        variant="outline"
        fullWidth
        size="lg"
      />

      {preview && (
        <Card title="PREVIEW" style={styles.previewCard}>
          <Text style={styles.previewItem}>
            Total Rows: {preview.totalRows}
          </Text>
          <Text style={[styles.previewItem, { color: COLORS.success }]}>
            Valid: {preview.validRows}
          </Text>
          {preview.invalidRows > 0 && (
            <Text style={[styles.previewItem, { color: COLORS.danger }]}>
              Invalid: {preview.invalidRows} (will be skipped)
            </Text>
          )}

          <Button
            title={importing ? 'Importing...' : 'Import Data'}
            onPress={handleImport}
            loading={importing}
            fullWidth
            size="lg"
            variant="success"
            style={styles.importBtn}
          />
        </Card>
      )}
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
  formatItem: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    paddingVertical: 2,
  },
  formatHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  previewCard: {
    marginTop: SPACING.md,
  },
  previewItem: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    paddingVertical: 2,
  },
  importBtn: {
    marginTop: SPACING.md,
  },
});
