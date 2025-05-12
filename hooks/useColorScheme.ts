import { useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

// Export a more reliable hook that defaults to the system preference
export function useColorScheme() {
  const systemColorScheme = useNativeColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme);
  
  // Update colorScheme when system preference changes
  useEffect(() => {
    setColorScheme(systemColorScheme);
  }, [systemColorScheme]);
  
  return colorScheme || 'light'; // Default to light if undefined
}