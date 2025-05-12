// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, Pressable, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chart.bar.fill': 'bar-chart',
  'lightbulb.fill': 'lightbulb',
  'gear': 'settings',
  'plus': 'add',
  'xmark': 'close',
  'plus.circle': 'add-circle-outline',
  'plus.circle.fill': 'add-circle',
  'minus.circle.fill': 'remove-circle',
  'person.circle': 'person',
  'person.circle.fill': 'person',
  'person.crop.circle.fill': 'person',
  'arrow.down': 'arrow-downward',
  'arrow.up': 'arrow-upward',
  'arrow.down.circle.fill': 'arrow-downward',
  'calendar': 'calendar-today',
  'chevron.down': 'arrow-drop-down',
  'exclamationmark.triangle.fill': 'warning',
  'checkmark.seal.fill': 'verified',
  'checkmark.circle.fill': 'check-circle',
  'envelope.fill': 'email',
  'moon.fill': 'dark-mode',
  'bell.fill': 'notifications',
  'brain': 'psychology',
  'fork.knife': 'restaurant',
  'car.fill': 'directions-car',
  'bag.fill': 'shopping-bag',
  'newspaper.fill': 'receipt',
  'film.fill': 'movie',
  'heart.fill': 'favorite',
  'book.fill': 'book',
  'banknote.fill': 'account-balance',
  'ellipsis.circle.fill': 'more-horiz',
  'trash': 'delete',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
  onPress,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
  onPress?: () => void;
}) {
  // Check if the name exists in the mapping
  const materialName = MAPPING[name] || 'help-outline'; // Fallback icon if no mapping found
  
  // If onPress is provided, wrap the icon in a Pressable
  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        <MaterialIcons color={color} size={size} name={materialName} style={style} />
      </Pressable>
    );
  }
  
  // Otherwise, just return the icon
  return <MaterialIcons color={color} size={size} name={materialName} style={style} />;
}