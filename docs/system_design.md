# Student Carpooling Web Application - System Design

## Implementation Approach

We will build a modern, scalable web application using React with TypeScript for the frontend and Node.js with Express for the backend. The system will prioritize real-time communication, mobile responsiveness, and security for student users.

**Key Technical Challenges & Solutions:**
- **Real-time Communication**: Implement Socket.IO for instant messaging and live ride updates
- **Mobile-First Design**: Use Tailwind CSS with responsive design patterns and PWA capabilities
- **Authentication Security**: Implement JWT-based authentication with college email verification
- **Scalability**: Use microservices architecture with Docker containers and cloud deployment
- **Location Services**: Integrate Google Maps API for route planning and real-time tracking
- **Cost Splitting**: Implement automated fare calculation algorithms with transparent pricing

**Technology Stack Selection:**
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Shadcn-ui for modern, type-safe UI development
- **Backend**: Node.js + Express + TypeScript for consistent language across the stack
- **Database**: PostgreSQL for relational data + Redis for caching and session management
- **Real-time**: Socket.IO for WebSocket connections
- **Authentication**: JWT + Passport.js for secure authentication flows
- **File Storage**: AWS S3 for profile images and document uploads
- **Deployment**: Docker + AWS ECS for containerized, scalable deployment

## Data Structures and Interfaces

```mermaid
classDiagram
    class User {
        +id: string
        +email: string
        +firstName: string
        +lastName: string
        +phoneNumber: string
        +collegeId: string
        +profileImage: string
        +isVerified: boolean
        +verificationStatus: VerificationStatus
        +rating: number
        +totalRides: number
        +createdAt: Date
        +updatedAt: Date
        +__init__(email: string, firstName: string, lastName: string)
        +verifyEmail(): Promise<boolean>
        +updateProfile(data: UserUpdateData): Promise<User>
        +calculateRating(): number
    }

    class College {
        +id: string
        +name: string
        +domain: string
        +location: Location
        +isActive: boolean
        +createdAt: Date
        +__init__(name: string, domain: string, location: Location)
        +validateEmailDomain(email: string): boolean
    }

    class Ride {
        +id: string
        +driverId: string
        +type: RideType
        +fromLocation: Location
        +toLocation: Location
        +departureTime: Date
        +availableSeats: number
        +costPerSeat: number
        +description: string
        +status: RideStatus
        +vehicleInfo: VehicleInfo
        +preferences: RidePreferences
        +createdAt: Date
        +updatedAt: Date
        +__init__(driverId: string, type: RideType, fromLocation: Location, toLocation: Location)
        +updateStatus(status: RideStatus): Promise<void>
        +calculateTotalCost(): number
        +addPassenger(userId: string): Promise<boolean>
        +removePassenger(userId: string): Promise<boolean>
    }

    class RideRequest {
        +id: string
        +passengerId: string
        +rideId: string
        +status: RequestStatus
        +message: string
        +requestedSeats: number
        +createdAt: Date
        +updatedAt: Date
        +__init__(passengerId: string, rideId: string, requestedSeats: number)
        +approve(): Promise<void>
        +reject(reason: string): Promise<void>
    }

    class Message {
        +id: string
        +senderId: string
        +receiverId: string
        +rideId: string
        +content: string
        +messageType: MessageType
        +isRead: boolean
        +createdAt: Date
        +__init__(senderId: string, receiverId: string, content: string)
        +markAsRead(): Promise<void>
    }

    class Rating {
        +id: string
        +raterId: string
        +ratedUserId: string
        +rideId: string
        +score: number
        +comment: string
        +type: RatingType
        +createdAt: Date
        +__init__(raterId: string, ratedUserId: string, rideId: string, score: number)
    }

    class Notification {
        +id: string
        +userId: string
        +type: NotificationType
        +title: string
        +message: string
        +data: object
        +isRead: boolean
        +createdAt: Date
        +__init__(userId: string, type: NotificationType, title: string, message: string)
        +markAsRead(): Promise<void>
        +send(): Promise<void>
    }

    class Location {
        +latitude: number
        +longitude: number
        +address: string
        +city: string
        +state: string
        +zipCode: string
        +__init__(latitude: number, longitude: number, address: string)
        +calculateDistance(other: Location): number
    }

    class VehicleInfo {
        +make: string
        +model: string
        +year: number
        +color: string
        +licensePlate: string
        +__init__(make: string, model: string, year: number, color: string)
    }

    class AuthService {
        +register(userData: RegisterData): Promise<User>
        +login(email: string, password: string): Promise<AuthResponse>
        +verifyEmail(token: string): Promise<boolean>
        +refreshToken(refreshToken: string): Promise<string>
        +logout(userId: string): Promise<void>
    }

    class RideService {
        +createRide(rideData: CreateRideData): Promise<Ride>
        +searchRides(criteria: SearchCriteria): Promise<Ride[]>
        +getRideById(rideId: string): Promise<Ride>
        +updateRide(rideId: string, updateData: UpdateRideData): Promise<Ride>
        +deleteRide(rideId: string): Promise<void>
        +requestToJoin(rideId: string, passengerId: string): Promise<RideRequest>
    }

    class MessageService {
        +sendMessage(messageData: SendMessageData): Promise<Message>
        +getConversation(userId1: string, userId2: string, rideId: string): Promise<Message[]>
        +markMessagesAsRead(userId: string, conversationId: string): Promise<void>
    }

    class NotificationService {
        +createNotification(notificationData: CreateNotificationData): Promise<Notification>
        +getUserNotifications(userId: string): Promise<Notification[]>
        +markAsRead(notificationId: string): Promise<void>
        +sendPushNotification(userId: string, notification: Notification): Promise<void>
    }

    class PaymentService {
        +calculateRideCost(rideId: string): Promise<CostBreakdown>
        +splitCost(totalCost: number, passengers: string[]): Promise<CostSplit>
        +processPayment(paymentData: PaymentData): Promise<PaymentResult>
    }

    User ||--|| College : belongs_to
    User ||--o{ Ride : creates
    User ||--o{ RideRequest : makes
    User ||--o{ Message : sends
    User ||--o{ Rating : gives
    User ||--o{ Notification : receives
    Ride ||--o{ RideRequest : has
    Ride ||--|| Location : from_location
    Ride ||--|| Location : to_location
    Ride ||--|| VehicleInfo : has
    RideRequest ||--|| Ride : for
    Message ||--|| Ride : about
    Rating ||--|| Ride : for
```

