export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  collegeId: string;
  studentId: string;
  isVerified: boolean;
  rating?: number;
  totalRatings?: number;
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
  genderPreference: "male" | "female" | "any";
}

export interface Ride {
  id: string;
  driver_id: string;
  driver?: User;
  type: "offer" | "request";
  from_address: string;
  from_city: string;
  from_state: string;
  from_latitude?: number;
  from_longitude?: number;
  to_address: string;
  to_city: string;
  to_state: string;
  to_latitude?: number;
  to_longitude?: number;
  departure_time: string;
  available_seats: number;
  cost_per_seat: number;
  description?: string;
  status: "active" | "completed" | "cancelled";
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
  music_allowed?: boolean;
  gender_preference?: "male" | "female" | "any";
  passengers?: string[];
  created_at: string;
  updated_at: string;
  // Component-expected properties (mapped from database columns)
  fromLocation?: Location;
  toLocation?: Location;
  departureTime?: Date;
  availableSeats?: number;
  costPerSeat?: number;
  preferences?: RidePreferences;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  passenger: User;
  rideId: string;
  ride: Ride;
  status: "pending" | "approved" | "rejected";
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
  messageType: "text" | "system";
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
  type: "driver" | "passenger";
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "ride_request"
    | "ride_approved"
    | "ride_cancelled"
    | "message"
    | "rating";
  title: string;
  message: string;
  data: Record<string, string>;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateRideData {
  type: "offer" | "request";
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
  genderPreference?: "male" | "female" | "any";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  studentId?: string;
}
