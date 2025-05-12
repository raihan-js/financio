import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SettingsScreen() {
  const [smsTracking, setSmsTracking] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [aiAdvice, setAiAdvice] = useState(true);
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>
      
      <ScrollView>
        {/* User Profile Section */}
        <ThemedView style={styles.profileSection}>
          <View style={styles.profileIcon}>
            <IconSymbol name="person.crop.circle.fill" size={60} color="#0A7EA4" />
          </View>
          <ThemedText type="defaultSemiBold" style={styles.profileName}>
            Your Name
          </ThemedText>
          <ThemedText style={styles.profileEmail}>
            your.email@example.com
          </ThemedText>
        </ThemedView>
        
        {/* App Settings */}
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            App Settings
          </ThemedText>
          
          <ThemedView style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="envelope.fill" size={24} color="#0A7EA4" />
              <ThemedText style={styles.settingText}>Track SMS Transactions</ThemedText>
            </View>
            <Switch
              value={smsTracking}
              onValueChange={setSmsTracking}
              trackColor={{ false: '#CCCCCC', true: '#0A7EA4' }}
            />
          </ThemedView>
          
          <ThemedView style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="moon.fill" size={24} color="#0A7EA4" />
              <ThemedText style={styles.settingText}>Dark Mode</ThemedText>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#CCCCCC', true: '#0A7EA4' }}
            />
          </ThemedView>
          
          <ThemedView style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="bell.fill" size={24} color="#0A7EA4" />
              <ThemedText style={styles.settingText}>Notifications</ThemedText>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#CCCCCC', true: '#0A7EA4' }}
            />
          </ThemedView>
          
          <ThemedView style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="brain" size={24} color="#0A7EA4" />
              <ThemedText style={styles.settingText}>AI Financial Advice</ThemedText>
            </View>
            <Switch
              value={aiAdvice}
              onValueChange={setAiAdvice}
              trackColor={{ false: '#CCCCCC', true: '#0A7EA4' }}
            />
          </ThemedView>
        </ThemedView>
        
        {/* Bank Accounts */}
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Bank Accounts
          </ThemedText>
          
          <Pressable style={styles.bankItem}>
            <View style={styles.bankInfo}>
              <View style={[styles.bankIcon, { backgroundColor: '#4CAF50' }]}>
                <ThemedText style={styles.bankInitial}>D</ThemedText>
              </View>
              <View>
                <ThemedText style={styles.bankName}>DBBL Bank</ThemedText>
                <ThemedText style={styles.bankDetail}>Last synced: Today</ThemedText>
              </View>
            </View>
            <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
          </Pressable>
          
          <Pressable style={styles.bankItem}>
            <View style={styles.bankInfo}>
              <View style={[styles.bankIcon, { backgroundColor: '#2196F3' }]}>
                <ThemedText style={styles.bankInitial}>B</ThemedText>
              </View>
              <View>
                <ThemedText style={styles.bankName}>BRAC Bank</ThemedText>
                <ThemedText style={styles.bankDetail}>Last synced: Yesterday</ThemedText>
              </View>
            </View>
            <IconSymbol name="checkmark.circle.fill" size={24} color="#2196F3" />
          </Pressable>
          
          <Pressable style={styles.addBankButton}>
            <IconSymbol name="plus.circle" size={24} color="#0A7EA4" />
            <ThemedText style={styles.addBankText}>Add New Bank</ThemedText>
          </Pressable>
        </ThemedView>
        
        {/* Categories */}
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Categories
          </ThemedText>
          <Pressable style={styles.menuItem}>
            <ThemedText>Manage Categories</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#AAAAAA" />
          </Pressable>
        </ThemedView>
        
        {/* Data Management */}
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Data Management
          </ThemedText>
          <Pressable style={styles.menuItem}>
            <ThemedText>Export Data</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#AAAAAA" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <ThemedText>Backup Settings</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#AAAAAA" />
          </Pressable>
          <Pressable style={[styles.menuItem, styles.dangerItem]}>
            <ThemedText style={styles.dangerText}>Clear All Data</ThemedText>
          </Pressable>
        </ThemedView>
        
        {/* About */}
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            About
          </ThemedText>
          <Pressable style={styles.menuItem}>
            <ThemedText>Privacy Policy</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#AAAAAA" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <ThemedText>Terms of Service</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#AAAAAA" />
          </Pressable>
          <ThemedText style={styles.versionText}>
            Version 1.0.0
          </ThemedText>
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
  profileSection: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  profileIcon: {
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    marginBottom: 4,
  },
  profileEmail: {
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
  },
  bankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bankName: {
    marginBottom: 4,
  },
  bankDetail: {
    fontSize: 12,
    opacity: 0.7,
  },
  addBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  addBankText: {
    marginLeft: 8,
    color: '#0A7EA4',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#F44336',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.7,
    fontSize: 12,
  },
});