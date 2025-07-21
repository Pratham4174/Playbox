import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useUser } from '../context/UserContext';

export default function ArenaOtpVerificationScreen({ route, navigation }: any) {
  const [otp, setOtp] = useState('');
  const { phoneNumber } = route.params;
  const { setUser } = useUser();

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch('http://localhost:8092/api/arena-owners/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otp,
        }),
      });

      const text = await response.text();

      if (response.ok) {
        console.log('✅ Arena Owner OTP verified successfully');

        setUser({
          phoneNumber,
          name: '',
          role: 'OWNER', // 👈 Use distinct role
          verified: true,
        });

        // Fetch owner details
        const userResponse = await fetch(`http://localhost:8092/api/arena-owners/by-phone?phoneNumber=${phoneNumber}`);
        const userData = await userResponse.json();

        const userId = userData?.id;
        if (!userId) throw new Error('Arena Owner ID not found');

        await AsyncStorage.setItem('ownerId', userId.toString());
        await AsyncStorage.setItem('arenaUserName', userData.name || '');
        await AsyncStorage.setItem('arenaUser', JSON.stringify(userData));

        const nextScreen = !userData.name || userData.name.trim() === ''
          ? 'ArenaSetup'
          : 'ArenaDashboard';

        navigation.replace(nextScreen, { phoneNumber });
      } else {
        console.warn('❌ OTP verification failed:', text);
        alert('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch('http://localhost:8080/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const text = await response.text();
      if (response.ok) {
        alert('OTP resent successfully');
        console.log('📨 OTP resent:', text);
      } else {
        alert('Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      alert('Something went wrong while resending OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>🏟️ Arena OTP Verification</Text>
          <Text style={styles.subText}>
            Enter the OTP sent to:
            {'\n'}<Text style={styles.phoneHighlight}>+91 {phoneNumber}</Text>
          </Text>

          <TextInput
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter OTP"
            placeholderTextColor="#aaa"
          />

          <Pressable
            onPress={handleVerifyOtp}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Verify & Proceed</Text>
          </Pressable>

          <Pressable onPress={handleResend} style={styles.resend}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#e6f4ea',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1b5e20',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  phoneHighlight: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  otpInput: {
    letterSpacing: 24,
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderColor: '#ccc',
    paddingVertical: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resend: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#2e7d32',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
