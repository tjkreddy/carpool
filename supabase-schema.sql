-- Campus Carpool Supabase Schema (Mahindra University Only)
-- Created for student carpooling application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE ride_type AS ENUM ('offer', 'request');
CREATE TYPE ride_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE message_type AS ENUM ('text', 'system');
CREATE TYPE rating_type AS ENUM ('driver', 'passenger');
CREATE TYPE notification_type AS ENUM ('ride_request', 'ride_approved', 'ride_cancelled', 'message', 'rating');
CREATE TYPE gender_preference AS ENUM ('male', 'female', 'any');

-- Users table (extends Supabase auth.users) - Mahindra University only
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    student_id VARCHAR(50) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Email domain constraint for Mahindra University
    CONSTRAINT email_domain_check CHECK (email LIKE '%@mahindrauniversity.edu.in')
);

-- Rides table
CREATE TABLE rides (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type ride_type NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    from_city VARCHAR(100) NOT NULL,
    from_state VARCHAR(50) NOT NULL,
    from_latitude DECIMAL(10, 8),
    from_longitude DECIMAL(11, 8),
    to_address VARCHAR(255) NOT NULL,
    to_city VARCHAR(100) NOT NULL,
    to_state VARCHAR(50) NOT NULL,
    to_latitude DECIMAL(10, 8),
    to_longitude DECIMAL(11, 8),
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    available_seats INTEGER NOT NULL CHECK (available_seats > 0),
    cost_per_seat DECIMAL(10, 2) NOT NULL CHECK (cost_per_seat >= 0),
    description TEXT,
    status ride_status DEFAULT 'active',
    smoking_allowed BOOLEAN DEFAULT FALSE,
    pets_allowed BOOLEAN DEFAULT FALSE,
    music_allowed BOOLEAN DEFAULT TRUE,
    gender_preference gender_preference DEFAULT 'any',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ride passengers junction table
CREATE TABLE ride_passengers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
    passenger_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(ride_id, passenger_id)
);

-- Ride requests table
CREATE TABLE ride_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    passenger_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
    status request_status DEFAULT 'pending',
    message TEXT,
    requested_seats INTEGER DEFAULT 1 CHECK (requested_seats > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(passenger_id, ride_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ratings table
CREATE TABLE ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rater_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    rated_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    type rating_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(rater_id, rated_user_id, ride_id, type)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_student_id ON public.users(student_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_departure_time ON rides(departure_time);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_from_city ON rides(from_city);
CREATE INDEX idx_rides_to_city ON rides(to_city);
CREATE INDEX idx_ride_passengers_ride_id ON ride_passengers(ride_id);
CREATE INDEX idx_ride_passengers_passenger_id ON ride_passengers(passenger_id);
CREATE INDEX idx_ride_requests_passenger_id ON ride_requests(passenger_id);
CREATE INDEX idx_ride_requests_ride_id ON ride_requests(ride_id);
CREATE INDEX idx_ride_requests_status ON ride_requests(status);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_ride_id ON messages(ride_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_ratings_rated_user_id ON ratings(rated_user_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create spatial indexes for location-based queries
CREATE INDEX idx_rides_from_location ON rides USING GIST (POINT(from_longitude, from_latitude));
CREATE INDEX idx_rides_to_location ON rides USING GIST (POINT(to_longitude, to_latitude));

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data and other users' public data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Rides policies
CREATE POLICY "Anyone can view active rides" ON rides
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create rides" ON rides
    FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their rides" ON rides
    FOR UPDATE USING (auth.uid() = driver_id);

-- Ride passengers policies
CREATE POLICY "Users can view ride passengers" ON ride_passengers
    FOR SELECT USING (true);

CREATE POLICY "Users can join rides" ON ride_passengers
    FOR INSERT WITH CHECK (auth.uid() = passenger_id);

-- Ride requests policies
CREATE POLICY "Users can view requests for their rides" ON ride_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rides WHERE rides.id = ride_requests.ride_id 
            AND rides.driver_id = auth.uid()
        ) OR passenger_id = auth.uid()
    );

CREATE POLICY "Users can create ride requests" ON ride_requests
    FOR INSERT WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Drivers can update requests for their rides" ON ride_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM rides WHERE rides.id = ride_requests.ride_id 
            AND rides.driver_id = auth.uid()
        )
    );

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON messages
    FOR UPDATE USING (auth.uid() = receiver_id);

-- Ratings policies
CREATE POLICY "Users can view all ratings" ON ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can create ratings" ON ratings
    FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ride_requests_updated_at BEFORE UPDATE ON ride_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and update user ratings
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users SET 
        rating = (
            SELECT COALESCE(AVG(score::DECIMAL), 0.0)
            FROM ratings 
            WHERE rated_user_id = NEW.rated_user_id
        ),
        total_ratings = (
            SELECT COUNT(*)
            FROM ratings 
            WHERE rated_user_id = NEW.rated_user_id
        )
    WHERE id = NEW.rated_user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update user ratings when a new rating is added
CREATE TRIGGER update_user_rating_trigger AFTER INSERT ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Create a function to handle new user registration (Mahindra University only)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate email domain for Mahindra University
    IF NEW.email NOT LIKE '%@mahindrauniversity.edu.in' THEN
        RAISE EXCEPTION 'Only Mahindra University email addresses are allowed';
    END IF;

    INSERT INTO public.users (id, first_name, last_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
