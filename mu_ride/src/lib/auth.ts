// Authentication utilities for Mahindra University Carpool
import { User, RegisterData, LoginData } from "@/types";
import { supabase } from "./supabase";

// Mahindra University domain validation
const MAHINDRA_UNIVERSITY_DOMAIN = "mahindrauniversity.edu.in";

// AuthResponse interface
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Validate email domain for Mahindra University
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  return email.endsWith(`@${MAHINDRA_UNIVERSITY_DOMAIN}`);
};

// Convert Supabase user to our User type
const convertSupabaseUser = (supabaseUser: any, profile?: any): User => {
  return {
    id: supabaseUser.id,
    firstName:
      profile?.first_name || supabaseUser.user_metadata?.first_name || "",
    lastName: profile?.last_name || supabaseUser.user_metadata?.last_name || "",
    email: supabaseUser.email || "",
    phoneNumber: profile?.phone_number || "",
    collegeId: "mahindra-university", // Fixed for Mahindra University
    studentId: profile?.student_id || "",
    isVerified: supabaseUser.email_confirmed_at ? true : false,
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(),
  };
};

// Authentication functions
export const register = async (
  userData: RegisterData
): Promise<AuthResponse> => {
  // Validate email domain
  if (!validateEmail(userData.email)) {
    throw new Error(
      "Please use a valid Mahindra University email address (@mahindrauniversity.edu.in)"
    );
  }

  try {
    // Sign up with Supabase Auth (disable email confirmation for development)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone_number: userData.phoneNumber,
          student_id: userData.studentId,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      throw new Error(`Registration failed: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error("Registration failed: No user data returned");
    }

    console.log("Auth signup successful:", authData.user.id);

    // Wait a moment for the trigger to create the user profile
    console.log("Waiting for profile creation...");
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the user profile (created by the database trigger)
    const { data: profile, error: profileFetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileFetchError) {
      console.error("Profile fetch error:", profileFetchError);
      console.log("Attempting manual profile creation...");

      // If profile doesn't exist yet, create it manually
      const { error: manualProfileError } = await supabase.from("users").insert({
        id: authData.user.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone_number: userData.phoneNumber,
        student_id: userData.studentId,
        is_verified: false,
      });

      if (manualProfileError) {
        console.error("Manual profile creation error:", manualProfileError);
        throw new Error(`Profile creation failed: ${manualProfileError.message}`);
      }

      console.log("Manual profile creation successful");

      // Try fetching again
      const { data: newProfile, error: newProfileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (newProfileError) {
        console.error("New profile fetch error:", newProfileError);
        throw new Error("Failed to retrieve user profile");
      }

      const user = convertSupabaseUser(authData.user, newProfile);
      console.log("Registration completed successfully");
      return {
        user,
        token: authData.session?.access_token || "",
        refreshToken: authData.session?.refresh_token || "",
      };
    }

    const user = convertSupabaseUser(authData.user, profile);
    console.log("Registration completed successfully with trigger");
    return {
      user,
      token: authData.session?.access_token || "",
      refreshToken: authData.session?.refresh_token || "",
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const login = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

    if (authError) {
      throw authError;
    }

    if (!authData.user || !authData.session) {
      throw new Error("Login failed");
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      throw new Error("User profile not found");
    }

    const user = convertSupabaseUser(authData.user, profile);

    return {
      user,
      token: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  // This function is kept for backward compatibility
  // In a real app, you'd get this from Supabase auth state
  return null;
};

export const isAuthenticated = (): boolean => {
  // This function is kept for backward compatibility
  // In a real app, you'd check Supabase auth state
  return false;
};

// Get current user from Supabase
export const getCurrentUserFromSupabase = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return null;
    }

    return convertSupabaseUser(user, profile);
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

// Check if user is authenticated with Supabase
export const isAuthenticatedWithSupabase = async (): Promise<boolean> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return !error && !!user;
  } catch (error) {
    return false;
  }
};

// Update user profile
export const updateProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone_number: updates.phoneNumber,
        student_id: updates.studentId,
        is_verified: updates.isVerified,
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Get current user from auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    return convertSupabaseUser(user, data);
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

// Get all colleges (for Mahindra University, this returns only one college)
export const getAllColleges = () => {
  return [
    {
      id: "mahindra-university",
      name: "Mahindra University",
      domain: "mahindrauniversity.edu.in",
      city: "Hyderabad",
      state: "Telangana",
    },
  ];
};

// Get college by ID (for Mahindra University, this returns the university info)
export const getCollegeById = (collegeId: string) => {
  if (collegeId === "mahindra-university") {
    return {
      id: "mahindra-university",
      name: "Mahindra University",
      domain: "mahindrauniversity.edu.in",
      city: "Hyderabad",
      state: "Telangana",
    };
  }
  return null;
};

// Generate a unique ID (for backward compatibility)
export const generateId = (): string => {
  return crypto.randomUUID();
};
