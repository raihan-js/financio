import {
    addTransaction,
    deleteTransaction,
    getTransactions,
    TransactionQueryOptions,
    updateTransaction
} from '@/services/transactionService';
import { Transaction } from '@/types';
import { useEffect, useState } from 'react';

export function useTransactions(options: TransactionQueryOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch transactions with given options
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransactions(options);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching transactions'));
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add a new transaction
  const addNewTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const id = await addTransaction(transaction);
      setTransactions([
        { ...transaction, id },
        ...transactions
      ]);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while adding transaction'));
      console.error('Failed to add transaction:', err);
      throw err;
    }
  };
  
  // Update existing transaction
  const updateExistingTransaction = async (id: string, data: Partial<Transaction>) => {
    try {
      await updateTransaction(id, data);
      setTransactions(transactions.map(t => 
        t.id === id ? { ...t, ...data } : t
      ));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while updating transaction'));
      console.error('Failed to update transaction:', err);
      throw err;
    }
  };
  
  // Delete transaction
  const removeTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while deleting transaction'));
      console.error('Failed to delete transaction:', err);
      throw err;
    }
  };
  
  // Calculate totals
  const totals = {
    income: transactions
      .filter(t => !t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0),
    
    expenses: transactions
      .filter(t => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0),
    
    balance: transactions.reduce((sum, t) => 
      t.isExpense ? sum - t.amount : sum + t.amount, 0
    ),
    
    byCategory: transactions.reduce((acc, t) => {
      const category = t.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += t.isExpense ? t.amount : 0;
      return acc;
    }, {} as Record<string, number>)
  };
  
  // Load transactions on mount and when options change
  useEffect(() => {
    fetchTransactions();
  }, [JSON.stringify(options)]);
  
  return {
    transactions,
    loading,
    error,
    refresh: fetchTransactions,
    add: addNewTransaction,
    update: updateExistingTransaction,
    remove: removeTransaction,
    totals
  };
}