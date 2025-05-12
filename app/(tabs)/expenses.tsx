import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { Transaction, TransactionCategoryType } from '@/types';

// Sample data - replace with Firebase in production
const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    amount: 35.50,
    description: 'Grocery Shopping',
    category: 'food',
    date: new Date(),
    isExpense: true,
    source: 'DBBL Bank'
  },
  {
    id: '2',
    amount: 10.25,
    description: 'Bus Fare',
    category: 'transportation',
    date: new Date(Date.now() - 86400000), // Yesterday
    isExpense: true, 
    source: 'Manual Entry'
  },
  {
    id: '3',
    amount: 1000.00,
    description: 'Salary',
    category: 'income',
    date: new Date(Date.now() - 172800000), // 2 days ago
    isExpense: false,
    source: 'BRAC Bank'
  },
  {
    id: '4',
    amount: 50.00,
    description: 'Electricity Bill',
    category: 'bills',
    date: new Date(Date.now() - 259200000), // 3 days ago
    isExpense: true,
    source: 'DBBL Bank'
  },
  {
    id: '5',
    amount: 15.75,
    description: 'Movie Ticket',
    category: 'entertainment',
    date: new Date(Date.now() - 345600000), // 4 days ago
    isExpense: true,
    source: 'Manual Entry'
  },
  {
    id: '6',
    amount: 75.00,
    description: 'Health Checkup',
    category: 'health',
    date: new Date(Date.now() - 432000000), // 5 days ago
    isExpense: true,
    source: 'BRAC Bank'
  },
  {
    id: '7',
    amount: 200.00,
    description: 'Savings Transfer',
    category: 'savings',
    date: new Date(Date.now() - 518400000), // 6 days ago
    isExpense: false,
    source: 'DBBL Bank'
  }
];

export default function ExpensesScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategoryType | 'all'>('all');

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    setTimeout(() => {
      setTransactions(SAMPLE_TRANSACTIONS);
      setLoading(false);
    }, 500);
    
    // TODO: Replace with Firebase query
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    // Apply type filter
    if (filter === 'expense' && !transaction.isExpense) return false;
    if (filter === 'income' && transaction.isExpense) return false;
    
    // Apply category filter
    if (categoryFilter !== 'all' && transaction.category !== categoryFilter) return false;
    
    return true;
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <View>
          <ThemedText type="title">Transactions</ThemedText>
          <ThemedText style={styles.subtitle}>
            {filteredTransactions.length} transactions found
          </ThemedText>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/modals/add-expense')}
        >
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </Pressable>
      </ThemedView>
      
      {/* Filter Options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <Pressable
          style={[styles.filterChip, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <ThemedText style={filter === 'all' ? styles.activeFilterText : styles.filterText}>
            All
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.filterChip, filter === 'expense' && styles.activeFilter]}
          onPress={() => setFilter('expense')}
        >
          <ThemedText style={filter === 'expense' ? styles.activeFilterText : styles.filterText}>
            Expenses
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.filterChip, filter === 'income' && styles.activeFilter]}
          onPress={() => setFilter('income')}
        >
          <ThemedText style={filter === 'income' ? styles.activeFilterText : styles.filterText}>
            Income
          </ThemedText>
        </Pressable>
        
        {/* Add category filters */}
        <Pressable
          style={[styles.filterChip, categoryFilter === 'food' && styles.activeFilter]}
          onPress={() => setCategoryFilter(categoryFilter === 'food' ? 'all' : 'food')}
        >
          <ThemedText style={categoryFilter === 'food' ? styles.activeFilterText : styles.filterText}>
            Food
          </ThemedText>
        </Pressable>
        
        <Pressable
          style={[styles.filterChip, categoryFilter === 'bills' && styles.activeFilter]}
          onPress={() => setCategoryFilter(categoryFilter === 'bills' ? 'all' : 'bills')}
        >
          <ThemedText style={categoryFilter === 'bills' ? styles.activeFilterText : styles.filterText}>
            Bills
          </ThemedText>
        </Pressable>
        
        <Pressable
          style={[styles.filterChip, categoryFilter === 'transportation' && styles.activeFilter]}
          onPress={() => setCategoryFilter(categoryFilter === 'transportation' ? 'all' : 'transportation')}
        >
          <ThemedText style={categoryFilter === 'transportation' ? styles.activeFilterText : styles.filterText}>
            Transport
          </ThemedText>
        </Pressable>
      </ScrollView>
      
      {/* Transaction List */}
      <ScrollView style={styles.transactionsList}>
        {loading ? (
          <ThemedText style={styles.centerText}>Loading transactions...</ThemedText>
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map(transaction => (
            <TransactionItem 
              key={transaction.id} 
              transaction={transaction}
              onPress={() => router.push({
                pathname: '/modals/edit-expense',
                params: { id: transaction.id }
              })}
            />
          ))
        ) : (
          <ThemedText style={styles.centerText}>No transactions found.</ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#0A7EA4',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#0A7EA4',
    borderColor: '#0A7EA4',
  },
  filterText: {
    color: '#555555',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerText: {
    textAlign: 'center',
    marginTop: 20,
  },
});