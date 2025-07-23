import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import ArenaDashboard from '../screen/ArenaDashboard';
import OwnerBookingManagement from '../screen/OwnerBookingManagement';
import OwnerScreen from '../screen/OwnerScreen';

const Drawer = createDrawerNavigator();

const OwnerDrawerContent = ({ navigation }: any) => {


  
  return (
    <View style={styles.drawerContainer}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.headerContent}>
          <Image
            source={require('../../assets/logo.png')} // Use owner-specific logo
            style={styles.logo}
          />
          <View>
            <Text style={styles.appName}>PlayBox Owner</Text>
            <Text style={styles.subtitle}>Venue Management</Text>
          </View>
        </View>
      </View>

      {/* Drawer Items */}
      <TouchableOpacity 
        style={styles.drawerItem}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Ionicons name="business-outline" size={22} color="#2E8B57" />
        <Text style={styles.drawerItemText}>My Venues</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.drawerItem}
        onPress={() => navigation.navigate('Bookings')}
      >
        <Ionicons name="calendar-outline" size={22} color="#2E8B57" />
        <Text style={styles.drawerItemText}>Bookings</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.drawerItem}
        onPress={() => navigation.navigate('Analytics')}
      >
        <Ionicons name="stats-chart-outline" size={22} color="#2E8B57" />
        <Text style={styles.drawerItemText}>Analytics</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.drawerItem}
        onPress={() => navigation.navigate('OwnerProfile')}
      >
        <Ionicons name="person-outline" size={22} color="#2E8B57" />
        <Text style={styles.drawerItemText}>Profile</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Additional Items */}
      <TouchableOpacity 
        style={styles.drawerItem}
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings-outline" size={22} color="#2E8B57" />
        <Text style={styles.drawerItemText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity 
  style={[styles.drawerItem, styles.logoutItem]}
  onPress={() => {
    // Clear AsyncStorage
    AsyncStorage.clear()
      .then(() => {
        // Reset navigation to your auth screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'PhoneLogin' }]  // Replace with your actual login screen name
        });
      })
      .catch(error => {
        console.error('Logout failed:', error);
        // Still navigate to login even if storage clearing fails
        navigation.reset({
          index: 0,
          routes: [{ name: 'PhoneLogin' }]
        });
      });
  }}
>
  <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
  <Text style={[styles.drawerItemText, styles.logoutText]}>Logout</Text>
</TouchableOpacity>
    </View>
  );
};

export default function OwnerDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <OwnerDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#2E8B57',
          fontWeight: '600',
        },
        headerTintColor: '#2E8B57',
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 280,
        },
        drawerActiveBackgroundColor: 'rgba(46, 139, 87, 0.1)',
        drawerActiveTintColor: '#2E8B57',
        drawerInactiveTintColor: '#555',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: -20,
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.1)',
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={ArenaDashboard} 
        options={{
          title: 'My Venues',
          drawerIcon: ({ color }) => (
            <Ionicons name="business-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Bookings" 
        component={OwnerBookingManagement} 
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Analytics" 
        component={OwnerBookingManagement} 
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="stats-chart-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={OwnerScreen} 
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={OwnerScreen} 
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Logout" 
        component={LogoutScreen} 
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="log-out-outline" size={22} color={color} />
          ),
          drawerItemStyle: { display: 'none' }, // Hide from drawer since we have custom logout
        }}
      />
    </Drawer.Navigator>
  );
}

// Logout Screen Component
function LogoutScreen({ navigation }: any) {
  React.useEffect(() => {
    const logout = async () => {
      // Perform logout actions (clear storage, etc.)
      await AsyncStorage.clear();
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }], // Replace with your auth screen name
      });
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

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    paddingTop: 30,
    paddingBottom: 30,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20, 
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E8B57',
    paddingTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 15,
  },
  logoutItem: {
    marginTop: 10,
  },
  logoutText: {
    color: '#e74c3c',
  },
});