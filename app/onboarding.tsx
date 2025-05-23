import { useAppContext } from '@/context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const { updateUserProfile, addTransaction } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [bankName, setBankName] = useState('');
  const [smsFormat, setSmsFormat] = useState('');

  const handleNext = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        Alert.alert('Required', 'Please enter your name');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!initialBalance || isNaN(Number(initialBalance)) || Number(initialBalance) < 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid initial balance');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      // Save user profile
      await updateUserProfile({
        name: name.trim(),
        email: '',
        bankName: bankName.trim(),
        smsFormat: smsFormat.trim(),
      });

      // Add initial balance as income transaction if provided
      if (initialBalance && Number(initialBalance) > 0) {
        await addTransaction({
          amount: Number(initialBalance),
          type: 'income',
          description: 'Initial Balance',
          category: 'Income',
          date: new Date().toISOString(),
          source: 'manual',
        });
      }

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    }
  };

  const handleSkipBank = () => {
    setBankName('');
    setSmsFormat('');
    handleComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentStep / 3) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>Step {currentStep} of 3</Text>
          </View>

          {/* Welcome Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeTitle}>
              {currentStep === 1 && "Welcome to Spendly! 👋"}
              {currentStep === 2 && "Let's set up your balance 💰"}
              {currentStep === 3 && "Bank SMS Setup 📱"}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {currentStep === 1 && "Let's get to know you better"}
              {currentStep === 2 && "What's your current financial position?"}
              {currentStep === 3 && "Help us read your bank SMS automatically"}
            </Text>
          </View>

          {/* Step Content */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>What should we call you?</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={handleNext}
                />
              </View>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Balance</Text>
                <Text style={styles.inputHint}>
                  Enter your current total money across all accounts
                </Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>৳</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={initialBalance}
                    onChangeText={setInitialBalance}
                    returnKeyType="next"
                    onSubmitEditing={handleNext}
                  />
                </View>
              </View>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bank Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Dutch Bangla Bank, BRAC Bank"
                  value={bankName}
                  onChangeText={setBankName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>SMS Format Example</Text>
                <Text style={styles.inputHint}>
                  Paste a sample SMS from your bank to help us parse transactions
                </Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  placeholder="Your A/C (***3766) has been debited BDT 3,060.00. Avl Bal: BDT 3,04,017.61 @ 07:58 PM. For query: 16419"
                  value={smsFormat}
                  onChangeText={setSmsFormat}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity style={styles.skipButton} onPress={handleSkipBank}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Ionicons name="arrow-back" size={20} color="#5F67E8" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.nextButton, currentStep === 1 && { flex: 1 }]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === 3 ? 'Get Started' : 'Next'}
              </Text>
              {currentStep < 3 && (
                <Ionicons name="arrow-forward" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5F67E8',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepContainer: {
    flex: 1,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencySymbol: {
    fontSize: 24,
    color: '#333',
    marginRight: 8,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    paddingVertical: 16,
    color: '#333',
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5F67E8',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5F67E8',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5F67E8',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});