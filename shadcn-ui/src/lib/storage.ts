// LocalStorage utilities for data persistence in MVP
import {
  User,
  Ride,
  Message,
  Rating,
  Notification,
  RideRequest,
} from "@/types";

const STORAGE_KEYS = {
  USER: "carpooling_user",
  TOKEN: "carpooling_token",
  RIDES: "carpooling_rides",
  MESSAGES: "carpooling_messages",
  RATINGS: "carpooling_ratings",
  NOTIFICATIONS: "carpooling_notifications",
  RIDE_REQUESTS: "carpooling_ride_requests",
} as const;

// Generic storage functions
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};

// User storage functions
export const userStorage = {
  getUser: (): User | null => storage.get<User>(STORAGE_KEYS.USER),
  setUser: (user: User): void => storage.set(STORAGE_KEYS.USER, user),
  removeUser: (): void => storage.remove(STORAGE_KEYS.USER),

  getToken: (): string | null => storage.get<string>(STORAGE_KEYS.TOKEN),
  setToken: (token: string): void => storage.set(STORAGE_KEYS.TOKEN, token),
  removeToken: (): void => storage.remove(STORAGE_KEYS.TOKEN),
};

// Rides storage functions
export const ridesStorage = {
  getRides: (): Ride[] => storage.get<Ride[]>(STORAGE_KEYS.RIDES) || [],
  setRides: (rides: Ride[]): void => storage.set(STORAGE_KEYS.RIDES, rides),

  addRide: (ride: Ride): void => {
    const rides = ridesStorage.getRides();
    rides.push(ride);
    ridesStorage.setRides(rides);
  },

  updateRide: (rideId: string, updates: Partial<Ride>): void => {
    const rides = ridesStorage.getRides();
    const index = rides.findIndex((r) => r.id === rideId);
    if (index !== -1) {
      rides[index] = { ...rides[index], ...updates, updatedAt: new Date() };
      ridesStorage.setRides(rides);
    }
  },

  removeRide: (rideId: string): void => {
    const rides = ridesStorage.getRides();
    const filtered = rides.filter((r) => r.id !== rideId);
    ridesStorage.setRides(filtered);
  },

  getUserRides: (userId: string): Ride[] => {
    const rides = ridesStorage.getRides();
    return rides.filter(
      (r) => r.driverId === userId || r.passengers.includes(userId)
    );
  },
};

// Messages storage functions
export const messagesStorage = {
  getMessages: (): Message[] =>
    storage.get<Message[]>(STORAGE_KEYS.MESSAGES) || [],
  setMessages: (messages: Message[]): void =>
    storage.set(STORAGE_KEYS.MESSAGES, messages),

  addMessage: (message: Message): void => {
    const messages = messagesStorage.getMessages();
    messages.push(message);
    messagesStorage.setMessages(messages);
  },

  getConversationMessages: (
    userId1: string,
    userId2: string,
    rideId: string
  ): Message[] => {
    const messages = messagesStorage.getMessages();
    return messages
      .filter(
        (m) =>
          m.rideId === rideId &&
          ((m.senderId === userId1 && m.receiverId === userId2) ||
            (m.senderId === userId2 && m.receiverId === userId1))
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  },

  markMessagesAsRead: (userId: string, conversationId: string): void => {
    const messages = messagesStorage.getMessages();
    const updated = messages.map((m) =>
      m.receiverId === userId && m.rideId === conversationId
        ? { ...m, isRead: true }
        : m
    );
    messagesStorage.setMessages(updated);
  },
};

// Ride requests storage functions
export const rideRequestsStorage = {
  getRequests: (): RideRequest[] =>
    storage.get<RideRequest[]>(STORAGE_KEYS.RIDE_REQUESTS) || [],
  setRequests: (requests: RideRequest[]): void =>
    storage.set(STORAGE_KEYS.RIDE_REQUESTS, requests),

  addRequest: (request: RideRequest): void => {
    const requests = rideRequestsStorage.getRequests();
    requests.push(request);
    rideRequestsStorage.setRequests(requests);
  },

  updateRequest: (requestId: string, updates: Partial<RideRequest>): void => {
    const requests = rideRequestsStorage.getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      requests[index] = {
        ...requests[index],
        ...updates,
        updatedAt: new Date(),
      };
      rideRequestsStorage.setRequests(requests);
    }
  },

  getRideRequests: (rideId: string): RideRequest[] => {
    const requests = rideRequestsStorage.getRequests();
    return requests.filter((r) => r.rideId === rideId);
  },

  getUserRequests: (userId: string): RideRequest[] => {
    const requests = rideRequestsStorage.getRequests();
    return requests.filter((r) => r.passengerId === userId);
  },
};

