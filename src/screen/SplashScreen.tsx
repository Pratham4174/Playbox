import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Parallel animations
    Animated.parallel([
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      // Scale up
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      // Slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Rotate
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      // Loading progress (using opacity as a workaround)
      Animated.timing(loadingProgress, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ]).start();

    // Navigate after 3 seconds
    const timeout = setTimeout(() => {
      navigation.replace('PhoneLogin');
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Workaround for animating width
  const loadingBarWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.6] // 60% of screen width
  });

  return (
    <LinearGradient
      colors={['#E8F5E9', '#C8E6C9']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
              { rotate: rotateInterpolate }
            ]
          }
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
        />
      </Animated.View>

      <Animated.Text
        style={[
          styles.text,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        Where FUN meets FITNESS{' '}
        <Text style={styles.brandText}>PlayBox</Text>
      </Animated.Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Loading your sports experience...</Text>
        <View style={styles.loadingBarBackground}>
          <Animated.View style={[
            styles.loadingBar,
            { 
              transform: [{
                translateX: loadingProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-width * 0.6, 0] // Slide from left to right
                })
              }] 
            }
          ]} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 50,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  brandText: {
    fontWeight: '900',
    color: '#1B5E20',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    width: '80%',
    alignItems: 'center',
  },
  footerText: {
    color: '#388E3C',
    fontSize: 14,
    marginBottom: 10,
  },
  loadingBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(46, 139, 87, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBar: {
    position: 'absolute',
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: '#2E8B57',
    borderRadius: 2,
  },
});