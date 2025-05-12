import { Colors } from '@/constants/Colors';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  isDark: boolean;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  colors: typeof Colors.light | typeof Colors.dark;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useNativeColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme as ColorScheme || 'light');
  
  // Update the color scheme when the system preference changes
  useEffect(() => {
    if (systemColorScheme) {
      setColorScheme(systemColorScheme as ColorScheme);
    }
  }, [systemColorScheme]);
  
  const isDark = colorScheme === 'dark';
  
  // Get the appropriate colors based on the color scheme
  const colors = isDark ? Colors.dark : Colors.light;
  
  // Toggle between light and dark mode
  const toggleColorScheme = () => {
    setColorScheme(prevScheme => (prevScheme === 'light' ? 'dark' : 'light'));
  };
  
  const value = {
    colorScheme,
    isDark,
    toggleColorScheme,
    setColorScheme,
    colors,
  };
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Hook for using the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}