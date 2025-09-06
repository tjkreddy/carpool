// Authentication utilities for the student carpooling application
import { User, RegisterData, LoginData, AuthResponse } from '@/types';
import { userStorage, ratingsStorage } from './storage';

// Mock college domains for validation
const VALID_COLLEGE_DOMAINS = [
  'stanford.edu',
  'berkeley.edu',
  'ucla.edu',
  'usc.edu',
  'caltech.edu',
  'student.college.edu', // Generic for demo
];

// Mock colleges data
const COLLEGES = [
  {
    id: 'stanford',
    name: 'Stanford University',
    domain: 'stanford.edu',
    location: {
      latitude: 37.4275,
      longitude: -122.1697,
      address: '450 Serra Mall',
      city: 'Stanford',
      state: 'CA',
    },
    isActive: true,
  },
  {
    id: 'berkeley',
    name: 'UC Berkeley',
    domain: 'berkeley.edu',
    location: {
      latitude: 37.8719,
      longitude: -122.2585,
      address: 'Berkeley, CA',
      city: 'Berkeley',
      state: 'CA',
    },
    isActive: true,
  },
  {
    id: 'demo-college',
    name: 'Demo College',
    domain: 'student.college.edu',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 College Ave',
      city: 'San Francisco',
      state: 'CA',
    },
    isActive: true,
  },
];

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateToken = (): string => {
  return btoa(generateId() + ':' + Date.now());
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCollegeEmail = (email: string): boolean => {
  if (!validateEmail(email)) return false;
  
  const domain = email.split('@')[1];
  return VALID_COLLEGE_DOMAINS.includes(domain);
};

export const getCollegeByDomain = (domain: string) => {
  return COLLEGES.find(college => college.domain === domain);
};

export const getCollegeById = (id: string) => {
  return COLLEGES.find(college => college.id === id);
};

export const getAllColleges = () => {
  return COLLEGES.filter(college => college.isActive);
};

// Mock user database (in real app, this would be in backend)
const getUsersFromStorage = (): User[] => {
  const users = localStorage.getItem('carpooling_users');
  return users ? JSON.parse(users) : [];
};

const saveUsersToStorage = (users: User[]): void => {
  localStorage.setItem('carpooling_users', JSON.stringify(users));
};

const findUserByEmail = (email: string): User | null => {
  const users = getUsersFromStorage();
  return users.find(user => user.email === email) || null;
};

const findUserById = (id: string): User | null => {
  const users = getUsersFromStorage();
  return users.find(user => user.id === id) || null;
};

// Authentication functions
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  // Validate email
  if (!validateCollegeEmail(userData.email)) {
    throw new Error('Please use a valid college email address');
  }

  // Check if user already exists
  if (findUserByEmail(userData.email)) {
    throw new Error('An account with this email already exists');
  }

  // Get college info
  const domain = userData.email.split('@')[1];
  const college = getCollegeByDomain(domain);
  
  if (!college) {
    throw new Error('College not supported yet');
  }

  // Create new user
  const newUser: User = {
    id: generateId(),
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phoneNumber: userData.phoneNumber,
    collegeId: college.id,
    isVerified: true, // Auto-verify for MVP
    verificationStatus: 'verified',
    rating: 0,
    totalRides: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save user
  const users = getUsersFromStorage();
  users.push(newUser);
  saveUsersToStorage(users);

  // Generate token
  const token = generateToken();
  const refreshToken = generateToken();

  // Store auth data
  userStorage.setUser(newUser);
  userStorage.setToken(token);

  return {
    user: newUser,
    token,
    refreshToken,
  };
};

export const login = async (loginData: LoginData): Promise<AuthResponse> => {
  // Find user
  const user = findUserByEmail(loginData.email);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // In a real app, we'd verify the password here
  // For MVP, we'll just check if the email exists

  // Update user rating from ratings
  const userRating = ratingsStorage.calculateUserRating(user.id);
  const updatedUser = { ...user, rating: userRating };

  // Generate new token
  const token = generateToken();
  const refreshToken = generateToken();

  // Store auth data
  userStorage.setUser(updatedUser);
  userStorage.setToken(token);

  return {
    user: updatedUser,
    token,
    refreshToken,
  };
};

export const logout = async (): Promise<void> => {
  userStorage.removeUser();
  userStorage.removeToken();
};

export const getCurrentUser = (): User | null => {
  return userStorage.getUser();
};

export const isAuthenticated = (): boolean => {
  const user = userStorage.getUser();
  const token = userStorage.getToken();
  return !!(user && token);
};

export const updateProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  const users = getUsersFromStorage();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const updatedUser = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date(),
  };

  users[userIndex] = updatedUser;
  saveUsersToStorage(users);

  // Update stored user if it's the current user
  const currentUser = userStorage.getUser();
  if (currentUser && currentUser.id === userId) {
    userStorage.setUser(updatedUser);
  }

  return updatedUser;
};

export const verifyEmail = async (token: string): Promise<boolean> => {
  // In a real app, this would verify the token with the backend
  // For MVP, we'll just return true
  return true;
};

export const refreshToken = async (refreshToken: string): Promise<string> => {
  // In a real app, this would validate the refresh token and return a new access token
  // For MVP, we'll just generate a new token
  const newToken = generateToken();
  userStorage.setToken(newToken);
  return newToken;
};

// Initialize demo user for testing
export const initializeDemoUser = (): void => {
  const existingUsers = getUsersFromStorage();
  
  if (existingUsers.length === 0) {
    const demoUser: User = {
      id: 'demo-user-1',
      email: 'john.doe@student.college.edu',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1-555-0123',
      collegeId: 'demo-college',
      isVerified: true,
      verificationStatus: 'verified',
      rating: 4.5,
      totalRides: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    saveUsersToStorage([demoUser]);
  }
};