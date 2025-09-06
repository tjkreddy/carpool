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

/**
 * A generic wrapper for `localStorage` to handle JSON serialization and parsing.
 */
export const storage = {
  /**
   * Retrieves an item from `localStorage` and parses it as JSON.
   * @param key The key of the item to retrieve.
   * @returns The parsed item, or `null` if not found or on error.
   */
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  /**
   * Serializes a value to JSON and stores it in `localStorage`.
   * @param key The key to store the item under.
   * @param value The value to store.
   */
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  },

  /**
   * Removes an item from `localStorage`.
   * @param key The key of the item to remove.
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },

  /**
   * Clears all items from `localStorage`.
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};

/**
 * A set of functions for managing user data and tokens in `localStorage`.
 */
export const userStorage = {
  /**
   * Retrieves the current user from `localStorage`.
   * @returns The user object or `null`.
   */
  getUser: (): User | null => storage.get<User>(STORAGE_KEYS.USER),
  /**
   * Stores the user object in `localStorage`.
   * @param user The user object to store.
   */
  setUser: (user: User): void => storage.set(STORAGE_KEYS.USER, user),
  /**
   * Removes the user object from `localStorage`.
   */
  removeUser: (): void => storage.remove(STORAGE_KEYS.USER),

  /**
   * Retrieves the auth token from `localStorage`.
   * @returns The token string or `null`.
   */
  getToken: (): string | null => storage.get<string>(STORAGE_KEYS.TOKEN),
  /**
   * Stores the auth token in `localStorage`.
   * @param token The token to store.
   */
  setToken: (token: string): void => storage.set(STORAGE_KEYS.TOKEN, token),
  /**
   * Removes the auth token from `localStorage`.
   */
  removeToken: (): void => storage.remove(STORAGE_KEYS.TOKEN),
};

/**
 * A set of functions for managing ride data in `localStorage`.
 */
export const ridesStorage = {
  /**
   * Retrieves all rides from `localStorage`.
   * @returns An array of ride objects.
   */
  getRides: (): Ride[] => storage.get<Ride[]>(STORAGE_KEYS.RIDES) || [],
  /**
   * Stores an array of rides in `localStorage`.
   * @param rides The array of rides to store.
   */
  setRides: (rides: Ride[]): void => storage.set(STORAGE_KEYS.RIDES, rides),

  /**
   * Adds a new ride to `localStorage`.
   * @param ride The ride to add.
   */
  addRide: (ride: Ride): void => {
    const rides = ridesStorage.getRides();
    rides.push(ride);
    ridesStorage.setRides(rides);
  },

  /**
   * Updates an existing ride in `localStorage`.
   * @param rideId The ID of the ride to update.
   * @param updates An object with the fields to update.
   */
  updateRide: (rideId: string, updates: Partial<Ride>): void => {
    const rides = ridesStorage.getRides();
    const index = rides.findIndex((r) => r.id === rideId);
    if (index !== -1) {
      rides[index] = { ...rides[index], ...updates, updatedAt: new Date() };
      ridesStorage.setRides(rides);
    }
  },

  /**
   * Removes a ride from `localStorage`.
   * @param rideId The ID of the ride to remove.
   */
  removeRide: (rideId: string): void => {
    const rides = ridesStorage.getRides();
    const filtered = rides.filter((r) => r.id !== rideId);
    ridesStorage.setRides(filtered);
  },

  /**
   * Retrieves all rides associated with a user (either as driver or passenger).
   * @param userId The ID of the user.
   * @returns An array of the user's rides.
   */
  getUserRides: (userId: string): Ride[] => {
    const rides = ridesStorage.getRides();
    return rides.filter(
      (r) => r.driverId === userId || r.passengers.includes(userId)
    );
  },
};

/**
 * A set of functions for managing message data in `localStorage`.
 */
