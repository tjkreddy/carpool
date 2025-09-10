-- Additional helper functions and views for Campus Carpool

-- View for rides with driver information
CREATE VIEW rides_with_driver AS
SELECT 
    r.*,
    u.first_name as driver_first_name,
    u.last_name as driver_last_name,
    u.rating as driver_rating,
    u.total_ratings as driver_total_ratings,
    (
        SELECT COUNT(*) 
        FROM ride_passengers rp 
        WHERE rp.ride_id = r.id
    ) as current_passengers
FROM rides r
JOIN public.users u ON r.driver_id = u.id;

-- View for ride requests with user information
CREATE VIEW ride_requests_with_details AS
SELECT 
    rr.*,
    u.first_name as passenger_first_name,
    u.last_name as passenger_last_name,
    u.rating as passenger_rating,
    r.from_city,
    r.to_city,
    r.departure_time,
    r.cost_per_seat
FROM ride_requests rr
JOIN public.users u ON rr.passenger_id = u.id
JOIN rides r ON rr.ride_id = r.id;

-- Function to search rides by location and date
CREATE OR REPLACE FUNCTION search_rides(
    from_city_param VARCHAR DEFAULT NULL,
    to_city_param VARCHAR DEFAULT NULL,
    departure_date_param DATE DEFAULT NULL,
    max_cost_param DECIMAL DEFAULT NULL,
    min_seats_param INTEGER DEFAULT 1
)
RETURNS TABLE (
    id UUID,
    driver_id UUID,
    driver_name TEXT,
    driver_rating DECIMAL,
    type ride_type,
    from_address VARCHAR,
    from_city VARCHAR,
    from_state VARCHAR,
    to_address VARCHAR,
    to_city VARCHAR,
    to_state VARCHAR,
    departure_time TIMESTAMP WITH TIME ZONE,
    available_seats INTEGER,
    current_passengers BIGINT,
    cost_per_seat DECIMAL,
    description TEXT,
    smoking_allowed BOOLEAN,
    pets_allowed BOOLEAN,
    music_allowed BOOLEAN,
    gender_preference gender_preference
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rwf.id,
        rwf.driver_id,
        (rwf.driver_first_name || ' ' || rwf.driver_last_name) as driver_name,
        rwf.driver_rating,
        rwf.type,
        rwf.from_address,
        rwf.from_city,
        rwf.from_state,
        rwf.to_address,
        rwf.to_city,
        rwf.to_state,
        rwf.departure_time,
        rwf.available_seats,
        rwf.current_passengers,
        rwf.cost_per_seat,
        rwf.description,
        rwf.smoking_allowed,
        rwf.pets_allowed,
        rwf.music_allowed,
        rwf.gender_preference
    FROM rides_with_driver rwf
    WHERE rwf.status = 'active'
        AND (from_city_param IS NULL OR rwf.from_city ILIKE '%' || from_city_param || '%')
        AND (to_city_param IS NULL OR rwf.to_city ILIKE '%' || to_city_param || '%')
        AND (departure_date_param IS NULL OR DATE(rwf.departure_time) = departure_date_param)
        AND (max_cost_param IS NULL OR rwf.cost_per_seat <= max_cost_param)
        AND rwf.available_seats >= min_seats_param
        AND rwf.current_passengers < rwf.available_seats
    ORDER BY rwf.departure_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby rides based on coordinates
CREATE OR REPLACE FUNCTION get_nearby_rides(
    lat DECIMAL,
    lng DECIMAL,
    radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    driver_name TEXT,
    from_address VARCHAR,
    to_address VARCHAR,
    departure_time TIMESTAMP WITH TIME ZONE,
    available_seats INTEGER,
    cost_per_seat DECIMAL,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        (u.first_name || ' ' || u.last_name) as driver_name,
        r.from_address,
        r.to_address,
        r.departure_time,
        r.available_seats,
        r.cost_per_seat,
        ROUND(
            ST_Distance(
                ST_Point(lng, lat)::geography,
                ST_Point(r.from_longitude, r.from_latitude)::geography
            ) / 1000, 2
        ) as distance_km
    FROM rides r
    JOIN public.users u ON r.driver_id = u.id
    WHERE r.status = 'active'
        AND r.from_latitude IS NOT NULL 
        AND r.from_longitude IS NOT NULL
        AND ST_DWithin(
            ST_Point(lng, lat)::geography,
            ST_Point(r.from_longitude, r.from_latitude)::geography,
            radius_km * 1000
        )
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param UUID)
RETURNS TABLE (
    total_rides_as_driver BIGINT,
    total_rides_as_passenger BIGINT,
    total_completed_rides BIGINT,
    average_rating DECIMAL,
    total_ratings BIGINT,
    money_saved DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM rides WHERE driver_id = user_id_param) as total_rides_as_driver,
        (SELECT COUNT(*) FROM ride_passengers WHERE passenger_id = user_id_param) as total_rides_as_passenger,
        (
            SELECT COUNT(*) FROM rides r 
            LEFT JOIN ride_passengers rp ON r.id = rp.ride_id 
            WHERE (r.driver_id = user_id_param OR rp.passenger_id = user_id_param) 
            AND r.status = 'completed'
        ) as total_completed_rides,
        COALESCE((SELECT rating FROM public.users WHERE id = user_id_param), 0.0) as average_rating,
        COALESCE((SELECT total_ratings FROM public.users WHERE id = user_id_param), 0) as total_ratings,
        COALESCE(
            (
                SELECT SUM(r.cost_per_seat * 0.8) -- Assuming 20% savings from carpooling
                FROM rides r
                JOIN ride_passengers rp ON r.id = rp.ride_id
                WHERE rp.passenger_id = user_id_param AND r.status = 'completed'
            ), 0.0
        ) as money_saved;
END;
$$ LANGUAGE plpgsql;

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
    user_id_param UUID,
    type_param notification_type,
    title_param VARCHAR,
    message_param TEXT,
    data_param JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (user_id_param, type_param, title_param, message_param, data_param)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to approve a ride request
CREATE OR REPLACE FUNCTION approve_ride_request(request_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    request_record RECORD;
    available_seats_count INTEGER;
BEGIN
    -- Get the request details
    SELECT * INTO request_record
    FROM ride_requests rr
    JOIN rides r ON rr.ride_id = r.id
    WHERE rr.id = request_id_param AND rr.status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check available seats
    SELECT (r.available_seats - COUNT(rp.passenger_id)) INTO available_seats_count
    FROM rides r
    LEFT JOIN ride_passengers rp ON r.id = rp.ride_id
    WHERE r.id = request_record.ride_id
    GROUP BY r.available_seats;
    
    IF available_seats_count < request_record.requested_seats THEN
        RETURN FALSE;
    END IF;
    
    -- Approve the request
    UPDATE ride_requests SET status = 'approved' WHERE id = request_id_param;
    
    -- Add passenger to ride
    INSERT INTO ride_passengers (ride_id, passenger_id) 
    VALUES (request_record.ride_id, request_record.passenger_id);
    
    -- Create notification for passenger
    PERFORM create_notification(
        request_record.passenger_id,
        'ride_approved',
        'Ride Request Approved!',
        'Your request to join the ride has been approved.',
        json_build_object('ride_id', request_record.ride_id)::jsonb
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
