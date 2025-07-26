import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

type Booking = {
  id: number;
  userName: string;
  sport: string;
  courtName: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: string;
};

type Court = {
  id: number;
  name: string;
};
type TimeSlot = string;
type BookingFormData = {
  userName: string;
  phone: string;
  sport: string;
  courtId: number | null;
  startTime: string; // ISO string format
  endTime: string;   // ISO string format
};
export default function OwnerBookingManagement({ route, navigation }: any) {
  const { venue } = route.params;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
//   const [selectedSport, setSelectedSport] = useState<string>(venue.sportPrices[0]?.sport || '');
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const availableSports = venue.sportPrices?.map((sp: any) => sp.sport) || [];
  const [selectedSport, setSelectedSport] = useState<string>(
    availableSports.length > 0 ? availableSports[0] : ''
  );

  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [newBooking, setNewBooking] = useState<BookingFormData>({
    userName: '',
    phone: '',
    sport: selectedSport,
    courtId: selectedCourt?.id || null,
    startTime: '',
    endTime: ''
  });
 
  const isPastTimeSlot = (date: Date, time: string): boolean => {
    const now = new Date();
    const [timeStr, period] = time.split(' ');
    let hour = parseInt(timeStr.split(':')[0], 10);
    
    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
  
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);
  
    return slotDate < now;
  };

 // Utility function to convert Date to local ISO string without timezone offset
const toLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  return new Date(date.getTime() - offset).toISOString().slice(0, -1);
};

