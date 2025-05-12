import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { Transaction } from '@/types';

export default function HomeScreen() {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock data for UI - in production this would come from Firebase
  useEffect(() => {
    setLoading(true);
    
    // This is placeholder/mock data
    // In production, you would fetch from Firebase
    setTimeout(() => {
      setRecentTransactions([
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
        }
      ]);
      
      setMonthlySpending(450.75);
      setMonthlySavings(550.25);
      setLoading(false);
    }, 1000);
    
    // TODO: Replace with actual Firebase queries once your data structure is set up
    // Example of how you would fetch from Firebase:
    /*
    const fetchRecentTransactions = async () => {
      try {
        const q = query(
          collection(firestore, 'transactions'),
          orderBy('date', 'desc'),
          limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        const transactions: Transaction[] = [];
        
        querySnapshot.forEach((doc) => {
          transactions.push({
            id: doc.id,
            ...doc.data() as Omit<Transaction, 'id'>,
            date: (doc.data().date as any).toDate() // Convert Firestore timestamp to JS Date
          });
        });
        
        setRecentTransactions(transactions);
        
        // Calculate monthly stats from Firebase
        // ...
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };
    
    fetchRecentTransactions();
    */
  }, []);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Finance Tracker</ThemedText>
        <Pressable onPress={() => router.push('/settings')}>
          <IconSymbol name="person.circle" size={32} color="#808080" />
        </Pressable>
      </ThemedView>
      
      {/* Balance Overview */}
      <ThemedView style={styles.balanceCard}>
        <ThemedText type="defaultSemiBold" style={styles.balanceLabel}>
          Monthly Overview
        </ThemedText>
        <View style={styles.balanceRow}>
          <ThemedView style={styles.balanceItem}>
            <IconSymbol name="arrow.down" size={24} color="#D32F2F" />
            <ThemedText style={styles.balanceAmount}>
              ৳{monthlySpending.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.balanceType}>Spending</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.balanceItem}>
            <IconSymbol name="arrow.up" size={24} color="#388E3C" />
            <ThemedText style={styles.balanceAmount}>
              ৳{monthlySavings.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.balanceType}>Savings</ThemedText>
          </ThemedView>
        </View>
      </ThemedView>
      
      {/* Quick Actions */}
      <ThemedView style={styles.quickActions}>
        <Pressable 
          style={styles.actionButton} 
          onPress={() => router.push('/modals/add-expense')}
        >
          <IconSymbol name="plus.circle.fill" size={28} color="#0A7EA4" />
          <ThemedText style={styles.actionText}>Add Expense</ThemedText>
        </Pressable>
        
        <Pressable 
          style={styles.actionButton}
          onPress={() => {
            // TODO: Implement SMS scanning feature
            alert('SMS Scanning will be implemented here');
          }}
        >
          <IconSymbol name="envelope.fill" size={28} color="#0A7EA4" />
          <ThemedText style={styles.actionText}>Scan SMS</ThemedText>
        </Pressable>
        
        <Pressable 
          style={styles.actionButton}
          onPress={() => router.push('/insights')}
        >
          <IconSymbol name="lightbulb.fill" size={28} color="#0A7EA4" />
          <ThemedText style={styles.actionText}>Insights</ThemedText>
        </Pressable>
      </ThemedView>
      
      {/* Recent Transactions */}
      <ThemedView style={styles.recentTransactions}>
        <View style={styles.sectionHeader}>
          <ThemedText type="defaultSemiBold">Recent Transactions</ThemedText>
          <Link href="/expenses" asChild>
            <Pressable>
              <ThemedText style={styles.viewAll}>View All</ThemedText>
            </Pressable>
          </Link>
        </View>
        
        {loading ? (
          <ThemedText>Loading transactions...</ThemedText>
        ) : recentTransactions.length > 0 ? (
          recentTransactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <ThemedText>No recent transactions found.</ThemedText>
        )}
      </ThemedView>
      
      {/* Financial Tips (Placeholder for AI insights) */}
      <ThemedView style={styles.tipsCard}>
        <ThemedText type="defaultSemiBold">Financial Tip</ThemedText>
        <ThemedText style={styles.tipText}>
          Consider setting up automatic transfers to your savings account right after receiving income to build your emergency fund.
        </ThemedText>
        <ThemedText style={styles.tipSource}>- AI Assistant</ThemedText>
      </ThemedView>
    </ScrollView>
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
    marginBottom: 20,
  },
  balanceCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceLabel: {
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  balanceType: {
    fontSize: 14,
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    flex: 1,
    marginHorizontal: 4,
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
  },
  recentTransactions: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAll: {
    color: '#0A7EA4',
  },
  tipsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0A7EA4',
    marginBottom: 30,
  },
  tipText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  tipSource: {
    marginTop: 8,
    textAlign: 'right',
    opacity: 0.7,
  },
});