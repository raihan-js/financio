import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Transaction object structure
 */
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  source?: 'manual' | 'sms';
  balance?: number;
}

/**
 * Keys used for AsyncStorage
 */
const STORAGE_KEYS = {
  TRANSACTIONS: 'spendly_transactions',
  USER_PROFILE: 'spendly_user_profile',
  SETTINGS: 'spendly_settings',
};

/**
 * Save a transaction to storage
 */
export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    // Generate ID if not provided
    if (!transaction.id) {
      transaction.id = Date.now().toString();
    }
    
    // Get existing transactions
    const existingTransactionsJSON = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const existingTransactions: Transaction[] = existingTransactionsJSON 
      ? JSON.parse(existingTransactionsJSON) 
      : [];
    
    // Add new transaction
    const updatedTransactions = [...existingTransactions, transaction];
    
    // Save back to storage
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

/**
 * Get all transactions
 */
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const transactionsJSON = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return transactionsJSON ? JSON.parse(transactionsJSON) : [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

/**
 * Delete a transaction by ID
 */
export const deleteTransaction = async (transactionId: string): Promise<void> => {
  try {
    const existingTransactionsJSON = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!existingTransactionsJSON) return;
    
    const existingTransactions: Transaction[] = JSON.parse(existingTransactionsJSON);
    const updatedTransactions = existingTransactions.filter(t => t.id !== transactionId);
    
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

/**
 * User profile structure
 */
export interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
  bankName?: string;
  smsFormat?: string;
  isOnboarded?: boolean;
}

/**
 * Save user profile
 */
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const profileJSON = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profileJSON ? JSON.parse(profileJSON) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * App settings structure
 */
export interface AppSettings {
  smsReaderEnabled: boolean;
  notificationsEnabled: boolean;
  currency: string;
}

/**
 * Default app settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  smsReaderEnabled: true,
  notificationsEnabled: true,
  currency: 'BDT',
};

/**
 * Save app settings
 */
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

/**
 * Get app settings
 */
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const settingsJSON = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settingsJSON ? JSON.parse(settingsJSON) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Clear all app data
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.SETTINGS,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};