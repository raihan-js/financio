import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Text, TextProps } from 'react-native';

type TextType = 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'link';

interface ThemedTextProps extends TextProps {
  type?: TextType;
}

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  let textStyle = {};
  
  // Apply text styles based on type
  switch (type) {
    case 'title':
      textStyle = {
        fontSize: 24,
        fontWeight: '700',
      };
      break;
    case 'subtitle':
      textStyle = {
        fontSize: 18,
        fontWeight: '600',
      };
      break;
    case 'defaultSemiBold':
      textStyle = {
        fontSize: 16,
        fontWeight: '600',
      };
      break;
    case 'link':
      textStyle = {
        fontSize: 16,
        color: Colors[colorScheme ?? 'light'].tint,
        textDecorationLine: 'underline',
      };
      break;
    default:
      textStyle = {
        fontSize: 16,
      };
  }
  
  return (
    <Text
      style={[
        { 
          color: isDark ? Colors.dark.text : Colors.light.text 
        },
        textStyle,
        style,
      ]}
      {...props}
    />
  );
}