// Supabase client configuration for Campus Carpool
import { createClient } from "@supabase/supabase-js";

// Database type definitions based on our schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone_number: string | null;
          student_id: string | null;
          is_verified: boolean;
          rating: number;
          total_ratings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone_number?: string | null;
          student_id?: string | null;
          is_verified?: boolean;
          rating?: number;
          total_ratings?: number;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          phone_number?: string | null;
          student_id?: string | null;
          is_verified?: boolean;
        };
      };
      rides: {
        Row: {
          id: string;
          driver_id: string;
          type: "offer" | "request";
          from_address: string;
          from_city: string;
          from_state: string;
          from_latitude: number | null;
          from_longitude: number | null;
          to_address: string;
          to_city: string;
          to_state: string;
          to_latitude: number | null;
          to_longitude: number | null;
          departure_time: string;
          available_seats: number;
          cost_per_seat: number;
          description: string | null;
          status: "active" | "completed" | "cancelled";
          smoking_allowed: boolean;
          pets_allowed: boolean;
          music_allowed: boolean;
          gender_preference: "male" | "female" | "any";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          type: "offer" | "request";
          from_address: string;
          from_city: string;
          from_state: string;
          from_latitude?: number | null;
          from_longitude?: number | null;
          to_address: string;
          to_city: string;
          to_state: string;
          to_latitude?: number | null;
          to_longitude?: number | null;
          departure_time: string;
          available_seats: number;
          cost_per_seat: number;
          description?: string | null;
          smoking_allowed?: boolean;
          pets_allowed?: boolean;
          music_allowed?: boolean;
          gender_preference?: "male" | "female" | "any";
        };
        Update: {
          type?: "offer" | "request";
          from_address?: string;
          from_city?: string;
          from_state?: string;
          from_latitude?: number | null;
          from_longitude?: number | null;
          to_address?: string;
          to_city?: string;
          to_state?: string;
          to_latitude?: number | null;
          to_longitude?: number | null;
          departure_time?: string;
          available_seats?: number;
          cost_per_seat?: number;
          description?: string | null;
          status?: "active" | "completed" | "cancelled";
          smoking_allowed?: boolean;
          pets_allowed?: boolean;
          music_allowed?: boolean;
          gender_preference?: "male" | "female" | "any";
        };
      };
      ride_passengers: {
        Row: {
          id: string;
          ride_id: string;
          passenger_id: string;
          joined_at: string;
        };
        Insert: {
          ride_id: string;
          passenger_id: string;
        };
        Update: {
          // No updates needed for this table
        };
      };
      ride_requests: {
        Row: {
          id: string;
          passenger_id: string;
          ride_id: string;
          status: "pending" | "approved" | "rejected";
          message: string | null;
          requested_seats: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          passenger_id: string;
          ride_id: string;
          message?: string | null;
          requested_seats?: number;
        };
        Update: {
          status?: "pending" | "approved" | "rejected";
          message?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          ride_id: string;
          content: string;
          message_type: "text" | "system";
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          sender_id: string;
          receiver_id: string;
          ride_id: string;
          content: string;
          message_type?: "text" | "system";
        };
        Update: {
          is_read?: boolean;
        };
      };
      ratings: {
        Row: {
          id: string;
          rater_id: string;
          rated_user_id: string;
          ride_id: string;
          score: number;
          comment: string | null;
          type: "driver" | "passenger";
          created_at: string;
        };
        Insert: {
          rater_id: string;
          rated_user_id: string;
          ride_id: string;
          score: number;
          comment?: string | null;
          type: "driver" | "passenger";
        };
        Update: {
          score?: number;
          comment?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type:
            | "ride_request"
            | "ride_approved"
            | "ride_cancelled"
            | "message"
            | "rating";
          title: string;
          message: string;
          data: Record<string, any>;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type:
            | "ride_request"
            | "ride_approved"
            | "ride_cancelled"
            | "message"
            | "rating";
          title: string;
          message: string;
          data?: Record<string, any>;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: {
      rides_with_driver: {
        Row: {
          id: string;
          driver_id: string;
          driver_first_name: string;
          driver_last_name: string;
          driver_rating: number;
          driver_total_ratings: number;
          current_passengers: number;
          type: "offer" | "request";
          from_address: string;
          from_city: string;
          from_state: string;
          to_address: string;
          to_city: string;
          to_state: string;
          departure_time: string;
          available_seats: number;
          cost_per_seat: number;
          description: string | null;
          status: "active" | "completed" | "cancelled";
          smoking_allowed: boolean;
          pets_allowed: boolean;
          music_allowed: boolean;
          gender_preference: "male" | "female" | "any";
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      search_rides: {
        Args: {
          from_city_param?: string;
          to_city_param?: string;
          departure_date_param?: string;
          max_cost_param?: number;
          min_seats_param?: number;
        };
        Returns: Array<{
          id: string;
          driver_id: string;
          driver_name: string;
          driver_rating: number;
          type: "offer" | "request";
          from_address: string;
          from_city: string;
          from_state: string;
          to_address: string;
          to_city: string;
          to_state: string;
          departure_time: string;
          available_seats: number;
          current_passengers: number;
          cost_per_seat: number;
          description: string;
          smoking_allowed: boolean;
          pets_allowed: boolean;
          music_allowed: boolean;
          gender_preference: "male" | "female" | "any";
        }>;
      };
      get_nearby_rides: {
        Args: {
          lat: number;
          lng: number;
          radius_km?: number;
        };
        Returns: Array<{
          id: string;
          driver_name: string;
          from_address: string;
          to_address: string;
          departure_time: string;
          available_seats: number;
          cost_per_seat: number;
          distance_km: number;
        }>;
      };
      get_user_stats: {
        Args: {
          user_id_param: string;
        };
        Returns: Array<{
          total_rides_as_driver: number;
          total_rides_as_passenger: number;
          total_completed_rides: number;
          average_rating: number;
          total_ratings: number;
          money_saved: number;
        }>;
      };
      approve_ride_request: {
        Args: {
          request_id_param: string;
        };
        Returns: boolean;
      };
    };
  };
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const auth = {
  signUp: async (
    email: string,
    password: string,
    userData: { firstName: string; lastName: string }
  ) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      },
    });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default supabase;
