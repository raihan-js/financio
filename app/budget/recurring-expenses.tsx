import {
    calculateNextDueDate,
    deleteRecurringExpense,
    getRecurringExpenses,
    RecurringExpense,
    saveRecurringExpense,
    toggleRecurringExpense
} from '@/utils/budgetStorage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
  { value: 'monthly', label: 'Monthly', icon: 'calendar-outline' },
  { value: 'quarterly', label: 'Quarterly', icon: 'calendar-outline' },
  { value: 'yearly', label: 'Yearly', icon: 'calendar-outline' },
] as const;

const CATEGORY_OPTIONS = [
  { value: 'Bills', icon: 'receipt-outline', color: '#FF6B6B' },
  { value: 'Subscriptions', icon: 'refresh-outline', color: '#4ECDC4' },
  { value: 'Insurance', icon: 'shield-outline', color: '#45B7D1' },
  { value: 'Rent/Mortgage', icon: 'home-outline', color: '#96CEB4' },
  { value: 'Utilities', icon: 'flash-outline', color: '#FCEA2B' },
  { value: 'Loan Payment', icon: 'card-outline', color: '#FF9FF3' },
  { value: 'Other', icon: 'ellipsis-horizontal-outline', color: '#8395A7' },
];

export default function RecurringExpensesScreen() {
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);

  // Form state for add/edit modal
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Bills');
  const [formFrequency, setFormFrequency] = useState<RecurringExpense['frequency']>('monthly');

  const loadExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedExpenses = await getRecurringExpenses();
      setExpenses(loadedExpenses);
    } catch (error) {
      console.error('Error loading recurring expenses:', error);
      Alert.alert('Error', 'Failed to load recurring expenses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  }, [loadExpenses]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const resetForm = () => {
    setFormName('');
    setFormAmount('');
    setFormCategory('Bills');
    setFormFrequency('monthly');
    setEditingExpense(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (expense: RecurringExpense) => {
    setFormName(expense.name);
    setFormAmount(expense.amount.toString());
    setFormCategory(expense.category);
    setFormFrequency(expense.frequency);
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const saveExpense = async () => {
    // Validation
    if (!formName.trim()) {
      Alert.alert('Missing Name', 'Please enter an expense name');
      return;
    }

    if (!formAmount || parseFloat(formAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    try {
      const expenseData: RecurringExpense = {
        id: editingExpense?.id || Date.now().toString(),
        name: formName.trim(),
        amount: parseFloat(formAmount),
        category: formCategory,
        frequency: formFrequency,
        nextDueDate: editingExpense?.nextDueDate || calculateNextDueDate(new Date(), formFrequency),
        isActive: editingExpense?.isActive ?? true,
        createdAt: editingExpense?.createdAt || new Date().toISOString(),
      };

      await saveRecurringExpense(expenseData);
      await loadExpenses();
      closeModal();
      
      Alert.alert(
        'Success',
        `Recurring expense ${editingExpense ? 'updated' : 'added'} successfully!`
      );
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    }
  };

  const handleToggleExpense = async (expenseId: string) => {
    try {
      await toggleRecurringExpense(expenseId);
      await loadExpenses();
    } catch (error) {
      console.error('Error toggling expense:', error);
      Alert.alert('Error', 'Failed to update expense status');
    }
  };

  const handleDeleteExpense = (expense: RecurringExpense) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecurringExpense(expense.id);
              await loadExpenses();
              Alert.alert('Success', 'Recurring expense deleted successfully');
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
            }
          }
        }
      ]
    );
  };

  const getFrequencyLabel = (frequency: RecurringExpense['frequency']) => {
    return FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || frequency;
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORY_OPTIONS.find(c => c.value === category)?.icon || 'ellipsis-horizontal-outline';
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_OPTIONS.find(c => c.value === category)?.color || '#8395A7';
  };

  const calculateMonthlyTotal = () => {
    return expenses
      .filter(e => e.isActive)
      .reduce((total, expense) => {
        switch (expense.frequency) {
          case 'weekly':
            return total + (expense.amount * 4.33); // Average weeks per month
          case 'monthly':
            return total + expense.amount;
          case 'quarterly':
            return total + (expense.amount / 3);
          case 'yearly':
            return total + (expense.amount / 12);
          default:
            return total;
        }
      }, 0);
  };

  const getDaysUntilDue = (nextDueDate: string) => {
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderExpenseItem = ({ item }: { item: RecurringExpense }) => {
    const daysUntilDue = getDaysUntilDue(item.nextDueDate);
    const isOverdue = daysUntilDue < 0;
    const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

    return (
      <View style={[styles.expenseCard, !item.isActive && styles.inactiveCard]}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
              <Ionicons 
                name={getCategoryIcon(item.category) as any} 
                size={20} 
                color={getCategoryColor(item.category)} 
              />
            </View>
            <View style={styles.expenseDetails}>
              <Text style={[styles.expenseName, !item.isActive && styles.inactiveText]}>
                {item.name}
              </Text>
              <Text style={styles.expenseCategory}>{item.category}</Text>
            </View>
          </View>
          
          <View style={styles.expenseActions}>
            <Switch
              value={item.isActive}
              onValueChange={() => handleToggleExpense(item.id)}
              trackColor={{ false: '#CCCCCC', true: '#5F67E8' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        <View style={styles.expenseMiddle}>
          <View style={styles.amountContainer}>
            <Text style={[styles.expenseAmount, !item.isActive && styles.inactiveText]}>
              ৳{item.amount.toLocaleString()}
            </Text>
            <Text style={styles.expenseFrequency}>{getFrequencyLabel(item.frequency)}</Text>
          </View>

          {item.isActive && (
            <View style={styles.dueDateContainer}>
              <View style={[
                styles.dueBadge,
                {
                  backgroundColor: isOverdue 
                    ? '#FFEBEE' 
                    : isDueSoon 
                      ? '#FFF3E0' 
                      : '#E8F5E8'
                }
              ]}>
                <Ionicons 
                  name={isOverdue ? "warning-outline" : "time-outline"} 
                  size={12} 
                  color={isOverdue ? '#FF3B30' : isDueSoon ? '#FF9500' : '#34C759'} 
                />
                <Text style={[
                  styles.dueText,
                  {
                    color: isOverdue 
                      ? '#FF3B30' 
                      : isDueSoon 
                        ? '#FF9500' 
                        : '#34C759'
                  }
                ]}>
                  {isOverdue 
                    ? `${Math.abs(daysUntilDue)} days overdue`
                    : daysUntilDue === 0
                      ? 'Due today'
                      : `${daysUntilDue} days left`
                  }
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.expenseFooter}>
          <Text style={styles.nextDueLabel}>
            Next due: {new Date(item.nextDueDate).toLocaleDateString()}
          </Text>
          
          <View style={styles.expenseButtons}>
            <TouchableOpacity 
              onPress={() => openEditModal(item)}
              style={styles.editButton}
            >
              <Ionicons name="pencil-outline" size={16} color="#5F67E8" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeleteExpense(item)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const monthlyTotal = calculateMonthlyTotal();
  const activeExpenses = expenses.filter(e => e.isActive);
  const upcomingExpenses = activeExpenses.filter(e => getDaysUntilDue(e.nextDueDate) <= 7);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recurring Expenses</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#5F67E8" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      {expenses.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Monthly Total</Text>
            <Text style={styles.summaryAmount}>৳{monthlyTotal.toLocaleString()}</Text>
            <Text style={styles.summarySubtext}>{activeExpenses.length} active expenses</Text>
          </View>
          
          {upcomingExpenses.length > 0 && (
            <View style={[styles.summaryCard, styles.urgentCard]}>
              <View style={styles.urgentHeader}>
                <Ionicons name="warning-outline" size={16} color="#FF3B30" />
                <Text style={styles.urgentLabel}>Due Soon</Text>
              </View>
              <Text style={styles.urgentCount}>{upcomingExpenses.length}</Text>
              <Text style={styles.urgentSubtext}>expenses due this week</Text>
            </View>
          )}
        </View>
      )}

      {/* Expenses List */}
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
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
            <Ionicons name="repeat-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Recurring Expenses</Text>
            <Text style={styles.emptySubtitle}>
              Track your subscriptions, bills, and fixed monthly costs
            </Text>
            <TouchableOpacity onPress={openAddModal} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Add First Expense</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </Text>
            <TouchableOpacity onPress={saveExpense} style={styles.modalSaveButton}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expense Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Netflix Subscription"
                value={formName}
                onChangeText={setFormName}
                autoFocus
              />
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={formAmount}
                  onChangeText={setFormAmount}
                />
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORY_OPTIONS.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryOption,
                      formCategory === category.value && styles.selectedCategory
                    ]}
                    onPress={() => setFormCategory(category.value)}
                  >
                    <View style={[
                      styles.categoryOptionIcon,
                      { backgroundColor: category.color + '20' },
                      formCategory === category.value && { backgroundColor: category.color }
                    ]}>
                      <Ionicons 
                        name={category.icon as any} 
                        size={20} 
                        color={formCategory === category.value ? 'white' : category.color} 
                      />
                    </View>
                    <Text style={[
                      styles.categoryOptionText,
                      formCategory === category.value && styles.selectedCategoryText
                    ]}>
                      {category.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Frequency Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Frequency</Text>
              <View style={styles.frequencyContainer}>
                {FREQUENCY_OPTIONS.map((frequency) => (
                  <TouchableOpacity
                    key={frequency.value}
                    style={[
                      styles.frequencyOption,
                      formFrequency === frequency.value && styles.selectedFrequency
                    ]}
                    onPress={() => setFormFrequency(frequency.value)}
                  >
                    <Text style={[
                      styles.frequencyOptionText,
                      formFrequency === frequency.value && styles.selectedFrequencyText
                    ]}>
                      {frequency.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    padding: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#666',
  },
  urgentCard: {
    backgroundColor: '#FFEBEE',
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  urgentLabel: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 4,
    fontWeight: '500',
  },
  urgentCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 4,
  },
  urgentSubtext: {
    fontSize: 12,
    color: '#FF3B30',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  expenseCard: {
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
  inactiveCard: {
    opacity: 0.6,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 12,
    color: '#666',
  },
  inactiveText: {
    color: '#999',
  },
  expenseActions: {
    marginLeft: 12,
  },
  expenseMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountContainer: {
    alignItems: 'flex-start',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  expenseFrequency: {
    fontSize: 12,
    color: '#666',
  },
  dueDateContainer: {
    alignItems: 'flex-end',
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextDueLabel: {
    fontSize: 12,
    color: '#666',
  },
  expenseButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F1FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalSaveButton: {
    padding: 4,
  },
  modalSaveText: {
    fontSize: 16,
    color: '#5F67E8',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectedCategory: {
    borderColor: '#5F67E8',
    backgroundColor: '#F0F1FE',
  },
  categoryOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#5F67E8',
    fontWeight: '500',
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectedFrequency: {
    backgroundColor: '#5F67E8',
    borderColor: '#5F67E8',
  },
  frequencyOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedFrequencyText: {
    color: 'white',
    fontWeight: '500',
  },
});