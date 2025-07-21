import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function VenueDetailsScreen({ route, navigation }: any) {
  const { venue } = route.params;
  console.log('Venue Details:', venue);

  if (!venue) return <Text style={{ padding: 16 }}>Venue not found.</Text>;

  // Placeholder image - in a real app you'd use venue images
  // const venueImage = require('../assets/venue-placeholder.jpg');

  
  return (
    <ScrollView style={styles.container}>
      {venue.images && venue.images.length > 0 ? (
  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
    {venue.images.map((img: {imageUrl:string}, index: number) => (
      console.log('Image URL:', img.imageUrl),
   <Image
   key={index}
   source={{ uri: img.imageUrl }}
   style={styles.venueImage}
   resizeMode="cover"
 />
    ))}
  </ScrollView>
) : (
  <View style={styles.noImageContainer}>
    <Text style={styles.noImageText}>No Images Available</Text>
  </View>
)}

      {/* Main content */}
      <View style={styles.contentContainer}>
        {/* Location with icon */}
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={20} color="#4CAF50" />
          <Text style={styles.location}>{venue.location}, {venue.city}, {venue.state} - {venue.pincode}</Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>{venue.description}</Text>

        {/* Contact section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <MaterialIcons name="contact-phone" size={20} color="#4CAF50" />
            <Text style={styles.sectionHeader}>Contact</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="phone" size={16} color="#4CAF50" />
            <Text style={styles.text}> {venue.contactNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#4CAF50" />
            <Text style={styles.text}> {venue.operationTime}</Text>
          </View>
        </View>

        {/* Amenities section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <MaterialIcons name="star" size={20} color="#4CAF50" />
            <Text style={styles.sectionHeader}>Amenities</Text>
          </View>
          {venue.amenities.map((amenity: string, index: number) => (
            <View key={index} style={styles.infoRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.text}>{amenity}</Text>
            </View>
          ))}
        </View>

        {/* Sports & Prices section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <MaterialIcons name="sports" size={20} color="#4CAF50" />
            <Text style={styles.sectionHeader}>Sports & Prices</Text>
          </View>
          {venue.sportPrices.map((sp: any) => (
            <View key={sp.id} style={styles.priceRow}>
              <Text style={styles.sportText}>{sp.sport}</Text>
              <Text style={styles.priceText}>₹{sp.pricePerHour}/hr</Text>
            </View>
          ))}
        </View>

        {/* Book Now button */}
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.8 : 1 }
          ]} 
          onPress={() => navigation.navigate('Booking', { venue })}
        >
          <Text style={styles.buttonText}>Book Now</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  imageContainer: {
    height: 220,
    justifyContent: 'flex-end',
  },
  venueImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    margin: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  contentContainer: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  location: {
    fontSize: 16,
    color: '#555',
    marginLeft: 6,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 16,
    color: '#333',
  },
  sectionContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginLeft: 6,
  },
  bullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sportText: {
    fontSize: 16,
    color: '#333',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  button: {
    marginTop: 16,
    marginBottom: 30,
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageScroll: {
    height: 220,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
 
  noImageContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    marginBottom: 20,
  },
  noImageText: {
    fontSize: 16,
    color: '#666',
  },
  
});