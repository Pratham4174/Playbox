import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Booking = {
  id: number;
  venueName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        alert('You must be logged in to view bookings');
        return;
      }

      const response = await fetch(`http://192.168.1.11:8091/api/bookings/user/${userId}`);
      const data = await response.json();

      const now = new Date();

      const upcoming = data.filter((b: Booking) => new Date(b.endTime) > now);
      const past = data.filter((b: Booking) => new Date(b.endTime) <= now);

      // Optional: Sort both lists by start time
      upcoming.sort((a: Booking, b: Booking) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      past.sort((a: Booking, b: Booking) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

      setBookings([...upcoming, ...past]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatus = (booking: Booking) => {
    const now = new Date();
    const bookingEnd = new Date(booking.endTime);
    return now < bookingEnd ? 'Upcoming' : 'Completed';
  };

  const formatTimeRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);

    const format = (d: Date) =>
      `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    return `${format(start)} - ${format(end)}`;
  };

  return (
    <View style={styles.wrapper}>
      {/* <Text style={styles.title}>My Bookings</Text> */}

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" />
      ) : bookings.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#555' }}>
          No bookings found.
        </Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const status = getStatus(item);
            const bookingDate = new Date(item.startTime);
            const timeRange = formatTimeRange(item.startTime, item.endTime);
            const isUpcoming = status === 'Upcoming';

            return (
              <View
                style={[
                  styles.card,
                  isUpcoming ? styles.cardActive : styles.cardInactive,
                ]}
              >
                <Text style={[styles.venue, isUpcoming && styles.venueActive]}>
                  {item.venueName}
                </Text>
                <Text style={styles.datetime}>
                  {bookingDate.toDateString()} | {timeRange}
                </Text>
                <Text
                  style={[
                    styles.status,
                    isUpcoming ? styles.upcoming : styles.completed,
                  ]}
                >
                  {status}
                </Text>
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#e6f4ea',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  venue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e7d32',
  },
  datetime: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  upcoming: {
    color: '#007BFF',
  },
  completed: {
    color: '#999',
  },
  cardActive: {
    backgroundColor: '#e0f7e9',
    borderColor: '#2e7d32',
    borderWidth: 1.2,
  },
  cardInactive: {
    backgroundColor: '#f4f4f4',
  },
  venueActive: {
    fontWeight: 'bold',
    color: '#1b5e20',
  },
});
