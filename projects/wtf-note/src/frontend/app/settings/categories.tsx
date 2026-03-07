import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Button, Input, EmptyState } from '../../src/components/ui';
import { useAppStore } from '../../src/stores';
import { categoryService } from '../../src/services';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';

export default function CategoriesScreen() {
  const { categories, fetchCategories } = useAppStore();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await categoryService.create({ name: newName.trim() });
      setNewName('');
      await fetchCategories();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create';
      Alert.alert('Error', message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete', `Remove "${name}" category?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await categoryService.remove(id);
            await fetchCategories();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card title="ADD CATEGORY">
        <View style={styles.addRow}>
          <Input
            placeholder="Category name"
            value={newName}
            onChangeText={setNewName}
            containerStyle={styles.addInput}
          />
          <Button
            title="ADD"
            onPress={handleAdd}
            loading={adding}
            size="sm"
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>CATEGORIES</Text>

      {categories.length === 0 ? (
        <EmptyState
          title="No custom categories"
          subtitle="Create one above"
        />
      ) : (
        categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.catItem}
            onLongPress={() => !cat.isDefault && handleDelete(cat.id, cat.name)}
          >
            <Text style={styles.catName}>{cat.name}</Text>
            {cat.isDefault && (
              <Text style={styles.defaultBadge}>DEFAULT</Text>
            )}
          </TouchableOpacity>
        ))
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
  addRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  addInput: {
    flex: 1,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  catItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: 4,
  },
  catName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  defaultBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
