import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function UserSetupScreen({ navigation, route }: any) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const { phoneNumber } = route.params; // assuming phone number is needed

  const handleContinue = async () => {
    try {
      const response = await fetch('http://192.168.1.8:8080/auth/setup', { // use your actual IP instead of 192.168.1.5
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phoneNumber, // only send what's needed
        }),
      });
  
      if (response.ok) {
        console.log('Profile setup successful');
        navigation.replace('Main', { phoneNumber });
      } else {
        const errorText = await response.text();
        console.warn('Profile setup failed:', errorText);
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error during profile setup:', error);
      alert('Failed to update profile.');
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brandContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.brandTitle}>PlayBox</Text>
          <Text style={styles.tagline}>
            FIND PLAYERS & VENUES NEARBY
          </Text>
          <Text style={styles.description}>
            Seamlessly explore sports venues and play with enthusiasts just like you!
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Set Up Your Profile</Text>

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            placeholder="Enter full name"
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Your Location</Text>
          <TextInput
            placeholder="e.g. Mumbai"
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#999"
          />

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: '#e6f4ea', // light green
    },
    container: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    brandContainer: {
      alignItems: 'center',
      marginVertical: 24,
    },
    logo: {
      width: 72,
      height: 72,
      resizeMode: 'contain',
      marginBottom: 10,
    },
    brandTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: '#2e7d32',
    },
    tagline: {
      fontSize: 16,
      fontWeight: '600',
      color: '#388e3c',
      marginTop: 6,
      textAlign: 'center',
    },
    description: {
      fontSize: 14,
      color: '#444',
      textAlign: 'center',
      paddingHorizontal: 20,
      marginTop: 8,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 24,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 3,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: '#2e7d32',
      textAlign: 'center',
      marginBottom: 16,
    },
    label: {
      fontSize: 15,
      fontWeight: '500',
      color: '#111',
      marginTop: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 14,
      fontSize: 15,
      backgroundColor: '#fff',
      color: '#000',
      marginTop: 6,
    },
    button: {
      backgroundColor: '#2e7d32',
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 24,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
  