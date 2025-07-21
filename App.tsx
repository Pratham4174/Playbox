// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppLoading from 'expo-app-loading';
import React from 'react';

import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';

import MainDrawer from './src/Components/MainDrawer';
import { UserProvider } from './src/context/UserContext';
import AddVenueScreen from './src/screen/AddVenueScreen';
import ArenaDashboard from './src/screen/ArenaDashboard';
import ArenaOtpVerificationScreen from './src/screen/ArenaOtpVerification';
import ArenaOwnerRegister from './src/screen/ArenaOwnerRegister';
import BookingConfirmationScreen from './src/screen/BookingConfirmationScreen';
import BookingPage from './src/screen/BookingPage';
import CommunityScreen from './src/screen/CommunityScreen';
import HomeScreen from './src/screen/HomeScreen';
import ManageVenuesScreen from './src/screen/ManageVenueScreen';
import MyBookingScreen from './src/screen/MyBookingScreen';
import OTPVerificationScreen from './src/screen/OTPVerificationScreen';
import PhoneLoginScreen from './src/screen/PhoneLoginScreen';
import ProfilePage from './src/screen/ProfilePage';
import RecentSearchesScreen from './src/screen/RecentSearchesScreen';
import SplashScreen from './src/screen/SplashScreen';
import UserSetupScreen from './src/screen/UserSetupScreen';
import VenueDetailsScreen from './src/screen/VenueDetailScreen';
import VenueListScreen from './src/screen/VenueListScreen';
import ViewBookingsScreen from './src/screen/ViewBookingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) return <AppLoading />;

  return (
    <UserProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OtpVerification" component={OTPVerificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserSetup" component={UserSetupScreen} />

        <Stack.Screen name="Booking" component={BookingPage} />
        <Stack.Screen name="MyBookingScreen" component={MyBookingScreen} />
        <Stack.Screen name="ArenaOwnerRegister" component={ArenaOwnerRegister} />
        <Stack.Screen name="ArenaDashboard" component={ArenaDashboard} options={{headerBackVisible: false, headerShown:false}}/>
        <Stack.Screen name="ArenaOTP" component={ArenaOtpVerificationScreen} />

        

        <Stack.Screen name="VenueDetails" component={VenueDetailsScreen} />
        {/* This is your drawer */}
        <Stack.Screen name="Main" component={MainDrawer} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />

        <Stack.Screen name="BookingConfirmation"  component={BookingConfirmationScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="CommunityScreen"  component={CommunityScreen}  options={{ headerShown: false }}/>
        {/* Others */}
        <Stack.Screen  name="RecentSearches"  component={RecentSearchesScreen} options={{ headerShown: false }}/>
        <Stack.Screen  name="ProfilePage"  component={ProfilePage} options={{ headerShown: true }}/>
        <Stack.Screen  name="VenueListScreen"  component={VenueListScreen} options={{ headerShown: false }}/>

        <Stack.Screen name="ManageVenues" component={ManageVenuesScreen} />
        <Stack.Screen name="AddVenue" component={AddVenueScreen} />
        <Stack.Screen name="ViewBookings" component={ViewBookingsScreen} />

        

      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
}