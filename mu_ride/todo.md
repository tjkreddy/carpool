# Student Carpooling App - MVP Implementation Plan

## Core Files to Create/Modify

### 1. Authentication & User Management
- `src/types/index.ts` - TypeScript interfaces for all data structures
- `src/lib/auth.ts` - Authentication utilities and JWT handling
- `src/lib/storage.ts` - LocalStorage utilities for data persistence
- `src/components/auth/LoginForm.tsx` - College email login form
- `src/components/auth/RegisterForm.tsx` - Student registration form
- `src/components/auth/AuthGuard.tsx` - Protected route wrapper

### 2. Ride Management
- `src/components/rides/RideOfferForm.tsx` - Create ride offer form
- `src/components/rides/RideRequestForm.tsx` - Create ride request form
- `src/components/rides/RideCard.tsx` - Individual ride display component
- `src/components/rides/RidesList.tsx` - List of available rides
- `src/components/rides/RideDetails.tsx` - Detailed ride view
- `src/components/rides/SearchFilters.tsx` - Search and filter component

### 3. User Interface & Navigation
- `src/components/layout/Header.tsx` - App header with navigation
- `src/components/layout/BottomNav.tsx` - Mobile bottom navigation
- `src/components/layout/Layout.tsx` - Main layout wrapper
- `src/pages/Dashboard.tsx` - Main dashboard page
- `src/pages/MyRides.tsx` - User's rides page
- `src/pages/Profile.tsx` - User profile page
- `src/pages/Messages.tsx` - Chat messages page

### 4. Communication & Features
- `src/components/chat/ChatWindow.tsx` - Chat interface
- `src/components/chat/MessageBubble.tsx` - Individual message component
- `src/components/ratings/RatingForm.tsx` - Rating and review form
- `src/components/notifications/NotificationCenter.tsx` - Notifications display
- `src/lib/costCalculator.ts` - Cost splitting calculations

### 5. PWA & Configuration
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service worker for offline functionality
- Update `index.html` - Add PWA meta tags and title
- Update `vite.config.ts` - PWA plugin configuration

## Implementation Priority
1. Data types and storage utilities
2. Authentication system
3. Basic ride management (create, list, search)
4. User interface and navigation
5. Chat functionality
6. Ratings and additional features
7. PWA configuration

## Key Features to Implement
- College email authentication with verification
- Post ride offers and requests
- Search and filter rides by time, destination, cost
- Book/join rides instantly
- Basic chat between matched students
- Cost splitting calculations
- Ratings and reviews system
- Mobile-responsive design
- PWA capabilities for mobile installation