const handleAddBookingClick = (timeSlot: TimeSlot) => {
  // Parse the time slot string (e.g., "9:00 PM")
  const [timeStr, period] = timeSlot.split(' ');
  let hour = parseInt(timeStr.split(':')[0], 10);
  
  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  // Create Date objects in local time
  const startTime = new Date(selectedDate);
  startTime.setHours(hour, 0, 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setHours(hour + 1, 0, 0, 0);

  // Debug logs to verify times
  console.log('Local Times:', {
    selectedSlot: timeSlot,
    localStart: startTime.toString(),
    localEnd: endTime.toString(),
    isoStart: startTime.toISOString(),
    isoEnd: endTime.toISOString(),
    localISOStart: toLocalISOString(startTime),
    localISOEnd: toLocalISOString(endTime)
  });

  // Update state with local ISO strings
  setNewBooking({
    userName: '',
    phone: '',
    sport: selectedSport,
    courtId: selectedCourt?.id || null,
    startTime: toLocalISOString(startTime),
    endTime: toLocalISOString(endTime)
  });

  setShowAddBookingModal(true);
};

const handleCreateBooking = async () => {
  if (!newBooking.userName || !newBooking.phone) {
    Alert.alert('Error', 'Please fill in all required fields');
    return;
  }

  try {
    // Convert local ISO strings back to Date for verification
    const startDate = new Date(newBooking.startTime + 'Z'); // Add Z to parse as UTC
    const endDate = new Date(newBooking.endTime + 'Z');
    
    console.log('Creating booking with:', {
      localStart: startDate.toString(),
      localEnd: endDate.toString(),
      sendingToAPI: {
        startTime: newBooking.startTime,
        endTime: newBooking.endTime
      }
    });

    const response = await fetch('http://192.168.1.8:8091/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: newBooking.userName,
        phoneNumber: newBooking.phone,
        venueId: venue.id,
        venueName: venue.name,
        venueLocation: venue.location,
        sport: newBooking.sport,
        startTime: newBooking.startTime, // Using local ISO string
        endTime: newBooking.endTime,     // Using local ISO string
        ownerId: venue.ownerId,
        courtId: newBooking.courtId,
        courtName: courts.find(c => c.id === newBooking.courtId)?.name || '',
        isActive: true,
        slotType: getSlotType(newBooking.startTime),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Send timezone info
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create booking');
    }

    Alert.alert('Success', 'Booking created successfully');
    setShowAddBookingModal(false);
    fetchBookings(); // Refresh the bookings list
  } catch (error: any) {
    console.error('Error creating booking:', error);
    Alert.alert('Error', error.message || 'Failed to create booking');
  }
};

// Helper to determine slot type from local ISO string
const getSlotType2 = (isoString: string) => {
  const date = new Date(isoString + 'Z'); // Parse as UTC
  const hours = date.getHours();
  
  if (hours < 12) return 'Morning';
  if (hours < 17) return 'Afternoon';
  return 'Evening';
};
  
  
  // Generate time slots from 6 AM to 11 PM
  const generateTimeSlots = (selectedDate: Date) => {
    const now = new Date();
    const slots = [];
    
    // Check if selected date is today
    const isToday = selectedDate.toDateString() === now.toDateString();
  
    for (let hour = 0; hour <= 23; hour++) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      const timeString = `${displayHour}:00 ${period}`;
      
      // If selected date is in the past, skip all slots
      if (selectedDate < new Date(now.setHours(0, 0, 0, 0))) {
        continue;
      }
      
      // If it's today, check if the slot is more than 1 hour in the past
      if (isToday) {
        const slotHour = hour === 12 && period === 'AM' ? 0 : hour;
        const slotTime = new Date();
        slotTime.setHours(slotHour, 0, 0, 0);
        
        // Skip slots that are more than 1 hour in the past
        if (slotTime.getTime() < now.getTime() - 3600000) { // 3600000ms = 1 hour
          continue;
        }
      }
      
      slots.push(timeString);
    }
    return slots;
  };

  // Fetch all bookings for the selected date, sport and court
  const fetchBookings = useCallback(async () => {
  if (!selectedCourt || !selectedSport) return;

  try {
    const dateString = selectedDate.toISOString().split('T')[0];
    const response = await fetch(
      `http://192.168.1.8:8091/api/bookings/venue/${venue.id}?date=${dateString}&sport=${selectedSport}&courtId=${selectedCourt.id}`
    );

    if (!response.ok) throw new Error('Failed to fetch bookings');
    
    const data = await response.json();
    
    // Double filter to ensure correct sport and court
    const filteredBookings = data.filter((booking: any) => 
      booking.sport.toLowerCase() === selectedSport.toLowerCase() && 
      booking.courtId === selectedCourt.id
    );
    
    setBookings(filteredBookings);

    // Update booked slots
    const slots: string[] = [];
    filteredBookings.forEach((booking: any) => {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      
      let current = new Date(start);
      while (current < end) {
        const timeString = current.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        if (!slots.includes(timeString)) {
          slots.push(timeString);
        }
        current.setHours(current.getHours() + 1);
      }
    });
    setBookedSlots(slots);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    Alert.alert('Error', 'Failed to load bookings');
  }
}, [selectedDate, selectedSport, selectedCourt, venue.id]);

  // Fetch available courts for the selected sport
  const fetchCourts = useCallback(async () => {
    if (!selectedSport) {
      setCourts([]);
      setSelectedCourt(null);
      return;
    }
  
    try {
      console.log(`Fetching courts for sport: ${selectedSport}, venue: ${venue.id}`);
      
      const response = await fetch(
        `http://192.168.1.8:8091/api/bookings/courts?venueId=${venue.id}&sport=${encodeURIComponent(selectedSport)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received courts data:', data);
      
      // If the backend already filters, just use the data directly
      setCourts(data || []);
  
      // Auto-select the first court if available
      if (data && data.length > 0) {
        setSelectedCourt(data[0]);
      } else {
        setSelectedCourt(null);
        console.warn(`No courts found for sport: ${selectedSport}`);
      }
    } catch (error) {
      console.error('Error fetching courts:', error);
      Alert.alert('Error', 'Failed to load courts for this sport');
      setCourts([]);
      setSelectedCourt(null);
    }
  }, [selectedSport, venue.id]);


  useEffect(() => {
    console.log('Selected sport changed:', selectedSport);
    fetchCourts();
  }, [selectedSport, fetchCourts]);
  
  useEffect(() => {
    console.log('Courts updated:', courts);
  }, [courts]);
  
  useEffect(() => {
    console.log('Selected court updated:', selectedCourt);
  }, [selectedCourt]);
  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchCourts(), fetchBookings()])
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, [fetchCourts, fetchBookings]);

  // Initialize component
  useEffect(() => {
    setTimeSlots(generateTimeSlots(selectedDate));
    fetchCourts();
  }, [selectedDate]); // Add selectedDate as dependency

  // Fetch bookings when date, sport or court changes
  useEffect(() => {
    if (selectedCourt) {
      fetchBookings();
    }
  }, [selectedDate, selectedSport, selectedCourt, fetchBookings]);

  const handleDateSelect = (day: { dateString: string } | undefined) => {
    if (!day) return;
    setSelectedDate(new Date(day.dateString));
    setShowCalendarModal(false);
  };

  const getSlotStatus = (time: string) => {
    const booking = getBookingForSlot(time);
    return booking ? 'booked' : 'available';
  };
  const getBookingForSlot = (time: string) => {
    const normalizedTime = new Date(selectedDate);
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    normalizedTime.setHours(hours, minutes, 0, 0);

    return bookings.find(booking => {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      return normalizedTime >= start && normalizedTime < end;
    });
  };

  // const handleCancelBooking = async (bookingId: number) => {
  //   try {
  //     const response = await fetch(`http://192.168.1.8:8091/api/bookings/${bookingId}`, {
  //       method: 'DELETE',
  //     });

  //     if (response.ok) {
  //       Alert.alert('Success', 'Booking cancelled successfully');
  //       fetchBookings();
  //     } else {
  //       throw new Error('Failed to cancel booking');
  //     }
  //   } catch (error) {
  //     console.error('Error cancelling booking:', error);
  //     Alert.alert('Error', 'Failed to cancel booking');
  //   }
  // };

  const getTodaysBookings = () => {
    const todayString = selectedDate.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
      return bookingDate === todayString;
    });
  };

  const getTodaysAvailableSlots = () => {
    const todaysBookings = getTodaysBookings();
    const bookedSlotsToday: string[] = [];
    
    todaysBookings.forEach((booking) => {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      
      let current = new Date(start);
      while (current < end) {
        const timeString = current.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        if (!bookedSlotsToday.includes(timeString)) {
          bookedSlotsToday.push(timeString);
        }
        current.setHours(current.getHours() + 1);
      }
    });
    
    return timeSlots.length - bookedSlotsToday.length;
  };

  
  const renderTimeSlot = (time: string) => {
    const status = getSlotStatus(time);
    const booking = getBookingForSlot(time);

    if (status === 'booked' && booking) {
      return (
        <View style={[styles.timeSlot, styles.bookedSlot]}>
          <View style={styles.bookingInfo}>
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingUserName}>{booking.userName}</Text>
              <Text style={styles.bookingPrice}>₹{booking.price}</Text>
            </View>
            <View style={styles.bookingTimeContainer}>
              <MaterialIcons name="access-time" size={14} color="#666" />
              <Text style={styles.bookingTime}>
                {moment(booking.startTime).format('h:mm A')} - {moment(booking.endTime).format('h:mm A')}
              </Text>
            </View>
            <Text style={styles.bookingCourt}>{booking.courtName}</Text>
          </View>
          <MaterialIcons name="lock" size={20} color="#f44336" />
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.timeSlot,
          styles.availableSlot,
          status === 'available' && styles.availableSlotActive,
        ]}
        disabled={status !== 'available'}
      >
        <Text style={styles.timeSlotText}>
          {time}
        </Text>
        {status === 'available' && (
          <MaterialIcons name="add-circle" size={20} color="#2E8B57" style={styles.addIcon} />
        )}
      </TouchableOpacity>
    );
  };

  
  // Helper function to determine slot type
  const getSlotType = (dateTime: string) => {
    const hour = new Date(dateTime).getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.venueName}>{venue.name}</Text>
        <Text style={styles.subtitle}>Booking Management</Text>
      </View>

      {/* Sports Selection */}
