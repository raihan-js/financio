import { TransactionCategoryType } from "@/types";

// Bank SMS message patterns (Bangladesh)
// These are example patterns and would need to be adjusted for real bank SMS formats
const SMS_PATTERNS = {
  DBBL: {
    // Dutch-Bangla Bank Limited
    debit: /Your a\/c \w+ has been debited by Tk ([\d,.]+) on (\d{2}\/\d{2}\/\d{2}) (.*?)\..*?Bal\. Tk ([\d,.]+)/i,
    credit: /Your a\/c \w+ has been credited by Tk ([\d,.]+) on (\d{2}\/\d{2}\/\d{2}) (.*?)\..*?Bal\. Tk ([\d,.]+)/i,
  },
  BRAC: {
    // BRAC Bank
    debit: /BDT ([\d,.]+) debited from A\/C \w+ on (\d{2}\/\d{2}\/\d{4})(?:(?:for|at|to) (.*?))?(?:Avl Bal: BDT ([\d,.]+))?/i,
    credit: /BDT ([\d,.]+) credited to A\/C \w+ on (\d{2}\/\d{2}\/\d{4})(?:(?:from|by) (.*?))?(?:Avl Bal: BDT ([\d,.]+))?/i,
  },
  EBL: {
    // Eastern Bank Limited
    debit: /EBL: BDT ([\d,.]+) has been debited from your Account \w+ on (\d{2}\/\d{2}\/\d{4})(?:for|at|to) (?:.*?) (.*?)(?:Avl Bal: BDT ([\d,.]+))?/i,
    credit: /EBL: BDT ([\d,.]+) has been credited to your Account \w+ on (\d{2}\/\d{2}\/\d{4})(?:from|by) (?:.*?) (.*?)(?:Avl Bal: BDT ([\d,.]+))?/i,
  }
};

// Keywords for transaction categorization
const CATEGORY_KEYWORDS: Record<TransactionCategoryType, string[]> = {
  food: ['restaurant', 'cafe', 'food', 'grocery', 'supermarket', 'bakery', 'meal'],
  transportation: ['uber', 'pathao', 'train', 'bus', 'railway', 'air', 'gas', 'petrol', 'fuel'],
  shopping: ['mall', 'shop', 'store', 'market', 'cloth', 'shoe', 'fashion', 'online'],
  bills: ['bill', 'utility', 'electricity', 'gas', 'water', 'internet', 'subscription'],
  entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'theatre', 'concert', 'event'],
  health: ['hospital', 'doctor', 'clinic', 'medicine', 'pharma', 'dental', 'medical'],
  education: ['school', 'college', 'university', 'course', 'books', 'tuition', 'fee'],
  income: ['salary', 'income', 'wage', 'payment', 'compensation', 'bonus', 'revenue'],
  savings: ['saving', 'investment', 'deposit', 'fund', 'dividend', 'interest'],
  other: []
};

/**
 * Determines the bank from the SMS sender/address
 */
export const identifyBank = (sender: string): 'DBBL' | 'BRAC' | 'EBL' | null => {
  const lowerSender = sender.toLowerCase();
  
  if (lowerSender.includes('dbbl') || lowerSender.includes('dutch') || lowerSender.includes('bangla')) {
    return 'DBBL';
  } else if (lowerSender.includes('brac')) {
    return 'BRAC';
  } else if (lowerSender.includes('ebl') || lowerSender.includes('eastern')) {
    return 'EBL';
  }
  
  return null;
};

/**
 * Attempts to determine a transaction category based on description
 */
export const categorizeTransaction = (description: string): TransactionCategoryType => {
  const lowerDesc = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return category as TransactionCategoryType;
      }
    }
  }
  
  return 'other';
};

/**
 * Parse a bank SMS to extract transaction details
 */
export const parseBankSMS = (message: string, sender: string) => {
  const bank = identifyBank(sender);
  if (!bank) return null;
  
  let match: RegExpExecArray | null = null;
  let isExpense = false;
  
  // Try to match debit (expense) pattern first
  match = SMS_PATTERNS[bank].debit.exec(message);
  if (match) {
    isExpense = true;
  } else {
    // Then try credit (income) pattern
    match = SMS_PATTERNS[bank].credit.exec(message);
    if (match) {
      isExpense = false;
    }
  }
  
  if (!match) return null;
  
  // Extract information from the matched pattern
  const [_, amountStr, dateStr, description] = match;
  
  // Clean amount string (remove commas, etc.)
  const amount = parseFloat(amountStr.replace(/,/g, ''));
  
  // Parse date (formats like "01/02/23" or "01/02/2023")
  const dateParts = dateStr.split('/');
  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // JavaScript months are 0-indexed
  
  let year = parseInt(dateParts[2], 10);
  if (year < 100) {
    year += 2000; // Assuming 2-digit years are in the 2000s
  }
  
  const date = new Date(year, month, day);
  
  // Generate a clean description or use a placeholder
  const cleanDescription = description?.trim() || (isExpense ? 'Payment' : 'Deposit');
  
  // Determine category based on description
  const category = categorizeTransaction(cleanDescription);
  
  return {
    amount,
    description: cleanDescription,
    category,
    date,
    isExpense,
    source: bank,
    fromSMS: true
  };
};

/**
 * Function to read and process SMS messages
 * In a real app, this would use a SMS reading library
 */
export const readSMSMessages = async () => {
  // This is a placeholder function
  // In a real app, you would need to implement SMS permission and reading functionality
  // using a library like react-native-sms or a custom native module
  
  console.log('Reading SMS messages (mock)');
  
  // Return mock SMS data for development
  return [
    {
      id: 'sms1',
      body: 'DBBL: Your a/c XX7890 has been debited by Tk 2,500.00 on 12/05/25 Grocery Shopping. Bal. Tk 45,670.25',
      address: 'DBBL',
      date: new Date(),
    },
    {
      id: 'sms2',
      body: 'BRAC: BDT 30,000.00 credited to A/C XX1234 on 10/05/2025 from ACME Inc SALARY Avl Bal: BDT 78,500.00',
      address: 'BRAC BANK',
      date: new Date(Date.now() - 172800000), // 2 days ago
    }
  ];
};

/**
 * Process all SMS messages and extract transactions
 */
export const processSMSTransactions = async () => {
  try {
    const messages = await readSMSMessages();
    const transactions = [];
    
    for (const message of messages) {
      const parsedTransaction = parseBankSMS(message.body, message.address);
      if (parsedTransaction) {
        transactions.push({
          ...parsedTransaction,
          smsId: message.id,
          id: `sms_${message.id}` // Generate a unique ID
        });
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Error processing SMS transactions:', error);
    return [];
  }
};

// SMS Parser service with all the functions
const SMSParserService = {
  identifyBank,
  categorizeTransaction,
  parseBankSMS,
  readSMSMessages,
  processSMSTransactions
};

export default SMSParserService;