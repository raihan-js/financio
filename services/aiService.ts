import { Transaction } from '@/types';

// This is a placeholder service for AI-powered financial insights
// In a real app, this would connect to an open source AI model or API

// Sample rules for generating financial insights
const INSIGHT_RULES = [
  {
    type: 'budget_alert',
    check: (transactions: Transaction[], category: string, threshold: number) => {
      const totalSpent = transactions
        .filter((transaction) => transaction.isExpense && transaction.category === category)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      return totalSpent > threshold;
    },
    getMessage: (category: string, amount: number, threshold: number) => ({
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Budget Alert`,
      description: `You've spent ৳${amount.toFixed(2)} on ${category} this month, which is above your budget of ৳${threshold.toFixed(2)}.`,
      type: 'warning' as const
    })
  },
  {
    type: 'savings_goal',
    check: (transactions: Transaction[], targetSavings: number) => {
      const savings = transactions
        .filter((transaction) => !transaction.isExpense || transaction.category === 'savings')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      const expenses = transactions
        .filter((transaction) => transaction.isExpense && transaction.category !== 'savings')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      return (savings - expenses) >= targetSavings;
    },
    getMessage: (savedAmount: number, targetSavings: number) => ({
      title: 'Savings Goal Achievement',
      description: `Congratulations! You've saved ৳${savedAmount.toFixed(2)} this month, reaching your goal of ৳${targetSavings.toFixed(2)}.`,
      type: 'achievement' as const
    })
  },
  {
    type: 'spending_pattern',
    check: (currentMonthTransactions: Transaction[], previousMonthTransactions: Transaction[], category: string, percentageIncrease: number) => {
      const currentSpent = currentMonthTransactions
        .filter((transaction) => transaction.isExpense && transaction.category === category)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      const previousSpent = previousMonthTransactions
        .filter((transaction) => transaction.isExpense && transaction.category === category)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      if (previousSpent === 0) return false;
      
      const increasePercentage = ((currentSpent - previousSpent) / previousSpent) * 100;
      
      return increasePercentage > percentageIncrease;
    },
    getMessage: (category: string, increasePercentage: number) => ({
      title: `Increased ${category.charAt(0).toUpperCase() + category.slice(1)} Spending`,
      description: `Your spending on ${category} has increased by ${increasePercentage.toFixed(0)}% compared to last month. Consider ways to reduce these expenses.`,
      type: 'warning' as const
    })
  }
];

// Sample financial tips
const FINANCIAL_TIPS = [
  {
    title: 'Emergency Fund',
    description: 'Try to build an emergency fund that covers 3-6 months of expenses to protect against unexpected financial shocks.',
    type: 'tip' as const
  },
  {
    title: '50/30/20 Rule',
    description: 'Consider the 50/30/20 budgeting rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.',
    type: 'tip' as const
  },
  {
    title: 'Automate Savings',
    description: 'Set up automatic transfers to your savings account right after receiving income to build saving habits without thinking about it.',
    type: 'tip' as const
  },
  {
    title: 'Track Small Expenses',
    description: 'Small daily expenses like coffee or snacks can add up significantly over time. Tracking these can reveal surprising saving opportunities.',
    type: 'tip' as const
  },
  {
    title: 'Review Subscriptions',
    description: 'Regularly review your subscriptions and cancel those you don\'t use frequently to reduce recurring expenses.',
    type: 'tip' as const
  }
];

/**
 * Generate financial insights based on transaction history
 * This is a simple implementation that would be replaced with actual AI in production
 */
