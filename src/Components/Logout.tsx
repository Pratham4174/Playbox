import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

// Logout Screen Component
export function LogoutScreen({ navigation }: any) {
    React.useEffect(() => {
      const logout = async () => {
        try {
          // Get all keys from AsyncStorage
          const allKeys = await AsyncStorage.getAllKeys();
          
          // Filter out keys you want to keep (if any)
          const keysToRemove = allKeys.filter(key => 
            !key.startsWith('app_settings_') // Example: keep settings prefixed with 'app_settings_'
          );
          
          // Remove all user-related keys
          await AsyncStorage.multiRemove(keysToRemove);
          
          // Alternatively, if you know specific keys to remove:
          // await AsyncStorage.multiRemove(['authToken', 'userId', 'userData', 'ownerId', 'arenaUser']);
          
          // Navigate to auth screen and reset navigation stack
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }], // Replace with your auth screen name
          });
        } catch (error) {
          console.error('Logout failed:', error);
          // Still navigate to auth screen even if storage clearing fails
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        }
      };
      
      logout();
    }, []);
  
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={{ marginTop: 20 }}>Logging out...</Text>
      </View>
    );
  }