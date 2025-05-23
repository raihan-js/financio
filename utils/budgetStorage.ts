import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Budget category structure
 */
export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  color: string;
}

/**
 * Monthly budget structure
 */
export interface MonthlyBudget {
  id: string;
  month: string; // Format: YYYY-MM
  totalIncome: number;
  totalAllocated: number;
  categories: BudgetCategory[];
  isZeroBasedBudget: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Recurring expense structure
 */
export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDueDate: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Budget notification structure
 */
export interface BudgetNotification {
  id: string;
  type: 'budget_exceeded' | 'budget_warning' | 'budget_reminder' | 'recurring_due';
  title: string;
  message: string;
  category?: string;
  amount?: number;
  isRead: boolean;
  createdAt: string;
}

/**
 * Storage keys for budget data
 */
const BUDGET_STORAGE_KEYS = {
  MONTHLY_BUDGETS: 'spendly_monthly_budgets',
  RECURRING_EXPENSES: 'spendly_recurring_expenses',
  BUDGET_NOTIFICATIONS: 'spendly_budget_notifications',
  BUDGET_SETTINGS: 'spendly_budget_settings',
};

/**
 * Budget settings structure
 */
export interface BudgetSettings {
  enableBudgetAlerts: boolean;
  warningThreshold: number; // Percentage (e.g., 80 for 80%)
  monthlyReminderEnabled: boolean;
  recurringExpenseReminder: boolean;
}

export const DEFAULT_BUDGET_SETTINGS: BudgetSettings = {
  enableBudgetAlerts: true,
  warningThreshold: 80,
  monthlyReminderEnabled: true,
  recurringExpenseReminder: true,
};

// ===== MONTHLY BUDGETS =====

/**
 * Save monthly budget
 */
export const saveMonthlyBudget = async (budget: MonthlyBudget): Promise<void> => {
  try {
    const existingBudgets = await getMonthlyBudgets();
    const updatedBudgets = existingBudgets.filter(b => b.id !== budget.id);
    updatedBudgets.push({ ...budget, updatedAt: new Date().toISOString() });
    
    await AsyncStorage.setItem(
      BUDGET_STORAGE_KEYS.MONTHLY_BUDGETS, 
      JSON.stringify(updatedBudgets)
    );
  } catch (error) {
    console.error('Error saving monthly budget:', error);
    throw error;
  }
};

/**
 * Get all monthly budgets
 */
export const getMonthlyBudgets = async (): Promise<MonthlyBudget[]> => {
  try {
    const budgetsJSON = await AsyncStorage.getItem(BUDGET_STORAGE_KEYS.MONTHLY_BUDGETS);
    return budgetsJSON ? JSON.parse(budgetsJSON) : [];
  } catch (error) {
    console.error('Error getting monthly budgets:', error);
    return [];
  }
};

/**
 * Get budget for specific month
 */
export const getBudgetForMonth = async (month: string): Promise<MonthlyBudget | null> => {
  try {
    const budgets = await getMonthlyBudgets();
    return budgets.find(b => b.month === month) || null;
  } catch (error) {
    console.error('Error getting budget for month:', error);
    return null;
  }
};

/**
 * Get current month's budget
 */
export const getCurrentMonthBudget = async (): Promise<MonthlyBudget | null> => {
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  return getBudgetForMonth(currentMonth);
};

/**
 * Delete monthly budget
 */
export const deleteMonthlyBudget = async (budgetId: string): Promise<void> => {
  try {
    const budgets = await getMonthlyBudgets();
    const updatedBudgets = budgets.filter(b => b.id !== budgetId);
    await AsyncStorage.setItem(
      BUDGET_STORAGE_KEYS.MONTHLY_BUDGETS, 
      JSON.stringify(updatedBudgets)
    );
  } catch (error) {
    console.error('Error deleting monthly budget:', error);
    throw error;
  }
};

/**
 * Delete budget by month
 */
export const deleteBudgetByMonth = async (month: string): Promise<void> => {
  try {
    const budgets = await getMonthlyBudgets();
    const updatedBudgets = budgets.filter(b => b.month !== month);
    await AsyncStorage.setItem(
      BUDGET_STORAGE_KEYS.MONTHLY_BUDGETS, 
      JSON.stringify(updatedBudgets)
    );
  } catch (error) {
    console.error('Error deleting budget by month:', error);
    throw error;
  }
};

// ===== RECURRING EXPENSES =====

/**
 * Save recurring expense
 */
export const saveRecurringExpense = async (expense: RecurringExpense): Promise<void> => {
  try {
    const existingExpenses = await getRecurringExpenses();
    const updatedExpenses = existingExpenses.filter(e => e.id !== expense.id);
    updatedExpenses.push(expense);
    
    await AsyncStorage.setItem(
      BUDGET_STORAGE_KEYS.RECURRING_EXPENSES, 
      JSON.stringify(updatedExpenses)
    );
  } catch (error) {
    console.error('Error saving recurring expense:', error);
    throw error;
  }
};

/**
 * Get all recurring expenses
 */
export const getRecurringExpenses = async (): Promise<RecurringExpense[]> => {
  try {
    const expensesJSON = await AsyncStorage.getItem(BUDGET_STORAGE_KEYS.RECURRING_EXPENSES);
    return expensesJSON ? JSON.parse(expensesJSON) : [];
  } catch (error) {
    console.error('Error getting recurring expenses:', error);
    return [];
  }
};

/**
 * Get active recurring expenses
 */
export const getActiveRecurringExpenses = async (): Promise<RecurringExpense[]> => {
  try {
    const expenses = await getRecurringExpenses();
    return expenses.filter(e => e.isActive);
  } catch (error) {
    console.error('Error getting active recurring expenses:', error);
    return [];
  }
};

/**
 * Delete recurring expense
 */
export const deleteRecurringExpense = async (expenseId: string): Promise<void> => {
  try {
    const expenses = await getRecurringExpenses();
    const updatedExpenses = expenses.filter(e => e.id !== expenseId);
    await AsyncStorage.setItem(
      BUDGET_STORAGE_KEYS.RECURRING_EXPENSES, 
      JSON.stringify(updatedExpenses)
    );
  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    throw error;
  }
};

/**
 * Toggle recurring expense active status
 */
export const toggleRecurringExpense = async (expenseId: string): Promise<void> => {
  try {
    const expenses = await getRecurringExpenses();
    const updatedExpenses = expenses.map(e => 
      e.id === expenseId ? { ...e, isActive: !e.isActive } : e
    );
    await AsyncStorage.setItem(
      BUDGET_STORAGE_KEYS.RECURRING_EXPENSES, 
      JSON.stringify(updatedExpenses)
    );
  } catch (error) {
    console.error('Error toggling recurring expense:', error);
    throw error;
  }
};

// ===== BUDGET NOTIFICATIONS =====

/**
 * Save budget notification
 */
export const saveBudgetNotification = async (notification: BudgetNotification): Promise<void> => {
  try {
    const existingNotifications = await getBudgetNotifications();
    const updatedNotifications = [...existingNotifications, notification];
    
    await AsyncStorage.setItem(
      BUDGET_STORAGE_KEYS.BUDGET_NOTIFICATIONS, 
      JSON.stringify(updatedNotifications)
    );
  } catch (error) {
    console.error('Error saving budget notification:', error);
    throw error;
  }
};

/**
 * Get all budget notifications
 */
export const getBudgetNotifications = async (): Promise<BudgetNotification[]> => {
  try {
    const notificationsJSON = await AsyncStorage.getItem(BUDGET_STORAGE_KEYS.BUDGET_NOTIFICATIONS);
    const notifications = notificationsJSON ? JSON.parse(notificationsJSON) : [];
    return notifications.sort((a: BudgetNotification, b: BudgetNotification) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error getting budget notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notifications = await getBudgetNotifications();
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    await AsyncStorage.setItem(
      BUDGET_STORAGE_KEYS.BUDGET_NOTIFICATIONS, 
      JSON.stringify(updatedNotifications)
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(BUDGET_STORAGE_KEYS.BUDGET_NOTIFICATIONS, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing notifications:', error);
    throw error;
  }
};

// ===== BUDGET SETTINGS =====

/**
 * Save budget settings
 */
export const saveBudgetSettings = async (settings: BudgetSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(BUDGET_STORAGE_KEYS.BUDGET_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving budget settings:', error);
    throw error;  
  }
};

/**
 * Get budget settings
 */
export const getBudgetSettings = async (): Promise<BudgetSettings> => {
  try {
    const settingsJSON = await AsyncStorage.getItem(BUDGET_STORAGE_KEYS.BUDGET_SETTINGS);
    return settingsJSON ? JSON.parse(settingsJSON) : DEFAULT_BUDGET_SETTINGS;
  } catch (error) {
    console.error('Error getting budget settings:', error);
    return DEFAULT_BUDGET_SETTINGS;
  }
};

// ===== BUDGET UTILITIES =====

/**
 * Calculate next due date based on frequency
 */
export const calculateNextDueDate = (currentDate: Date, frequency: RecurringExpense['frequency']): string => {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate.toISOString();
};

/**
 * Generate budget notification
 */
export const generateBudgetNotification = (
  type: BudgetNotification['type'],
  category: string,
  spent: number,
  allocated: number
): BudgetNotification => {
  const percentage = Math.round((spent / allocated) * 100);
  
  let title = '';
  let message = '';
  
  switch (type) {
    case 'budget_exceeded':
      title = '🚨 Budget Exceeded!';
      message = `You've spent ৳${spent.toLocaleString()} in ${category}, which is ${percentage}% of your ৳${allocated.toLocaleString()} budget.`;
      break;
    case 'budget_warning':
      title = '⚠️ Budget Warning';
      message = `You've used ${percentage}% of your ${category} budget (৳${spent.toLocaleString()} of ৳${allocated.toLocaleString()}).`;
      break;
    case 'budget_reminder':
      title = '📅 Budget Planning Reminder';
      message = `Don't forget to plan your budget for this month! Set spending limits for each category.`;
      break;
    case 'recurring_due':
      title = '🔄 Recurring Expense Due';
      message = `Your ${category} expense of ৳${spent.toLocaleString()} is due soon.`;
      break;
  }
  
  return {
    id: Date.now().toString(),
    type,
    title,
    message,
    category,
    amount: spent,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Update budget with actual spending
 */
export const updateBudgetSpending = async (
  month: string,
  category: string,
  amount: number
): Promise<void> => {
  try {
    const budget = await getBudgetForMonth(month);
    if (!budget) return;
    
    const updatedCategories = budget.categories.map(cat => {
      if (cat.name === category) {
        return { ...cat, spentAmount: cat.spentAmount + amount };
      }
      return cat;
    });
    
    const updatedBudget: MonthlyBudget = {
      ...budget,
      categories: updatedCategories,
      updatedAt: new Date().toISOString(),
    };
    
    await saveMonthlyBudget(updatedBudget);
    
    // Check for budget alerts
    const settings = await getBudgetSettings();
    if (settings.enableBudgetAlerts) {
      const updatedCategory = updatedCategories.find(cat => cat.name === category);
      if (updatedCategory) {
        const percentage = (updatedCategory.spentAmount / updatedCategory.allocatedAmount) * 100;
        
        if (percentage >= 100 && updatedCategory.spentAmount - amount < updatedCategory.allocatedAmount) {
          // Just exceeded budget
          const notification = generateBudgetNotification(
            'budget_exceeded',
            category,
            updatedCategory.spentAmount,
            updatedCategory.allocatedAmount
          );
          await saveBudgetNotification(notification);
        } else if (percentage >= settings.warningThreshold && (updatedCategory.spentAmount - amount) / updatedCategory.allocatedAmount * 100 < settings.warningThreshold) {
          // Just hit warning threshold
          const notification = generateBudgetNotification(
            'budget_warning',
            category,
            updatedCategory.spentAmount,
            updatedCategory.allocatedAmount
          );
          await saveBudgetNotification(notification);
        }
      }
    }
  } catch (error) {
    console.error('Error updating budget spending:', error);
  }
};

/**
 * Clear all budget data
 */
export const clearAllBudgetData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      BUDGET_STORAGE_KEYS.MONTHLY_BUDGETS,
      BUDGET_STORAGE_KEYS.RECURRING_EXPENSES,
      BUDGET_STORAGE_KEYS.BUDGET_NOTIFICATIONS,
      BUDGET_STORAGE_KEYS.BUDGET_SETTINGS,
    ]);
  } catch (error) {
    console.error('Error clearing budget data:', error);
    throw error;
  }
};