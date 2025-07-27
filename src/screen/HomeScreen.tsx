import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions } from '@react-navigation/native';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Footer from '../Components/Footer';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

const sports = [
  'Football ⚽️', 
  'Badminton 🏸', 
  'Tennis 🎾', 
  'Box Cricket 🏏', 
  'Cricket Nets 🏏', 
  'Basketball 🏀', 
  'Volleyball 🏐', 
  'Shooting 🎯', 
  'Hockey 🏑', 
  'Billiard 🎱', 
  'Skating ⛸️', 
  'Ultimate Frisbee 🥏', 
  'Bouldering �', 
  'Motor Sport 🏎️', 
  'Padel 🎾', 
  'Pickleball 🏓', 
  'Swimming �'
];



export default function HomeScreen({ navigation }: any) {
  const { location, setLocation } = useUser();
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [city, setCity] = useState<string | null>(location?.city || null);
  const [showAllSports, setShowAllSports] = useState(false);
  const displayedSports = showAllSports ? sports : sports.slice(0, 5);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useUser();
  const [activeIndices, setActiveIndices] = useState<Record<number, number>>({});
  const [searchText, setSearchText] = useState('');

  const updateActiveIndex = (venueId: number, index: number) => {
    setActiveIndices(prev => ({ ...prev, [venueId]: index }));
  };


  const clearSearch = () => {
    setSearchText('');
  };

  const filterVenues = () => {
    let filtered = venues;

    // First filter by sport if one is selected
    if (selectedSport !== 'All') {
      filtered = filtered.filter((venue) => {
        return venue.sportPrices?.some((sportPrice: { sport: string }) => {
          const venueSport = sportPrice.sport?.trim().toLowerCase();
          const selected = selectedSport.trim().toLowerCase();
          return venueSport === selected;
        });
      });
    }

    // Then filter by search text if any
    if (searchText.trim() !== '') {
      const searchTerm = searchText.trim().toLowerCase();
      filtered = filtered.filter((venue) => {
        return (
          venue.name.toLowerCase().includes(searchTerm) ||
          venue.location.toLowerCase().includes(searchTerm) ||
          venue.city.toLowerCase().includes(searchTerm) ||
          venue.sportPrices?.some((sp: { sport: string }) => 
            sp.sport.toLowerCase().includes(searchTerm)
          )
        );
      });
    }

    return filtered;
  };

  const filteredVenues = filterVenues();


  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user?.phoneNumber) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://192.168.1.11:8080/auth/user?phone=${user.phoneNumber}`
        );
        const data = await response.json();
        setUser(data);
        await AsyncStorage.setItem('user', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to fetch user:', error);
        Alert.alert('Error', 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://192.168.1.11:8092/api/venues/all');
      setVenues(response.data);
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      Alert.alert('Error', 'Could not fetch venues');
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => setLocationModalVisible(true)} 
          style={styles.locationButton}
        >
          <Ionicons name="location-sharp" size={20} color="#2E8B57" />
          <Text style={styles.cityText}>{city || 'Set Location'}</Text>
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={24} color="#2E8B57" />
          </TouchableOpacity>
          <Text style={styles.greeting}>Hey {user?.name || 'Player'}</Text>
        </View>
      ),
      headerTitle: '',
    });
  }, [navigation, city, user?.name]);

  useEffect(() => {
    if (!location) {
      setLocationModalVisible(true);
    } else {
      setCity(location.city || null);
    }
  }, []);

  const detectLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to detect your city.');
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync(loc.coords);
      const cityName = geocode[0]?.city || 'Unknown';
      
      const newLocation = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        city: cityName,
      };

      setLocation(newLocation);
      setCity(cityName);
      setLocationModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch location');
    }
  };
  const getSportNameWithoutEmoji = (sportWithEmoji: string) => {
    return sportWithEmoji.replace(/\p{Emoji}/gu, '').trim();
  };
  // const filteredVenues = selectedSport === 'All' 
  // ? venues 
  // : venues.filter((venue) => {
  //     // Check if any of the sportPrices match the selected sport
  //     return venue.sportPrices?.some((sportPrice: { sport: string; }) => {
  //       const venueSport = sportPrice.sport?.trim().toLowerCase();
  //       const selected = selectedSport.trim().toLowerCase();
  //       return venueSport === selected;
  //     });
  //   });

  const renderVenueCard = ({ item, index }: any) => {
    // Calculate minimum price
    const minPrice = item.sportPrices?.reduce((min: number, sport: any) => {
      const price = parseFloat(sport.pricePerHour);
      return price < min ? price : min;
    }, Infinity);
  
    return (
      <Pressable
        onPress={() => navigation.navigate('VenueDetails', { venue: item })}
        style={styles.card}
      >
        {/* Image Slider */}
        <View style={styles.sliderContainer}>
          {item.images && item.images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.imageSlider}
                snapToInterval={width - 32} // This is crucial
                snapToAlignment="center" // Aligns to center
                decelerationRate="fast" // Makes it feel snappier
                onScroll={(event) => {
                  const slideSize = event.nativeEvent.layoutMeasurement.width;
                  const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
                  updateActiveIndex(item.id, index);
                }}
                scrollEventThrottle={16}
              >
                {item.images.map((img: any, imgIndex: number) => (
                  <View key={imgIndex} style={{ width: width - 32 }}>
                    <Image
                      source={{ uri: img.imageUrl }}
                      style={styles.sliderImage}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
              {/* Pagination indicators */}
              <View style={styles.pagination}>
                {item.images.map((_: any, imgIndex: number) => (
                  <View
                    key={imgIndex}
                    style={[
                      styles.paginationDot,
                      activeIndices[item.id] === imgIndex ? styles.activeDot : styles.inactiveDot
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.noImagePlaceholder}>
              <MaterialIcons name="sports" size={40} color="#fff" />
            </View>
          )}
        </View>
  
        {/* Venue Info */}
        <View style={styles.cardBody}>
          <Text style={styles.venueName}>{item.name}</Text>
          
          <View style={styles.venueMeta}>
            {/* Location */}
            <View style={styles.metaItem}>
              <Ionicons name="location" size={14} color="#555" />
              <Text style={styles.venueLocation}>{item.location}</Text>
            </View>
            
            {/* Operation Time */}
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color="#555" />
              <Text style={styles.venueTime}>{item.operationTime}</Text>
            </View>
          </View>
          
          {/* Sport Type Badge */}
          <View style={styles.sportBadge}>
            <Text style={styles.sportText}>{item.sport || 'Multi-sport'}</Text>
          </View>
          
          {/* Price Tag */}
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              {minPrice !== Infinity ? `Starts from ₹${minPrice}/hr` : 'Price not available'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };
 
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search venues or locations"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
  
        {/* Sports Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Sports</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sportsContainer}
          >
           {displayedSports.map((sport, index) => {
  const emoji = sport.match(/\p{Emoji}/u)?.[0] || '🏃‍♂️';
  const name = sport.replace(/\p{Emoji}/gu, '').trim();
  const isSelected = selectedSport === name;
  
  return (
    <TouchableOpacity 
      key={index}
      style={[
        styles.sportButton,
        isSelected && styles.selectedSportButton  // Add selected style
      ]}
      onPress={() => {
        // Set the selected sport to filter venues
        setSelectedSport(isSelected ? 'All' : name);
      }}
    >
      <Text style={styles.sportEmoji}>{emoji}</Text>
      <Text style={[
        styles.sportName,
        isSelected && styles.selectedSportText  // Add selected text style
      ]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
})}
          </ScrollView>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowAllSports(!showAllSports)}
          >
            <Text style={styles.toggleText}>
              {showAllSports ? 'Show Less' : 'Show More →'}
            </Text>
          </TouchableOpacity>
        </View>
  
        {/* Venues List - This will take up remaining space */}
        <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>
          {searchText ? 'Search Results' : 'Nearby Venues'}
        </Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#2E8B57" />
        ) : filteredVenues.length === 0 ? (
          <Text style={styles.noResultsText}>
            {searchText ? 'No matching venues found' : 'No venues available'}
          </Text>
        ) : (
          <FlatList
            data={filteredVenues}
            renderItem={renderVenueCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.venueList}
          />
        )}
      </View>
  
        {/* Footer - Now at natural bottom of layout */}
        <View style={styles.footerWrapper}>
          <Footer navigation={navigation} active="Home" />
        </View>
  
        {/* Location Modal */}
        <Modal
          transparent
          animationType="fade"
          visible={locationModalVisible}
          onRequestClose={() => setLocationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Enable Location</Text>
              <Text style={styles.modalText}>
                Allow us to access your location to show venues nearby.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => setLocationModalVisible(false)}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={detectLocation}
                >
                  <Text style={styles.primaryButtonText}>Allow Location</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8B57',
    marginLeft: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 16,
  },
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 60, // Set a fixed height for footer
  },
  cityText: {
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '600',
    marginLeft: 6,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: '#888',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  sportsContainer: {
    paddingBottom: 8,
  },
  sportButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 100,
  },
  sportEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  sportName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E8B57',
  },
  toggleButton: {
    alignSelf: 'center',
    marginTop: 12,
    padding: 8,
  },
  toggleText: {
    color: '#2E8B57',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageSlider: {
    width: '100%',
    height: 200,
    
  },
  sliderImage: {
    width: width - 32,
    height: 200,
  },
  noImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    padding: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  venueMeta: {
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  venueLocation: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  venueTime: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  sportBadge: {
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  sportText: {
    color: '#2E8B57',
    fontWeight: '600',
    fontSize: 12,
  },
  venueList: {
    paddingBottom: 100,
  },
  loader: {
    marginVertical: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    padding: 14,
    flex: 1,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 14,
    flex: 1,
    marginRight: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#555',
    fontWeight: '600',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  noImage: {
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  cardContent: {
    padding: 16,
    position: 'relative',
  },

  venueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  priceTag: {
    position: 'absolute',
    top: -20,
    right: 16,
    backgroundColor: '#2E8B57',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  priceText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  menuButton: {
    marginRight: 10,
  },
  sliderContainer: {
    position: 'relative',
    height: 200,
    
  },
 
  pagination: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#2E8B57',
  },
  inactiveDot: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  listContainer: {
    flex: 1, // Takes up remaining space
    paddingHorizontal: 16,
    marginBottom: 60, // Space for footer
  },
  selectedSportButton: {
    backgroundColor: '#2E8B57',
  },
  selectedSportText: {
    color: '#fff',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
});