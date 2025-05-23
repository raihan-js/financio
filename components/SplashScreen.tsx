import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    View
} from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const titleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const gradientOpacity = useSharedValue(0);
  const particleAnimations = useRef(
    Array.from({ length: 12 }, () => ({
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      scale: useSharedValue(0),
      opacity: useSharedValue(0),
    }))
  ).current;

  // Start animation sequence
  useEffect(() => {
    const startAnimation = () => {
      // Background gradient fade in
      gradientOpacity.value = withTiming(1, { duration: 800 });

      // Logo entrance with bounce
      logoScale.value = withDelay(
        300,
        withSequence(
          withSpring(1.2, { damping: 8, stiffness: 100 }),
          withSpring(1, { damping: 12, stiffness: 150 })
        )
      );

      logoOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));

      // Logo subtle rotation
      logoRotation.value = withDelay(
        800,
        withSequence(
          withTiming(5, { duration: 200 }),
          withTiming(-5, { duration: 400 }),
          withTiming(0, { duration: 200 })
        )
      );

      // Title slide up
      titleTranslateY.value = withDelay(
        1000,
        withSpring(0, { damping: 15, stiffness: 150 })
      );
      titleOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));

      // Subtitle slide up
      subtitleTranslateY.value = withDelay(
        1200,
        withSpring(0, { damping: 15, stiffness: 150 })
      );
      subtitleOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));

      // Animated particles
      particleAnimations.forEach((particle, index) => {
        const delay = 1400 + index * 100;
        const angle = (index * 30) * (Math.PI / 180);
        const radius = 120 + Math.random() * 60;
        
        particle.translateX.value = withDelay(
          delay,
          withSequence(
            withTiming(Math.cos(angle) * radius, { 
              duration: 1000,
              easing: Easing.out(Easing.quad) 
            }),
            withTiming(Math.cos(angle) * (radius + 20), { 
              duration: 500,
              easing: Easing.inOut(Easing.quad) 
            })
          )
        );
        
        particle.translateY.value = withDelay(
          delay,
          withSequence(
            withTiming(Math.sin(angle) * radius, { 
              duration: 1000,
              easing: Easing.out(Easing.quad) 
            }),
            withTiming(Math.sin(angle) * (radius + 20), { 
              duration: 500,
              easing: Easing.inOut(Easing.quad) 
            })
          )
        );
        
        particle.scale.value = withDelay(
          delay,
          withSequence(
            withTiming(1, { duration: 300 }),
            withTiming(0.8, { duration: 700 }),
            withTiming(0, { duration: 500 })
          )
        );
        
        particle.opacity.value = withDelay(
          delay,
          withSequence(
            withTiming(0.8, { duration: 300 }),
            withTiming(0.6, { duration: 700 }),
            withTiming(0, { duration: 500 })
          )
        );
      });

      // Complete animation after delay
      setTimeout(() => {
        // Fade out everything
        logoOpacity.value = withTiming(0, { duration: 500 });
        titleOpacity.value = withTiming(0, { duration: 500 });
        subtitleOpacity.value = withTiming(0, { duration: 500 });
        gradientOpacity.value = withTiming(0, { 
          duration: 500,
        }, () => {
          runOnJS(onAnimationComplete)();
        });
      }, 3500);
    };

    startAnimation();
  }, []);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: logoScale.value },
        { rotate: `${logoRotation.value}deg` }
      ],
      opacity: logoOpacity.value,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: titleTranslateY.value }],
      opacity: titleOpacity.value,
    };
  });

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: subtitleTranslateY.value }],
      opacity: subtitleOpacity.value,
    };
  });

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: gradientOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Animated Background Gradient */}
      <Animated.View style={[styles.gradientContainer, gradientAnimatedStyle]}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Animated Particles */}
      {particleAnimations.map((particle, index) => {
        const particleStyle = useAnimatedStyle(() => ({
          transform: [
            { translateX: particle.translateX.value },
            { translateY: particle.translateY.value },
            { scale: particle.scale.value },
          ],
          opacity: particle.opacity.value,
        }));

        return (
          <Animated.View
            key={index}
            style={[styles.particle, particleStyle]}
          >
            <View style={[
              styles.particleInner,
              { backgroundColor: index % 2 === 0 ? '#fff' : '#FFD700' }
            ]} />
          </Animated.View>
        );
      })}

      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
          <View style={styles.logoBackground}>
            <Ionicons name="wallet" size={60} color="#fff" />
          </View>
          <View style={styles.logoGlow} />
        </Animated.View>
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          Spendly
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          Smart Expense Tracking
        </Animated.Text>
      </View>

      {/* Floating Elements */}
      <View style={styles.floatingElements}>
        <Animated.View style={[styles.floatingIcon, styles.floatingIcon1]}>
          <Ionicons name="card" size={24} color="rgba(255,255,255,0.3)" />
        </Animated.View>
        <Animated.View style={[styles.floatingIcon, styles.floatingIcon2]}>
          <Ionicons name="trending-up" size={20} color="rgba(255,255,255,0.25)" />
        </Animated.View>
        <Animated.View style={[styles.floatingIcon, styles.floatingIcon3]}>
          <Ionicons name="pie-chart" size={22} color="rgba(255,255,255,0.2)" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -10,
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: height / 2,
    left: width / 2,
  },
  particleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingIcon: {
    position: 'absolute',
  },
  floatingIcon1: {
    top: height * 0.15,
    left: width * 0.1,
  },
  floatingIcon2: {
    top: height * 0.25,
    right: width * 0.15,
  },
  floatingIcon3: {
    bottom: height * 0.2,
    left: width * 0.2,
  },
});