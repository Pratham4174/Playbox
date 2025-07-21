// components/VenueDetailCard.tsx
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

type Props = {
  venue: {
    id: number;
    name: string;
    sport: string;
    location: string;
    images: { id: number; imageUrl: string }[];
  };
};

const VenueDetailCard = ({ venue }: Props) => {
  const renderImage = ({ item }: any) => (
    <Image source={{ uri: item.imageUrl }} style={styles.image} />
  );

  return (
    <View style={styles.card}>
   <Carousel
  loop
  width={width}
  height={200}
  autoPlay={true}
  data={['img1', 'img2']}
  scrollAnimationDuration={1000}
  renderItem={({ index }) => (
    <View style={{ flex: 1, backgroundColor: 'red' }}>
      <Text>{index}</Text>
    </View>
  )}
/>

      <View style={styles.details}>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.info}>📍 {venue.location}</Text>
        <Text style={styles.info}>🏅 {venue.sport}</Text>
      </View>
    </View>
  );
};

export default VenueDetailCard;

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  details: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: '#555',
  },
});
