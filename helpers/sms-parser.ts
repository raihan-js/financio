import { processSMSTransactions } from '@/app/helpers/sms-parser';
import { addMultipleTransactions } from '@/services/transactionService';
import { Transaction } from '@/types';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

export function useSMSReader() {
  const [isReading, setIsReading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  // Check if we have permission to read SMS
  const checkPermission = async () => {
    if (Platform.OS !== 'android') {
      // SMS reading is only available on Android
      setHasPermission(false);
      return false;
    }
    
    try {
      // This is a placeholder - in a real app you would use a permissions library
      // such as react-native-permissions or expo-permissions
      
      // For demonstration, we'll assume we have permission
      setHasPermission(true);
      return true;
    } catch (err) {
      console.error('Failed to check SMS permission:', err);
      setError(err instanceof Error ? err : new Error('Failed to check SMS permission'));
      setHasPermission(false);
      return false;
    }
  };
  
  // Request permission to read SMS
  const requestPermission = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Not Available',
        'SMS reading is only available on Android devices.'
      );
      return false;
    }
    
    try {
      // In a real app, you would request permission here
      // For demonstration, we'll just show how to direct to app settings
      
      Alert.alert(
        'Permission Required',
        'This app needs permission to read SMS messages to detect bank transactions.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings()
          }
        ]
      );
      
      // In a real implementation, check if permission was granted
      await checkPermission();
      
      return hasPermission;
    } catch (err) {
      console.error('Failed to request SMS permission:', err);
      setError(err instanceof Error ? err : new Error('Failed to request SMS permission'));
      return false;
    }
  };
  
  // Read SMS messages and extract transactions
  const readSMS = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Not Available',
        'SMS reading is only available on Android devices.'
      );
      return [];
    }
    
    // Check/request permission if we don't have it
    if (hasPermission !== true) {
      const granted = await requestPermission();
      if (!granted) {
        return [];
      }
    }
    
    try {
      setIsReading(true);
      setError(null);
      
      // Process SMS transactions
      const extractedTransactions = await processSMSTransactions();
      setTransactions(extractedTransactions);
      
      return extractedTransactions;
    } catch (err) {
      console.error('Failed to read SMS messages:', err);
      setError(err instanceof Error ? err : new Error('Failed to read SMS messages'));
      return [];
    } finally {
      setIsReading(false);
    }
  };
  
  // Save the extracted transactions to the database
  const saveTransactions = async (transactionsToSave: Omit<Transaction, 'id'>[]) => {
    try {
      const ids = await addMultipleTransactions(transactionsToSave);
      return ids;
    } catch (err) {
      console.error('Failed to save transactions:', err);
      setError(err instanceof Error ? err : new Error('Failed to save transactions'));
      throw err;
    }
  };
  
  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);
  
  return {
    isReading,
    transactions,
    error,
    hasPermission,
    readSMS,
    saveTransactions,
    requestPermission
  };
}