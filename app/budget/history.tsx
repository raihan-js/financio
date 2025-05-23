import {
    deleteMonthlyBudget,
    getMonthlyBudgets,
    MonthlyBudget
} from '@/utils/budgetStorage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BudgetHistoryScreen() {
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      const allBudgets = await getMonthlyBudgets();
      // Sort by month descending (newest first)
      const sortedBudgets = allBudgets.sort((a, b) => b.month.localeCompare(a.month));
      setBudgets(sortedBudgets);
    } catch (error) {
      console.error('Error loading budgets:', error);
      Alert.alert('Error', 'Failed to load budget history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  }, [loadBudgets]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleDeleteBudget = (budget: MonthlyBudget) => {
    const monthName = new Date(budget.month + '-01').toLocaleDateString('en', { 
      month: 'long', 
      year: 'numeric' 
    });

    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete the budget for ${monthName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMonthlyBudget(budget.id);
              await loadBudgets();
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

  const formatMonth = (month: string) => {
    return new Date(month + '-01').toLocaleDateString('en', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getCurrentMonth = () => {
    return new Date().toISOString().substring(0, 7);
  };

  const renderBudgetItem = ({ item }: { item: MonthlyBudget }) => {
    const isCurrentMonth = item.month === getCurrentMonth();
    const totalSpent = item.categories.reduce((sum, cat) => sum + cat.spentAmount, 0);
    const utilizationPercentage = item.totalAllocated > 0 
      ? Math.round((totalSpent / item.totalAllocated) * 100) 
      : 0;

    return (
      <View style={[styles.budgetCard, isCurrentMonth && styles.currentMonthCard]}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetInfo}>
            <Text style={[styles.budgetMonth, isCurrentMonth && styles.currentMonthText]}>
              {formatMonth(item.month)}
            </Text>
            {isCurrentMonth && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
            <View style={styles.budgetTypeBadge}>
              <Text style={styles.budgetTypeText}>
                {item.isZeroBasedBudget ? 'Zero-Based' : 'Standard'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => handleDeleteBudget(item)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.budgetStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Budgeted</Text>
            <Text style={styles.statValue}>৳{item.totalAllocated.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={[styles.statValue, { color: totalSpent > item.totalAllocated ? '#FF3B30' : '#333' }]}>
              ৳{totalSpent.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Utilization</Text>
            <Text style={[
              styles.statValue, 
              { color: utilizationPercentage > 100 ? '#FF3B30' : utilizationPercentage > 80 ? '#FF9500' : '#34C759' }
            ]}>
              {utilizationPercentage}%
            </Text>
          </View>
        </View>

        <View style={styles.budgetProgress}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(utilizationPercentage, 100)}%`,
                  backgroundColor: utilizationPercentage > 100 ? '#FF3B30' : '#5F67E8'
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.budgetFooter}>
          <Text style={styles.categoriesCount}>
            {item.categories.length} categories
          </Text>
          <Text style={styles.budgetDate}>
            Created {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary */}
      {budgets.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Budgets</Text>
            <Text style={styles.summaryValue}>{budgets.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active Months</Text>
            <Text style={styles.summaryValue}>
              {budgets.filter(b => b.month >= getCurrentMonth()).length}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Zero-Based</Text>
            <Text style={styles.summaryValue}>
              {budgets.filter(b => b.isZeroBasedBudget).length}
            </Text>
          </View>
        </View>
      )}

      {/* Budgets List */}
      <FlatList
        data={budgets}
        renderItem={renderBudgetItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5F67E8']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Budget History</Text>
            <Text style={styles.emptySubtitle}>
              Create your first budget to start tracking your financial progress
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/budget/create-budget')} 
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        }
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 40,
  },
  budgetCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  currentMonthCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#5F67E8',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  currentMonthText: {
    color: '#5F67E8',
  },
  currentBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    color: '#5F67E8',
    fontWeight: '500',
  },
  budgetTypeBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  budgetTypeText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  budgetProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesCount: {
    fontSize: 12,
    color: '#666',
  },
  budgetDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: '#5F67E8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});