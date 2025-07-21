import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';

interface Booking {
  id: number;
  venue: string;
  date: string;   // ISO format e.g., "2025-07-20"
  time: string;   // e.g., "10:00 AM - 11:00 AM"
}

export default function ViewBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const dummyBookings: Booking[] = [
      { id: 1, venue: 'Green Court', date: '2025-07-19', time: '10:00 AM - 11:00 AM' },
      { id: 2, venue: 'City Arena', date: '2025-07-20', time: '5:00 PM - 6:00 PM' },
    ];
    setBookings(dummyBookings);
  }, []);

  const renderItem: ListRenderItem<Booking> = ({ item }) => (
    <View style={styles.bookingCard}>
      <Text style={styles.venue}>{item.venue}</Text>
      <Text style={styles.meta}>{item.date} • {item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#e6f4ea' },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: '#1b5e20' },
  bookingCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  venue: { fontSize: 18, fontWeight: '600', color: '#2e7d32' },
  meta: { fontSize: 14, color: '#444' },
});
