
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';

import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type DateData = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

type Court = {
  id: number;
  name: string;
  // add other properties as needed
};
type DayProps = {
  date?: DateData;
  state: 'disabled' | 'today' | '';
  marking?: any;
};
const toLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, -1);
};
export default function BookingPage({ route, navigation }: any) {
  const { venue } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>(venue.sportPrices[0]?.sport || '' );
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(1);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [availableSports, setAvailableSports] = useState<string[]>(venue.sportPrices.map((sp: any) => sp.sport) );
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<{ [date: string]: any }>({});
  const [courts, setCourts] = useState<any[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);


  // Generate time slots from 6 AM to 11 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      slots.push(`${displayHour}:00 ${period}`);
    }
    return slots;
  };
  const handleTimeSlotPress = (time: string, status: string) => {
    if (status !== 'available') return;
  
    const updatedSelectedTimes = [...selectedTimes];
  
    if (updatedSelectedTimes.includes(time)) {
      // Deselect if already selected
      const index = updatedSelectedTimes.indexOf(time);
      updatedSelectedTimes.splice(index, 1);
    } else {
      updatedSelectedTimes.push(time);
    }
  
    // Sort the selected times
    const sorted = updatedSelectedTimes.sort((a, b) =>
      moment(a, 'h:mm A').diff(moment(b, 'h:mm A'))
    );
  
    // Check for continuity
    let isContinuous = true;
    for (let i = 1; i < sorted.length; i++) {
      const diff = moment(sorted[i], 'h:mm A').diff(moment(sorted[i - 1], 'h:mm A'), 'hours');
      if (diff !== 1) {
        isContinuous = false;
        break;
      }
    }
  
    if (isContinuous) {
      setSelectedTimes(sorted);
    } else {
      // Show error or toast
      Alert.alert("Error", "Please select continuous slots without gaps or booked times.");
    }
  };


// 1. First, declare fetchBookedSlots using useCallback at the top level of your component
const fetchBookedSlots = useCallback(async (courtId: number) => {
  if (!selectedSport) return;

  try {
    const dateString = selectedDate.toISOString().split('T')[0];
    
    const response = await fetch(
      `http://localhost:8091/api/bookings/venuebycourt/${venue.id}/date/${dateString}?sport=${selectedSport}&courtId=${courtId}`
    );

    if (!response.ok) throw new Error('Failed to fetch booked slots');
    
    const bookedSlots = await response.json();
    const bookedTimeSlots: string[] = [];

    bookedSlots.forEach((slot: any) => {
      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);

      let current = new Date(start);
      while (current < end) {
        const timeString = current.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        if (!bookedTimeSlots.includes(timeString)) {
          bookedTimeSlots.push(timeString);
        }
        current.setHours(current.getHours() + 1);
      }
    });

    setBookedSlots(bookedTimeSlots);
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    setBookedSlots([]);
  }
}, [selectedDate, selectedSport, venue.id]);

