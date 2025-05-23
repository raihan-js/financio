import { useAppContext } from '@/context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper function to get icon based on category
const getCategoryIcon = (category: string): any => {
  const categoryMap: Record<string, any> = {
    'Food': 'fast-food-outline',
    'Transport': 'car-outline',
    'Shopping': 'cart-outline',
    'Bills': 'receipt-outline',
    'Entertainment': 'film-outline',
    'Health': 'medical-outline',
    'Income': 'cash-outline',
    'Other': 'ellipsis-horizontal-outline',
  };
  
  return categoryMap[category] || 'ellipsis-horizontal-outline';
};

export default function HomeScreen() {
  const { transactions, userProfile, syncSMS, removeTransaction } = useAppContext();
  
  // Calculate totals and stats
  const stats = useMemo(() => {
    let totalBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
        totalBalance += transaction.amount;
      } else {
        totalExpense += transaction.amount;
        totalBalance -= transaction.amount;
      }
    });
    
    // Calculate growth rates (dummy values for now - in a real app you'd compare with previous period)
    const growthRate = totalBalance > 0 ? 15 : -5;
    const incomeGrowth = totalIncome > 0 ? 12 : 0;
    const expenseGrowth = totalExpense > 0 ? 8 : 0;
    
    return {
      balance: totalBalance,
      income: totalIncome,
      expense: totalExpense,
      growthRate,
      incomeGrowth,
      expenseGrowth
    };
  }, [transactions]);

  const handleSyncSMS = async () => {
    try {
      const result = await syncSMS();
      if (result.success) {
        Alert.alert(
          'SMS Sync Complete', 
          `Found and processed ${result.count} new transactions from your SMS messages.`
        );
      } else {
        Alert.alert('Sync Failed', result.error || 'Unable to sync SMS messages');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sync SMS messages');
    }
  };

  const handleDeleteTransaction = (transactionId: string, description: string) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTransaction(transactionId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          }
        }
      ]
    );
  };
  // Goals data (this would come from storage in a full implementation)
  // Removed placeholder data

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userProfile?.name ? userProfile.name[0].toUpperCase() : 'U'}</Text>
          </View>
          <Text style={styles.greeting}>Hello, {userProfile?.name || 'User'}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSyncSMS}>
            <Ionicons name="sync-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>৳{stats.balance.toLocaleString()}</Text>
            <View style={styles.growthBadge}>
              <Ionicons name="arrow-up" size={14} color="#333" />
              <Text style={styles.growthText}>{stats.growthRate}%</Text>
            </View>
          </View>
          
          <View style={styles.timeFilterRow}>
            <TouchableOpacity style={[styles.timeFilterButton, styles.timeFilterActive]}>
              <Text style={styles.timeFilterActiveText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeFilterButton}>
              <Text style={styles.timeFilterText}>Week</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction Overview */}
        <Text style={styles.sectionTitle}>Transactions</Text>
        <View style={styles.transactionCards}>
          {/* Income Card */}
          <View style={[styles.transactionCard, styles.incomeCard]}>
            <View style={styles.transactionCardTop}>
              <Text style={styles.transactionTypeText}>Income</Text>
              <View style={styles.transactionGrowth}>
                <Ionicons name="arrow-up" size={12} color="#FFF" />
                <Text style={styles.transactionGrowthText}>{stats.incomeGrowth}%</Text>
              </View>
            </View>
            <Text style={styles.transactionAmount}>৳{stats.income}</Text>
            <View style={styles.transactionPatternContainer}>
              <View style={styles.transactionPattern} />
            </View>
          </View>
          
          {/* Outcome Card */}
          <View style={[styles.transactionCard, styles.outcomeCard]}>
            <View style={styles.transactionCardTop}>
              <Text style={styles.transactionTypeText}>Outcome</Text>
              <View style={styles.transactionGrowth}>
                <Ionicons name="arrow-up" size={12} color="#FFF" />
                <Text style={styles.transactionGrowthText}>{stats.expenseGrowth}%</Text>
              </View>
            </View>
            <Text style={styles.transactionAmount}>৳{stats.expense}</Text>
            <View style={styles.transactionPatternContainer}>
              <View style={styles.transactionPattern} />
            </View>
          </View>
        </View>

        {/* Goals Section - Only show if there are goals */}
        {/* For now, we'll hide this section since we removed placeholder data */}
        {false && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Goal</Text>
            </View>
            
            {/* Goals would be rendered here */}
          </>
        )}

        {/* Top Expenses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top expenses</Text>
          <TouchableOpacity style={styles.periodDropdown}>
            <Text style={styles.periodText}>Month</Text>
            <Ionicons name="chevron-down" size={16} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* Top expense items */}
        <View style={styles.expensesList}>
          {transactions
            .filter(t => t.type === 'expense')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3)
            .map((transaction, index) => (
              <View key={transaction.id} style={styles.expenseItem}>
                <View style={styles.expenseIconContainer}>
                  <Ionicons 
                    name={getCategoryIcon(transaction.category) as any}
                    size={20} 
                    color="#5F67E8" 
                  />
                </View>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseTitle}>{transaction.description}</Text>
                  <Text style={styles.expenseCategory}>{transaction.category}</Text>
                </View>
                <Text style={styles.expenseAmount}>-৳{transaction.amount.toLocaleString()}</Text>
                <TouchableOpacity 
                  style={styles.expenseDeleteButton}
                  onPress={() => handleDeleteTransaction(transaction.id, transaction.description)}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
            
          {transactions.filter(t => t.type === 'expense').length === 0 && (
            <Text style={styles.noDataText}>No expense transactions yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5F67E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    marginRight: 12,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4FE',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  growthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 2,
  },
  timeFilterRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  timeFilterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  timeFilterActive: {
    backgroundColor: '#EEEEEE',
  },
  timeFilterActiveText: {
    color: '#333',
    fontWeight: '600',
  },
  timeFilterText: {
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  transactionCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  transactionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    height: 120,
  },
  incomeCard: {
    backgroundColor: '#5F67E8',
  },
  outcomeCard: {
    backgroundColor: '#00C1FF',
  },
  transactionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionTypeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  transactionGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionGrowthText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 2,
  },
  transactionAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transactionPatternContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    height: 30,
  },
  transactionPattern: {
    height: 60,
    width: '100%',
    opacity: 0.1,
    backgroundColor: 'white',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    transform: [{ scaleX: 1.5 }],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  expensesList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expenseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F1FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 12,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginRight: 8,
  },
  expenseDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  goalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5F67E8',
    borderRadius: 3,
  },
  goalBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalPeriod: {
    fontSize: 12,
    color: '#666',
  },
  goalMonthly: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});