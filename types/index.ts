// Transaction Categories
export type TransactionCategoryType = 
  | 'food' 
  | 'transportation' 
  | 'shopping' 
  | 'bills' 
  | 'entertainment' 
  | 'health' 
  | 'education' 
  | 'income' 
  | 'savings' 
  | 'other';

// Transaction Type
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: TransactionCategoryType;
  date: Date;
  isExpense: boolean;
  source?: string; // bank name or manual entry
  smsId?: string; // if transaction was created from SMS
}

// SMS Message Type
export interface SMSMessage {
  id: string;
  body: string;
  address: string; // sender (usually bank)
  date: Date;
  isProcessed: boolean;
}

// User Type
export interface User {
  id: string;
  name: string;
  email: string;
  banks: string[]; // list of bank names
  monthlySavingsGoal?: number;
  monthlyBudget?: {
    [key in TransactionCategoryType]?: number;
  };
}

// Saving Goal Type
export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

// Financial Insight Type
export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'achievement';
  date: Date;
  isRead: boolean;
}