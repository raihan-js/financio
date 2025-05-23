import { useAppContext } from '@/context/AppContext';
import {
    BudgetCategory,
    getCurrentMonthBudget,
    MonthlyBudget,
    saveMonthlyBudget
} from '@/utils/budgetStorage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Predefined categories with colors
const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#FF6B6B' },
  { name: 'Transport', color: '#4ECDC4' },
  { name: 'Shopping', color: '#45B7D1' },
  { name: 'Bills', color: '#96CEB4' },
  { name: 'Entertainment', color: '#FCEA2B' },
  { name: 'Health', color: '#FF9FF3' },
  { name: 'Education', color: '#54A0FF' },
  { name: 'Other', color: '#8395A7' },
];

export default function CreateBudgetScreen() {
  const { userProfile, transactions } = useAppContext();
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [totalIncome, setTotalIncome] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingBudget, setExistingBudget] = useState<MonthlyBudget | null>(null);

  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const monthName = new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' });

  useEffect(() => {
    loadExistingBudget();
  }, []);

  const loadExistingBudget = async () => {
    try {
      const budget = await getCurrentMonthBudget();
      if (budget) {
        setExistingBudget(budget);
        setIsEditMode(true);
        setTotalIncome(budget.totalIncome.toString());
        setBudgetCategories(budget.categories);
      } else {
        // Initialize with default categories
        const initialCategories: BudgetCategory[] = DEFAULT_CATEGORIES.map((cat, index) => ({
          id: (index + 1).toString(),
          name: cat.name,
          allocatedAmount: 0,
          spentAmount: 0,
          color: cat.color,
        }));
        setBudgetCategories(initialCategories);
        
        // Set income from user profile if available
        if (userProfile?.monthlyIncome) {
          setTotalIncome(userProfile.monthlyIncome.toString());
        }
      }
    } catch (error) {
      console.error('Error loading existing budget:', error);
    }
  };

  const updateCategoryAmount = (categoryId: string, amount: string) => {
    setBudgetCategories(categories =>
      categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, allocatedAmount: parseFloat(amount) || 0 }
          : cat
      )
    );
  };

  const addCustomCategory = () => {
    Alert.prompt(
      'Add Category',
      'Enter category name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (categoryName) => {
            if (categoryName && categoryName.trim()) {
              const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FCEA2B', '#FF9FF3'];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              
              const newCategory: BudgetCategory = {
                id: Date.now().toString(),
                name: categoryName.trim(),
                allocatedAmount: 0,
                spentAmount: 0,
                color: randomColor,
              };
              
              setBudgetCategories(categories => [...categories, newCategory]);
            }
          }
        }
      ]
    );
  };

  const removeCategory = (categoryId: string) => {
    setBudgetCategories(categories => categories.filter(cat => cat.id !== categoryId));
  };

  const saveBudget = async () => {
    // Validation
    if (!totalIncome || parseFloat(totalIncome) <= 0) {
      Alert.alert('Invalid Income', 'Please enter a valid monthly income.');
      return;
    }

    const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
    const income = parseFloat(totalIncome);

    if (totalAllocated > income) {
      Alert.alert(
        'Budget Exceeds Income',
        `You've allocated ৳${totalAllocated.toLocaleString()} but your income is only ৳${income.toLocaleString()}. Please adjust your budget.`
      );
      return;
    }

    // Filter out categories with 0 allocation
    const validCategories = budgetCategories.filter(cat => cat.allocatedAmount > 0);
    
    if (validCategories.length === 0) {
      Alert.alert('No Budget Set', 'Please allocate amounts to at least one category.');
      return;
    }

    try {
      const budgetData: MonthlyBudget = {
        id: existingBudget?.id || Date.now().toString(),
        month: currentMonth,
        totalIncome: income,
        totalAllocated,
        categories: validCategories,
        isZeroBasedBudget: false,
        createdAt: existingBudget?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveMonthlyBudget(budgetData);
      
      Alert.alert(
        'Budget Saved',
        `Your ${monthName} budget has been ${isEditMode ? 'updated' : 'created'} successfully!`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    }
  };

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const income = parseFloat(totalIncome) || 0;
  const remaining = income - totalAllocated;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Budget' : 'Create Budget'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Month Info */}
          <View style={styles.monthCard}>
            <Text style={styles.monthTitle}>Budget for {monthName}</Text>
            <Text style={styles.monthSubtitle}>
              {isEditMode ? 'Update your spending limits' : 'Set your spending limits for each category'}
            </Text>
          </View>

          {/* Income Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Income</Text>
            <View style={styles.incomeInputContainer}>
              <Text style={styles.currencySymbol}>৳</Text>
              <TextInput
                style={styles.incomeInput}
                placeholder="Enter your monthly income"
                keyboardType="numeric"
                value={totalIncome}
                onChangeText={setTotalIncome}
              />
            </View>
          </View>

          {/* Budget Summary */}
          {income > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Income</Text>
                <Text style={styles.summaryValue}>৳{income.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Allocated</Text>
                <Text style={[styles.summaryValue, { color: totalAllocated > income ? '#FF3B30' : '#333' }]}>
                  ৳{totalAllocated.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text style={[
                  styles.summaryValue, 
                  styles.summaryRemaining,
                  { color: remaining >= 0 ? '#34C759' : '#FF3B30' }
                ]}>
                  ৳{remaining.toLocaleString()}
                </Text>
              </View>
              
              {remaining < 0 && (
                <View style={styles.warningContainer}>
                  <Ionicons name="warning-outline" size={16} color="#FF3B30" />
                  <Text style={styles.warningText}>
                    Budget exceeds income by ৳{Math.abs(remaining).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Budget Categories</Text>
              <TouchableOpacity onPress={addCustomCategory} style={styles.addButton}>
                <Ionicons name="add" size={20} color="#5F67E8" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categoriesContainer}>
              {budgetCategories.map((category) => (
                <View key={category.id} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                        <View style={[styles.categoryIconDot, { backgroundColor: category.color }]} />
                      </View>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    
                    {budgetCategories.length > 1 && (
                      <TouchableOpacity 
                        onPress={() => removeCategory(category.id)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="close" size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.categoryInputContainer}>
                    <Text style={styles.currencySymbol}>৳</Text>
                    <TextInput
                      style={styles.categoryInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={category.allocatedAmount > 0 ? category.allocatedAmount.toString() : ''}
                      onChangeText={(value) => updateCategoryAmount(category.id, value)}
                    />
                  </View>

                  {income > 0 && category.allocatedAmount > 0 && (
                    <Text style={styles.categoryPercentage}>
                      {Math.round((category.allocatedAmount / income) * 100)}% of income
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Quick Allocation Buttons */}
          {income > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Allocation</Text>
              <View style={styles.quickButtonsContainer}>
                <TouchableOpacity 
                  style={styles.quickButton}
                  onPress={() => {
                    const equalAmount = Math.floor(income / budgetCategories.length);
                    setBudgetCategories(categories =>
                      categories.map(cat => ({ ...cat, allocatedAmount: equalAmount }))
                    );
                  }}
                >
                  <Text style={styles.quickButtonText}>Equal Split</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickButton}
                  onPress={() => {
                    // 50/30/20 rule: 50% needs, 30% wants, 20% savings
                    const needs = Math.floor(income * 0.5);
                    const wants = Math.floor(income * 0.3);
                    const savings = Math.floor(income * 0.2);
                    
                    setBudgetCategories(categories => {
                      const updated = [...categories];
                      if (updated[0]) updated[0].allocatedAmount = needs; // Food (needs)
                      if (updated[1]) updated[1].allocatedAmount = Math.floor(needs * 0.3); // Transport
                      if (updated[2]) updated[2].allocatedAmount = wants; // Shopping (wants)
                      if (updated[3]) updated[3].allocatedAmount = Math.floor(needs * 0.3); // Bills
                      if (updated[4]) updated[4].allocatedAmount = Math.floor(wants * 0.5); // Entertainment
                      return updated;
                    });
                  }}
                >
                  <Text style={styles.quickButtonText}>50/30/20 Rule</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity 
            style={[
              styles.saveButton,
              { opacity: income > 0 && totalAllocated > 0 ? 1 : 0.5 }
            ]}
            onPress={saveBudget}
            disabled={income <= 0 || totalAllocated <= 0}
          >
            <Text style={styles.saveButtonText}>
              {isEditMode ? 'Update Budget' : 'Create Budget'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  monthCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  monthSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F1FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 14,
    color: '#5F67E8',
    fontWeight: '500',
    marginLeft: 4,
  },
  incomeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#333',
    marginRight: 8,
    fontWeight: '600',
  },
  incomeInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 16,
    color: '#333',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  summaryRemaining: {
    fontWeight: 'bold',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#FF3B30',
    marginLeft: 6,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  categoryInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  quickButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickButtonText: {
    fontSize: 14,
    color: '#5F67E8',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#5F67E8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});