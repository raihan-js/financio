/**
 * Enhanced utility to parse bank SMS messages and extract transaction data
 * Optimized for UCB (United Commercial Bank) and other Bangladesh banks
 */

export interface SMSTransaction {
  type: 'debit' | 'credit';
  amount: number;
  balance: number;
  timestamp: string;
  accountNumber?: string;
  description?: string;
  transactionId?: string;
}

/**
 * Enhanced bank SMS parser that handles UCB and other bank formats
 * 
 * UCB Format Examples:
 * - "Your A/C (***3766) has been debited BDT 3,060.00. Avl Bal: BDT 3,04,017.61 @ 07:58 PM. For query: 16419"
 * - "Your UCB Debit Card#5884 (CL ID:257015) has been charged for BDT4,300.00 at NEW SONALI JEWELLERS on 07/05/25 20:07"
 * - "BDT7,000.00 withdrawn fm Card#5884 (CL ID:257015) on 08/05/25 18:33 at UCBL ATM"
 */
export function parseBankSMS(message: string): SMSTransaction | null {
  try {
    const cleanMessage = message.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('🔍 Parsing SMS:', cleanMessage);
    
    // Determine transaction type
    let type: 'debit' | 'credit' = 'debit';
    
    if (cleanMessage.match(/(credited|credit|deposit|inward credit|reversed)/i)) {
      type = 'credit';
    } else if (cleanMessage.match(/(debited|debit|charged|withdrawn)/i)) {
      type = 'debit';
    } else {
      console.log('❌ No transaction type found');
      return null;
    }
    
    // Extract amount - UCB uses various formats
    let amount = 0;
    const amountPatterns = [
      /BDT\s*([\d,]+\.?\d*)/i,                    // BDT 3,060.00 or BDT3060.00
      /charged for BDT\s*([\d,]+\.?\d*)/i,       // charged for BDT4,300.00
      /([\d,]+\.?\d*)\s*withdrawn/i,             // 7,000.00 withdrawn
      /amount:?\s*BDT\s*([\d,]+\.?\d*)/i,        // amount: BDT 1000
    ];
    
    for (const pattern of amountPatterns) {
      const amountMatch = cleanMessage.match(pattern);
      if (amountMatch) {
        const amountStr = amountMatch[1].replace(/,/g, '');
        amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          console.log(`💰 Amount found: ${amount}`);
          break;
        }
      }
    }
    
    if (amount === 0) {
      console.log('❌ No amount found');
      return null;
    }
    
    // Extract account number
    let accountNumber: string | undefined;
    const accountPatterns = [
      /A\/C \(\*+(\d+)\)/i,                      // A/C (***3766)
      /Card#(\d+)/i,                             // Card#5884
      /account.*?(\d{4})/i,                      // various account formats
    ];
    
    for (const pattern of accountPatterns) {
      const match = cleanMessage.match(pattern);
      if (match) {
        accountNumber = match[1];
        console.log(`🏦 Account found: ***${accountNumber}`);
        break;
      }
    }
    
    // Extract balance - UCB specific formats
    let balance = 0;
    const balancePatterns = [
      /Avl Bal:\s*BDT\s*([\d,]+\.?\d*)/i,        // Avl Bal: BDT 3,04,017.61
      /Avl Bal:\s*([\d,]+\.?\d*)/i,              // Avl Bal:169271.77
      /Available Balance:\s*BDT\s*([\d,]+\.?\d*)/i,
      /Balance:\s*BDT\s*([\d,]+\.?\d*)/i,
    ];
    
    for (const pattern of balancePatterns) {
      const balanceMatch = cleanMessage.match(pattern);
      if (balanceMatch) {
        const balanceStr = balanceMatch[1].replace(/,/g, '');
        balance = parseFloat(balanceStr);
        if (!isNaN(balance)) {
          console.log(`💳 Balance found: ${balance}`);
          break;
        }
      }
    }
    
    // Extract timestamp
    let timestamp = new Date().toLocaleTimeString();
    const timestampPatterns = [
      /@\s*(\d{1,2}:\d{2}\s*[AP]M)/i,           // @ 07:58 PM
      /at\s*(\d{1,2}:\d{2}\s*[AP]M)/i,          // at 07:58 PM
      /on\s*(\d{2}\/\d{2}\/\d{2})\s*(\d{2}:\d{2})/i, // on 07/05/25 20:07
    ];
    
    for (const pattern of timestampPatterns) {
      const timestampMatch = cleanMessage.match(pattern);
      if (timestampMatch) {
        timestamp = timestampMatch[1] || `${timestampMatch[1]} ${timestampMatch[2]}`;
        console.log(`⏰ Timestamp found: ${timestamp}`);
        break;
      }
    }
    
    // Extract description based on UCB message patterns
    let description = type === 'debit' ? 'Bank Debit' : 'Bank Credit';
    
    // UCB specific merchant/location extraction
    if (cleanMessage.match(/at\s+([A-Z\s\(\)]+?)\s+on\s+\d{2}\/\d{2}\/\d{2}/i)) {
      const merchantMatch = cleanMessage.match(/at\s+([A-Z\s\(\)]+?)\s+on\s+\d{2}\/\d{2}\/\d{2}/i);
      if (merchantMatch) {
        description = merchantMatch[1].trim();
      }
    } else if (cleanMessage.match(/at\s+(UCBL ATM|NPSB ATM)/i)) {
      description = 'ATM Withdrawal';
    } else if (cleanMessage.match(/Beftn Inward Credit/i)) {
      description = 'Bank Transfer (Received)';
    } else if (cleanMessage.match(/I Banking.*Transfer|Fund Transfer/i)) {
      description = 'Online Transfer';
    } else if (cleanMessage.match(/NPSB CHARGE/i)) {
      description = 'Bank Service Charge';
    } else if (cleanMessage.match(/reversed/i)) {
      description = 'Transaction Reversal';
    }
    
    console.log(`📝 Description: ${description}`);
    
    // Extract transaction reference
    let transactionId: string | undefined;
    const refPatterns = [
      /For query:\s*(\d+)/i,                     // For query: 16419
      /CL ID:\s*(\d+)/i,                         // CL ID:257015
      /Ref:\s*([A-Za-z0-9]+)/i,                  // Ref: ABC123
    ];
    
    for (const pattern of refPatterns) {
      const idMatch = cleanMessage.match(pattern);
      if (idMatch) {
        transactionId = idMatch[1];
        console.log(`🔗 Transaction ID: ${transactionId}`);
        break;
      }
    }
    
    const result = {
      type,
      amount,
      balance,
      timestamp,
      accountNumber,
      description,
      transactionId,
    };
    
    console.log('✅ Parsed result:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error parsing bank SMS:', error);
    return null;
  }
}

