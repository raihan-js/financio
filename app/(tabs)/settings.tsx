import { useAppContext } from '@/context/AppContext';
import { clearAllData } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { settings, updateSettings, userProfile, updateUserProfile, refreshData, syncSMS } = useAppContext();
  
  const handleSyncSMS = async () => {
    try {
      const result = await syncSMS();
      if (result.success) {
        Alert.alert(
          'SMS Sync Complete', 
          `Found and processed ${result.count} new transactions from your SMS messages.`
        );
      } else {
        Alert.alert('Sync Failed', result.error || 'Unable to sync SMS messages');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sync SMS messages');
    }
  };
  
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await refreshData();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userProfile?.name ? userProfile.name[0] : 'U'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{userProfile?.email || 'No email set'}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil-outline" size={20} color="#5F67E8" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#F0F1FE' }]}>
                  <Ionicons name="mail-outline" size={20} color="#5F67E8" />
                </View>
                <Text style={styles.settingLabel}>SMS Reading</Text>
              </View>
              <Switch
                value={settings.smsReaderEnabled}
                onValueChange={(value) => updateSettings({ smsReaderEnabled: value })}
                trackColor={{ false: '#CCCCCC', true: '#5F67E8' }}
                thumbColor={'#FFFFFF'}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleSyncSMS}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#E8F5E8' }]}>
                  <Ionicons name="sync-outline" size={20} color="#34C759" />
                </View>
                <Text style={styles.settingLabel}>Sync SMS Now</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#F0F1FE' }]}>
                  <Ionicons name="notifications-outline" size={20} color="#5F67E8" />
                </View>
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
                trackColor={{ false: '#CCCCCC', true: '#5F67E8' }}
                thumbColor={'#FFFFFF'}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#F0F1FE' }]}>
                  <Ionicons name="cash-outline" size={20} color="#5F67E8" />
                </View>
                <Text style={styles.settingLabel}>Currency</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{settings.currency}</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleClearData}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#FFE8E8' }]}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </View>
                <Text style={styles.settingLabel}>Clear Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#E8F8FF' }]}>
                  <Ionicons name="information-circle-outline" size={20} color="#0A84FF" />
                </View>
                <Text style={styles.settingLabel}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#FFF0E8' }]}>
                  <Ionicons name="log-out-outline" size={20} color="#FF9500" />
                </View>
                <Text style={styles.settingLabel}>Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.appVersion}>Spendly v1.0.0</Text>
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5F67E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F1FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 16,
  },
  appVersion: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 16,
  },
});