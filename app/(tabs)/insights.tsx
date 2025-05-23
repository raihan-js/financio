import { useAppContext } from '@/context/AppContext';
import { Transaction } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Time periods for filtering
const timePeriods = ['Week', 'Month', 'Quarter', 'Year'];

// Financial tips based on popular finance books
const financialTips = [
  {
    id: 1,
    title: "Emergency Fund First",
    tip: "Build ৳50,000-100,000 emergency fund before investing. This is your financial security blanket.",
    source: "Dave Ramsey - Total Money Makeover",
    icon: "shield-outline",
    color: "#FF6B6B"
  },
  {
    id: 2,
    title: "Assets vs Liabilities",
    tip: "Buy things that put money in your pocket (assets), avoid things that take money out (liabilities).",
    source: "Robert Kiyosaki - Rich Dad Poor Dad",
    icon: "trending-up-outline",
    color: "#4ECDC4"
  },
  {
    id: 3,
    title: "Pay Yourself First",
    tip: "Save 20% of your income before paying any bills. Automate your savings to make it easier.",
    source: "Financial Planning Basics",
    icon: "wallet-outline",
    color: "#45B7D1"
  },
  {
    id: 4,
    title: "Time Value of Money",
    tip: "৳1,000 saved today is worth more than ৳1,000 saved tomorrow. Start investing early.",
    source: "Compound Interest Principle",
    icon: "time-outline",
    color: "#96CEB4"
  },
];

interface CategoryData {
  id: string;
  name: string;
  amount: number;
  percentage: number;
}

interface StatsData {
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  incomeGrowth: number;
  expenseGrowth: number;
  balanceGrowth: number;
}

