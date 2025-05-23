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

// Zero-based budget categories with recommended allocation percentages
const ZERO_BASED_CATEGORIES = [
  // Essential/Needs (50-60%)
  { name: 'Housing', color: '#FF6B6B', category: 'needs', recommended: 25 },
  { name: 'Food', color: '#4ECDC4', category: 'needs', recommended: 10 },
  { name: 'Transportation', color: '#45B7D1', category: 'needs', recommended: 10 },
  { name: 'Utilities', color: '#96CEB4', category: 'needs', recommended: 5 },
  { name: 'Insurance', color: '#F7DC6F', category: 'needs', recommended: 5 },
  
  // Wants (20-30%)
  { name: 'Entertainment', color: '#BB8FCE', category: 'wants', recommended: 10 },
  { name: 'Shopping', color: '#85C1E9', category: 'wants', recommended: 10 },
  { name: 'Dining Out', color: '#F8C471', category: 'wants', recommended: 5 },
  
  // Savings & Debt (20-30%)
  { name: 'Emergency Fund', color: '#82E0AA', category: 'savings', recommended: 10 },
  { name: 'Retirement', color: '#AED6F1', category: 'savings', recommended: 10 },
  { name: 'Debt Payment', color: '#F1948A', category: 'debt', recommended: 5 },
  { name: 'Investments', color: '#D7BDE2', category: 'savings', recommended: 5 },
];

const CATEGORY_GROUPS = {
  needs: { title: 'Needs (50-60%)', color: '#FF6B6B', target: 55 },
  wants: { title: 'Wants (20-30%)', color: '#4ECDC4', target: 25 },
  savings: { title: 'Savings & Investments (15-20%)', color: '#45B7D1', target: 15 },
  debt: { title: 'Debt Repayment (5-10%)', color: '#F39C12', target: 5 },
};

