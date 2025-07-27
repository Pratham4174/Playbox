import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function PhoneLoginScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isArenaOwner, setIsArenaOwner] = useState(false); 
  const phoneInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleGetOtp = async () => {
    if (phoneNumber.length !== 10) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        })
      ]).start();
      return;
    }
  
    try {
      // Button press animation
      await Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
  
      // API call
      const endpoint = isAdmin 
        ? 'http://192.168.1.11:8092/api/arena-owners/send-otp' 
        : 'http://192.168.1.11:8080/auth/send-otp';
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phoneNumber }),
      });
  
      const data = await response.text(); 
  
      if (response.ok) {
        console.log('OTP Sent:', data);
  
        navigation.navigate(isAdmin? 'ArenaOTP' : 'OtpVerification', {
          phoneNumber,
        });
      } else {
        alert(data || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP error:', error);
      alert('Something went wrong while sending OTP');
    }
  };

  return (
    <LinearGradient 
      colors={['#E8F5E9', '#C8E6C9']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <Animated.ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')} // Make sure this path is correct
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Welcome to <Text style={styles.brand}>PlayBox</Text>
          </Text>
          <Text style={styles.subtitle}>
            {isAdmin ? 'Manage your sports arena' : 'Book, Play, Repeat'}
          </Text>

          {/* Role Toggle */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                !isAdmin && styles.activeRoleButton
              ]}
              onPress={() => setIsAdmin(false)}
            >
              <Ionicons 
                name="person" 
                size={20} 
                color={!isAdmin ? '#FFF' : '#7DBE7D'} 
              />
              <Text style={[
                styles.roleText,
                !isAdmin && styles.activeRoleText
              ]}>
                Player
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                isAdmin && styles.activeRoleButton
              ]}
              onPress={() => setIsAdmin(true)}
            >
              <Ionicons 
                name="business" 
                size={20} 
                color={isAdmin ? '#FFF' : '#7DBE7D'} 
              />
              <Text style={[
                styles.roleText,
                isAdmin && styles.activeRoleText
              ]}>
                Arena Owner
              </Text>
            </TouchableOpacity>
          </View>

          {/* Phone Input */}
          <View style={[
            styles.inputContainer,
            isFocused && styles.inputFocused
          ]}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
  style={styles.input}
  placeholder="Enter phone number"
  placeholderTextColor="#A0A0A0"
  keyboardType="phone-pad"
  value={phoneNumber}
  onChangeText={(text) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleanedText);
    if (cleanedText.length === 10) {
      Keyboard.dismiss();
      phoneInputRef.current?.blur(); // Optional: explicitly blur the input
    }
  }}
  maxLength={10}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
  autoFocus={true}
  ref={phoneInputRef} // Proper ref assignment
/>  

    {phoneNumber ? (
              <TouchableOpacity 
                onPress={() => setPhoneNumber('')}
                style={styles.clearButton}
              >
                <MaterialIcons name="close" size={20} color="#A0A0A0" />
              </TouchableOpacity>
            ) : (
              <MaterialIcons name="phone-iphone" size={20} color="#A0A0A0" />
            )}
          </View>

          {/* Continue Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
              style={[
                styles.button,
                phoneNumber.length !== 10 && styles.buttonDisabled
              ]}
              onPress={handleGetOtp}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#2E8B57', '#2E8B57']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Continue with OTP</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Skip Option */}
          {!isAdmin && (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.skipText}>Explore as guest</Text>
            </TouchableOpacity>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>By continuing, you agree to our</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms & Conditions</Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 100 : 0,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: height * 0.05,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 36,
  },
  brand: {
    color: '#1B5E20',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(125, 190, 125, 0.1)',
    borderRadius: 12,
    padding: 6,
    marginBottom: 32,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeRoleButton: {
    backgroundColor: '#2E8B57',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7DBE7D',
    marginLeft: 8,
  },
  activeRoleText: {
    color: '#FFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputFocused: {
    borderWidth: 1,
    borderColor: '#7DBE7D',
    shadowColor: '#7DBE7D',
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  clearButton: {
    padding: 4,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#7DBE7D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  skipButton: {
    alignItems: 'center',
    padding: 12,
  },
  skipText: {
    color: '#7DBE7D',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
  footerLink: {
    fontSize: 12,
    color: '#7DBE7D',
    fontWeight: '600',
    marginTop: 4,
  },
});