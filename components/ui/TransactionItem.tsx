import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getCategoryInfo } from '@/constants/Categories';
import { Transaction } from '@/types';
import { Pressable, StyleSheet, View } from 'react-native';

type TransactionItemProps = {
  transaction: Transaction;
  onPress?: () => void;
};

export const TransactionItem = ({ transaction, onPress }: TransactionItemProps) => {
  const { description, amount, category, date, isExpense, source } = transaction;
  
  // Format date to something like "Today", "Yesterday", or "May 8"
  const formatDate = (dateObj: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const transactionDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    if (transactionDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (transactionDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      // Format as "Jan 1" for other dates
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  // Get the appropriate icon for the category
  const categoryInfo = getCategoryInfo(category);
  
  return (
    <Pressable 
      style={styles.container}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: categoryInfo.color }]}>
        <IconSymbol name={categoryInfo.icon} size={20} color="#FFFFFF" />
      </View>
      
      <View style={styles.detailsContainer}>
        <ThemedText style={styles.description}>{description}</ThemedText>
        <View style={styles.metaData}>
          <ThemedText style={styles.source}>{source}</ThemedText>
          <ThemedText style={styles.date}>{formatDate(date)}</ThemedText>
        </View>
      </View>
      
      <ThemedText 
        style={[
          styles.amount,
          isExpense ? styles.expenseAmount : styles.incomeAmount
        ]}
      >
        {isExpense ? '-' : '+'} ৳{amount.toFixed(2)}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    marginBottom: 4,
  },
  metaData: {
    flexDirection: 'row',
    opacity: 0.6,
  },
  source: {
    fontSize: 12,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseAmount: {
    color: '#F44336',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
});