export default function ZeroBasedBudgetScreen() {
  const { userProfile } = useAppContext();
  const [totalIncome, setTotalIncome] = useState('');
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
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
      if (budget && budget.isZeroBasedBudget) {
        setExistingBudget(budget);
        setIsEditMode(true);
        setTotalIncome(budget.totalIncome.toString());
        setBudgetCategories(budget.categories);
      } else {
        // Initialize with zero-based categories
        const initialCategories: BudgetCategory[] = ZERO_BASED_CATEGORIES.map((cat, index) => ({
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
          // Auto-allocate based on recommended percentages
          const income = userProfile.monthlyIncome;
          const autoAllocated = initialCategories.map(cat => {
            const recommended = ZERO_BASED_CATEGORIES.find(zbc => zbc.name === cat.name)?.recommended || 0;
            return {
              ...cat,
              allocatedAmount: Math.round((income * recommended) / 100)
            };
          });
          setBudgetCategories(autoAllocated);
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

  const autoAllocateRecommended = () => {
    const income = parseFloat(totalIncome) || 0;
    if (income <= 0) {
      Alert.alert('Set Income First', 'Please enter your monthly income before auto-allocating.');
      return;
    }

    const autoAllocated = budgetCategories.map(cat => {
      const recommended = ZERO_BASED_CATEGORIES.find(zbc => zbc.name === cat.name)?.recommended || 0;
      return {
        ...cat,
        allocatedAmount: Math.round((income * recommended) / 100)
      };
    });
    
    setBudgetCategories(autoAllocated);
  };

  const getCategoryGroupStats = () => {
    const income = parseFloat(totalIncome) || 0;
    const stats: Record<string, { allocated: number; percentage: number; target: number }> = {};
    
    Object.keys(CATEGORY_GROUPS).forEach(groupKey => {
      const groupCategories = ZERO_BASED_CATEGORIES.filter(cat => cat.category === groupKey);
      const allocated = budgetCategories
        .filter(budgetCat => groupCategories.some(gc => gc.name === budgetCat.name))
        .reduce((sum, cat) => sum + cat.allocatedAmount, 0);
      
      stats[groupKey] = {
        allocated,
        percentage: income > 0 ? (allocated / income) * 100 : 0,
        target: CATEGORY_GROUPS[groupKey as keyof typeof CATEGORY_GROUPS].target
      };
    });
    
    return stats;
  };

  const saveBudget = async () => {
    // Validation
    if (!totalIncome || parseFloat(totalIncome) <= 0) {
      Alert.alert('Invalid Income', 'Please enter a valid monthly income.');
      return;
    }

    const income = parseFloat(totalIncome);
    const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);

    // Zero-based budgeting requires every dollar to be allocated
    if (Math.abs(totalAllocated - income) > 1) { // Allow for rounding differences
      Alert.alert(
        'Incomplete Zero-Based Budget',
        `In zero-based budgeting, every dollar must be allocated.\n\nIncome: ৳${income.toLocaleString()}\nAllocated: ৳${totalAllocated.toLocaleString()}\nDifference: ৳${Math.abs(income - totalAllocated).toLocaleString()}\n\nPlease adjust your allocations.`
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
        isZeroBasedBudget: true,
        createdAt: existingBudget?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveMonthlyBudget(budgetData);
      
      Alert.alert(
        'Zero-Based Budget Saved',
        `Your ${monthName} zero-based budget has been ${isEditMode ? 'updated' : 'created'} successfully!`,
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
  const groupStats = getCategoryGroupStats();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zero-Based Budget</Text>
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
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#5F67E8" />
              <Text style={styles.infoTitle}>Zero-Based Budgeting</Text>
            </View>
            <Text style={styles.infoText}>
              Give every dollar a job! Allocate all your income across needs, wants, savings, and debt payment until you reach zero remaining.
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

          {/* Zero-Based Summary */}
          {income > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Budget Status</Text>
                <TouchableOpacity onPress={autoAllocateRecommended} style={styles.autoButton}>
                  <Ionicons name="flash-outline" size={16} color="#5F67E8" />
                  <Text style={styles.autoButtonText}>Auto-Allocate</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Income</Text>
                <Text style={styles.summaryValue}>৳{income.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Allocated</Text>
                <Text style={styles.summaryValue}>৳{totalAllocated.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remaining to Allocate</Text>
                <Text style={[
                  styles.summaryValue, 
                  styles.summaryRemaining,
                  { 
                    color: Math.abs(remaining) <= 1 ? '#34C759' : '#FF3B30',
                    fontWeight: 'bold'
                  }
                ]}>
                  ৳{remaining.toLocaleString()}
                </Text>
              </View>
              
              {Math.abs(remaining) <= 1 ? (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#34C759" />
                  <Text style={styles.successText}>Perfect! Every dollar is allocated.</Text>
                </View>
              ) : (
                <View style={styles.warningContainer}>
                  <Ionicons name="warning-outline" size={16} color="#FF3B30" />
                  <Text style={styles.warningText}>
                    {remaining > 0 
                      ? `Allocate remaining ৳${remaining.toLocaleString()}` 
                      : `Reduce allocations by ৳${Math.abs(remaining).toLocaleString()}`
                    }
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Category Groups Overview */}
          {income > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Groups</Text>
              <View style={styles.groupsContainer}>
                {Object.entries(CATEGORY_GROUPS).map(([key, group]) => {
                  const stats = groupStats[key];
                  return (
                    <View key={key} style={styles.groupCard}>
                      <View style={styles.groupHeader}>
                        <View style={[styles.groupColorDot, { backgroundColor: group.color }]} />
                        <Text style={styles.groupTitle}>{group.title}</Text>
                      </View>
                      <View style={styles.groupStats}>
                        <Text style={styles.groupAmount}>৳{stats.allocated.toLocaleString()}</Text>
                        <Text style={[
                          styles.groupPercentage,
                          { 
                            color: Math.abs(stats.percentage - stats.target) <= 5 
                              ? '#34C759' 
                              : '#FF9500' 
                          }
                        ]}>
                          {Math.round(stats.percentage)}% (target: {stats.target}%)
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Categories by Group */}
          {Object.entries(CATEGORY_GROUPS).map(([groupKey, group]) => {
            const groupCategories = budgetCategories.filter(budgetCat => 
              ZERO_BASED_CATEGORIES.some(zbc => 
                zbc.name === budgetCat.name && zbc.category === groupKey
              )
            );

            if (groupCategories.length === 0) return null;

            return (
              <View key={groupKey} style={styles.section}>
                <View style={styles.groupSectionHeader}>
                  <View style={[styles.groupColorDot, { backgroundColor: group.color }]} />
                  <Text style={styles.groupSectionTitle}>{group.title}</Text>
                </View>

                <View style={styles.categoriesContainer}>
                  {groupCategories.map((category) => {
                    const recommendedData = ZERO_BASED_CATEGORIES.find(zbc => zbc.name === category.name);
                    const recommendedAmount = income > 0 ? Math.round((income * (recommendedData?.recommended || 0)) / 100) : 0;
                    
                    return (
                      <View key={category.id} style={styles.categoryCard}>
                        <View style={styles.categoryHeader}>
                          <View style={styles.categoryInfo}>
                            <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                              <View style={[styles.categoryIconDot, { backgroundColor: category.color }]} />
                            </View>
                            <View>
                              <Text style={styles.categoryName}>{category.name}</Text>
                              {recommendedAmount > 0 && (
                                <Text style={styles.categoryRecommended}>
                                  Suggested: ৳{recommendedAmount.toLocaleString()}
                                </Text>
                              )}
                            </View>
                          </View>
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
                          {recommendedAmount > 0 && category.allocatedAmount !== recommendedAmount && (
                            <TouchableOpacity
                              onPress={() => updateCategoryAmount(category.id, recommendedAmount.toString())}
                              style={styles.useRecommendedButton}
                            >
                              <Text style={styles.useRecommendedText}>Use Suggested</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {income > 0 && category.allocatedAmount > 0 && (
                          <Text style={styles.categoryPercentage}>
                            {Math.round((category.allocatedAmount / income) * 100)}% of income
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* Save Button */}
          <TouchableOpacity 
            style={[
              styles.saveButton,
              { 
                opacity: (income > 0 && Math.abs(remaining) <= 1) ? 1 : 0.5,
                backgroundColor: Math.abs(remaining) <= 1 ? '#34C759' : '#5F67E8'
              }
            ]}
            onPress={saveBudget}
            disabled={income <= 0 || Math.abs(remaining) > 1}
          >
            <Ionicons 
              name={Math.abs(remaining) <= 1 ? "checkmark-circle-outline" : "calculator-outline"} 
              size={20} 
              color="white" 
            />
            <Text style={styles.saveButtonText}>
              {Math.abs(remaining) <= 1 
                ? (isEditMode ? 'Update Zero-Based Budget' : 'Create Zero-Based Budget')
                : `Allocate Remaining ৳${Math.abs(remaining).toLocaleString()}`
              }
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
  infoCard: {
    backgroundColor: '#F0F1FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5F67E8',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  autoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F1FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  autoButtonText: {
    fontSize: 12,
    color: '#5F67E8',
    fontWeight: '500',
    marginLeft: 4,
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
    fontSize: 16,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  successText: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 6,
    fontWeight: '500',
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
  groupsContainer: {
    gap: 8,
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  groupStats: {
    alignItems: 'flex-end',
  },
  groupAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  groupPercentage: {
    fontSize: 12,
    fontWeight: '500',
  },
  groupSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  categoryRecommended: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  useRecommendedButton: {
    backgroundColor: '#5F67E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  useRecommendedText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5F67E8',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});