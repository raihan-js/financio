/**
 * Utility to parse bank SMS messages and extract transaction data
 */

export interface SMSTransaction {
  type: 'debit' | 'credit';
  amount: number;
  balance: number;
  timestamp: string;
  accountNumber?: string;
}

/**
 * Parse SMS message from bank to extract transaction details
 * 
 * Sample SMS format:
 * "Your A/C (***3766) has been debited BDT 3,060.00. Avl Bal: BDT 3,04,017.61 @ 07:58 PM. For query: 16419"
 * 
 * @param message SMS message text
 * @returns SMSTransaction object if successful, null if parsing fails
 */
export function parseBankSMS(message: string): SMSTransaction | null {
  try {
    // Extract transaction type (debit or credit)
    const typeMatch = message.match(/(debited|credited)/i);
    if (!typeMatch) return null;
    
    const type = typeMatch[1].toLowerCase() === 'debited' ? 'debit' : 'credit';
    
    // Extract account number
    const accountMatch = message.match(/A\/C \(\*+(\d+)\)/);
    const accountNumber = accountMatch ? accountMatch[1] : undefined;
    
    // Extract transaction amount
    const amountMatch = message.match(/BDT\s+([\d,]+\.\d{2})/);
    if (!amountMatch) return null;
    
    const amountStr = amountMatch[1].replace(/,/g, '');
    const amount = parseFloat(amountStr);
    
    // Extract available balance
    const balanceMatch = message.match(/Avl Bal: BDT\s+([\d,]+\.\d{2})/);
    if (!balanceMatch) return null;
    
    const balanceStr = balanceMatch[1].replace(/,/g, '');
    const balance = parseFloat(balanceStr);
    
    // Extract timestamp
    const timestampMatch = message.match(/@\s+(\d{2}:\d{2}\s+[AP]M)/);
    const timestamp = timestampMatch ? timestampMatch[1] : new Date().toLocaleTimeString();
    
    return {
      type,
      amount,
      balance,
      timestamp,
      accountNumber,
    };
  } catch (error) {
    console.error('Error parsing bank SMS:', error);
    return null;
  }
}

/**
 * Categorize a transaction based on keywords
 * This is a simple implementation and should be expanded with more keywords
 * 
 * @param description Description or source of the transaction
 * @returns Category name
 */
export function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();
  
  if (desc.includes('salary') || desc.includes('income')) {
    return 'Income';
  } else if (desc.includes('food') || desc.includes('restaurant') || desc.includes('cafe')) {
    return 'Food';
  } else if (desc.includes('transport') || desc.includes('uber') || desc.includes('taxi')) {
    return 'Transport';
  } else if (desc.includes('bill') || desc.includes('utility') || desc.includes('electricity')) {
    return 'Bills';
  } else if (desc.includes('medicine') || desc.includes('doctor') || desc.includes('hospital')) {
    return 'Health';
  } else if (desc.includes('shopping') || desc.includes('store') || desc.includes('market')) {
    return 'Shopping';
  } else if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('game')) {
    return 'Entertainment';
  }
  
  return 'Other';
}