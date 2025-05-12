import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Pressable, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Define button styles based on variant
  let buttonStyle: ViewStyle = {};
  let buttonTextStyle: TextStyle = {};
  let iconColor = '#FFFFFF';
  
  // Determine styles based on variant
  switch (variant) {
    case 'primary':
      buttonStyle = {
        backgroundColor: disabled ? (isDark ? '#37474F' : '#BDBDBD') : Colors[colorScheme ?? 'light'].tint,
      };
      buttonTextStyle = {
        color: '#FFFFFF',
      };
      break;
      
    case 'secondary':
      buttonStyle = {
        backgroundColor: disabled 
          ? (isDark ? '#37474F' : '#E0E0E0') 
          : (isDark ? '#424242' : '#EEEEEE'),
      };
      buttonTextStyle = {
        color: disabled 
          ? (isDark ? '#78909C' : '#9E9E9E') 
          : (isDark ? '#FFFFFF' : '#424242'),
      };
      iconColor = isDark ? '#FFFFFF' : '#424242';
      break;
      
    case 'outline':
      buttonStyle = {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled 
          ? (isDark ? '#37474F' : '#E0E0E0') 
          : Colors[colorScheme ?? 'light'].tint,
      };
      buttonTextStyle = {
        color: disabled 
          ? (isDark ? '#78909C' : '#9E9E9E') 
          : Colors[colorScheme ?? 'light'].tint,
      };
      iconColor = Colors[colorScheme ?? 'light'].tint;
      break;
      
    case 'danger':
      buttonStyle = {
        backgroundColor: disabled ? (isDark ? '#5D4037' : '#FFCDD2') : '#F44336',
      };
      buttonTextStyle = {
        color: '#FFFFFF',
      };
      break;
  }
  
  // Determine size styles
  let sizeStyle: ViewStyle = {};
  let textSizeStyle: TextStyle = {};
  let iconSize = 20;
  
  switch (size) {
    case 'small':
      sizeStyle = {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
      };
      textSizeStyle = {
        fontSize: 14,
      };
      iconSize = 16;
      break;
      
    case 'medium':
      sizeStyle = {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
      };
      textSizeStyle = {
        fontSize: 16,
      };
      iconSize = 20;
      break;
      
    case 'large':
      sizeStyle = {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
      };
      textSizeStyle = {
        fontSize: 18,
      };
      iconSize = 24;
      break;
  }
  
  // Full width style
  const widthStyle: ViewStyle = fullWidth 
    ? { width: '100%' } 
    : {};
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        buttonStyle,
        sizeStyle,
        widthStyle,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && iconPosition === 'left' && (
          <IconSymbol 
            name={icon} 
            size={iconSize} 
            color={buttonTextStyle.color || iconColor} 
            style={styles.leftIcon} 
          />
        )}
        
        <ThemedText
          style={[
            styles.text,
            buttonTextStyle,
            textSizeStyle,
            textStyle,
            // Override the themed text color with button text color
            { color: buttonTextStyle.color },
          ]}
        >
          {title}
        </ThemedText>
        
        {icon && iconPosition === 'right' && (
          <IconSymbol 
            name={icon} 
            size={iconSize} 
            color={buttonTextStyle.color || iconColor} 
            style={styles.rightIcon} 
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});