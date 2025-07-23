import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Footer from '../Components/Footer';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user?.phoneNumber) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://192.168.1.9:8080/auth/user?phone=${user.phoneNumber}`
        );
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        Alert.alert('Error', 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { 
        text: 'Cancel', 
        style: 'cancel' 
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // Get all keys from AsyncStorage
            const allKeys = await AsyncStorage.getAllKeys();
            
            // Filter and remove all user-related keys
            const userKeys = allKeys.filter(key => 
              key === 'userId' ||
              key === 'userToken' ||
              key === 'userData' ||
              key === 'arenaUser' ||
              key === 'ownerId' ||
              key === 'userName' ||
              key === 'name' ||
              key.startsWith('user_') // Example for prefixed keys
            );
            
            // Remove all identified user keys
            await AsyncStorage.multiRemove(userKeys);
            
            // Clear global state if using context/Redux
            setUser(null);
            
            // Reset navigation stack completely
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'PhoneLogin' }],
              })
            );
            
            // Optional: Clear any cached images/data
            // await ImageCache.clear();
            
          } catch (error) {
            console.error('Logout error:', error);
            // Fallback - still navigate to login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'PhoneLogin' }],
            });
          }
        },
      },
    ]);
  };

  const handleLoginRedirect = () => {
    navigation.navigate('PhoneLogin');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.notLoggedInContainer}>
          <Image
            source={require('../../assets/user.png')}
            style={styles.guestAvatar}
          />
          <Text style={styles.notLoggedInTitle}>Welcome Guest</Text>
          <Text style={styles.notLoggedInText}>
            Please login to view your profile and access all features
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLoginRedirect}
          >
            <Text style={styles.loginButtonText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
        <Footer navigation={navigation} active="Profile" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/user.png')}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color="#2E8B57" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phoneNumber}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#2E8B57" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart" size={24} color="#2E8B57" />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color="#2E8B57" />
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <ProfileMenuItem 
            icon="person-outline" 
            title="Edit Profile" 
            onPress={() => {}} 
          />
          <ProfileMenuItem 
            icon="calendar-outline" 
            title="My Bookings" 
            onPress={() => navigation.navigate('MyBookingScreen')} 
          />
          <ProfileMenuItem 
            icon="card-outline" 
            title="Payment Methods" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <ProfileMenuItem 
            icon="settings-outline" 
            title="Preferences" 
            onPress={() => {}} 
          />
          <ProfileMenuItem 
            icon="notifications-outline" 
            title="Notifications" 
            onPress={() => {}} 
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <ProfileMenuItem 
            icon="help-circle-outline" 
            title="Help Center" 
            onPress={() => {}} 
          />
          <ProfileMenuItem 
            icon="information-circle-outline" 
            title="About" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#e53935" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Footer navigation={navigation} active="Profile" />
    </View>
  );
};

const ProfileMenuItem = ({ icon, title, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={20} color="#2E8B57" />
      </View>
      <Text style={styles.menuItemText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#aaa" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  guestAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    opacity: 0.8,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  notLoggedInText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#2E8B57',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: width * 0.28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E8B57',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    padding: 15,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    padding: 15,
    borderRadius: 12,
  },
  logoutText: {
    color: '#e53935',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ProfileScreen;