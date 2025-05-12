import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ style, variant = 'default', children, ...props }: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  let cardStyle = {};
  
  switch (variant) {
    case 'elevated':
      cardStyle = {
        backgroundColor: isDark ? '#202124' : '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 4,
      };
      break;
    case 'outlined':
      cardStyle = {
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: isDark ? '#414345' : '#E0E0E0',
      };
      break;
    default:
      cardStyle = {
        backgroundColor: isDark ? '#202124' : '#F5F5F5',
        borderRadius: 12,
        padding: 16,
      };
  }
  
  return (
    <View
      style={[styles.card, cardStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
});