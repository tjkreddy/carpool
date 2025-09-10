import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Car, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromSupabase } from "@/lib/auth";
import { generateId } from "@/lib/auth";
import { Ride, SearchCriteria, User } from "@/types";
import SearchFilters from "@/components/rides/SearchFilters";
import RideCard from "@/components/rides/RideCard";
import { useNavigate } from "react-router-dom";

/**
 * A page that allows users to search for available rides.
 * It provides search filters and displays a list of matching rides.
 * @returns The rendered page component.
 */
export default function SearchRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUserFromSupabase();
        setUser(currentUser);

        if (currentUser) {
          // Load all active rides from Supabase
          const { data: allRides, error: ridesError } = await supabase
            .from("rides")
            .select("*")
            .eq("status", "active")
            .eq("type", "offer")
            .neq("driver_id", currentUser.id);

          if (ridesError) {
            console.error("Error fetching rides:", ridesError);
            setMessage("Error loading rides. Please try again.");
          } else {
            // Get driver information for each ride
            const ridesWithDrivers = await Promise.all(
              (allRides || []).map(async (ride) => {
                const { data: driver } = await supabase
                  .from("users")
                  .select("*")
                  .eq("id", ride.driver_id)
                  .single();

                // Map database structure to expected component structure
                return {
                  ...ride,
                  driver: driver || null,
                  fromLocation: {
                    address: ride.from_address,
                    city: ride.from_city,
                    state: ride.from_state,
                    latitude: ride.from_latitude,
                    longitude: ride.from_longitude,
                  },
                  toLocation: {
                    address: ride.to_address,
                    city: ride.to_city,
                    state: ride.to_state,
                    latitude: ride.to_latitude,
                    longitude: ride.to_longitude,
                  },
                  departureTime: new Date(ride.departure_time),
                  availableSeats: ride.available_seats,
                  costPerSeat: ride.cost_per_seat,
                  passengers: [], // We'll need to fetch this separately if needed
                  preferences: {
                    smokingAllowed: ride.smoking_allowed,
                    petsAllowed: ride.pets_allowed,
                    musicAllowed: ride.music_allowed,
                    genderPreference: ride.gender_preference,
                  },
                };
              })
            );

            // Filter out rides where user is already a passenger
            const availableRides = ridesWithDrivers.filter(
              (ride) => !ride.passengers?.includes(currentUser.id)
            );

            setRides(availableRides);
            setFilteredRides(availableRides);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setMessage("Error loading data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  const handleSearch = (criteria: SearchCriteria) => {
    let filtered = [...rides];

    // Filter by from city
    if (criteria.fromCity) {
      filtered = filtered.filter(
        (ride) =>
          ride.fromLocation.city
            .toLowerCase()
            .includes(criteria.fromCity!.toLowerCase()) ||
          ride.fromLocation.address
            .toLowerCase()
            .includes(criteria.fromCity!.toLowerCase())
      );
    }

    // Filter by to city
    if (criteria.toCity) {
      filtered = filtered.filter(
        (ride) =>
          ride.toLocation.city
            .toLowerCase()
            .includes(criteria.toCity!.toLowerCase()) ||
          ride.toLocation.address
            .toLowerCase()
            .includes(criteria.toCity!.toLowerCase())
      );
    }

    // Filter by departure date
    if (criteria.departureDate) {
      const searchDate = criteria.departureDate.toDateString();
      filtered = filtered.filter(
        (ride) => ride.departureTime.toDateString() === searchDate
      );
    }

    // Filter by max cost
    if (criteria.maxCostPerSeat) {
      filtered = filtered.filter(
        (ride) => ride.costPerSeat <= criteria.maxCostPerSeat!
      );
    }

    // Filter by available seats
    if (criteria.availableSeats) {
      filtered = filtered.filter(
        (ride) => ride.availableSeats >= criteria.availableSeats!
      );
    }

    // Filter by gender preference
    if (criteria.genderPreference) {
      filtered = filtered.filter(
        (ride) =>
          ride.preferences.genderPreference === "any" ||
          ride.preferences.genderPreference === criteria.genderPreference
      );
    }

    setFilteredRides(filtered);
  };

  const handleClearSearch = () => {
    setFilteredRides(rides);
  };

  const handleJoinRide = async (rideId: string) => {
    if (!user) return;

    try {
      const ride = rides.find((r) => r.id === rideId);
      if (!ride) {
        setMessage("Ride not found");
        return;
      }

      if (ride.available_seats <= 0) {
        setMessage("No seats available");
        return;
      }

      // Check if user already requested this ride
      const { data: existingRequests, error: checkError } = await supabase
        .from("ride_requests")
        .select("*")
        .eq("passenger_id", user.id)
        .eq("ride_id", rideId)
        .eq("status", "pending");

      if (checkError) {
        console.error("Error checking existing requests:", checkError);
        setMessage("Error checking ride request status");
        return;
      }

      if (existingRequests && existingRequests.length > 0) {
        setMessage("You have already requested to join this ride");
        return;
      }

      // Create ride request in Supabase
      const { data: requestData, error: requestError } = await supabase
        .from("ride_requests")
        .insert({
          passenger_id: user.id,
          ride_id: rideId,
          status: "pending",
          message: `${user.firstName} ${user.lastName} would like to join your ride`,
          requested_seats: 1,
        })
        .select()
        .single();

      if (requestError) {
        console.error("Error creating ride request:", requestError);
        setMessage("Failed to send ride request. Please try again.");
        return;
      }

      // Create notification for driver
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: ride.driver_id,
          type: "ride_request",
          title: "New Ride Request",
          message: `${user.firstName} ${user.lastName} wants to join your ride`,
          data: { rideId, requestId: requestData.id },
          is_read: false,
        });

      if (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't fail the whole operation for notification error
      }

      setMessage("Ride request sent! The driver will be notified.");

      // Remove the ride from filtered results temporarily
      setFilteredRides((prev) => prev.filter((r) => r.id !== rideId));
    } catch (error) {
      console.error("Error joining ride:", error);
      setMessage("Failed to send ride request. Please try again.");
    }
  };

  const handleMessageDriver = (rideId: string) => {
    navigate(`/messages?rideId=${rideId}`);
  };

  const handleViewDetails = (rideId: string) => {
    navigate(`/ride/${rideId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Loading rides...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <MapPin className="h-6 w-6" />
          <span>Find Rides</span>
        </h1>
        <p className="text-gray-600">
          Search for available rides from fellow students
        </p>
      </div>

      {/* Search Filters */}
      <SearchFilters onSearch={handleSearch} onClear={handleClearSearch} />

      {/* Message Alert */}
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Available Rides ({filteredRides.length})</span>
            <Car className="h-5 w-5" />
          </CardTitle>
          <CardDescription>
            Click "Request to Join" to send a request to the driver
          </CardDescription>
        </CardHeader>

        <CardContent>
          {filteredRides.length > 0 ? (
            <div className="space-y-4">
              {filteredRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  showActions={true}
                  onJoinRide={handleJoinRide}
                  onMessageDriver={handleMessageDriver}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No rides found</h3>
              <p className="text-sm">
                Try adjusting your search criteria or check back later for new
                rides.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
