import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy transaction data
const transactions = [
  {
    id: '1',
    title: 'Grocery Shopping',
    amount: -1200,
    date: '2025-05-19',
    category: 'Food',
  },
  {
    id: '2',
    title: 'Salary',
    amount: 45000,
    date: '2025-05-15',
    category: 'Income',
  },
  {
    id: '3',
    title: 'Electricity Bill',
    amount: -2800,
    date: '2025-05-10',
    category: 'Utilities',
  },
  {
    id: '4',
    title: 'Freelance Work',
    amount: 15000,
    date: '2025-05-08',
    category: 'Income',
  },
  {
    id: '5',
    title: 'Restaurant',
    amount: -980,
    date: '2025-05-05',
    category: 'Food',
  },
];

export default function TransactionsScreen() {
  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText, 
          item.amount > 0 ? styles.incomeText : styles.expenseText
        ]}>
          {item.amount > 0 ? `+৳${item.amount.toLocaleString()}` : `-৳${Math.abs(item.amount).toLocaleString()}`}
        </Text>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>
      
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  incomeText: {
    color: '#34C759',
  },
  expenseText: {
    color: '#FF3B30',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
});