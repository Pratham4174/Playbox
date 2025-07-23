import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    RefreshControl,
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
  

  // Generate time slots from 6 AM to 11 PM
  const generateTimeSlots = (selectedDate: Date) => {
    const now = new Date();
    const slots = [];
    
    // Check if selected date is today
    const isToday = selectedDate.toDateString() === now.toDateString();
  
    for (let hour = 6; hour <= 23; hour++) {
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
        `http://192.168.1.9:8091/api/bookings/venue/${venue.id}?date=${dateString}&sport=${selectedSport}&courtId=${selectedCourt.id}`
      );

      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookings(data);

      // Update booked slots
      const slots: string[] = [];
      data.forEach((booking: any) => {
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
    if (!selectedSport) return;

    try {
      const response = await fetch(
        `http://192.168.1.9:8091/api/bookings/courts?venueId=${venue.id}&sport=${selectedSport}`
      );
      const data = await response.json();
      setCourts(data);

      // Auto-select the first court if available
      if (data.length > 0) {
        setSelectedCourt(data[0]);
      } else {
        setSelectedCourt(null);
      }
    } catch (error) {
      console.error('Error fetching courts:', error);
    }
  }, [selectedSport, venue.id]);

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

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`http://192.168.1.9:8091/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Alert.alert('Success', 'Booking cancelled successfully');
        fetchBookings();
      } else {
        throw new Error('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking');
    }
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
          <Text style={styles.statValue}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {timeSlots.length - bookedSlots.length}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ₹{bookings.reduce((sum, booking) => sum + booking.price, 0)}
          </Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Time Slots */}
      <Text style={styles.sectionTitle}>Time Slots</Text>
      <View style={styles.timeSlotsContainer}>
        {timeSlots.map((time) => (
          <View key={time}>
            {renderTimeSlot(time)}
          </View>
        ))}
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
              minDate={new Date().toISOString().split('T')[0]}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 12,
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
  cancelButton: {
    padding: 8,
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

});