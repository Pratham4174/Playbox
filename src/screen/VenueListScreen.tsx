import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import VenueDetailCard from '../Components/VenueDetailCard';

type Venue = {
    id: number;
    name: string;
    location: string;
    sport: string;
    images: { id: number; imageUrl: string }[];
  };
const VenueListScreen = () => {
const [venues, setVenues] = useState<Venue[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch('http://192.168.1.11:8090/api/venues');
        const data = await response.json();
        setVenues(data);
      } catch (err) {
        Alert.alert('Error', 'Failed to load venues from backend.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={venues}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <VenueDetailCard venue={item} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default VenueListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