<Text style={styles.sectionTitle}>Select Sport</Text>
<ScrollView 
  horizontal 
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.sportsContainer}
>
  {venue.sportPrices?.map((sp: any) => (
    <TouchableOpacity 
      key={sp.sport}
      style={[
        styles.sportButton,
        selectedSport === sp.sport && styles.selectedSportButton
      ]}
      onPress={() => setSelectedSport(sp.sport)}
    >
      <Text style={[
        styles.sportText,
        selectedSport === sp.sport && styles.selectedSportText
      ]}>
        {sp.sport} (₹{sp.pricePerHour}/hr)
      </Text>
    </TouchableOpacity>
  ))}
</ScrollView>

      {/* Court Selection */}
      {courts.length > 0 && (
        <>
          {selectedSport && courts.length > 0 && (
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
          onPress={() => setSelectedCourt(court)}
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

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{getTodaysBookings().length}</Text>
    <Text style={styles.statLabel}>Bookings</Text>
  </View>
  <View style={styles.statItem}>
    <Text style={styles.statValue}>
      {getTodaysAvailableSlots()}
    </Text>
    <Text style={styles.statLabel}>Free Slots</Text>
  </View>
  <View style={styles.statItem}>
    <Text style={styles.statValue}>
      ₹{getTodaysBookings().reduce((sum, booking) => sum + booking.price, 0)}
    </Text>
    <Text style={styles.statLabel}>Total Revenue</Text>
  </View>
</View>

      {/* Time Slots */}
      <View style={styles.timelineContainer}>
{timeSlots.map((time, index) => {
  const status = getSlotStatus(time);
  const booking = getBookingForSlot(time);
  const isFirstInBlock = index === 0 || getSlotStatus(timeSlots[index-1]) !== status;
  const isLastInBlock = index === timeSlots.length-1 || getSlotStatus(timeSlots[index+1]) !== status;
  const isPast = isPastTimeSlot(selectedDate, time);
  
  return (
    <View key={time} style={[
      styles.timelineSlot,
      status === 'booked' && styles.timelineSlotBooked,
      status === 'available' && styles.timelineSlotAvailable,
      isPast &&status!=='booked' && styles.pastSlot, // Add this line
      isFirstInBlock && styles.timelineSlotFirst,
      isLastInBlock && styles.timelineSlotLast,
    ]}>
      <Text style={[
        styles.timelineTimeLabel,
        isPast && styles.pastTimeLabel // Add this line
      ]}>{time}</Text>
      
      {status === 'booked' && booking ? (
        <View style={styles.timelineBookingInfo}>
          <Text style={styles.timelineBookingName} numberOfLines={1}>
            {booking.userName}
          </Text>
          <Text style={styles.timelineBookingTime}>
            {moment(booking.startTime).format('h:mm')}-{moment(booking.endTime).format('h:mm A')}
          </Text>
        </View>
      ) : (
        <View style={styles.timelineActionButtons}>
          <TouchableOpacity 
            style={[
              styles.addBookingButton,
              isPast && styles.disabledAddBookingButton // Add this line
            ]}
            onPress={isPast ? undefined : () => handleAddBookingClick(time)}
            disabled={isPast}
          >
            <MaterialIcons 
              name="add" 
              size={18} 
              color={isPast ? "#cccccc" : "#2E8B57"} 
            />
            <Text style={[
              styles.addBookingButtonText,
              isPast && styles.disabledAddBookingButtonText
            ]}>
              Add Booking
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
})}
</View>
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
  markedDates={{
    [selectedDate.toISOString().split('T')[0]]: {
      selected: true,
      selectedColor: '#2E8B57',
      selectedTextColor: '#fff',
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
      {/* Add Booking Modal */}
<Modal
  visible={showAddBookingModal}
  animationType="slide"
  transparent={false}
  onRequestClose={() => setShowAddBookingModal(false)}
>
  <View style={styles.enhancedModalContainer}>
    {/* Enhanced Header with shadow and better spacing */}
    <View style={styles.enhancedModalHeaderContainer}>
      <View style={styles.enhancedModalHeader}>
        <Text style={styles.enhancedModalTitle}>New Booking</Text>
        <TouchableOpacity 
          style={styles.closeIconContainer}
          onPress={() => setShowAddBookingModal(false)}
        >
          <MaterialIcons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>

    <ScrollView 
      contentContainerStyle={styles.modalContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Information Card with improved styling */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <MaterialIcons name="calendar-today" size={20} color="#2E8B57" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {moment(selectedDate).format('dddd, MMMM D, YYYY')}
            </Text>
          </View>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <MaterialIcons name="access-time" size={20} color="#2E8B57" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Time Slot</Text>
            <Text style={styles.infoValue}>
              {moment(newBooking.startTime).format('h:mm A')} - {moment(newBooking.endTime).format('h:mm A')}
            </Text>
          </View>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <MaterialIcons name="sports" size={20} color="#2E8B57" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Sport</Text>
            <Text style={styles.infoValue}>{selectedSport}</Text>
          </View>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <MaterialIcons name="place" size={20} color="#2E8B57" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Court</Text>
            <Text style={styles.infoValue}>
              {selectedCourt?.name || 'Not selected'}
            </Text>
          </View>
        </View>
      </View>

      {/* Form Section with better typography */}
      <Text style={styles.sectionTitle}>Customer Details</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.enhancedInput}
            placeholder="John Doe"
            placeholderTextColor="#9CA3AF"
            value={newBooking.userName}
            onChangeText={(text) => setNewBooking({...newBooking, userName: text})}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.enhancedInput}
            placeholder="98765 43210"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={newBooking.phone}
            onChangeText={(text) => setNewBooking({...newBooking, phone: text})}
          />
        </View>
      </View>

      {/* Action Buttons with better spacing and visual feedback */}
      <View style={styles.enhancedButtonContainer}>
        <TouchableOpacity 
          style={[styles.enhancedButton, styles.cancelButton]}
          onPress={() => setShowAddBookingModal(false)}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.enhancedButton, 
            styles.submitButton,
            (!newBooking.userName || !newBooking.phone) && styles.disabledButton
          ]}
          onPress={handleCreateBooking}
          disabled={!newBooking.userName || !newBooking.phone}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Confirm Booking</Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  </View>
</Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  enhancedModalHeaderContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10, // Ensures header stays above content when scrolling
    paddingTop: 40,
},
  enhancedModalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  enhacedModalHeaderContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  enhancedModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  enhancedModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeIconContainer: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  enhancedInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  enhancedButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  enhancedButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2E8B57',
  },
  disabledButton: {
    backgroundColor: '#A5B4FC',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 8,
  },

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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
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

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#f5fff7',
    borderRadius: 8,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  lockIcon: {
    marginLeft: 4,
  },
  timeIcon: {
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  bookingInfo: {
    flex: 1,
  },
  bookingUserName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingTime: {
    fontSize: 12,
    color: '#666',
  },
  bookingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginTop: 4,
  },

  timeSlot: {
    width: '100%',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  availableSlot: {
    backgroundColor: '#fff',
  },
  availableSlotActive: {
    backgroundColor: '#f0f8f0',
    borderColor: '#2E8B57',
  },


  addIcon: {
    marginLeft: 8,
  },

  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  bookingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },


  bookingCourt: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  timelineContainer: {
    marginBottom: 20,
  },
  timelineSlot: {
    height: 60,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 8,
    marginLeft: 40,
    position: 'relative',
  },
  timelineSlotBooked: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f44336',
  },
  timelineSlotFirst: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  timelineSlotLast: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  timelineTimeLabel: {
    position: 'absolute',
    left: -40,
    top: 0,
    width: 36,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  timelineBookingInfo: {
    padding: 8,
  },
  timelineBookingName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  timelineBookingTime: {
    fontSize: 12,
    color: '#666',
  },
  timelineSlotAvailable: {
    backgroundColor: '#f0fff4',
  },
  timelineActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    width: '100%',
  },
  addBookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  addBookingButtonText: {
    color: '#2E8B57',
    marginLeft: 4,
    fontSize: 12,
  },
  blockSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  blockSlotButtonText: {
    color: '#f44336',
    marginLeft: 4,
    fontSize: 12,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookingInfoSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },

  infoText: {
    marginLeft: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  pastTimeLabel: {
    color: '#999',
  },
  disabledAddBookingButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  disabledAddBookingButtonText: {
    color: '#999',
  },
  
});