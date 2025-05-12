import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CATEGORIES } from '@/constants/Categories';
import { Transaction, TransactionCategoryType } from '@/types';

// This would come from Firebase in production
const MOCK_TRANSACTIONS: Record<string, Transaction> = {
  '1': {
    id: '1',
    amount: 35.50,
    description: 'Grocery Shopping',
    category: 'food',
    date: new Date(),
    isExpense: true,
    source: 'DBBL Bank'
  },
  '2': {
    id: '2',
    amount: 10.25,
    description: 'Bus Fare',
    category: 'transportation',
    date: new Date(Date.now() - 86400000), // Yesterday
    isExpense: true,
    source: 'Manual Entry'
  },
  '3': {
    id: '3',
    amount: 1000.00,
    description: 'Salary',
    category: 'income',
    date: new Date(Date.now() - 172800000), // 2 days ago
    isExpense: false,
    source: 'BRAC Bank'
  }
};

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategoryType | null>(null);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!id) {
      Alert.alert('Error', 'Transaction ID not provided');
      router.back();
      return;
    }

    // In production, fetch from Firebase
    // For now, use mock data
    const mockTransaction = MOCK_TRANSACTIONS[id];
    if (mockTransaction) {
      setAmount(mockTransaction.amount.toString());
      setDescription(mockTransaction.description);
      setCategory(mockTransaction.category);
      setTransactionType(mockTransaction.isExpense ? 'expense' : 'income');
      setSource(mockTransaction.source || 'Manual Entry');
    } else {
      Alert.alert('Error', 'Transaction not found');
      router.back();
    }
    
    setLoading(false);
  }, [id]);
  
  const updateTransaction = () => {
    // Validate inputs (same as in add-expense.tsx)
    if (!amount || amount === '0') {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (!description) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    
    // Create updated transaction object
    const updatedTransaction = {
      id,
      amount: parseFloat(amount),
      description,
      category,
      date: new Date(), // In production, you'd keep the original date or allow editing
      isExpense: transactionType === 'expense',
      source
    };
    
    // TODO: Update in Firebase
    console.log('Updating transaction:', updatedTransaction);
    
    // Close modal and return to previous screen
    router.back();
  };
  
  const deleteTransaction = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Delete from Firebase
            console.log('Deleting transaction:', id);
            router.back();
          },
        },
      ]
    );
  };
  
  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ThemedText>Loading transaction...</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color="#555555" />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>
          Edit Transaction
        </ThemedText>
        <Pressable onPress={updateTransaction} style={styles.saveButton}>
          <ThemedText style={styles.saveButtonText}>Update</ThemedText>
        </Pressable>
      </ThemedView>
      
      {/* Transaction Type Selector */}
      <ThemedView style={styles.typeSelector}>
        <Pressable
          style={[
            styles.typeButton,
            transactionType === 'expense' && styles.activeTypeButton
          ]}
          onPress={() => setTransactionType('expense')}
        >
          <ThemedText
            style={[
              styles.typeButtonText,
              transactionType === 'expense' && styles.activeTypeButtonText
            ]}
          >
            Expense
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.typeButton,
            transactionType === 'income' && styles.activeTypeButton
          ]}
          onPress={() => setTransactionType('income')}
        >
          <ThemedText
            style={[
              styles.typeButtonText,
              transactionType === 'income' && styles.activeTypeButtonText
            ]}
          >
            Income
          </ThemedText>
        </Pressable>
      </ThemedView>
      
      {/* Amount Input */}
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Amount</ThemedText>
        <View style={styles.amountInputContainer}>
          <ThemedText style={styles.currencySymbol}>৳</ThemedText>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholderTextColor="#AAAAAA"
          />
        </View>
      </ThemedView>
      
      {/* Description Input */}
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Description</ThemedText>
        <TextInput
          style={styles.textInput}
          placeholder="What was this for?"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#AAAAAA"
        />
      </ThemedView>
      
      {/* Category Selector */}
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Category</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {CATEGORIES.filter(cat => 
            transactionType === 'expense' ? cat.id !== 'income' : cat.id === 'income' || cat.id === 'other'
          ).map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryButton,
                category === cat.id && { borderColor: cat.color, borderWidth: 2 }
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: cat.color }
                ]}
              >
                <IconSymbol name={cat.icon} size={20} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.categoryName}>{cat.name}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </ThemedView>
      
      {/* Source Info */}
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Source</ThemedText>
        <View style={styles.sourceContainer}>
          <ThemedText>{source}</ThemedText>
        </View>
      </ThemedView>
      
      {/* Delete Button */}
      <ThemedView style={styles.deleteContainer}>
        <Pressable
          style={styles.deleteButton}
          onPress={deleteTransaction}
        >
          <IconSymbol name="trash" size={20} color="#FFFFFF" />
          <ThemedText style={styles.deleteButtonText}>Delete Transaction</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 8,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#0A7EA4',
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 8,
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTypeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  typeButtonText: {
    fontWeight: '500',
    color: '#777777',
  },
  activeTypeButtonText: {
    color: '#0A7EA4',
  },
  inputContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  inputLabel: {
    marginBottom: 8,
    opacity: 0.6,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: 28,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    padding: 0,
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingVertical: 8,
    fontSize: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 16,
    borderRadius: 8,
    padding: 4,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
  },
  sourceContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingVertical: 12,
  },
  deleteContainer: {
    padding: 16,
    marginTop: 'auto',
    marginBottom: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});