export const messagesStorage = {
  /**
   * Retrieves all messages from `localStorage`.
   * @returns An array of message objects.
   */
  getMessages: (): Message[] =>
    storage.get<Message[]>(STORAGE_KEYS.MESSAGES) || [],
  /**
   * Stores an array of messages in `localStorage`.
   * @param messages The array of messages to store.
   */
  setMessages: (messages: Message[]): void =>
    storage.set(STORAGE_KEYS.MESSAGES, messages),

  /**
   * Adds a new message to `localStorage`.
   * @param message The message to add.
   */
  addMessage: (message: Message): void => {
    const messages = messagesStorage.getMessages();
    messages.push(message);
    messagesStorage.setMessages(messages);
  },

  /**
   * Retrieves all messages in a conversation between two users for a specific ride.
   * @param userId1 The ID of the first user.
   * @param userId2 The ID of the second user.
   * @param rideId The ID of the ride.
   * @returns A sorted array of messages in the conversation.
   */
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

  /**
   * Marks messages in a conversation as read for a specific user.
   * @param userId The ID of the user reading the messages.
   * @param conversationId The ID of the conversation (ride ID).
   */
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

/**
 * A set of functions for managing ride request data in `localStorage`.
 */
export const rideRequestsStorage = {
  /**
   * Retrieves all ride requests from `localStorage`.
   * @returns An array of ride request objects.
   */
  getRequests: (): RideRequest[] =>
    storage.get<RideRequest[]>(STORAGE_KEYS.RIDE_REQUESTS) || [],
  /**
   * Stores an array of ride requests in `localStorage`.
   * @param requests The array of ride requests to store.
   */
  setRequests: (requests: RideRequest[]): void =>
    storage.set(STORAGE_KEYS.RIDE_REQUESTS, requests),

  /**
   * Adds a new ride request to `localStorage`.
   * @param request The ride request to add.
   */
  addRequest: (request: RideRequest): void => {
    const requests = rideRequestsStorage.getRequests();
    requests.push(request);
    rideRequestsStorage.setRequests(requests);
  },

  /**
   * Updates an existing ride request in `localStorage`.
   * @param requestId The ID of the request to update.
   * @param updates An object with the fields to update.
   */
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

  /**
   * Retrieves all ride requests for a specific ride.
   * @param rideId The ID of the ride.
   * @returns An array of ride requests for the ride.
   */
  getRideRequests: (rideId: string): RideRequest[] => {
    const requests = rideRequestsStorage.getRequests();
    return requests.filter((r) => r.rideId === rideId);
  },

  /**
   * Retrieves all ride requests made by a specific user.
   * @param userId The ID of the user.
   * @returns An array of ride requests made by the user.
   */
  getUserRequests: (userId: string): RideRequest[] => {
    const requests = rideRequestsStorage.getRequests();
    return requests.filter((r) => r.passengerId === userId);
  },
};

/**
 * A set of functions for managing rating data in `localStorage`.
 */
export const ratingsStorage = {
  /**
   * Retrieves all ratings from `localStorage`.
   * @returns An array of rating objects.
   */
  getRatings: (): Rating[] => storage.get<Rating[]>(STORAGE_KEYS.RATINGS) || [],
  /**
   * Stores an array of ratings in `localStorage`.
   * @param ratings The array of ratings to store.
   */
  setRatings: (ratings: Rating[]): void =>
    storage.set(STORAGE_KEYS.RATINGS, ratings),

  /**
   * Adds a new rating to `localStorage`.
   * @param rating The rating to add.
   */
  addRating: (rating: Rating): void => {
    const ratings = ratingsStorage.getRatings();
    ratings.push(rating);
    ratingsStorage.setRatings(ratings);
  },

  /**
   * Retrieves all ratings for a specific user.
   * @param userId The ID of the user.
   * @returns An array of ratings for the user.
   */
  getUserRatings: (userId: string): Rating[] => {
    const ratings = ratingsStorage.getRatings();
    return ratings.filter((r) => r.ratedUserId === userId);
  },

  /**
   * Calculates the average rating for a user.
   * @param userId The ID of the user.
   * @returns The average rating, rounded to one decimal place.
   */
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

/**
 * A set of functions for managing notification data in `localStorage`.
 */
export const notificationsStorage = {
  /**
   * Retrieves all notifications from `localStorage`.
   * @returns An array of notification objects.
   */
  getNotifications: (): Notification[] =>
    storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [],
  /**
   * Stores an array of notifications in `localStorage`.
   * @param notifications The array of notifications to store.
   */
  setNotifications: (notifications: Notification[]): void =>
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications),

  /**
   * Adds a new notification to `localStorage`.
   * @param notification The notification to add.
   */
  addNotification: (notification: Notification): void => {
    const notifications = notificationsStorage.getNotifications();
    notifications.unshift(notification); // Add to beginning for chronological order
    notificationsStorage.setNotifications(notifications);
  },

  /**
   * Retrieves all notifications for a specific user.
   * @param userId The ID of the user.
   * @returns A sorted array of notifications for the user.
   */
  getUserNotifications: (userId: string): Notification[] => {
    const notifications = notificationsStorage.getNotifications();
    return notifications
      .filter((n) => n.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  /**
   * Marks a notification as read.
   * @param notificationId The ID of the notification to mark as read.
   */
  markAsRead: (notificationId: string): void => {
    const notifications = notificationsStorage.getNotifications();
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    notificationsStorage.setNotifications(updated);
  },

  /**
   * Gets the number of unread notifications for a user.
   * @param userId The ID of the user.
   * @returns The count of unread notifications.
   */
  getUnreadCount: (userId: string): number => {
    const userNotifications = notificationsStorage.getUserNotifications(userId);
    return userNotifications.filter((n) => !n.isRead).length;
  },
};

/**
 * Initializes demo data for the application if no data exists.
 */
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

/**
 * Initializes a demo user for the application if no user exists.
 * @deprecated This function is a duplicate and will be removed. Use `initializeDemoData` instead.
 */
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