export const generateFinancialInsights = (
  currentMonthTransactions: Transaction[],
  previousMonthTransactions: Transaction[] = [],
  userPreferences = {
    budgets: {
      food: 500,
      transportation: 200,
      entertainment: 300
    },
    savingsGoal: 1000
  }
) => {
  const insights = [];
  
  // Check budget alerts
  for (const [category, threshold] of Object.entries(userPreferences.budgets)) {
    const totalSpent = currentMonthTransactions
      .filter((transaction) => transaction.isExpense && transaction.category === category)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    if (totalSpent > threshold) {
      insights.push({
        id: `budget_${category}_${Date.now()}`,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Budget Alert`,
        description: `You've spent ৳${totalSpent.toFixed(2)} on ${category} this month, which is above your budget of ৳${threshold}.`,
        type: 'warning' as const,
        date: new Date(),
        isRead: false
      });
    }
  }
  
  // Check savings goal
  const savings = currentMonthTransactions
    .filter((transaction) => !transaction.isExpense || transaction.category === 'savings')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const expenses = currentMonthTransactions
    .filter((transaction) => transaction.isExpense && transaction.category !== 'savings')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const netSavings = savings - expenses;
  
  if (netSavings >= userPreferences.savingsGoal) {
    insights.push({
      id: `savings_goal_${Date.now()}`,
      title: 'Savings Goal Achievement',
      description: `Congratulations! You've saved ৳${netSavings.toFixed(2)} this month, reaching your goal of ৳${userPreferences.savingsGoal}.`,
      type: 'achievement' as const,
      date: new Date(),
      isRead: false
    });
  }
  
  // Check spending patterns (if we have previous month data)
  if (previousMonthTransactions.length > 0) {
    for (const category of Object.keys(userPreferences.budgets)) {
      const currentSpent = currentMonthTransactions
        .filter((transaction) => transaction.isExpense && transaction.category === category)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      const previousSpent = previousMonthTransactions
        .filter((transaction) => transaction.isExpense && transaction.category === category)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      if (previousSpent > 0) {
        const increasePercentage = ((currentSpent - previousSpent) / previousSpent) * 100;
        
        if (increasePercentage > 20) { // 20% increase threshold
          insights.push({
            id: `spending_pattern_${category}_${Date.now()}`,
            title: `Increased ${category.charAt(0).toUpperCase() + category.slice(1)} Spending`,
            description: `Your spending on ${category} has increased by ${increasePercentage.toFixed(0)}% compared to last month. Consider ways to reduce these expenses.`,
            type: 'warning' as const,
            date: new Date(),
            isRead: false
          });
        }
      }
    }
  }
  
  // Add a random financial tip if we have fewer than 3 insights
  if (insights.length < 3) {
    const randomTip = FINANCIAL_TIPS[Math.floor(Math.random() * FINANCIAL_TIPS.length)];
    insights.push({
      id: `tip_${Date.now()}`,
      ...randomTip,
      date: new Date(),
      isRead: false
    });
  }
  
  return insights;
};

/**
 * Get a personalized financial tip
 */
export const getFinancialTip = () => {
  const randomTip = FINANCIAL_TIPS[Math.floor(Math.random() * FINANCIAL_TIPS.length)];
  return randomTip;
};

/**
 * Analyze spending patterns
 */
export const analyzeSpendingPatterns = (transactions: Transaction[]) => {
  // Group transactions by category
  const categorySpendings: Record<string, number> = {};
  
  transactions
    .filter((transaction) => transaction.isExpense)
    .forEach((transaction) => {
      const { category, amount } = transaction;
      if (!categorySpendings[category]) {
        categorySpendings[category] = 0;
      }
      categorySpendings[category] += amount;
    });
  
  // Calculate total spending
  const totalSpending = Object.values(categorySpendings).reduce((sum, amount) => sum + amount, 0);
  
  // Calculate percentages
  const categoryPercentages: Record<string, number> = {};
  for (const [category, amount] of Object.entries(categorySpendings)) {
    categoryPercentages[category] = (amount / totalSpending) * 100;
  }
  
  return {
    categorySpendings,
    categoryPercentages,
    totalSpending
  };
};

/**
 * Generate savings recommendations
 */
export const generateSavingsRecommendations = (
  transactions: Transaction[],
  monthlyIncome: number
) => {
  const { totalSpending } = analyzeSpendingPatterns(transactions);
  
  const currentSavingsRate = ((monthlyIncome - totalSpending) / monthlyIncome) * 100;
  
  let recommendation = '';
  
  if (currentSavingsRate < 0) {
    recommendation = "You're spending more than your income. Try to reduce expenses immediately to avoid debt.";
  } else if (currentSavingsRate < 10) {
    recommendation = "Your current savings rate is below 10%. Consider reducing non-essential expenses to increase your savings.";
  } else if (currentSavingsRate < 20) {
    recommendation = "You're saving between 10-20% of your income. This is good, but aim for 20% for long-term financial security.";
  } else {
    recommendation = "Great job! You're saving over 20% of your income, which puts you on track for financial security.";
  }
  
  return {
    currentSavingsRate,
    recommendation
  };
};

// Export default service object
const aiService = {
  generateFinancialInsights,
  getFinancialTip,
  analyzeSpendingPatterns,
  generateSavingsRecommendations
};

export default aiService;