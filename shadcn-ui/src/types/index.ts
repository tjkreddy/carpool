export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  collegeId: string;
  studentId: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface College {
  id: string;
  name: string;
  domain: string;
  city: string;
  state: string;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface RidePreferences {
  smokingAllowed: boolean;
  petsAllowed: boolean;
  musicAllowed: boolean;
  genderPreference: 'male' | 'female' | 'any';
}

export interface Ride {
  id: string;
  driverId: string;
  driver: User;
  type: 'offer' | 'request';
  fromLocation: Location;
  toLocation: Location;
  departureTime: Date;
  availableSeats: number;
  costPerSeat: number;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  preferences: RidePreferences;
  passengers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  passenger: User;
  rideId: string;
  ride: Ride;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  requestedSeats: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  rideId: string;
  content: string;
  messageType: 'text' | 'system';
  isRead: boolean;
  createdAt: Date;
}

export interface ChatConversation {
  id: string;
  participants: User[];
  rideId: string;
  lastMessage?: Message;
  unreadCount: number;
}

export interface Rating {
  id: string;
  raterId: string;
  rater: User;
  ratedUserId: string;
  ratedUser: User;
  rideId: string;
  score: number;
  comment?: string;
  type: 'driver' | 'passenger';
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'ride_request' | 'ride_approved' | 'ride_cancelled' | 'message' | 'rating';
  title: string;
  message: string;
  data: Record<string, string>;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateRideData {
  type: 'offer' | 'request';
  fromLocation: {
    address: string;
    city: string;
    state: string;
  };
  toLocation: {
    address: string;
    city: string;
    state: string;
  };
  departureTime: Date;
  availableSeats: number;
  costPerSeat: number;
  description: string;
  preferences: RidePreferences;
}

export interface SearchCriteria {
  fromCity?: string;
  toCity?: string;
  departureDate?: Date;
  maxCostPerSeat?: number;
  availableSeats?: number;
  genderPreference?: 'male' | 'female' | 'any';
}