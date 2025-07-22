import { Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define TypeScript interfaces
interface SportPrice {
  id: string;
  sport: string;
  pricePerHour: number;
}

interface VenueImage {
  imageUrl: string;
}

interface Venue {
  id: string;
  name: string;
  images: VenueImage[];
  location: string;
  city: string;
  state: string;
  pincode: string;
  description: string;
  contactNumber: string;
  operationTime: string;
  amenities: string[];
  sportPrices: SportPrice[];
  rating?: number;
  reviewCount?: number;
  totalGames?: number;
  upcomingEvents?: number;
  offers?: {
    title: string;
    description: string;
  }[];
}

//  export type RootStackParamList = {
//     VenueDetails: { venue: Venue };
//     Map: { address: string };
//     RateVenue: { venueId: string };
//     SportDetails: { sport: SportPrice };
//     Booking: { venue: Venue };
//     // ... other screens
//   };

//   type VenueDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'VenueDetails'>;

const VenueDetailsScreen = ({ route, navigation }: any) => {
  const { venue } = route.params;
  console.log('Venue Details:', venue);

  if (!venue) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Venue not found.</Text>
      </View>
    );
  }

  // Helper function to render stars
  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FontAwesome key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FontAwesome key={i} name="star-half-o" size={16} color="#FFD700" />);
      } else {
        stars.push(<FontAwesome key={i} name="star-o" size={16} color="#FFD700" />);
      }
    }
    return stars;
  };

  // Group amenities into columns
  const groupAmenities = (amenities: string[], columns: number = 3) => {
    const result = [];
    const itemsPerColumn = Math.ceil(amenities.length / columns);
    
    for (let i = 0; i < columns; i++) {
      result.push(amenities.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
    }
    return result;
  };

  const amenityColumns = groupAmenities(venue.amenities);
  const fullAddress = `${venue.location}, ${venue.city}, ${venue.state} - ${venue.pincode}`;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Image Carousel */}
        {venue.images && venue.images.length > 0 ? (
          <View style={styles.imageCarousel}>
            <Image 
              source={{ uri: venue.images[0].imageUrl }} 
              style={styles.venueImage}
            />
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={48} color="#ccc" />
            <Text style={styles.noImageText}>No Images Available</Text>
          </View>
        )}
        {/* Back Arrow Button - Add this right after your image carousel */}
<TouchableOpacity 
  style={styles.backButton}
  onPress={() => navigation.goBack()}
>
  <Ionicons name="arrow-back" size={24} color="white" />
</TouchableOpacity>
        
        {/* Venue Info */}
        <View style={styles.headerContainer}>
          <Text style={styles.venueTitle}>{venue.name}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#2E8B57" />
            <Text style={styles.infoText}>{venue.operationTime}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Entypo name="location-pin" size={18} color="#2E8B57" />
            <Text style={styles.infoText}>{fullAddress}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => navigation.navigate('Map', { address: fullAddress })}
          >
            <Text style={styles.mapButtonText}>Show in Map</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#2E8B57" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />
        
        {/* Offers Section */}
        {venue.offers && venue.offers.length > 0 && (
          <>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Offers</Text>
              {venue.offers.map((offer:any, index:any) => (
                <View key={`offer-${index}`} style={styles.offerCard}>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <Text style={styles.offerText}>{offer.description}</Text>
                </View>
              ))}
            </View>
            <View style={styles.divider} />
          </>
        )}
        
        {/* Rating Section */}
        <View style={styles.ratingContainer}>
          {(venue.rating || venue.reviewCount) && (
            <View style={styles.ratingRow}>
              <View style={styles.starsContainer}>
                {renderStars(venue.rating || 0)}
              </View>
              <Text style={styles.ratingText}>
                {venue.rating?.toFixed(1)} ({venue.reviewCount} ratings)
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.rateButton}
            onPress={() => navigation.navigate('RateVenue', { venueId: venue.id })}
          >
            <Text style={styles.rateButtonText}>Rate Venue</Text>
          </TouchableOpacity>
          
          {venue.totalGames && (
            <Text style={styles.gamesText}>{venue.totalGames.toLocaleString()} Total Games</Text>
          )}
          
          {venue.upcomingEvents && venue.upcomingEvents > 0 && (
            <Text style={styles.upcomingText}>↑ {venue.upcomingEvents} Upcoming</Text>
          )}
        </View>
        
        <View style={styles.divider} />
        
        {/* Sports Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Available Sports</Text>
          <Text style={styles.subtitle}>(Tap to see price details)</Text>
          
          <View style={styles.sportsContainer}>
            {venue.sportPrices.map((sport:any) => (
              <TouchableOpacity 
                key={`sport-${sport.id}`}
                style={styles.sportItem}
                onPress={() => navigation.navigate('SportDetails', { sport })}
              >
                <Text style={styles.sportName}>{sport.sport}</Text>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>₹{sport.pricePerHour}/hr</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Amenities Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          
          <View style={styles.amenitiesContainer}>
            {amenityColumns.map((column, columnIndex) => (
              <View key={`column-${columnIndex}`} style={styles.amenityColumn}>
                {column.map((amenity, amenityIndex) => (
                  <View key={`amenity-${columnIndex}-${amenityIndex}`} style={styles.amenityItem}>
                    <View style={styles.amenityBullet} />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
        
        {/* About Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About Venue</Text>
          <Text style={styles.aboutText}>{venue.description}</Text>
        </View>
      </ScrollView>
      
      {/* Fixed Book Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('Booking', { venue })}
        >
          <Text style={styles.bookButtonText}>Book Now!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  notFoundText: {
    padding: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  imageCarousel: {
    height: 250,
    backgroundColor: '#f5f5f5',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noImageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  headerContainer: {
    padding: 16,
  },
  venueTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  mapButtonText: {
    color: '#2E8B57',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 8,
    backgroundColor: '#f5f5f5',
    marginVertical: 12,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  offerCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 4,
  },
  offerText: {
    fontSize: 14,
    color: '#333',
  },
  ratingContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  rateButton: {
    marginVertical: 8,
  },
  rateButtonText: {
    color: '#2E8B57',
    fontSize: 14,
    fontWeight: '600',
  },
  gamesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  upcomingText: {
    fontSize: 14,
    color: '#2E8B57',
    marginTop: 4,
    fontWeight: '600',
  },
  sportsContainer: {
    marginTop: 8,
  },
  sportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sportName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  priceBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  priceText: {
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '600',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  backButton: {
    position: 'absolute',
    top: 80, // Adjust based on your status bar height
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.2)', // More transparent
    borderRadius: 18, // Smaller rounded corners
    width: 36, // Smaller width
    height: 36, // Smaller height
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)', // Subtle white border
  },
  amenityColumn: {
    width: '33%',
    marginBottom: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  amenityBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E8B57',
    marginRight: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bookButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VenueDetailsScreen;