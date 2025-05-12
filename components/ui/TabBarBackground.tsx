import { useColorScheme } from '@/hooks/useColorScheme';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={80}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 85, // Adjust based on your tab bar height
        }}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
      />
    );
  }
  
  // For Android, return a simple View with background color
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60, // Adjust based on your tab bar height
        backgroundColor: colorScheme === 'dark' ? '#151718' : '#ffffff',
        borderTopWidth: 1,
        borderTopColor: colorScheme === 'dark' ? '#2C2C2C' : '#E0E0E0',
      }}
    />
  );
}