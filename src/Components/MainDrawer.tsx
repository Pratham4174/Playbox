import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HomeScreen from '../screen/HomeScreen';
import MyBookingsScreen from '../screen/MyBookingScreen';
import ProfileScreen from '../screen/ProfilePage';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }: any) => {
  return (
    <View style={styles.drawerContainer}>
      {/* Drawer Header - Adjusted to position content lower */}
      <View style={styles.drawerHeader}>
        <View style={styles.headerContent}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.appName}>PlayBox</Text>
        </View>
      </View>

      {/* Drawer Items */}
      <TouchableOpacity 
        style={styles.drawerItem}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="home-outline" size={22} color="#2E8B57" />
        <Text style={styles.drawerItemText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.drawerItem}
        onPress={() => navigation.navigate('My Bookings')}
      >
        <Ionicons name="calendar-outline" size={22} color="#2E8B57" />
        <Text style={styles.drawerItemText}>My Bookings</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.drawerItem}
        onPress={() => navigation.navigate('Profile')}
      >
        <Ionicons name="person-outline" size={22} color="#2E8B57" />
        <Text style={styles.drawerItemText}>Profile</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Additional Items */}
      <TouchableOpacity style={styles.drawerItem}>
        <Ionicons name="settings-outline" size={22} color="#2E8B57" />
        <Text style={styles.drawerItemText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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
        name="Home" 
        component={HomeScreen} 
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="My Bookings" 
        component={MyBookingsScreen} 
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 20,  // Reduced from 40 to lower content
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
    marginTop: 20,  // Added margin to push content down
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E8B57',
    paddingTop: 2,  // Small adjustment for perfect vertical alignment
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
});