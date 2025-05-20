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
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  userProfile: UserProfile | null;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  isLoading: boolean;
  refreshData: () => Promise<void>;
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load transactions
      const savedTransactions = await getTransactions();
      setTransactions(savedTransactions);

      // Load user profile
      const savedProfile = await getUserProfile();
      setUserProfile(savedProfile);

      // Load settings
      const savedSettings = await getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
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
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error removing transaction:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      await saveUserProfile(profile);
      setUserProfile(profile);
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

  const refreshData = async () => {
    await loadData();
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        addTransaction,
        removeTransaction,
        userProfile,
        updateUserProfile,
        settings,
        updateSettings,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};