// 2. Then use it in your useEffect
useEffect(() => {
  const fetchData = async () => {
    if (!selectedSport) return;

    try {
      // Fetch available courts
      const courtsResponse = await fetch(
        `http://localhost:8091/api/bookings/courts?venueId=${venue.id}&sport=${selectedSport}`
      );
      const courtsData = await courtsResponse.json();
      setCourts(courtsData);

      // Fetch booked slots if courts exist
      if (courtsData.length > 0) {
        const firstCourt = courtsData[0];
        setSelectedCourt(firstCourt);
        console.log('Auto-selected court:', firstCourt);
        await fetchBookedSlots(courtsData[0].id);
      } else {
        setSelectedCourt(null);
        setBookedSlots([]);
        setBookedSlots([]); // Clear slots if no courts
      }
    } catch (error) {
      console.error('Error fetching courts:', error);
    }
  };

  fetchData();
}, [selectedDate, selectedSport, venue.id, fetchBookedSlots]); // Dependencies for the callback
  
  useEffect(() => {
  const initBookingScreen = async () => {
    // ✅ 1. Check if user is logged in
    const storedUserId = await AsyncStorage.getItem('userId');
    if (!storedUserId) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to book a slot.',
        [
          {
            text: 'Go to Login',
            onPress: () => navigation.navigate('PhoneLogin'),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      setUserId(storedUserId);
    }

    // ✅ 2. Set default sports
    const defaultSports = ['Football', 'Box Cricket', 'Badminton', 'Basketball'];
    const venueSports = venue.sportPrices.map((sp: any) => sp.sport);
    setAvailableSports(venueSports);
    setSelectedSport(venueSports[0]); // Default sport

    // ✅ 3. Generate time slots
    setTimeSlots(generateTimeSlots());
  };

  initBookingScreen();
}, []); // <- run only once on mount





  
  const handleDateSelect = (day: { dateString: string } | undefined) => {
    if (!day) return; 
    setSelectedDate(new Date(day.dateString));
    setSelectedTimes([]); // Reset time selection when date changes
    setShowCalendarModal(false); // Close the modal after selection
  };

  const normalizeTime = (time: string) =>
  new Date(`1970-01-01T${new Date(`1970-01-01 ${time}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

const getSlotStatus = (time: string) => {
  const now = new Date();
  const slotDate = new Date(selectedDate);
  const [timePart, period] = time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  slotDate.setHours(hours, minutes, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return 'past'; // Entire date is in the past
  }
  // If selected date is today and time is in the past
  if (
    selectedDate.toDateString() === now.toDateString() &&
    slotDate.getTime() < now.getTime()
  ) {
    return 'past';
  }

  // Normalize and check if booked
  const normalizeTime = (str: string) =>
  str.replace(/\u202f/g, ' ').trim(); // Replace non-breaking spaces with regular space

const normalized = normalizeTime(
  slotDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
);

const isBooked = bookedSlots.some(
  (slot) => normalizeTime(slot) === normalized
);

if (isBooked) return 'booked';


  return 'available';
 
};
  

const handleConfirm = async () => {
  if (!userId) {
    Alert.alert('Login Required', 'Please log in to confirm your booking.');
    return;
  }

  if (selectedTimes.length === 0) {
    alert('Please select a time slot');
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    Alert.alert('Invalid Date', 'You cannot book for past dates.');
    return;
  }
  

  try {
    const storedUserId = await AsyncStorage.getItem('userId');
    const storedUser = await AsyncStorage.getItem('user');

    const parsedUserId = storedUserId ? parseInt(storedUserId) : null;
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userName = user?.name || 'Guest';
    const duration = selectedTimes.length;

    const [time, period] = selectedTimes[0].split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour = period === 'PM' && hours !== 12 ? hours + 12 : hours;
    hour = period === 'AM' && hours === 12 ? 0 : hour;

    const startTime = new Date(selectedDate);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + duration);

    const bookingPayload = {
      userId: parsedUserId,
      userName: userName,
      venueId: venue.id,
      venueName: venue.name,
      ownerId: venue.owner.id,
      sport: selectedSport,
      courtId: selectedCourt?.id,
      courtName: selectedCourt?.name,
      venueLocation: venue.location || 'N/A',
      slotType: hour < 12 ? 'Morning' : hour < 18 ? 'Evening' : 'Night',
      startTime: toLocalISOString(startTime),
      endTime: toLocalISOString(endTime),
      duration: duration * 60
    };

    const response = await fetch('http://localhost:8091/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });

    if (response.ok) {
      navigation.navigate('BookingConfirmation', {
        bookingDetails: {
          userName: userName,
          venueName: venue.name,
          sport: selectedSport,
          date: selectedDate.toDateString(),
          time: `${selectedTimes[0]} - ${moment(selectedTimes[0], 'h:mm A')
            .add(duration, 'hours')
            .format('h:mm A')}`,
          duration: `${duration} hour${duration > 1 ? 's' : ''}`,
        },
      });
    } else {
      const err = await response.json();
      alert(err.message || 'Booking failed. Try again.');
    }
  } catch (error) {
    console.error('Booking error:', error);
    alert('Something went wrong. Please try again later.');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.venueName}>{venue.name}</Text>
        <View style={styles.karmaBadge}>
          <MaterialIcons name="stars" size={16} color="#FFD700" />
          <Text style={styles.karmaPoints}>Earn 3 PlayBox points on every booking!</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Sports Selection */}
      <Text style={styles.sectionTitle}>Select Sport</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sportsContainer}
      >
        {availableSports.map((sport) => (
          <TouchableOpacity 
            key={sport}
            style={[
              styles.sportButton,
              selectedSport === sport && styles.selectedSportButton
            ]}
            onPress={() => setSelectedSport(sport)}
          >
            <Text style={[
              styles.sportText,
              selectedSport === sport && styles.selectedSportText
            ]}>
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
{/* Court Selection */}

{courts.length > 0 && (
  <>
    <Text style={styles.sectionTitle}>Select Court</Text>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.sportsContainer}
    >
      {courts.map((court) => (
        <TouchableOpacity 
          key={court.id}
          style={[
            styles.sportButton,
            selectedCourt?.id === court.id && styles.selectedSportButton
          ]}
          onPress={() => {
            setSelectedCourt(court); // Store the entire court object
            fetchBookedSlots(court.id); // Fetch slots for this court
          }}
        >
          <Text style={[
            styles.sportText,
            selectedCourt?.id === court.id && styles.selectedSportText
          ]}>
            {court.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </>
)}

      {/* Date Selection */}
      <Text style={styles.sectionTitle}>Select Date</Text>
      <TouchableOpacity 
        style={styles.dateSelector}
        onPress={() => setShowCalendarModal(true)}
      >
        <MaterialIcons name="calendar-today" size={20} color="#2E8B57" />
        <Text style={styles.dateSelectorText}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
      </TouchableOpacity>


      {/* Selected Time */}
      {selectedTimes && selectedTimes.length > 0 && (
  <View style={styles.selectedInfo}>
    <Text style={styles.selectedLabel}>Selected Time:</Text>
    <Text style={styles.selectedValue}>
      {(() => {
        const sorted = [...selectedTimes].sort((a, b) => moment(a, 'h:mm A').diff(moment(b, 'h:mm A')));
        const start = sorted[0];
        const end = moment(sorted[sorted.length - 1], 'h:mm A').add(1, 'hour').format('h:mm A');
        return `${start} - ${end}`;
      })()}
    </Text>
  </View>
)}


      {/* Time Slots */}
      <Text style={styles.sectionTitle}>Available Time Slots</Text>
      <View style={styles.timeSlotsContainer}>
        {timeSlots.map((time) => {
          const status = getSlotStatus(time);
          return (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                status === 'available' && styles.availableSlot,
                status === 'booked' && styles.bookedSlot,
                status === 'past' && styles.pastSlot,
                selectedTimes.includes(time) && styles.selectedTimeSlot
              ]}
              onPress={() => handleTimeSlotPress(time, status)}
              
              disabled={status !== 'available'}
            >
              <Text style={[
                styles.timeSlotText,
                status === 'available' && styles.availableSlotText,
                status === 'booked' && styles.bookedSlotText,
                status === 'past' && styles.pastSlotText,
                selectedTimes.includes(time) && styles.selectedTimeSlotText
              ]}>
                {time}
              </Text>
              {status === 'booked' && (
                <MaterialIcons name="lock" size={16} color="#fff" style={styles.lockIcon} />
              )}
              {status === 'past' && (
                <MaterialIcons name="access-time" size={16} color="#999" style={styles.timeIcon} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Turf Selection */}
      <View style={styles.turfContainer}>
        <Text style={styles.turfLabel}>Selected Turf:</Text>
        <Text style={styles.turfValue}>5 a side Turf 2</Text>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity 
        style={[
          styles.checkoutButton,
          !selectedTimes && styles.disabledCheckoutButton
        ]}
        onPress={handleConfirm}
        disabled={!selectedTimes}
      >
        <Text style={styles.checkoutButtonText}>Add Slots To Checkout</Text>
        <View style={styles.karmaBadgeSmall}>
          <MaterialIcons name="stars" size={14} color="#FFD700" />
          <Text style={styles.karmaPointsSmall}>+3 PlayBox</Text>
        </View>
      </TouchableOpacity>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <Calendar
  current={selectedDate.toISOString().split('T')[0]}
  onDayPress={handleDateSelect}
  monthFormat={'MMMM yyyy'}
  hideArrows={false}
  minDate={new Date().toISOString().split('T')[0]} // Add this line to disable past dates
  markedDates={{
    ...bookedDates,
    [selectedDate.toISOString().split('T')[0]]: {
      ...(bookedDates[selectedDate.toISOString().split('T')[0]] || {}),
      selected: true,
      selectedColor: '#2E8B57',
      selectedTextColor: '#fff',
      marked: true,
      dotColor: '#fff'
    },
    
  }}
  renderArrow={(direction) => (
    <MaterialIcons 
      name={direction === 'left' ? 'chevron-left' : 'chevron-right'} 
      size={24} 
      color="#2E8B57" 
    />
  )}
  theme={{
    calendarBackground: '#fff',
    textSectionTitleColor: '#2E8B57',
    selectedDayBackgroundColor: '#2E8B57',
    selectedDayTextColor: '#fff',
    todayTextColor: '#2E8B57',
    dayTextColor: '#333',
    textDisabledColor: '#ccc',
    arrowColor: '#2E8B57',
    monthTextColor: '#2E8B57',
    textMonthFontWeight: 'bold',
    textMonthFontSize: 16,
    textDayHeaderFontWeight: 'bold',
  }}
/>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCalendarModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  venueName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  karmaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f4e6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  karmaPoints: {
    fontSize: 12,
    color: '#8B7500',
    marginLeft: 4,
  },
  karmaBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  karmaPointsSmall: {
    fontSize: 10,
    color: '#8B7500',
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sportsContainer: {
    paddingBottom: 8,
  },
  sportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedSportButton: {
    backgroundColor: '#2E8B57',
  },
  sportText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedSportText: {
    color: '#fff',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5fff7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginHorizontal: 8,
  },
  selectedInfo: {
    backgroundColor: '#f5fff7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '30%',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  availableSlot: {
    backgroundColor: '#e6f4ea',
    borderWidth: 1,
    borderColor: '#2E8B57',
  },
  bookedSlot: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  pastSlot: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTimeSlot: {
    backgroundColor: '#2E8B57',
    borderWidth: 1,
    borderColor: '#2E8B57',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  availableSlotText: {
    color: '#2E8B57',
  },
  bookedSlotText: {
    color: '#f44336',
  },
  pastSlotText: {
    color: '#999',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  lockIcon: {
    marginLeft: 4,
  },
  timeIcon: {
    marginLeft: 4,
  },
  turfContainer: {
    backgroundColor: '#f5fff7',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  turfLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  turfValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  checkoutButton: {
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 16,
  },
  disabledCheckoutButton: {
    backgroundColor: '#cccccc',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2E8B57',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});