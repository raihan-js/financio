import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FinancialInsight } from '@/types';

// Sample insights data
const SAMPLE_INSIGHTS: FinancialInsight[] = [
  {
    id: '1',
    title: 'Monthly Spending Analysis',
    description: 'Your food expenses are 15% higher than last month. Consider cooking more meals at home to reduce costs.',
    type: 'warning',
    date: new Date(),
    isRead: false
  },
  {
    id: '2',
    title: 'Savings Goal Progress',
    description: 'You\'re on track to meet your savings goal this month! Keep going with your current saving habits.',
    type: 'achievement',
    date: new Date(Date.now() - 86400000),
    isRead: true
  },
  {
    id: '3',
    title: 'Budget Management Tip',
    description: 'Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.',
    type: 'tip',
    date: new Date(Date.now() - 172800000),
    isRead: true
  }
];

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [spendingByCategoryData, setSpendingByCategoryData] = useState<{ category: string, amount: number }[]>([]);
  const [monthlySpendingData, setMonthlySpendingData] = useState<{ month: string, amount: number }[]>([]);

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      setInsights(SAMPLE_INSIGHTS);
      
      // Sample data for charts
      setSpendingByCategoryData([
        { category: 'Food', amount: 450 },
        { category: 'Transport', amount: 200 },
        { category: 'Bills', amount: 350 },
        { category: 'Entertainment', amount: 150 },
        { category: 'Shopping', amount: 250 }
      ]);
      
      setMonthlySpendingData([
        { month: 'Jan', amount: 1200 },
        { month: 'Feb', amount: 1350 },
        { month: 'Mar', amount: 1100 },
        { month: 'Apr', amount: 1500 },
        { month: 'May', amount: 1400 }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const getIconForInsightType = (type: 'tip' | 'warning' | 'achievement') => {
    switch (type) {
      case 'tip': return { name: 'lightbulb.fill', color: '#FFC107' };
      case 'warning': return { name: 'exclamationmark.triangle.fill', color: '#F44336' };
      case 'achievement': return { name: 'checkmark.seal.fill', color: '#4CAF50' };
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Financial Insights</ThemedText>
      </ThemedView>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Chart Placeholders */}
        <Card style={styles.chartCard}>
          <ThemedText type="defaultSemiBold">Monthly Spending</ThemedText>
          <View style={styles.chartPlaceholder}>
            {/* This would be replaced with a real chart */}
            <ThemedText style={styles.chartText}>Monthly Spending Chart</ThemedText>
            {monthlySpendingData.map((item, index) => (
              <View key={index} style={styles.chartBarContainer}>
                <ThemedText style={styles.chartLabel}>{item.month}</ThemedText>
                <View 
                  style={[
                    styles.chartBar, 
                    { 
                      height: (item.amount / 1500) * 100, 
                      backgroundColor: index === 4 ? '#0A7EA4' : (isDark ? '#555555' : '#CCCCCC')
                    }
                  ]} 
                />
                <ThemedText style={styles.chartValue}>
                  ৳{item.amount}
                </ThemedText>
              </View>
            ))}
          </View>
          <ThemedText style={styles.chartCaption}>
            Your spending has decreased slightly compared to last month
          </ThemedText>
        </Card>
        
        <Card style={styles.chartCard}>
          <ThemedText type="defaultSemiBold">Spending by Category</ThemedText>
          <View style={styles.chartPlaceholder}>
            {/* This would be replaced with a real pie chart */}
            <ThemedText style={styles.chartText}>Category Breakdown</ThemedText>
            <View style={styles.pieChartPlaceholder}>
              {spendingByCategoryData.map((item, index) => (
                <View key={index} style={styles.categoryRow}>
                  <View 
                    style={[
                      styles.categoryColor, 
                      { 
                        backgroundColor: [
                          '#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0'
                        ][index % 5] 
                      }
                    ]} 
                  />
                  <ThemedText style={styles.categoryName}>{item.category}</ThemedText>
                  <ThemedText style={styles.categoryAmount}>
                    ৳{item.amount}
                  </ThemedText>
                  <ThemedText style={styles.categoryPercentage}>
                    {Math.round((item.amount / 1400) * 100)}%
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </Card>
        
        {/* AI Insights List */}
        <ThemedView style={styles.insightsContainer}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            AI Financial Advisor
          </ThemedText>
          
          {loading ? (
            <ThemedText style={styles.centerText}>Loading insights...</ThemedText>
          ) : insights.length > 0 ? (
            insights.map(insight => {
              const icon = getIconForInsightType(insight.type);
              return (
                <Pressable 
                  key={insight.id}
                  style={[
                    styles.insightCard, 
                    !insight.isRead && styles.unreadInsight,
                    isDark && styles.insightCardDark
                  ]}
                  onPress={() => {
                    // Mark as read logic would go here
                    setInsights(insights.map(item => 
                      item.id === insight.id 
                        ? { ...item, isRead: true } 
                        : item
                    ));
                  }}
                >
                  <View style={styles.insightHeader}>
                    <View style={styles.insightIconContainer}>
                      <IconSymbol name={icon.name} size={24} color={icon.color} />
                    </View>
                    <View style={styles.insightTextContainer}>
                      <ThemedText type="defaultSemiBold" style={styles.insightTitle}>
                        {insight.title}
                      </ThemedText>
                      <ThemedText style={styles.insightDescription}>
                        {insight.description}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.insightDate}>
                    {insight.date.toLocaleDateString()}
                  </ThemedText>
                </Pressable>
              );
            })
          ) : (
            <ThemedText style={styles.centerText}>No insights available.</ThemedText>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chartCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  chartPlaceholder: {
    height: 200,
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  chartText: {
    position: 'absolute',
    opacity: 0.5,
  },
  chartCaption: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  insightsContainer: {
    padding: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  insightCard: {
    padding: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  insightCardDark: {
    borderColor: '#333333',
  },
  unreadInsight: {
    borderLeftWidth: 4,
    borderLeftColor: '#0A7EA4',
  },
  insightHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  insightIconContainer: {
    marginRight: 12,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  insightDate: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'right',
    marginTop: 8,
  },
  centerText: {
    textAlign: 'center',
    marginTop: 20,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 20,
    backgroundColor: '#CCCCCC',
    marginBottom: 5,
  },
  chartLabel: {
    fontSize: 12,
    position: 'absolute',
    bottom: 0,
  },
  chartValue: {
    fontSize: 10,
    position: 'absolute',
    top: 10,
  },
  pieChartPlaceholder: {
    width: '100%',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
  },
  categoryAmount: {
    marginRight: 8,
  },
  categoryPercentage: {
    width: 40,
    textAlign: 'right',
  }
});