/**
 * Enhanced categorization with UCB-specific patterns
 */
export function categorizeTransaction(description: string, amount?: number): string {
  const desc = description.toLowerCase();
  
  // UCB specific patterns
  if (desc.includes('atm withdrawal') || desc.includes('withdrawn') || desc.includes('atm')) {
    return 'ATM Withdrawal';
  }
  
  if (desc.includes('beftn') || desc.includes('transfer') || desc.includes('inward credit')) {
    return 'Bank Transfer';
  }
  
  if (desc.includes('charge') || desc.includes('fee') || desc.includes('npsb charge')) {
    return 'Bank Fees';
  }
  
  if (desc.includes('reversal') || desc.includes('reversed')) {
    return 'Refund';
  }
  
  // Merchant-specific patterns
  if (desc.match(/(jeweller|jewelry|gold)/i)) {
    return 'Shopping';
  }
  
  if (desc.match(/(pharma|pharmacy|medicine|medical)/i)) {
    return 'Health';
  }
  
  // General patterns
  if (desc.match(/(restaurant|cafe|food|pizza|burger|kfc|domino|starbucks|coffee|dining)/i)) {
    return 'Food';
  }
  
  if (desc.match(/(uber|pathao|taxi|transport|fuel|petrol|gas)/i)) {
    return 'Transport';
  }
  
  if (desc.match(/(shop|store|market|mall|purchase|retail|bazar|daraz)/i)) {
    return 'Shopping';
  }
  
  if (desc.match(/(bill|utility|electric|internet|phone|mobile|recharge)/i)) {
    return 'Bills';
  }
  
  if (desc.match(/(salary|income|payment|bonus|allowance)/i)) {
    return 'Income';
  }
  
  if (desc.match(/(entertainment|movie|game|fun|ticket)/i)) {
    return 'Entertainment';
  }
  
  if (desc.match(/(education|school|college|course|book)/i)) {
    return 'Education';
  }
  
  // Default based on transaction type and amount
  if (amount && amount > 10000) {
    return 'Large Payment';
  }
  
  return 'Other';
}