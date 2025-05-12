import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { CATEGORIES } from '@/constants/Categories';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Transaction, TransactionCategoryType } from '@/types';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

interface ExpenseChartProps {
  transactions: Transaction[];
  title?: string;
  type?: 'pie' | 'bar';
}

export function ExpenseChart({ 
  transactions, 
  title = 'Expense Breakdown', 
  type = 'pie' 
}: ExpenseChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Filter only expense transactions
  const expenseTransactions = transactions.filter(t => t.isExpense);
  
  // Group by category
  const expensesByCategory: Record<TransactionCategoryType, number> = {} as Record<TransactionCategoryType, number>;
  
  // Initialize all categories with 0
  CATEGORIES.forEach(cat => {
    if (cat.id !== 'income') {
      expensesByCategory[cat.id] = 0;
    }
  });
  
  // Sum up expenses by category
  expenseTransactions.forEach(transaction => {
    if (transaction.category in expensesByCategory) {
      expensesByCategory[transaction.category] += transaction.amount;
    } else {
      expensesByCategory['other'] += transaction.amount;
    }
  });
  
  // Calculate total expenses
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
  
  // Sort categories by amount (descending)
  const sortedCategories = Object.entries(expensesByCategory)
    .filter(([_, amount]) => amount > 0)
    .sort(([_, amountA], [__, amountB]) => amountB - amountA)
    .map(([category, amount]) => ({
      category: category as TransactionCategoryType,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }));
  
  // For pie chart calculations
  const screenWidth = Dimensions.get('window').width;
  const chartSize = screenWidth - 64; // Allow for padding
  const chartRadius = chartSize / 2;
  const chartCenter = chartSize / 2;
  
  // Empty state
  if (totalExpenses === 0) {
    return (
      <Card variant="elevated">
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No expense data available
          </ThemedText>
        </View>
      </Card>
    );
  }
  
  return (
    <Card variant="elevated">
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      
      {type === 'pie' ? (
        <View style={styles.chartContainer}>
          {/* Simplified Pie Chart (placeholder) */}
          <View style={styles.pieChartContainer}>
            <View style={styles.pieChart}>
              {sortedCategories.map((item, index) => {
                const startAngle = sortedCategories
                  .slice(0, index)
                  .reduce((sum, cat) => sum + (cat.percentage / 100) * Math.PI * 2, 0);
                
                const endAngle = startAngle + (item.percentage / 100) * Math.PI * 2;
                
                // Get color from category
                const categoryInfo = CATEGORIES.find(cat => cat.id === item.category);
                const color = categoryInfo?.color || '#808080';
                
                // For a real pie chart, you would use SVG or a charting library
                // This is just a placeholder to show the concept
                return (
                  <View 
                    key={item.category}
                    style={[
                      styles.pieSegmentPlaceholder, 
                      {
                        width: (item.percentage / 100) * chartSize,
                        backgroundColor: color,
                      }
                    ]} 
                  />
                );
              })}
            </View>
          </View>
          
          {/* Legend */}
          <View style={styles.legend}>
            {sortedCategories.map(item => {
              const categoryInfo = CATEGORIES.find(cat => cat.id === item.category);
              return (
                <View key={item.category} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: categoryInfo?.color }]} />
                  <ThemedText style={styles.legendText}>
                    {categoryInfo?.name || item.category}
                  </ThemedText>
                  <ThemedText style={styles.legendValue}>
                    ৳{item.amount.toFixed(0)}
                  </ThemedText>
                  <ThemedText style={styles.legendPercentage}>
                    {item.percentage.toFixed(1)}%
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          {/* Simplified Bar Chart (placeholder) */}
          <View style={styles.barChart}>
            {sortedCategories.map(item => {
              const categoryInfo = CATEGORIES.find(cat => cat.id === item.category);
              return (
                <View key={item.category} style={styles.barContainer}>
                  <View style={styles.barLabel}>
                    <ThemedText style={styles.barLabelText}>
                      {categoryInfo?.name || item.category}
                    </ThemedText>
                  </View>
                  <View style={styles.barWrapper}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          width: `${item.percentage}%`,
                          backgroundColor: categoryInfo?.color 
                        }
                      ]} 
                    />
                    <ThemedText style={styles.barValue}>
                      ৳{item.amount.toFixed(0)}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
      
      <ThemedText style={styles.totalText}>
        Total Expenses: ৳{totalExpenses.toFixed(2)}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    marginTop: 16,
  },
  emptyState: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    opacity: 0.6,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pieChart: {
    width: 200,
    height: 40,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
  },
  pieSegmentPlaceholder: {
    height: 40,
  },
  legend: {
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
  },
  legendValue: {
    marginRight: 8,
  },
  legendPercentage: {
    width: 50,
    textAlign: 'right',
    opacity: 0.7,
  },
  totalText: {
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  barChart: {
    marginTop: 16,
  },
  barContainer: {
    marginBottom: 12,
  },
  barLabel: {
    marginBottom: 4,
  },
  barLabelText: {
    fontSize: 14,
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    marginLeft: 8,
    fontSize: 12,
  },
});