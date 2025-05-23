import { useAppContext } from '@/context/AppContext';
import { BudgetCategory, deleteMonthlyBudget, getCurrentMonthBudget, MonthlyBudget } from '@/utils/budgetStorage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BudgetScreen() {
  const { transactions } = useAppContext();
  const [currentBudget, setCurrentBudget] = useState<MonthlyBudget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const monthName = new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' });

  // Calculate actual spending for current month
  const calculateActualSpending = useCallback(() => {
    const currentMonthTransactions = transactions.filter(t => 
      t.date.startsWith(currentMonth) && t.type === 'expense'
    );

    const spendingByCategory: Record<string, number> = {};
    currentMonthTransactions.forEach(t => {
      if (spendingByCategory[t.category]) {
        spendingByCategory[t.category] += t.amount;
      } else {
        spendingByCategory[t.category] = t.amount;
      }
    });

    return spendingByCategory;
  }, [transactions, currentMonth]);

  const loadBudgetData = useCallback(async () => {
    try {
      setIsLoading(true);
      const budget = await getCurrentMonthBudget();
      
      if (budget) {
        // Update spent amounts with actual transaction data
        const actualSpending = calculateActualSpending();
        const updatedCategories = budget.categories.map(category => ({
          ...category,
          spentAmount: actualSpending[category.name] || 0
        }));
        
        setCurrentBudget({
          ...budget,
          categories: updatedCategories
        });
      } else {
        setCurrentBudget(null);
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
      Alert.alert('Error', 'Failed to load budget data');
    } finally {
      setIsLoading(false);
    }
  }, [calculateActualSpending]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBudgetData();
    setRefreshing(false);
  }, [loadBudgetData]);

  useEffect(() => {
    loadBudgetData();
  }, [loadBudgetData]);

  const handleCreateBudget = () => {
    router.push('/budget/create-budget');
  };

  const handleZeroBasedBudget = () => {
    router.push('/budget/zero-based');
  };

  const handleRecurringExpenses = () => {
    router.push('/budget/recurring-expenses');
  };

  const handleBudgetHistory = () => {
    router.push('/budget/history');
  };

  const handleDeleteBudget = () => {
    if (!currentBudget) return;
    
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete your ${monthName} budget? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMonthlyBudget(currentBudget.id);
              setCurrentBudget(null);
              Alert.alert('Success', 'Budget deleted successfully');
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getBudgetProgress = (category: BudgetCategory) => {
    if (category.allocatedAmount === 0) return 0;
    return Math.min((category.spentAmount / category.allocatedAmount) * 100, 100);
  };

  const getBudgetColor = (category: BudgetCategory) => {
    const progress = getBudgetProgress(category);
    if (progress >= 100) return '#FF3B30';
    if (progress >= 80) return '#FF9500';
    return '#34C759';
  };

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  const totalBudgeted = currentBudget?.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0) || 0;
  const totalSpent = currentBudget?.categories.reduce((sum, cat) => sum + cat.spentAmount, 0) || 0;
  const totalRemaining = totalBudgeted - totalSpent;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading budget...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Budget</Text>
          <Text style={styles.headerSubtitle}>{monthName}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleBudgetHistory}>
            <Ionicons name="time-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleRecurringExpenses}>
            <Ionicons name="repeat-outline" size={24} color="#333" />
          </TouchableOpacity>
          {currentBudget && (
            <TouchableOpacity style={styles.iconButton} onPress={handleDeleteBudget}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/budget/create-budget')}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5F67E8']}
          />
        }
      >
        {currentBudget ? (
          <>
            {/* Budget Overview */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <Text style={styles.overviewTitle}>Monthly Overview</Text>
                <View style={styles.budgetTypeTag}>
                  <Text style={styles.budgetTypeText}>
                    {currentBudget.isZeroBasedBudget ? 'Zero-Based' : 'Standard'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.overviewStats}>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewStatLabel}>Budgeted</Text>
                  <Text style={styles.overviewStatValue}>{formatCurrency(totalBudgeted)}</Text>
                </View>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewStatLabel}>Spent</Text>
                  <Text style={[styles.overviewStatValue, { color: '#FF3B30' }]}>
                    {formatCurrency(totalSpent)}
                  </Text>
                </View>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewStatLabel}>Remaining</Text>
                  <Text style={[
                    styles.overviewStatValue, 
                    { color: totalRemaining >= 0 ? '#34C759' : '#FF3B30' }
                  ]}>
                    {formatCurrency(totalRemaining)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.overviewProgressContainer}>
                <View style={styles.overviewProgressBar}>
                  <View 
                    style={[
                      styles.overviewProgressFill, 
                      { 
                        width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%`,
                        backgroundColor: totalSpent > totalBudgeted ? '#FF3B30' : '#5F67E8'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.overviewProgressText}>
                  {totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0}% used
                </Text>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Budget Categories</Text>
              <View style={styles.sectionActions}>
                <TouchableOpacity onPress={() => router.push('/budget/create-budget')}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteBudget} style={styles.deleteAction}>
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.categoriesContainer}>
              {currentBudget.categories.map((category) => {
                const progress = getBudgetProgress(category);
                const progressColor = getBudgetColor(category);
                const remaining = category.allocatedAmount - category.spentAmount;

                return (
                  <View key={category.id} style={styles.categoryCard}>
                    <View style={styles.categoryHeader}>
                      <View style={styles.categoryInfo}>
                        <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                          <View style={[styles.categoryIconDot, { backgroundColor: category.color }]} />
                        </View>
                        <Text style={styles.categoryName}>{category.name}</Text>
                      </View>
                      <View style={styles.categoryAmounts}>
                        <Text style={styles.categorySpent}>
                          {formatCurrency(category.spentAmount)}
                        </Text>
                        <Text style={styles.categoryBudgeted}>
                          of {formatCurrency(category.allocatedAmount)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.categoryProgressContainer}>
                      <View style={styles.categoryProgressBar}>
                        <View 
                          style={[
                            styles.categoryProgressFill, 
                            { 
                              width: `${progress}%`,
                              backgroundColor: progressColor
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.categoryProgressText, { color: progressColor }]}>
                        {Math.round(progress)}%
                      </Text>
                    </View>

                    <View style={styles.categoryFooter}>
                      <Text style={[
                        styles.categoryRemaining,
                        { color: remaining >= 0 ? '#666' : '#FF3B30' }
                      ]}>
                        {remaining >= 0 ? 'Remaining: ' : 'Over budget: '}
                        {formatCurrency(Math.abs(remaining))}
                      </Text>
                      {progress >= 80 && (
                        <View style={styles.warningBadge}>
                          <Ionicons name="warning-outline" size={12} color="#FF9500" />
                          <Text style={styles.warningText}>
                            {progress >= 100 ? 'Exceeded' : 'Warning'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>

            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={styles.quickActionCard} onPress={handleCreateBudget}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#F0F1FE' }]}>
                  <Ionicons name="create-outline" size={24} color="#5F67E8" />
                </View>
                <Text style={styles.quickActionTitle}>Edit Budget</Text>
                <Text style={styles.quickActionSubtitle}>Modify category limits</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard} onPress={handleBudgetHistory}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#FFF0E8' }]}>
                  <Ionicons name="time-outline" size={24} color="#FF9500" />
                </View>
                <Text style={styles.quickActionTitle}>Budget History</Text>
                <Text style={styles.quickActionSubtitle}>View past budgets</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={styles.quickActionCard} onPress={handleZeroBasedBudget}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E8' }]}>
                  <Ionicons name="calculator-outline" size={24} color="#34C759" />
                </View>
                <Text style={styles.quickActionTitle}>Zero-Based</Text>
                <Text style={styles.quickActionSubtitle}>Allocate every dollar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard} onPress={handleRecurringExpenses}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#F0F1FE' }]}>
                  <Ionicons name="repeat-outline" size={24} color="#5F67E8" />
                </View>
                <Text style={styles.quickActionTitle}>Recurring</Text>
                <Text style={styles.quickActionSubtitle}>Manage subscriptions</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* No Budget Created */
          <View style={styles.noBudgetContainer}>
            <View style={styles.noBudgetIcon}>
              <Ionicons name="calculator-outline" size={64} color="#ccc" />
            </View>
            <Text style={styles.noBudgetTitle}>No Budget Set</Text>
            <Text style={styles.noBudgetSubtitle}>
              Create your first budget to track spending and reach your financial goals
            </Text>

            <View style={styles.budgetOptionsContainer}>
              <TouchableOpacity style={styles.primaryBudgetOption} onPress={handleCreateBudget}>
                <View style={styles.budgetOptionIcon}>
                  <Ionicons name="pie-chart-outline" size={24} color="white" />
                </View>
                <Text style={styles.primaryBudgetOptionTitle}>Monthly Budget</Text>
                <Text style={styles.primaryBudgetOptionSubtitle}>Set spending limits by category</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBudgetOption} onPress={handleZeroBasedBudget}>
                <View style={[styles.budgetOptionIcon, { backgroundColor: '#F0F1FE' }]}>
                  <Ionicons name="calculator-outline" size={24} color="#5F67E8" />
                </View>
                <Text style={styles.secondaryBudgetOptionTitle}>Zero-Based Budget</Text>
                <Text style={styles.secondaryBudgetOptionSubtitle}>Allocate every dollar of income</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBudgetOption} onPress={handleRecurringExpenses}>
                <View style={[styles.budgetOptionIcon, { backgroundColor: '#FFF0E8' }]}>
                  <Ionicons name="repeat-outline" size={24} color="#FF9500" />
                </View>
                <Text style={styles.secondaryBudgetOptionTitle}>Recurring Expenses</Text>
                <Text style={styles.secondaryBudgetOptionSubtitle}>Track subscriptions & fixed costs</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100, // Increased bottom padding for tab bar
  },
  overviewCard: {
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
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  budgetTypeTag: {
    backgroundColor: '#F0F1FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  budgetTypeText: {
    fontSize: 12,
    color: '#5F67E8',
    fontWeight: '500',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  overviewStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  overviewProgressContainer: {
    marginTop: 8,
  },
  overviewProgressBar: {
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    marginBottom: 8,
  },
  overviewProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  overviewProgressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    fontSize: 14,
    color: '#5F67E8',
    fontWeight: '500',
  },
  deleteAction: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  categoryAmounts: {
    alignItems: 'flex-end',
  },
  categorySpent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryBudgeted: {
    fontSize: 12,
    color: '#666',
  },
  categoryProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    marginRight: 8,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryProgressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 30,
    textAlign: 'right',
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryRemaining: {
    fontSize: 12,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 10,
    color: '#FF9500',
    marginLeft: 2,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  noBudgetContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  noBudgetIcon: {
    marginBottom: 24,
  },
  noBudgetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noBudgetSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  budgetOptionsContainer: {
    width: '100%',
  },
  primaryBudgetOption: {
    backgroundColor: '#5F67E8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryBudgetOption: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  budgetOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBudgetOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  primaryBudgetOptionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  secondaryBudgetOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  secondaryBudgetOptionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});