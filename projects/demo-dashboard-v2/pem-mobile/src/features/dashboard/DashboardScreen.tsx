import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';

const DashboardScreen = ({ navigation }: any) => {
  const { user, clearAuth } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hi, {user?.name}</Text>
        <TouchableOpacity onPress={clearAuth}>
          <LogOut size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <Wallet size={24} color="#fff" />
          <Text style={styles.balanceTitle}>Total Balance</Text>
        </View>
        <Text style={styles.balanceAmount}>$1,250.00</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <TrendingUp size={24} color="#34C759" />
          <Text style={styles.statTitle}>Income</Text>
          <Text style={styles.statAmount}>$3,000.00</Text>
        </View>
        <View style={styles.statItem}>
          <TrendingDown size={24} color="#FF3B30" />
          <Text style={styles.statTitle}>Expenses</Text>
          <Text style={styles.statAmount}>$1,750.00</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Plus size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Transaction</Text>
      </TouchableOpacity>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionItem}>
          <View>
            <Text style={styles.transCategory}>Lunch</Text>
            <Text style={styles.transDate}>Oct 25, 2023</Text>
          </View>
          <Text style={[styles.transAmount, { color: '#FF3B30' }]}>-$15.00</Text>
        </View>
        <View style={styles.transactionItem}>
          <View>
            <Text style={styles.transCategory}>Salary</Text>
            <Text style={styles.transDate}>Oct 24, 2023</Text>
          </View>
          <Text style={[styles.transAmount, { color: '#34C759' }]}>+$2,500.00</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  welcomeText: { fontSize: 20, fontWeight: 'bold' },
  balanceCard: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  balanceTitle: { color: 'rgba(255,255,255,0.8)', marginLeft: 10, fontSize: 16 },
  balanceAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    width: '48%',
    alignItems: 'center',
  },
  statTitle: { color: '#8E8E93', marginTop: 5 },
  statAmount: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  addButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  recentSection: { marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  transCategory: { fontSize: 16, fontWeight: '600' },
  transDate: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  transAmount: { fontSize: 16, fontWeight: 'bold' },
});

export default DashboardScreen;
