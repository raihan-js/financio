import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { GestureResponderEvent, Pressable } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const { onPress, ...restProps } = props;
  
  const handlePress = (e: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };
  
  // Extract only the compatible props that Pressable accepts
  // This avoids passing restProps directly, which contains incompatible types
  const {
    // Standard Pressable props
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole,
    accessibilityState,
    accessibilityValue,
    accessible,
    children,
    delayLongPress,
    disabled,
    hitSlop,
    style,
    testID,
    // Navigation-specific props we can safely ignore
    // Add other props as needed
    ...otherProps
  } = restProps;

  // Return Pressable with only compatible props
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityValue={accessibilityValue}
      accessible={accessible}
      delayLongPress={delayLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={style}
      testID={testID}
      onPress={handlePress}
    >
      {children}
    </Pressable>
  );
}