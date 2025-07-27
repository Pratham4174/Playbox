import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  Button,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const API_BASE = 'http://192.168.1.11:8092/api/venues';
const availableSports = ["Cricket", "Badminton", "Football", "Snooker", "Swimming","Pickleball"];

type Venue = {
  id: number;
  name: string;
  city: string;
  state: string;
  sportPrices: { sport: string; pricePerHour: string }[];
  images: { imageUrl: string }[];
  location?: string;
  pincode?: string;
  coordinates?: string;
  contactNumber?: string;
  description?: string;
  operationTime?: string;
  amenities?: string[];
};

export default function ArenaDashboard({ navigation,route }: any) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Venue[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [arenaUser, setArenaUser] = useState<any>(null);



  
  // Edit modal states
  const [editVenue, setEditVenue] = useState<Venue | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [prices, setPrices] = useState<{ [key: string]: string }>({});
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userJson = await AsyncStorage.getItem('arenaUser');
        if (userJson) {
          const user = JSON.parse(userJson);
          setArenaUser(user);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('Profile')} 
          style={styles.profileButton}
        >
          <Ionicons name="person-circle-outline" size={28} color="#2E8B57" />
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
          <Text style={styles.greeting}>Hey {arenaUser?.name || 'Owner'}</Text>
        </View>
      ),
      headerTitle: '',
    });
  }, [navigation, arenaUser?.name]);

  useEffect(() => {
    fetchVenues();
  }, []);

  

  useEffect(() => {
    const term = search.toLowerCase();
    const results = venues.filter(v =>
      v.name.toLowerCase().includes(term) ||
      v.city.toLowerCase().includes(term) ||
      v.state.toLowerCase().includes(term)
    );
    setFiltered(results);
  }, [search, venues]);

  const fetchVenues = async () => {
    try {
      setRefreshing(true);
      const ownerId = await AsyncStorage.getItem('ownerId');
      if (!ownerId) {
        Alert.alert('Error', 'Owner ID not found. Please log in again.');
        return;
      }

      const res = await fetch(`${API_BASE}/owner/${ownerId}`);
      if (!res.ok) throw new Error('Failed to fetch venues');

      const data = await res.json();
      setVenues(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not load venues.');
    } finally {
      setRefreshing(false);
    }
  };



  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.7,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setImages((prev) => [...prev, selectedImage.uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleEditPress = (venue: Venue) => {
    const fullVenue: Venue = {
      ...venue,
      name: venue.name || '',
      city: venue.city || '',
      state: venue.state || '',
      location: venue.location || '',
      pincode: venue.pincode || '',
      coordinates: venue.coordinates || '',
      contactNumber: venue.contactNumber || '',
      description: venue.description || '',
      operationTime: venue.operationTime || '',
      amenities: venue.amenities || [],
      sportPrices: venue.sportPrices || [],
      images: venue.images || [],
    };

    setEditVenue(fullVenue);
    setModalVisible(true);
  
    if (venue.sportPrices) {
      const sports = venue.sportPrices.map(sp => sp.sport);
      const priceMap: { [key: string]: string } = {};
      venue.sportPrices.forEach(sp => {
        priceMap[sp.sport] = sp.pricePerHour;
      });
      setSelectedSports(sports);
      setPrices(priceMap);
    } else {
      setSelectedSports([]);
      setPrices({});
    }
  
    if (venue.amenities) {
      setSelectedAmenities(venue.amenities);
    } else {
      setSelectedAmenities([]);
    }
  
    if (venue.images) {
      const imageUrls = venue.images.map(img => img.imageUrl);
      setImages(imageUrls);
    } else {
      setImages([]);
    }
  };

  const handleUpdate = async () => {
    if (!editVenue) return;
    
    const updatedVenue = {
      ...editVenue,
      sportPrices: selectedSports.map((sport) => ({
        sport,
        pricePerHour: prices[sport] || "0",
      })),
      images: images.map((url) => ({ imageUrl: url })),
      amenities: selectedAmenities,  
    };

    try {
      const response = await fetch(`${API_BASE}/update/${editVenue.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedVenue),
      });

      if (response.ok) {
        setModalVisible(false);
        setEditVenue(null);
        fetchVenues();
        Alert.alert("Success", "Venue updated successfully");
      } else {
        throw new Error("Failed to update venue");
      }
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "Failed to update venue");
    }
  };

  return (
    <View style={styles.container}>
     <StatusBar backgroundColor="#2E8B57" barStyle="light-content" />
      
<View style={styles.searchContainer}>
  <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
  <TextInput
    style={styles.searchInput}
    placeholder="Search by name, city or state"
    placeholderTextColor="#888"
    value={search}
    onChangeText={setSearch}
    clearButtonMode="while-editing"
  />
  {search.length > 0 && (
    <TouchableOpacity onPress={() => setSearch('')} style={styles.clearButton}>
      <Ionicons name="close-circle" size={20} color="#888" />
    </TouchableOpacity>
  )}
</View>

      <ScrollView 
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchVenues}
            colors={['#2E8B57']}
            tintColor="#2E8B57"
          />
        }
      >
        {filtered.map(venue => (
  <TouchableOpacity
    key={venue.id}
    style={styles.card}
    onPress={() => navigation.navigate('OwnerBookingManagement', { venue })}
    activeOpacity={0.9}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {venue.images[0] ? (
        <Image
          source={{ uri: venue.images[0].imageUrl }}
          style={styles.thumbnail}
        />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons name="image-outline" size={24} color="#999" />
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.venueName}>{venue.name}</Text>
        <Text style={styles.venueInfo}>{venue.city}, {venue.state}</Text>
        {venue.sportPrices.length > 0 && (
          <Text style={styles.venueInfo}>
            {venue.sportPrices[0].sport}: ₹{venue.sportPrices[0].pricePerHour}/hr
          </Text>
        )}
      </View>
    </View>

    <TouchableOpacity
      style={styles.editButton}
      onPress={() => handleEditPress(venue)}
    >
      <Ionicons name="create-outline" size={20} color="#2E8B57" />
    </TouchableOpacity>
  </TouchableOpacity>
))}
{filtered.length === 0 && (
  <Text style={{ textAlign: 'center', marginTop: 30, color: '#888' }}>
    No arenas found.
  </Text>
)}

      </ScrollView>

      {/* Edit Venue Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Venue</Text>

              {[
                { label: "Name", key: "name" },
                { label: "Location", key: "location" },
                { label: "City", key: "city" },
                { label: "State", key: "state" },
                { label: "Pincode", key: "pincode" },
                { label: "Coordinates", key: "coordinates" },
                { label: "Contact Number", key: "contactNumber" },
                { label: "Description", key: "description" },
                { label: "Operation Time", key: "operationTime" },
              ].map(({ label, key }) => (
                <TextInput
                  key={key}
                  placeholder={label}
                  style={styles.modalInput}
                  value={(editVenue as any)?.[key] ?? ''}
                  onChangeText={(text) =>
                    setEditVenue((prev) => (prev ? { ...prev, [key]: text } : null))
                  }
                />
              ))}

              <Text style={styles.modalLabel}>Images</Text>
              <View style={styles.imageContainer}>
                {images.map((uri, index) => (
                  <TouchableOpacity key={index} onPress={() => removeImage(index)}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={pickImage} style={styles.addImageBox}>
                  <Ionicons name="add" size={24} color="#2E8B57" />
                  <Text>Add Image</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Select Sports:</Text>
              <View style={styles.sportsContainer}>
                {availableSports.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.sportButton,
                      selectedSports.includes(sport) && styles.selectedSport,
                    ]}
                    onPress={() => {
                      if (selectedSports.includes(sport)) {
                        setSelectedSports(prev => prev.filter(s => s !== sport));
                        const updatedPrices = { ...prices };
                        delete updatedPrices[sport];
                        setPrices(updatedPrices);
                      } else {
                        setSelectedSports(prev => [...prev, sport]);
                      }
                    }}
                  >
                    <Text style={styles.sportText}>{sport}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedSports.map((sport) => (
                <View key={sport} style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>{sport} Price (₹/hour):</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder={`Enter price for ${sport}`}
                    value={prices[sport] || ""}
                    onChangeText={(text) =>
                      setPrices((prev) => ({ ...prev, [sport]: text }))
                    }
                  />
                </View>
              ))}

              <View style={styles.modalActions}>
                <Button 
                  title="Cancel" 
                  color="#999" 
                  onPress={() => setModalVisible(false)} 
                />
                <Button 
                  title="Update" 
                  color="#2E8B57" 
                  onPress={handleUpdate} 
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5fffa',
  },
  header: {
    backgroundColor: '#2E8B57',
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  search: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    fontSize: 16,
    elevation: 3,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
    position: 'relative',
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  venueInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  editButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
    backgroundColor: '#e1f5ec',
    borderRadius: 14,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  modalLabel: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#2E8B57',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 4,
  },
  addImageBox: {
    width: 80,
    height: 80,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  removeText: {
    color: '#f44336',
    fontSize: 12,
    textAlign: 'center',
  },
  sportsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  sportButton: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: "#4caf50",
    borderRadius: 20,
    backgroundColor: "#e8f5e9",
  },
  selectedSport: {
    backgroundColor: "#a5d6a7",
  },
  sportText: {
    color: "#2e7d32",
  },
  priceInputContainer: {
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: "#1b5e20",
  },

  headerContent: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerSubtitle: {
    paddingTop: 20,
    fontSize: 12,
    color: '#e1f5ec',
    fontWeight: '500',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },

  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statSeparator: {
    width: 1,
    backgroundColor: '#EEE',
    marginVertical: 4,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2E8B57',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

 
  venueInfoContainer: {
    flex: 1,
    marginLeft: 16,
  },
 
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
 
  sportTag: {
    backgroundColor: '#e1f5ec',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
 
  priceText: {
    fontSize: 12,
    color: '#2a6049',
    fontWeight: 'bold',
  },
  moreSportsTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  moreSportsText: {
    fontSize: 12,
    color: '#666',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 4,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0, // Remove extra padding on iOS
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  profileButton: {
    marginRight: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  menuButton: {
    marginRight: 10,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8B57',
  },
});