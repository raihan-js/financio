import { Transaction, TransactionCategoryType } from '@/types';

// Mock storage for transactions
let mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 35.50,
    description: 'Grocery Shopping',
    category: 'food',
    date: new Date(),
    isExpense: true,
    source: 'DBBL Bank'
  },
  {
    id: '2',
    amount: 10.25,
    description: 'Bus Fare',
    category: 'transportation',
    date: new Date(Date.now() - 86400000), // Yesterday
    isExpense: true,
    source: 'Manual Entry'
  },
  {
    id: '3',
    amount: 1000.00,
    description: 'Salary',
    category: 'income',
    date: new Date(Date.now() - 172800000), // 2 days ago
    isExpense: false,
    source: 'BRAC Bank'
  }
];

/**
 * Add a new transaction
 */
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<string> => {
  try {
    const id = Date.now().toString();
    const newTransaction = { ...transaction, id };
    mockTransactions.push(newTransaction);
    return id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

/**
 * Update an existing transaction
 */
export const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<void> => {
  try {
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index >= 0) {
      mockTransactions[index] = { ...mockTransactions[index], ...data };
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    mockTransactions = mockTransactions.filter(t => t.id !== id);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

/**
 * Get a transaction by ID
 */
export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  try {
    return mockTransactions.find(t => t.id === id) || null;
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
};

/**
 * Get transactions with optional filtering
 */
export interface TransactionQueryOptions {
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  isExpense?: boolean;
  category?: TransactionCategoryType;
  source?: string;
}

export const getTransactions = async (options: TransactionQueryOptions = {}): Promise<Transaction[]> => {
  try {
    let filteredTransactions = [...mockTransactions];
    
    // Apply filters
    if (options.startDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date >= options.startDate!);
    }
    
    if (options.endDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date <= options.endDate!);
    }
    
    if (options.isExpense !== undefined) {
      filteredTransactions = filteredTransactions.filter(t => t.isExpense === options.isExpense);
    }
    
    if (options.category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === options.category);
    }
    
    if (options.source) {
      filteredTransactions = filteredTransactions.filter(t => t.source === options.source);
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    // Apply limit
    if (options.limit) {
      filteredTransactions = filteredTransactions.slice(0, options.limit);
    }
    
    return filteredTransactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

/**
 * Get recent transactions
 */
export const getRecentTransactions = async (count: number = 5): Promise<Transaction[]> => {
  return getTransactions({ limit: count });
};

/**
 * Get transactions for a specific month and year
 */
export const getMonthTransactions = async (month: number, year: number): Promise<Transaction[]> => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of month
  
  return getTransactions({ startDate, endDate });
};

/**
 * Get transactions by category
 */
export const getTransactionsByCategory = async (category: TransactionCategoryType): Promise<Transaction[]> => {
  return getTransactions({ category });
};

/**
 * Add multiple transactions in batch
 */
export const addMultipleTransactions = async (transactions: Omit<Transaction, 'id'>[]): Promise<string[]> => {
  try {
    const ids: string[] = [];
    
    for (const transaction of transactions) {
      const id = await addTransaction(transaction);
      ids.push(id);
    }
    
    return ids;
  } catch (error) {
    console.error('Error adding multiple transactions:', error);
    throw error;
  }
};