export default function InsightsScreen() {
  const { transactions } = useAppContext();
  const [activePeriod, setActivePeriod] = useState('Month');
  const [currentTip, setCurrentTip] = useState(0);

  // Calculate dynamic statistics with proper typing
  const stats: StatsData = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalBalance = 0;
    
    // Calculate totals
    transactions.forEach((transaction: Transaction) => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
        totalBalance += transaction.amount;
      } else {
        totalExpense += transaction.amount;
        totalBalance -= transaction.amount;
      }
    });
    
    // Calculate growth rates (simplified - in a real app, compare with previous period)
    const incomeGrowth = totalIncome > 0 ? 12 : 0;
    const expenseGrowth = totalExpense > 0 ? 5 : 0;
    const balanceGrowth = totalBalance > 0 ? 18 : totalBalance < 0 ? -10 : 0;
    
    return {
      totalIncome,
      totalExpense,
      totalBalance,
      incomeGrowth,
      expenseGrowth,
      balanceGrowth
    };
  }, [transactions]);

  // Calculate expenses by category with proper typing
  const expensesByCategory: CategoryData[] = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    // Sum up expenses by category
    transactions
      .filter((t: Transaction) => t.type === 'expense')
      .forEach((transaction: Transaction) => {
        if (categoryTotals[transaction.category]) {
          categoryTotals[transaction.category] += transaction.amount;
        } else {
          categoryTotals[transaction.category] = transaction.amount;
        }
      });
    
    // Convert to array and calculate percentages
    const totalExpenses: number = Object.values(categoryTotals).reduce((sum: number, amount: number) => sum + amount, 0);
    
    return Object.entries(categoryTotals)
      .map(([category, amount]: [string, number]): CategoryData => ({
        id: category,
        name: category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
      }))
      .sort((a: CategoryData, b: CategoryData) => b.amount - a.amount) // Sort by amount descending
      .slice(0, 8); // Show top 8 categories
  }, [transactions]);
  
  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % financialTips.length);
  };
  
  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + financialTips.length) % financialTips.length);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>
        
        {/* Time Period Filter */}
        <View style={styles.periodFilter}>
          {timePeriods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                activePeriod === period && styles.activePeriodButton
              ]}
              onPress={() => setActivePeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                activePeriod === period && styles.activePeriodButtonText
              ]}>{period}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryAmount}>৳{stats.totalIncome.toLocaleString()}</Text>
            <View style={styles.summaryTrend}>
              <Ionicons 
                name={stats.incomeGrowth >= 0 ? "arrow-up" : "arrow-down"} 
                size={12} 
                color={stats.incomeGrowth >= 0 ? "#34C759" : "#FF3B30"} 
              />
              <Text style={[
                styles.summaryTrendText, 
                { color: stats.incomeGrowth >= 0 ? '#34C759' : '#FF3B30' }
              ]}>
                {Math.abs(stats.incomeGrowth)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryAmount}>৳{stats.totalExpense.toLocaleString()}</Text>
            <View style={styles.summaryTrend}>
              <Ionicons 
                name={stats.expenseGrowth >= 0 ? "arrow-up" : "arrow-down"} 
                size={12} 
                color={stats.expenseGrowth >= 0 ? "#FF3B30" : "#34C759"} 
              />
              <Text style={[
                styles.summaryTrendText, 
                { color: stats.expenseGrowth >= 0 ? '#FF3B30' : '#34C759' }
              ]}>
                {Math.abs(stats.expenseGrowth)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[
              styles.summaryAmount,
              { color: stats.totalBalance >= 0 ? '#333' : '#FF3B30' }
            ]}>
              ৳{stats.totalBalance.toLocaleString()}
            </Text>
            <View style={styles.summaryTrend}>
              <Ionicons 
                name={stats.balanceGrowth >= 0 ? "arrow-up" : "arrow-down"} 
                size={12} 
                color={stats.balanceGrowth >= 0 ? "#34C759" : "#FF3B30"} 
              />
              <Text style={[
                styles.summaryTrendText, 
                { color: stats.balanceGrowth >= 0 ? '#34C759' : '#FF3B30' }
              ]}>
                {Math.abs(stats.balanceGrowth)}%
              </Text>
            </View>
          </View>
        </View>
        
        {/* Expenses by Category */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expenses by Category</Text>
        </View>
        
        <View style={styles.categoryList}>
          {expensesByCategory.length > 0 ? (
            expensesByCategory.map((category: CategoryData) => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryAmount}>৳{category.amount.toLocaleString()}</Text>
                </View>
                <View style={styles.categoryBarContainer}>
                  <View 
                    style={[styles.categoryBar, { width: `${category.percentage}%` }]} 
                  />
                </View>
                <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="pie-chart-outline" size={48} color="#ccc" />
              <Text style={styles.noDataText}>No expense data yet</Text>
              <Text style={styles.noDataSubtext}>Start adding transactions to see category breakdown</Text>
            </View>
          )}
        </View>
        
        {/* Financial Education Tip */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Financial Tip</Text>
          <View style={styles.tipNavigation}>
            <TouchableOpacity onPress={prevTip} style={styles.tipNavButton}>
              <Ionicons name="chevron-back" size={16} color="#666" />
            </TouchableOpacity>
            <Text style={styles.tipCounter}>{currentTip + 1}/{financialTips.length}</Text>
            <TouchableOpacity onPress={nextTip} style={styles.tipNavButton}>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={[styles.tipIcon, { backgroundColor: financialTips[currentTip].color + '20' }]}>
              <Ionicons 
                name={financialTips[currentTip].icon as any} 
                size={24} 
                color={financialTips[currentTip].color} 
              />
            </View>
            <Text style={styles.tipTitle}>{financialTips[currentTip].title}</Text>
          </View>
          <Text style={styles.tipText}>{financialTips[currentTip].tip}</Text>
          <Text style={styles.tipSource}>— {financialTips[currentTip].source}</Text>
        </View>
        
        {/* Placeholder for future charts */}
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>Expense Trends Coming Soon</Text>
          <Text style={styles.placeholderMessage}>
            Charts and detailed analytics will be added in future updates
          </Text>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  periodFilter: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  activePeriodButton: {
    backgroundColor: '#5F67E8',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activePeriodButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTrendText: {
    fontSize: 12,
    marginLeft: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 10,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  categoryList: {
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
  categoryItem: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  categoryBarContainer: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    marginBottom: 4,
  },
  categoryBar: {
    height: '100%',
    backgroundColor: '#5F67E8',
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  chartPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  placeholderMessage: {
    fontSize: 14,
    color: '#666',
  },
  tipNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipNavButton: {
    padding: 8,
  },
  tipCounter: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 12,
  },
  tipSource: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});