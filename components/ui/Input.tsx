import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isFocused, setIsFocused] = useState(false);
  
  const borderColor = error
    ? '#F44336'
    : isFocused
      ? Colors[colorScheme ?? 'light'].tint
      : isDark ? '#414345' : '#E0E0E0';
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText style={styles.label}>{label}</ThemedText>
      )}
      
      <View style={[
        styles.inputContainer,
        { borderColor },
        isFocused && styles.focused
      ]}>
        {leftIcon && (
          <IconSymbol
            name={leftIcon}
            size={20}
            color={isDark ? '#9BA1A6' : '#687076'}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            {
              color: isDark ? '#ECEDEE' : '#11181C',
              paddingLeft: leftIcon ? 0 : 12
            },
            style
          ]}
          placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && (
          <IconSymbol
            name={rightIcon}
            size={20}
            color={isDark ? '#9BA1A6' : '#687076'}
            style={[
              styles.rightIcon,
              onRightIconPress && styles.touchableIcon
            ]}
            onPress={onRightIconPress}
          />
        )}
      </View>
      
      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  focused: {
    borderWidth: 2,
  },
  leftIcon: {
    paddingLeft: 12,
    paddingRight: 0,
  },
  rightIcon: {
    paddingRight: 12,
  },
  touchableIcon: {
    padding: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
});