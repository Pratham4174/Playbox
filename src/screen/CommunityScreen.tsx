import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Footer from '../Components/Footer';

const { width } = Dimensions.get('window');

const dummyGroups = [
  {
    id: '1',
    name: 'Mumbai Badminton Club',
    sport: 'Badminton',
    location: 'Mumbai',
    members: 120,
  },
  {
    id: '2',
    name: 'Delhi Footballers',
    sport: 'Football',
    location: 'Delhi',
    members: 95,
  },
  {
    id: '3',
    name: 'Pune Pickleball Squad',
    sport: 'Pickleball',
    location: 'Pune',
    members: 60,
  },
  {
    id: '4',
    name: 'Hyderabad Swimmers',
    sport: 'Swimming',
    location: 'Hyderabad',
    members: 80,
  },
];

const CommunityScreen = ({ navigation }: any) => {
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);

  const handleJoin = (groupId: string, groupName: string) => {
    if (joinedGroups.includes(groupId)) {
      Alert.alert('Already Joined', `You're already a member of ${groupName}.`);
      return;
    }
    setJoinedGroups([...joinedGroups, groupId]);
    Alert.alert('Success', `You joined ${groupName}`);
  };

  const renderItem = ({ item }: any) => {
    const isJoined = joinedGroups.includes(item.id);

    return (
      <View style={styles.cardContainer}>
        <Image source={item.image} style={styles.cardImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.groupName}>{item.name}</Text>
            <View style={styles.detailsRow}>
              <MaterialIcons name="sports" size={16} color="#FFF" />
              <Text style={styles.detailsText}>{item.sport}</Text>
            </View>
            <View style={styles.detailsRow}>
              <MaterialIcons name="location-on" size={16} color="#FFF" />
              <Text style={styles.detailsText}>{item.location}</Text>
            </View>
            <View style={styles.detailsRow}>
              <MaterialIcons name="people" size={16} color="#FFF" />
              <Text style={styles.detailsText}>{item.members} members</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.joinButton, isJoined && styles.joinedButton]}
            onPress={() => handleJoin(item.id, item.name)}
          >
            <Text style={[styles.joinText, isJoined && styles.joinedText]}>
              {isJoined ? 'Joined' : 'Join +'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Sports Communities</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="tune" size={24} color="#7DBE7D" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={dummyGroups}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Footer navigation={navigation} active="Community" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Inter-Bold',
  },
  filterButton: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 6,
    fontFamily: 'Inter-Medium',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  joinButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#7DBE7D',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  joinedButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  joinText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  joinedText: {
    color: '#FFF',
  },
});

export default CommunityScreen;