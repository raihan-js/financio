import { useAppContext } from '@/context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = [
  { id: '1', name: 'Food', icon: 'fast-food-outline' },
  { id: '2', name: 'Transport', icon: 'car-outline' },
  { id: '3', name: 'Shopping', icon: 'cart-outline' },
  { id: '4', name: 'Bills', icon: 'receipt-outline' },
  { id: '5', name: 'Entertainment', icon: 'film-outline' },
  { id: '6', name: 'Health', icon: 'medical-outline' },
  { id: '7', name: 'Salary', icon: 'cash-outline' },
  { id: '8', name: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function AddScreen() {
  const { addTransaction } = useAppContext();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const handleAddTransaction = async () => {
    // Validate inputs
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for the transaction.');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Missing Category', 'Please select a category.');
      return;
    }
    
    try {
      // Add transaction to storage
      await addTransaction({
        amount: Number(amount),
        type,
        description: title,
        category: categories.find(c => c.id === selectedCategory)?.name || 'Other',
        date: new Date().toISOString(),
        source: 'manual',
      });
      
      // Reset form
      setAmount('');
      setTitle('');
      setSelectedCategory('');
      
      // Navigate to home screen
      Alert.alert('Success', 'Transaction added successfully!', [
        { text: 'OK', onPress: () => router.navigate('/') }
      ]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Transaction</Text>
          </View>
          
          {/* Transaction Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                type === 'expense' && styles.toggleButtonActive
              ]}
              onPress={() => setType('expense')}
            >
              <Text style={[
                styles.toggleText,
                type === 'expense' && styles.toggleTextActive
              ]}>Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                type === 'income' && styles.toggleButtonActive
              ]}
              onPress={() => setType('income')}
            >
              <Text style={[
                styles.toggleText,
                type === 'income' && styles.toggleTextActive
              ]}>Income</Text>
            </TouchableOpacity>
          </View>
          
          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>৳</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>
          
          {/* Title Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What was this for?"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          {/* Category Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity 
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.id && styles.categoryItemSelected
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View style={styles.categoryIcon}>
                    <Ionicons 
                      name={category.icon} 
                      size={20} 
                      color={selectedCategory === category.id ? 'white' : '#5F67E8'} 
                    />
                  </View>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextSelected
                  ]}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Add Button */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddTransaction}
          >
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#5F67E8',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: 'white',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    paddingVertical: 12,
    color: '#333',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryItem: {
    width: '25%',
    padding: 4,
    marginBottom: 8,
  },
  categoryIcon: {
    backgroundColor: '#F0F1FE',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryItemSelected: {
    backgroundColor: '#5F67E8',
    borderRadius: 8,
  },
  categoryText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
  },
  categoryTextSelected: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#5F67E8',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});