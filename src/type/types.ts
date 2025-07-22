export type Sport = {
    id: string;
    name: string;
    slots: string[];
  };
  // src/types/User.ts
export interface User {
  name: string;
  phone: string;
  image?: string;
}
export type SportPrice = {
  sport: string;
  pricePerHour: string;
};
 export interface VenueImage {
  imageUrl: string;
}
export interface Venue {
  id: string;
  name: string;
  images: VenueImage[];
  location: string;
  city: string;
  state: string;
  pincode: string;
  description: string;
  contactNumber: string;
  operationTime: string;
  amenities: string[];
  sportPrices: SportPrice[];
  rating?: number;
  reviewCount?: number;
  totalGames?: number;
  upcomingEvents?: number;
  offers?: {
    title: string;
    description: string;
  }[];
}

export type RootStackParamList = {
  Splash: undefined;
  PhoneLogin: undefined;
  OtpVerification: undefined;
  UserSetup: undefined;
  Booking: { venue: Venue };
  BookingConfirmation: undefined;
  MyBookingScreen: undefined;
  ArenaOwnerRegister: undefined;
  ArenaDashboard: undefined;
  ArenaOTP: undefined;
  Main: undefined;
  VenueDetails: { venue: Venue };
  Home: undefined;
  CommunityScreen: undefined;
  RecentSearches: undefined;
  ProfilePage: undefined;
  VenueListScreen: undefined;
  ManageVenues: undefined;
  AddVenue: undefined;
  ViewBookings: undefined;

  Map: { address: string };
  RateVenue: { venueId: string };
  SportDetails: { sport: SportPrice };
};
