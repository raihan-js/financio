import { TransactionCategoryType } from '@/types';

export const CATEGORIES: Array<{ id: TransactionCategoryType; name: string; icon: string; color: string }> = [
  { id: 'food', name: 'Food', icon: 'fork.knife', color: '#4CAF50' },
  { id: 'transportation', name: 'Transport', icon: 'car.fill', color: '#2196F3' },
  { id: 'shopping', name: 'Shopping', icon: 'bag.fill', color: '#9C27B0' },
  { id: 'bills', name: 'Bills', icon: 'newspaper.fill', color: '#F44336' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film.fill', color: '#FF9800' },
  { id: 'health', name: 'Health', icon: 'heart.fill', color: '#E91E63' },
  { id: 'education', name: 'Education', icon: 'book.fill', color: '#3F51B5' },
  { id: 'savings', name: 'Savings', icon: 'banknote.fill', color: '#009688' },
  { id: 'income', name: 'Income', icon: 'arrow.down.circle.fill', color: '#8BC34A' },
  { id: 'other', name: 'Other', icon: 'ellipsis.circle.fill', color: '#607D8B' },
];

export const getCategoryInfo = (categoryId: TransactionCategoryType) => {
  return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[CATEGORIES.length - 1]; // Default to 'other'
};

export const EXPENSE_CATEGORIES = CATEGORIES.filter(cat => cat.id !== 'income');
export const INCOME_CATEGORIES = CATEGORIES.filter(cat => cat.id === 'income' || cat.id === 'other');