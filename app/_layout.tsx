import SplashScreen from '@/components/SplashScreen';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootNavigator() {
  const { isOnboarded, isLoading } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);

  // Hide splash screen after animation completes
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen while loading or if explicitly shown
  if (showSplash || isLoading) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isOnboarded ? (
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // You can add custom fonts here if needed
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}