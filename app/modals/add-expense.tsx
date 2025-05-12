import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CATEGORIES } from '@/constants/Categories';
import { TransactionCategoryType } from '@/types';

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategoryType | null>(null);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  
  const saveTransaction = () => {
    // Validate inputs
    if (!amount || amount === '0') {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!description) {
      alert('Please enter a description');
      return;
    }
    
    if (!category) {
      alert('Please select a category');
      return;
    }
    
    // Create transaction object
    const transaction = {
      amount: parseFloat(amount),
      description,
      category,
      date: new Date(),
      isExpense: transactionType === 'expense',
      source: 'Manual Entry'
    };
    
    // TODO: Save to Firebase
    console.log('Saving transaction:', transaction);
    
    // Close modal and return to previous screen
    router.back();
  };
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color="#555555" />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>
          {transactionType === 'expense' ? 'Add Expense' : 'Add Income'}
        </ThemedText>
        <Pressable onPress={saveTransaction} style={styles.saveButton}>
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
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
      
      {/* Date Selector (simplified for now) */}
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Date</ThemedText>
        <Pressable style={styles.dateSelector}>
          <ThemedText>Today</ThemedText>
          <IconSymbol name="calendar" size={20} color="#555555" />
        </Pressable>
      </ThemedView>
      
      {/* Bank Selection */}
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Source</ThemedText>
        <Pressable style={styles.bankSelector}>
          <ThemedText>Manual Entry</ThemedText>
          <IconSymbol name="chevron.down" size={20} color="#555555" />
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
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DDDDDD',
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
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingVertical: 12,
  },
  bankSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingVertical: 12,
  },
});