// Ratings storage functions
export const ratingsStorage = {
  getRatings: (): Rating[] => storage.get<Rating[]>(STORAGE_KEYS.RATINGS) || [],
  setRatings: (ratings: Rating[]): void =>
    storage.set(STORAGE_KEYS.RATINGS, ratings),

  addRating: (rating: Rating): void => {
    const ratings = ratingsStorage.getRatings();
    ratings.push(rating);
    ratingsStorage.setRatings(ratings);
  },

  getUserRatings: (userId: string): Rating[] => {
    const ratings = ratingsStorage.getRatings();
    return ratings.filter((r) => r.ratedUserId === userId);
  },

  calculateUserRating: (userId: string): number => {
    const userRatings = ratingsStorage.getUserRatings(userId);
    if (userRatings.length === 0) return 0;

    const totalScore = userRatings.reduce(
      (sum, rating) => sum + rating.score,
      0
    );
    return Math.round((totalScore / userRatings.length) * 10) / 10;
  },
};

// Notifications storage functions
export const notificationsStorage = {
  getNotifications: (): Notification[] =>
    storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [],
  setNotifications: (notifications: Notification[]): void =>
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications),

  addNotification: (notification: Notification): void => {
    const notifications = notificationsStorage.getNotifications();
    notifications.unshift(notification); // Add to beginning for chronological order
    notificationsStorage.setNotifications(notifications);
  },

  getUserNotifications: (userId: string): Notification[] => {
    const notifications = notificationsStorage.getNotifications();
    return notifications
      .filter((n) => n.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  markAsRead: (notificationId: string): void => {
    const notifications = notificationsStorage.getNotifications();
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    notificationsStorage.setNotifications(updated);
  },

  getUnreadCount: (userId: string): number => {
    const userNotifications = notificationsStorage.getUserNotifications(userId);
    return userNotifications.filter((n) => !n.isRead).length;
  },
};

// Initialize demo data for MVP
export const initializeDemoData = (): void => {
  // Only initialize if no data exists
  if (ridesStorage.getRides().length === 0) {
    const demoUser: User = {
      id: "demo-user-1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@student.college.edu",
      phoneNumber: "+1234567890",
      collegeId: "demo-college-1",
      studentId: "123456",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const demoRides: Ride[] = [
      {
        id: "demo-ride-1",
        driverId: "demo-user-1",
        driver: demoUser,
        type: "offer",
        fromLocation: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: "University Campus",
          city: "San Francisco",
          state: "CA",
        },
        toLocation: {
          latitude: 37.7849,
          longitude: -122.4094,
          address: "Downtown Area",
          city: "San Francisco",
          state: "CA",
        },
        departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        availableSeats: 3,
        costPerSeat: 15,
        description:
          "Heading downtown after classes, can drop off at BART station",
        status: "active",
        preferences: {
          smokingAllowed: false,
          petsAllowed: false,
          musicAllowed: true,
          genderPreference: "any",
        },
        passengers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    ridesStorage.setRides(demoRides);
  }
};

// Initialize demo user for MVP
export const initializeDemoUser = (): void => {
  // Only initialize if no user exists
  if (!userStorage.getUser()) {
    const demoUser: User = {
      id: "demo-user-1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@student.college.edu",
      phoneNumber: "+1234567890",
      collegeId: "demo-college-1",
      studentId: "123456",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userStorage.setUser(demoUser);
  }
};
