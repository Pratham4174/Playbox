import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const availableSports = ["Cricket", "Badminton", "Football", "Snooker", "Swimming"];
const availableAmenities = [
  "Parking",
  "Changing Room",
  "Shower",
  "Drinking Water",
  "First Aid",
  "Washroom",
  "Equipment Rental",
];


export default function AddVenueScreen() {
  const [venueName, setVenueName] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [operationTime, setOperationTime] = useState("");
  const [prices, setPrices] = useState<{ [key: string]: string }>({});
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const toggleAmenity = (amenity: string) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(newAmenities);
  };

  const toggleSport = (sport: string) => {
    const newSports = selectedSports.includes(sport)
      ? selectedSports.filter((s) => s !== sport)
      : [...selectedSports, sport];
    setSelectedSports(newSports);
  };

  const handlePriceChange = (sport: string, value: string) => {
    setPrices({ ...prices, [sport]: value });
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Fix here
      allowsMultipleSelection: true,
      quality: 1,
    });
  
    if (!result.canceled && result.assets) {
      const uploadedUrls: string[] = [];
  
      for (const asset of result.assets) {
        if (!asset.uri || asset.uri.trim() === '') continue;
  
        const localUri = asset.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
  
        const formData = new FormData();
        formData.append('file', {
          uri: localUri,
          name: filename,
          type,
        } as any);
  
        try {
          const response = await fetch('http://192.168.1.11:8092/api/venues/upload', {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
  
          const imageUrl = await response.text();
          console.log('Image uploaded:', imageUrl);
  
          if (imageUrl && imageUrl.trim() !== '') {
            uploadedUrls.push(imageUrl);
          }
        } catch (error) {
          console.error('Image upload failed:', error);
          Alert.alert('Upload Failed', 'Could not upload image');
        }
      }
  
      setImages((prev) => [...prev, ...uploadedUrls]);
    }
  };
  
  
  const handleSubmit = async () => {
      const ownerId = await AsyncStorage.getItem('ownerId');
      console.log("Owner ID:", ownerId);
      if (!ownerId) {
        Alert.alert("Error", "Owner ID not found");
        return;
      }
    const venueData = {
      venueName,
      location,
      city,
      state,
      pincode,
      coordinates,
      contactNumber,
      description,
      operationTime,
      amenities: selectedAmenities,
      ownerId: parseInt(ownerId), 
      sportPrices: selectedSports.map((sport) => ({
        sport,
        pricePerHour: prices[sport] || "0",
      })),
      images: images.map((url) => ({ url })),
    };

    try {
      const response = await fetch(`http://192.168.1.11:8092/api/venues/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venueData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        Alert.alert("Error Venue submission failed ");
        return; // stop further execution
      }

      const result = await response.json();
      console.log("Venue saved:", result);
      Alert.alert("Success", "Venue submitted successfully!");
      setVenueName("");
      setLocation("");
      setCity("");
      setState("");
      setPincode("");
      setCoordinates("");
      setContactNumber("");
      setDescription("");
      setOperationTime("");
      setSelectedSports([]);
      setPrices({});
      setImages([]);
      setSelectedAmenities([]);
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", "Failed to submit venue");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add New Venue</Text>

      <TextInput style={styles.input} placeholder="Venue Name" value={venueName} onChangeText={setVenueName} />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
      <TextInput style={styles.input} placeholder="State" value={state} onChangeText={setState} />
      <TextInput style={styles.input} placeholder="Pincode" value={pincode} onChangeText={setPincode} />
      <TextInput style={styles.input} placeholder="Coordinates (lat,lon)" value={coordinates} onChangeText={setCoordinates} />
      <TextInput style={styles.input} placeholder="Venue Contact Number" value={contactNumber} onChangeText={setContactNumber} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
      <TextInput style={styles.input} placeholder="Operation Time (e.g. 6am - 10pm)" value={operationTime} onChangeText={setOperationTime} />

      <Text style={styles.label}>Select Sports:</Text>
      <View style={styles.sportsContainer}>
        {availableSports.map((sport) => (
          <TouchableOpacity key={sport} style={[styles.sportButton, selectedSports.includes(sport) && styles.selectedSport]} onPress={() => toggleSport(sport)}>
            <Text style={styles.sportText}>{sport}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSports.map((sport) => (
        <View key={sport} style={styles.priceInputContainer}>
          <Text style={styles.priceLabel}>{sport} Price (₹/hour):</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter price for ${sport}`}
            keyboardType="numeric"
            value={prices[sport] || ""}
            onChangeText={(value) => handlePriceChange(sport, value)}
          />
        </View>
      ))}
      <Text style={styles.label}>Select Amenities:</Text>
<View style={styles.sportsContainer}>
  {availableAmenities.map((amenity) => (
    <TouchableOpacity
      key={amenity}
      style={[styles.sportButton, selectedAmenities.includes(amenity) && styles.selectedSport]}
      onPress={() => toggleAmenity(amenity)}
    >
      <Text style={styles.sportText}>{amenity}</Text>
    </TouchableOpacity>
  ))}
</View>


      <Text style={styles.label}>Upload Images:</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
        <Text style={styles.uploadText}>Choose Images</Text>
      </TouchableOpacity>

      <View style={styles.imagePreviewContainer}>
        {images.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.imagePreview} />
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Venue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0fff4",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1b5e20",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
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
  uploadButton: {
    backgroundColor: "#81c784",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  uploadText: {
    color: "#fff",
    fontWeight: "600",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  imagePreview: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
