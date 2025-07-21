import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ correct import

export default function Footer({ navigation, active = 'Home' }: { navigation: any; active?: string }) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
          <Ionicons name="home" size={24} color={active === 'Home' ? '#2e7d32' : '#999'} />
          <Text style={[styles.tabText, active === 'Home' && styles.activeTab]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('RecentSearches')}>
          <Ionicons name="search" size={24} color={active === 'Search' ? '#2e7d32' : '#999'} />
          <Text style={[styles.tabText, active === 'Search' && styles.activeTab]}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('CommunityScreen')}>
          <Ionicons name="people" size={24} color={active === 'Community' ? '#2e7d32' : '#999'} />
          <Text style={[styles.tabText, active === 'Community' && styles.activeTab]}>Community</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ProfilePage')}>
          <Ionicons name="person" size={24} color={active === 'Profile' ? '#2e7d32' : '#999'} />
          <Text style={[styles.tabText, active === 'Profile' && styles.activeTab]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'android' ? 16 : 0,
  },
  tabItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activeTab: {
    color: '#2e7d32',
    fontWeight: '600',
  },
});
