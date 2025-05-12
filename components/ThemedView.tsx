import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View, ViewProps } from 'react-native';

export function ThemedView({ style, ...props }: ViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View
      style={[
        { backgroundColor: isDark ? Colors.dark.background : Colors.light.background },
        style,
      ]}
      {...props}
    />
  );
}