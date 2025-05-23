/**
 * SMS Reader for Android devices
 * This will read actual SMS messages from the device
 */

import { PermissionsAndroid, Platform } from 'react-native';
import { categorizeTransaction, parseBankSMS } from './smsParser';
import { getTransactions, saveTransaction, Transaction } from './storage';

interface SMSMessage {
  _id: string;
  address: string;
  body: string;
  date: number;
  read: number;
}

/**
 * Request SMS permissions on Android
 */
export async function requestSMSPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    console.log('SMS reading only supported on Android');
    return false;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message: 'Spendly needs access to your SMS messages to automatically track bank transactions.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Error requesting SMS permission:', err);
    return false;
  }
}

/**
 * Read SMS messages from device
 * Note: This requires a native module to be implemented
 * For now, we'll provide a mock implementation
 */
export async function readDeviceSMS(): Promise<SMSMessage[]> {
  // In a real implementation, you would use a native module like:
  // import SmsAndroid from 'react-native-get-sms-android';
  
  // For now, return mock SMS data that simulates real bank messages
  const mockSMSMessages: SMSMessage[] = [
    {
      _id: '1',
      address: 'DBBL',
      body: "Your A/C (***3766) has been debited BDT 3,060.00. Avl Bal: BDT 3,04,017.61 @ 07:58 PM. For query: 16419",
      date: Date.now() - 86400000, // yesterday
      read: 1,
    },
    {
      _id: '2',
      address: 'BRAC-BANK',
      body: "Your A/C (***1234) has been credited BDT 45,000.00. Avl Bal: BDT 3,49,017.61 @ 10:15 AM. For query: 16419",
      date: Date.now() - 172800000, // 2 days ago
      read: 1,
    },
    {
      _id: '3',
      address: 'DBBL',
      body: "Your A/C (***3766) has been debited BDT 1,200.00. Avl Bal: BDT 3,02,817.61 @ 03:22 PM. For query: 16419",
      date: Date.now() - 259200000, // 3 days ago
      read: 1,
    },
    {
      _id: '4',
      address: 'ISLAMI-BANK',
      body: "Your A/C (***5678) has been debited BDT 850.00. Avl Bal: BDT 2,51,967.61 @ 01:45 PM. For query: 16419",
      date: Date.now() - 345600000, // 4 days ago
      read: 1,
    },
    {
      _id: '5',
      address: 'DBBL',
      body: "Your A/C (***3766) has been debited BDT 2,500.00. Avl Bal: BDT 2,49,467.61 @ 09:30 AM. For query: 16419",
      date: Date.now() - 432000000, // 5 days ago
      read: 1,
    },
  ];

  return mockSMSMessages;
}

/**
 * Filter SMS messages from bank senders
 */
export function filterBankSMS(messages: SMSMessage[], userBankName?: string): SMSMessage[] {
  const bankKeywords = [
    'BANK', 'DBBL', 'BRAC', 'ISLAMI', 'EASTERN', 'CITY', 'PRIME', 'MUTUAL',
    'DUTCH', 'BANGLA', 'TRUST', 'STANDARD', 'CHARTERED', 'HSBC', 'CITIBANK',
    'BALANCE', 'DEBITED', 'CREDITED', 'A/C', 'ACCOUNT'
  ];

  // If user provided bank name, add it to keywords
  if (userBankName) {
    bankKeywords.push(userBankName.toUpperCase());
  }

  return messages.filter(message => {
    const body = message.body.toUpperCase();
    const address = message.address.toUpperCase();
    
    return bankKeywords.some(keyword => 
      body.includes(keyword) || address.includes(keyword)
    );
  });
}

/**
 * Process SMS messages and convert to transactions
 */
export async function processSMSTransactions(userBankName?: string): Promise<number> {
  try {
    // Check permission first
    const hasPermission = await requestSMSPermission();
    if (!hasPermission) {
      console.log('SMS permission not granted');
      return 0;
    }

    // Read SMS messages
    const allMessages = await readDeviceSMS();
    const bankMessages = filterBankSMS(allMessages, userBankName);
    
    // Get existing transactions to avoid duplicates
    const existingTransactions = await getTransactions();
    const existingSMSIds = existingTransactions
      .filter(t => t.source === 'sms')
      .map(t => t.id);

    let processedCount = 0;

    for (const message of bankMessages) {
      // Check if we already processed this SMS
      const smsId = `sms-${message._id}`;
      if (existingSMSIds.includes(smsId)) {
        continue;
      }

      // Parse the SMS
      const parsedTransaction = parseBankSMS(message.body);
      if (!parsedTransaction) {
        continue;
      }

      // Convert to app transaction
      const transaction: Transaction = {
        id: smsId,
        amount: parsedTransaction.amount,
        type: parsedTransaction.type === 'debit' ? 'expense' : 'income',
        category: categorizeTransaction(
          parsedTransaction.type === 'debit' ? 'Bank Debit' : 'Bank Credit'
        ),
        description: parsedTransaction.type === 'debit' ? 'Bank Debit' : 'Bank Credit',
        date: new Date(message.date).toISOString(),
        source: 'sms',
        balance: parsedTransaction.balance,
      };

      // Save transaction
      await saveTransaction(transaction);
      processedCount++;
    }

    return processedCount;
  } catch (error) {
    console.error('Error processing SMS transactions:', error);
    return 0;
  }
}

/**
 * Auto-sync SMS transactions (can be called periodically)
 */
export async function autoSyncSMS(userBankName?: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const count = await processSMSTransactions(userBankName);
    return { success: true, count };
  } catch (error) {
    return { 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}