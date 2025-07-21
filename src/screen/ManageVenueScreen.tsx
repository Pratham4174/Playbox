import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Image,
  ListRenderItem,
  Modal, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SportPrice } from '../type/types';
const availableSports = ["Cricket", "Badminton", "Football", "Snooker", "Swimming"];

interface Venue {
  id: number;
  name: string;
  sport: string;
  location: string;
  city?: string;
  state?: string;
  pincode?: string;
  coordinates?: string;
  contactNumber?: string;
  description?: string;
  operationTime?: string;
  sportPrices?: SportPrice[];            // Already included
  amenities?: string[];                 // ✅ Add this
  images?: { url: string }[];           // Already included
  ownerId?: number;                     // ✅ Add this
}

export default function ManageVenuesScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [editVenue, setEditVenue] = useState<Venue | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
const [prices, setPrices] = useState<{ [key: string]: string }>({});
const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);


  // Pick image from gallery
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
  
  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  useEffect(() => {
    fetchVenues();
  }, []);


  const fetchVenues = async () => {
    try {
      const ownerId = await AsyncStorage.getItem("ownerId");
      if (!ownerId) {
        console.warn("No ownerId found in AsyncStorage");
        return;
      }

      const response = await fetch(`http://localhost:8092/api/venues/owner/${ownerId}`);
      if (!response.ok) throw new Error("Failed to fetch venues");

      const data = await response.json();
      setVenues(data);
    } catch (error) {
      console.error("Error loading venues:", error);
    }
  };

  const handleEditPress = (venue: Venue) => {
    const fullVenue: Venue = {
      id: venue.id,
      name: venue.name || '',
      sport: venue.sport || '',
      location: venue.location || '',
      city: venue.city || '',
      state: venue.state || '',
      pincode: venue.pincode || '',
      coordinates: venue.coordinates || '',
      contactNumber: venue.contactNumber || '',
      description: venue.description || '',
      operationTime: venue.operationTime || '',
      amenities: venue.amenities || [],
      ownerId: venue.ownerId || 0, // if applicable
      sportPrices: venue.sportPrices || [],
      images: venue.images || [],
    };
    console.log("Editing venue:", fullVenue);

    // Set full venue object
    setEditVenue(fullVenue);
  
    // Set modal visible
    setModalVisible(true);
  
    // Set sports and prices
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
  
    // Set amenities
    if (venue.amenities) {
      setSelectedAmenities(venue.amenities);
    } else {
      setSelectedAmenities([]);
    }
  
    // Set uploaded image URLs
    if (venue.images) {
      const imageUrls = venue.images.map(img => img.url);
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
      images: images.map((url) => ({ url })),         // ✅ convert image list
      amenities: selectedAmenities,  
    };

    try {
      const response = await fetch(`http://localhost:8092/api/venues/update/${editVenue.id}`, {
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

  const renderVenue: ListRenderItem<Venue> = ({ item }) => (
    <View style={styles.venueCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.sport} - {item.location}</Text>
      </View>
      <TouchableOpacity onPress={() => handleEditPress(item)}>
        <Ionicons name="create-outline" size={24} color="#2e7d32" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Arenas</Text>
      <FlatList
        data={venues}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVenue}
      />

      {/* Edit Venue Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Venue</Text>

              {[
                { label: "Name", key: "name" },
                { label: "Sport", key: "sport" },
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
                  style={styles.input}
                  value={(editVenue as any)?.[key] ?? ''}
                  onChangeText={(text) =>
                    setEditVenue((prev) => (prev ? { ...prev, [key]: text } : null))
                  }
                />
                
              ))}
              <Text style={styles.label}>Images</Text>
<View style={styles.imageContainer}>
  {images.map((uri, index) => (
    <TouchableOpacity key={index} onPress={() => removeImage(index)}>
      <Image source={{ uri: uri }} style={styles.imagePreview} />
      <Text style={styles.removeText}>Remove</Text>
    </TouchableOpacity>
  ))}
  <TouchableOpacity onPress={pickImage} style={styles.addImageBox}>
    <Ionicons name="add" size={24} color="#2e7d32" />
    <Text>Add Image</Text>
  </TouchableOpacity>
</View>
<Text style={styles.label}>Select Sports:</Text>
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
      style={styles.input}
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
                <Button title="Cancel" color="#999" onPress={() => setModalVisible(false)} />
                <Button title="Update" onPress={handleUpdate} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#e6f4ea' },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: '#1b5e20' },
  venueCard: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  name: { fontSize: 18, fontWeight: '600', color: '#2e7d32' },
  meta: { fontSize: 14, color: '#555' },
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 16,
  },

  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 4,
  },
  addImageBox: {
    width: 100,
    height: 100,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  removeText: {
    color: 'red',
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
});
