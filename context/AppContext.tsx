import {
  BudgetNotification,
  BudgetSettings,
  DEFAULT_BUDGET_SETTINGS,
  deleteBudgetByMonth,
  deleteMonthlyBudget,
  getBudgetNotifications,
  getBudgetSettings,
  getCurrentMonthBudget,
  getRecurringExpenses,
  MonthlyBudget,
  RecurringExpense,
  saveBudgetSettings,
  updateBudgetSpending
} from '@/utils/budgetStorage';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  deleteTransaction,
  getSettings,
  getTransactions,
  getUserProfile,
  saveSettings,
  saveTransaction,
  saveUserProfile,
  Transaction,
  UserProfile
} from '@/utils/storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AppContextType {
  // Existing transaction functionality
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  userProfile: UserProfile | null;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  isLoading: boolean;
  isOnboarded: boolean;
  refreshData: () => Promise<void>;
  syncSMS: () => Promise<{ success: boolean; count: number; message: string; details?: any }>;

  // New budget functionality
  currentBudget: MonthlyBudget | null;
  budgetNotifications: BudgetNotification[];
  budgetSettings: BudgetSettings;
  recurringExpenses: RecurringExpense[];
  updateBudgetSettings: (settings: Partial<BudgetSettings>) => Promise<void>;
  refreshBudgetData: () => Promise<void>;
  getUnreadNotificationsCount: () => number;
  deleteBudget: (budgetId: string) => Promise<void>;
  deleteCurrentMonthBudget: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Existing state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // New budget state
  const [currentBudget, setCurrentBudget] = useState<MonthlyBudget | null>(null);
  const [budgetNotifications, setBudgetNotifications] = useState<BudgetNotification[]>([]);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(DEFAULT_BUDGET_SETTINGS);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load existing data
      const savedTransactions = await getTransactions();
      setTransactions(savedTransactions);

      const savedProfile = await getUserProfile();
      setUserProfile(savedProfile);
      setIsOnboarded(savedProfile?.isOnboarded === true);

      const savedSettings = await getSettings();
      setSettings(savedSettings);

      // Load budget data
      await loadBudgetData();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBudgetData = async () => {
    try {
      // Load current month's budget
      const budget = await getCurrentMonthBudget();
      setCurrentBudget(budget);

      // Load budget notifications
      const notifications = await getBudgetNotifications();
      setBudgetNotifications(notifications);

      // Load budget settings
      const budgetSettings = await getBudgetSettings();
      setBudgetSettings(budgetSettings);

      // Load recurring expenses
      const expenses = await getRecurringExpenses();
      setRecurringExpenses(expenses);
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      // Create transaction with generated ID
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
      };
      
      await saveTransaction(newTransaction);
      setTransactions(prev => [...prev, newTransaction]);

      // Update budget spending if it's an expense
      if (newTransaction.type === 'expense') {
        const currentMonth = new Date().toISOString().substring(0, 7);
        if (newTransaction.date.startsWith(currentMonth)) {
          await updateBudgetSpending(currentMonth, newTransaction.category, newTransaction.amount);
          // Refresh budget data to get updated spending and potential notifications
          await loadBudgetData();
        }
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Refresh budget data since spending amounts may have changed
      await loadBudgetData();
    } catch (error) {
      console.error('Error removing transaction:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      const updatedProfile = { ...profile, isOnboarded: true };
      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      setIsOnboarded(true);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const updateBudgetSettings = async (newBudgetSettings: Partial<BudgetSettings>) => {
    try {
      const updatedBudgetSettings = { ...budgetSettings, ...newBudgetSettings };
      await saveBudgetSettings(updatedBudgetSettings);
      setBudgetSettings(updatedBudgetSettings);
    } catch (error) {
      console.error('Error updating budget settings:', error);
      throw error;
    }
  };

  const syncSMS = async () => {
    try {
      // Import the function dynamically to avoid circular dependency
      const { autoSyncSMS } = await import('@/utils/smsReader');
      const result = await autoSyncSMS(userProfile?.bankName);
      if (result.success && result.count > 0) {
        // Refresh transactions to show new SMS-based transactions
        await refreshData();
      }
      return result;
    } catch (error) {
      return { 
        success: false, 
        count: 0, 
        message: error instanceof Error ? error.message : 'Unknown error occurred during SMS sync'
      };
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const refreshBudgetData = async () => {
    await loadBudgetData();
  };

  const getUnreadNotificationsCount = (): number => {
    return budgetNotifications.filter(notification => !notification.isRead).length;
  };

  const deleteBudget = async (budgetId: string) => {
    try {
      await deleteMonthlyBudget(budgetId);
      // Refresh budget data to update the current budget state
      await loadBudgetData();
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  };

  const deleteCurrentMonthBudget = async () => {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7);
      await deleteBudgetByMonth(currentMonth);
      setCurrentBudget(null);
    } catch (error) {
      console.error('Error deleting current month budget:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Existing functionality
        transactions,
        addTransaction,
        removeTransaction,
        userProfile,
        updateUserProfile,
        settings,
        updateSettings,
        isLoading,
        isOnboarded,
        refreshData,
        syncSMS,

        // New budget functionality
        currentBudget,
        budgetNotifications,
        budgetSettings,
        recurringExpenses,
        updateBudgetSettings,
        refreshBudgetData,
        getUnreadNotificationsCount,
        deleteBudget,
        deleteCurrentMonthBudget,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};