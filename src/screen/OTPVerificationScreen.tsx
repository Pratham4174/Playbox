import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

export default function OtpVerificationScreen({ route, navigation }: any) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);
  const { phoneNumber, isArenaOwner = false } = route.params;
  const { setUser } = useUser();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      triggerShake();
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otp: otpString,
        }),
      });

      const text = await response.text();

      if (response.ok) {
        console.log('✅ OTP verified successfully');
        handleSuccess();
      } else {
        console.warn('❌ OTP verification failed:', text);
        triggerShake();
        Alert.alert('Invalid OTP', 'Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleSuccess = async () => {
    setUser({
      phoneNumber,
      name: '',
      role: isArenaOwner ? 'OWNER' : 'PLAYER',
      verified: true,
    });

    const userResponse = await fetch(`http://localhost:8080/auth/user?phone=${phoneNumber}`);
    const userData = await userResponse.json();

    const userId = userData?.id;
    if (!userId) throw new Error('User ID not found in response');

    await AsyncStorage.setItem('userId', userId.toString());
    await AsyncStorage.setItem('userName', userData.name || '');

    if (!userData.name || userData.name.trim() === '') {
      navigation.replace('UserSetup', { phoneNumber });
    } else {
      navigation.replace('Main', { phoneNumber });
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleChangeText = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    if (index === 3 && text) {
      handleVerifyOtp();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    console.log('Resend OTP for:', phoneNumber);
    Alert.alert('OTP Resent', 'A new OTP has been sent to your number');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#F5FFF7', '#E6F4EA']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#7DBE7D" />
            </TouchableOpacity>
            <Text style={styles.title}>Verify Your Number</Text>
          </View>

          <Text style={styles.subtitle}>
            We've sent a 4-digit code to {'\n'}
            <Text style={styles.phoneNumber}>{phoneNumber}</Text>
          </Text>

          <Animated.View 
            style={[
              styles.otpContainer,
              { transform: [{ translateX: shakeAnim }] }
            ]}
          >
            {[0, 1, 2, 3].map((i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputs.current[i] = ref; }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={otp[i]}
                onChangeText={(text) => handleChangeText(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                selectTextOnFocus
              />
            ))}
          </Animated.View>

          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={handleVerifyOtp}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#2E8B57', '#2E8B57']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Verify & Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  phoneNumber: {
    color: '#7DBE7D',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFF',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#7DBE7D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#7DBE7D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#666',
    marginRight: 4,
  },
  resendLink: {
    color: '#7DBE7D',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});