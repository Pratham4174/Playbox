import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

type CardItem = {
  title: string;
  icon: 'business-outline' | 'add-circle-outline' | 'calendar-outline' | 'stats-chart-outline' | 'people-outline' | 'settings-outline' | 'notifications-outline' | 'chatbubbles-outline' | 'help-circle-outline' | 'person-circle-outline';
  colors: [string, string];
  textColor: string;
  height?: number;
  onPress: () => void;
  fullWidth?: boolean;
};

export default function ArenaDashboard({ navigation }: any) {
  // Animation values for each card
  const cardScales = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1)
  ]).current;

  const animateCardPress = (index: number, callback?: () => void) => {
    Animated.sequence([
      Animated.spring(cardScales[index], {
        toValue: 0.95,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(cardScales[index], {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (callback) callback();
    });
  };

  const cards: CardItem[] = [
    {
      title: "Manage Venues",
      icon: "business-outline",
      colors: ['#2E8B57', '#3CB371'],
      textColor: '#FFF',
      height: 160,
      fullWidth: true,
      onPress: () => animateCardPress(0, () => navigation.navigate('ManageVenues'))
    },
    {
      title: "Add New Venue",
      icon: "add-circle-outline",
      colors: ['#FFFFFF', '#FFFFFF'],
      textColor: '#2E8B57',
      onPress: () => animateCardPress(1, () => navigation.navigate('AddVenue'))
    },
    {
      title: "View Bookings",
      icon: "calendar-outline",
      colors: ['#3CB371', '#2E8B57'],
      textColor: '#FFF',
      onPress: () => animateCardPress(2, () => navigation.navigate('ViewBookings'))
    },
    {
      title: "Analytics",
      icon: "stats-chart-outline",
      colors: ['#FFFFFF', '#FFFFFF'],
      textColor: '#2E8B57',
      onPress: () => animateCardPress(3, () => navigation.navigate('Analytics'))
    },
    {
      title: "Manage Staff",
      icon: "people-outline",
      colors: ['#FFFFFF', '#FFFFFF'],
      textColor: '#2E8B57',
      onPress: () => animateCardPress(4, () => navigation.navigate('StaffManagement'))
    },
    {
      title: "Settings",
      icon: "settings-outline",
      colors: ['#FFFFFF', '#FFFFFF'],
      textColor: '#2E8B57',
      onPress: () => animateCardPress(5, () => navigation.navigate('Settings'))
    }
  ];

  const quickActions: CardItem[] = [
    {
      title: "Notifications",
      icon: "notifications-outline",
      colors: ['#F0FFF0', '#F0FFF0'],
      textColor: '#2E8B57',
      onPress: () => navigation.navigate('Notifications')
    },
    {
      title: "Messages",
      icon: "chatbubbles-outline",
      colors: ['#F0FFF0', '#F0FFF0'],
      textColor: '#2E8B57',
      onPress: () => navigation.navigate('Messages')
    },
    {
      title: "Help",
      icon: "help-circle-outline",
      colors: ['#F0FFF0', '#F0FFF0'],
      textColor: '#2E8B57',
      onPress: () => navigation.navigate('Help')
    }
  ];

  return (
    <View style={styles.fullContainer}>
      {/* Green Status Bar */}
      <StatusBar backgroundColor="#2E8B57" barStyle="light-content" />
      
      {/* Green Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity 
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          style={styles.menuButton}
        >
          <Ionicons name="menu-outline" size={28} color="#FFF"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arena Dashboard</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={28} color="#FFF"  />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <LinearGradient colors={['#f5fff7', '#e6f4ea'] as [string, string]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Active Venues</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₹42K</Text>
              <Text style={styles.statLabel}>Today's Revenue</Text>
            </View>
          </View>

          {/* Main Actions Grid */}
          <View style={styles.gridContainer}>
            {cards.map((card, index) => (
              <Animated.View 
                key={index}
                style={[
                  { transform: [{ scale: cardScales[index] }] },
                  card.fullWidth ? { width: '100%' } : { width: '48%' }
                ]}
              >
                <TouchableOpacity 
                  style={[
                    styles.card,
                    { 
                      backgroundColor: card.colors[0] === '#FFFFFF' ? '#FFF' : 'transparent',
                      height: card.height || 140
                    }
                  ]}
                  activeOpacity={0.7}
                  onPress={card.onPress}
                >
                  {card.colors[0] !== '#FFFFFF' ? (
                    <LinearGradient
                      colors={card.colors as [string, string]}
                      style={styles.cardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={card.icon} size={32} color={card.textColor} />
                      <Text style={[styles.cardText, { color: card.textColor }]}>{card.title}</Text>
                    </LinearGradient>
                  ) : (
                    <>
                      <Ionicons name={card.icon} size={32} color={card.textColor} />
                      <Text style={[styles.cardText, { color: card.textColor }]}>{card.title}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.quickAction}
                onPress={action.onPress}
              >
                <Ionicons name={action.icon} size={24} color="#2E8B57" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  topHeader: {
    backgroundColor: '#2E8B57',
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    paddingTop: 15,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  menuButton: {
    padding: 5,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E8B57',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAction: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0FFF0',
    justifyContent: 'center',
    alignItems: 'center',
  },

});