import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function BookingConfirmationScreen({ route, navigation }: any) {
  const { bookingDetails } = route.params || {};

  const handleGoHome = () => {
    navigation.navigate('Main'); // goes to drawer Home
  };

  const handleViewBookings = () => {
    navigation.navigate('MyBookingScreen'); // navigate to MyBookings screen
  };

  return (
    <View style={styles.container}>
      {/* <Image source={require('../../assets/success.png')} style={styles.image} /> */}

      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.message}>You're all set to play 🎉</Text>

      <View style={styles.card}>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Venue:</Text> {bookingDetails?.venueName || 'N/A'}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Sport:</Text> {bookingDetails?.sport || 'N/A'}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Date:</Text> {bookingDetails?.date || 'N/A'}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Time:</Text> {bookingDetails?.time || 'N/A'}
        </Text>
      </View>

      <Pressable style={styles.button} onPress={handleGoHome}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </Pressable>

      <Pressable style={styles.outlineBtn} onPress={handleViewBookings}>
        <Text style={styles.outlineBtnText}>View My Bookings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f4ea',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 90,
    height: 90,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#2e7d32',
    fontWeight: '800',
  },
  message: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 4,
  },
  detailText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#2e7d32',
    fontSize: 15,
    fontWeight: '600',
  },
});
