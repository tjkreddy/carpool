import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Clock, Users, DollarSign, Car } from "lucide-react";
import { getCurrentUserFromSupabase } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/costCalculator";
import { User, Ride } from "@/types";
import RideCard from "@/components/rides/RideCard";
import { useNavigate } from "react-router-dom";

/**
 * The main dashboard page for authenticated users.
 * It displays a welcome message, user stats, quick actions, nearby rides, and safety tips.
 * @returns The rendered page component.
 */
export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [nearbyRides, setNearbyRides] = useState<Ride[]>([]);
  const [userStats, setUserStats] = useState({
    totalRides: 0,
    totalSaved: 0,
    rating: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const currentUser = await getCurrentUserFromSupabase();
        setUser(currentUser);

        if (currentUser) {
          // Get nearby rides from Supabase
          const { data: allRides, error: ridesError } = await supabase
            .from("rides")
            .select("*")
            .eq("status", "active")
            .neq("driver_id", currentUser.id)
            .limit(3);

          if (ridesError) {
            console.error("Error fetching rides:", ridesError);
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

            setNearbyRides(ridesWithDrivers);
          }

          // Get user stats from Supabase
          const { data: userRides, error: userRidesError } = await supabase
            .from("rides")
            .select("*")
            .eq("driver_id", currentUser.id);

          if (userRidesError) {
            console.error("Error fetching user rides:", userRidesError);
          } else {
            const completedRides =
              userRides?.filter((ride) => ride.status === "completed") || [];
            const totalSaved = completedRides.reduce((sum, ride) => {
              // Estimate savings: assume solo ride would cost 3x the shared cost
              const sharedCost = ride.cost_per_seat;
              const estimatedSoloCost = sharedCost * 3;
              return sum + (estimatedSoloCost - sharedCost);
            }, 0);

            setUserStats({
              totalRides: completedRides.length,
              totalSaved,
              rating: currentUser.rating || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    loadDashboardData();
  }, []);

  const handleCreateRide = () => {
    navigate("/create-ride");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-600">
          Find your next ride or offer one to help fellow Mahindra University
          students
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Car className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{userStats.totalRides}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Rides</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">
                {formatCurrency(userStats.totalSaved)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Money Saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">
                {userStats.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleCreateRide} className="w-full" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Offer a Ride
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/search")}
            className="w-full"
            size="lg"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Find a Ride
          </Button>
        </CardContent>
      </Card>

      {/* Nearby Rides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Available Rides</span>
          </CardTitle>
          <CardDescription>
            Recent ride offers from fellow students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nearbyRides.length > 0 ? (
            <div className="space-y-4">
              {nearbyRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} showActions={true} />
              ))}

              <Button
                variant="outline"
                onClick={() => navigate("/search")}
                className="w-full"
              >
                View All Rides
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No rides available right now</p>
              <p className="text-sm">
                Check back later or create your own ride!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Safe Carpooling at Mahindra University</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start space-x-2">
            <Badge variant="secondary" className="mt-1">
              1
            </Badge>
            <p className="text-sm">
              Always verify the driver's identity and vehicle details
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Badge variant="secondary" className="mt-1">
              2
            </Badge>
            <p className="text-sm">
              Share your trip details with friends or family
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Badge variant="secondary" className="mt-1">
              3
            </Badge>
            <p className="text-sm">
              Agree on payment method before the trip starts
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Badge variant="secondary" className="mt-1">
              4
            </Badge>
            <p className="text-sm">
              Rate and review after each ride to help the community
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