## Program Call Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Gateway
    participant AUTH as AuthService
    participant RS as RideService
    participant MS as MessageService
    participant NS as NotificationService
    participant DB as Database
    participant WS as WebSocket Server
    participant EXT as External APIs

    Note over U, EXT: User Registration & Authentication Flow
    U->>FE: Enter college email and password
    FE->>API: POST /api/auth/register
    API->>AUTH: register(userData)
    AUTH->>DB: INSERT INTO users
    AUTH->>EXT: Send verification email
    AUTH-->>API: Return user data
    API-->>FE: Return auth response
    FE-->>U: Show verification required

    U->>FE: Click email verification link
    FE->>API: GET /api/auth/verify/:token
    API->>AUTH: verifyEmail(token)
    AUTH->>DB: UPDATE users SET isVerified = true
    AUTH-->>API: Return success
    API-->>FE: Return verification success
    FE-->>U: Show dashboard

    Note over U, EXT: Ride Creation Flow
    U->>FE: Fill ride offer form
    FE->>EXT: Get location coordinates
    EXT-->>FE: Return lat/lng
    FE->>API: POST /api/rides
    API->>RS: createRide(rideData)
    RS->>DB: INSERT INTO rides
    RS->>NS: Create ride notifications
    NS->>DB: INSERT INTO notifications
    NS->>WS: Broadcast new ride
    WS-->>FE: Notify interested users
    RS-->>API: Return ride data
    API-->>FE: Return created ride
    FE-->>U: Show ride created success

    Note over U, EXT: Ride Search & Booking Flow
    U->>FE: Search for rides
    FE->>API: GET /api/rides/search?params
    API->>RS: searchRides(criteria)
    RS->>DB: SELECT FROM rides WHERE conditions
    RS-->>API: Return matching rides
    API-->>FE: Return search results
    FE-->>U: Display available rides

    U->>FE: Request to join ride
    FE->>API: POST /api/rides/:id/requests
    API->>RS: requestToJoin(rideId, userId)
    RS->>DB: INSERT INTO ride_requests
    RS->>NS: Notify driver
    NS->>WS: Send real-time notification
    WS-->>FE: Update driver's notifications
    RS-->>API: Return request data
    API-->>FE: Return request success
    FE-->>U: Show request sent

    Note over U, EXT: Real-time Messaging Flow
    U->>FE: Send message
    FE->>WS: Emit message event
    WS->>MS: sendMessage(messageData)
    MS->>DB: INSERT INTO messages
    MS->>WS: Broadcast to recipient
    WS-->>FE: Deliver message
    FE-->>U: Show message delivered

    Note over U, EXT: Ride Completion & Rating Flow
    U->>FE: Complete ride
    FE->>API: PUT /api/rides/:id/complete
    API->>RS: updateRide(rideId, {status: 'completed'})
    RS->>DB: UPDATE rides SET status = 'completed'
    RS->>NS: Send rating reminders
    NS->>WS: Notify participants
    RS-->>API: Return updated ride
    API-->>FE: Return completion success
    FE-->>U: Show rating prompt

    U->>FE: Submit rating
    FE->>API: POST /api/ratings
    API->>DB: INSERT INTO ratings
    API->>DB: UPDATE user ratings
    API-->>FE: Return rating success
    FE-->>U: Show thank you message
```

## Anything UNCLEAR

Several aspects need clarification for optimal implementation:

1. **Payment Integration Scope**: The PRD mentions cost splitting but doesn't specify if actual payment processing is required or if it's just calculation-based for manual payments.

2. **College Verification Process**: Need details on how college email domains will be validated and maintained, and whether integration with college IT systems is required.

3. **Liability and Insurance**: Legal framework for peer-to-peer ride sharing needs clarification, especially regarding platform liability and required insurance coverage.

4. **Geographic Expansion Strategy**: Whether the system should be designed for single-college deployment initially or multi-tenant architecture from the start.

5. **Real-time Location Tracking**: Level of location tracking required during rides and privacy implications for users.

6. **Content Moderation**: Automated and manual moderation requirements for user-generated content and safety monitoring.

7. **Data Retention Policies**: Specific requirements for how long user data, ride history, and messages should be retained.

8. **Emergency Procedures**: Integration requirements with campus security or emergency services for incident handling.