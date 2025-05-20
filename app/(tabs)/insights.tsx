import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy data for expenses by category
const expenseCategories = [
  { id: '1', name: 'Food', amount: 12500, percentage: 35 },
  { id: '2', name: 'Transport', amount: 8000, percentage: 25 },
  { id: '3', name: 'Shopping', amount: 5500, percentage: 15 },
  { id: '4', name: 'Bills', amount: 4500, percentage: 13 },
  { id: '5', name: 'Entertainment', amount: 3000, percentage: 8 },
  { id: '6', name: 'Other', amount: 1500, percentage: 4 },
];

// Time periods for filtering
const timePeriods = ['Week', 'Month', 'Quarter', 'Year'];

export default function InsightsScreen() {
  const [activePeriod, setActivePeriod] = useState('Month');
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>
        
        {/* Time Period Filter */}
        <View style={styles.periodFilter}>
          {timePeriods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                activePeriod === period && styles.activePeriodButton
              ]}
              onPress={() => setActivePeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                activePeriod === period && styles.activePeriodButtonText
              ]}>{period}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryAmount}>৳45,000</Text>
            <View style={styles.summaryTrend}>
              <Ionicons name="arrow-up" size={12} color="#34C759" />
              <Text style={[styles.summaryTrendText, { color: '#34C759' }]}>12%</Text>
            </View>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryAmount}>৳35,000</Text>
            <View style={styles.summaryTrend}>
              <Ionicons name="arrow-down" size={12} color="#FF3B30" />
              <Text style={[styles.summaryTrendText, { color: '#FF3B30' }]}>5%</Text>
            </View>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={styles.summaryAmount}>৳10,000</Text>
            <View style={styles.summaryTrend}>
              <Ionicons name="arrow-up" size={12} color="#34C759" />
              <Text style={[styles.summaryTrendText, { color: '#34C759' }]}>18%</Text>
            </View>
          </View>
        </View>
        
        {/* Expenses by Category */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expenses by Category</Text>
        </View>
        
        <View style={styles.categoryList}>
          {expenseCategories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryAmount}>৳{category.amount.toLocaleString()}</Text>
              </View>
              <View style={styles.categoryBarContainer}>
                <View 
                  style={[styles.categoryBar, { width: `${category.percentage}%` }]} 
                />
              </View>
              <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
            </View>
          ))}
        </View>
        
        {/* Placeholder for future charts */}
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>Monthly Spending Trend</Text>
          <Text style={styles.placeholderMessage}>
            Charts will be implemented in the next update
          </Text>
        </View>
      </ScrollView>
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  periodFilter: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  activePeriodButton: {
    backgroundColor: '#5F67E8',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activePeriodButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTrendText: {
    fontSize: 12,
    marginLeft: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 10,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  categoryList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  categoryBarContainer: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    marginBottom: 4,
  },
  categoryBar: {
    height: '100%',
    backgroundColor: '#5F67E8',
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  chartPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  placeholderMessage: {
    fontSize: 14,
    color: '#666',
  },
});