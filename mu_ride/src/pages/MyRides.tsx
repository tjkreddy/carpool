import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Car, Users, Clock } from "lucide-react";
import { getCurrentUserFromSupabase } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { User, Ride, RideRequest } from "@/types";
import RideCard from "@/components/rides/RideCard";
import { useNavigate } from "react-router-dom";

/**
 * A page that displays the user's rides, categorized into "offered", "joined", and "requests".
 * It allows users to manage their rides and view their ride requests.
 * @returns The rendered page component.
 */
export default function MyRides() {
  const [user, setUser] = useState<User | null>(null);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [joinedRides, setJoinedRides] = useState<Ride[]>([]);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRides = async () => {
      try {
        const currentUser = await getCurrentUserFromSupabase();
        setUser(currentUser);

        if (currentUser) {
          // Get rides created by user (as driver)
          const { data: userCreatedRides, error: ridesError } = await supabase
            .from("rides")
            .select("*")
            .eq("driver_id", currentUser.id)
            .eq("type", "offer");

          if (ridesError) {
            console.error("Error fetching user rides:", ridesError);
          } else {
            // Transform database rides to component format
            const transformedRides = (userCreatedRides || []).map((ride) => ({
              id: ride.id,
              driver_id: ride.driver_id,
              driver: currentUser,
              type: ride.type,
              from_address: ride.from_address,
              from_city: ride.from_city,
              from_state: ride.from_state,
              from_latitude: ride.from_latitude,
              from_longitude: ride.from_longitude,
              to_address: ride.to_address,
              to_city: ride.to_city,
              to_state: ride.to_state,
              to_latitude: ride.to_latitude,
              to_longitude: ride.to_longitude,
              departure_time: ride.departure_time,
              available_seats: ride.available_seats,
              cost_per_seat: ride.cost_per_seat,
              description: ride.description,
              status: ride.status,
              smoking_allowed: ride.smoking_allowed,
              pets_allowed: ride.pets_allowed,
              music_allowed: ride.music_allowed,
              gender_preference: ride.gender_preference,
              passengers: [],
              created_at: ride.created_at,
              updated_at: ride.updated_at,
              // Component-expected properties
              fromLocation: {
                address: ride.from_address,
                city: ride.from_city,
                state: ride.from_state,
                latitude: ride.from_latitude || 0,
                longitude: ride.from_longitude || 0,
              },
              toLocation: {
                address: ride.to_address,
                city: ride.to_city,
                state: ride.to_state,
                latitude: ride.to_latitude || 0,
                longitude: ride.to_longitude || 0,
              },
              departureTime: new Date(ride.departure_time),
              availableSeats: ride.available_seats,
              costPerSeat: ride.cost_per_seat,
              preferences: {
                smokingAllowed: ride.smoking_allowed || false,
                petsAllowed: ride.pets_allowed || false,
                musicAllowed: ride.music_allowed || true,
                genderPreference: ride.gender_preference || "any",
              },
            }));
            setMyRides(transformedRides);
          }

          // Get rides user has joined (as passenger) - this would require a passengers table
          // For now, we'll leave this empty as it requires additional schema changes
          setJoinedRides([]);

          // Get ride requests made by user
          const { data: userRequests, error: requestsError } = await supabase
            .from("rides")
            .select("*")
            .eq("driver_id", currentUser.id)
            .eq("type", "request");

          if (requestsError) {
            console.error("Error fetching user requests:", requestsError);
          } else {
            // Transform database requests to component format
            const transformedRequests = (userRequests || []).map((request) => ({
              id: request.id,
              passengerId: request.driver_id, // In our schema, driver_id is the requester
              passenger: currentUser,
              rideId: request.id, // For requests, rideId can be the same as id
              ride: {
                id: request.id,
                driver_id: request.driver_id,
                driver: currentUser,
                type: request.type,
                from_address: request.from_location,
                from_city: "",
                from_state: "",
                from_latitude: request.from_latitude,
                from_longitude: request.from_longitude,
                to_address: request.to_location,
                to_city: "",
                to_state: "",
                to_latitude: request.to_latitude,
                to_longitude: request.to_longitude,
                departure_time: request.departure_time,
                available_seats: request.available_seats,
                cost_per_seat: request.cost_per_seat,
                description: request.description,
                status: request.status,
                smoking_allowed: request.preferences?.smokingAllowed,
                pets_allowed: request.preferences?.petsAllowed,
                music_allowed: request.preferences?.musicAllowed,
                gender_preference: request.preferences?.genderPreference,
                passengers: [],
                created_at: request.created_at,
                updated_at: request.updated_at,
                fromLocation: {
                  address: request.from_location,
                  city: "",
                  state: "",
                  latitude: request.from_latitude || 0,
                  longitude: request.from_longitude || 0,
                },
                toLocation: {
                  address: request.to_location,
                  city: "",
                  state: "",
                  latitude: request.to_latitude || 0,
                  longitude: request.to_longitude || 0,
                },
                departureTime: new Date(request.departure_time),
                availableSeats: request.available_seats,
                costPerSeat: request.cost_per_seat,
                preferences: request.preferences,
              },
              status: request.status as "pending" | "approved" | "rejected",
              message: request.description || "",
              requestedSeats: request.available_seats,
              createdAt: new Date(request.created_at),
              updatedAt: new Date(request.updated_at),
            }));
            setRideRequests(transformedRequests);
          }
        }
      } catch (error) {
        console.error("Error fetching user rides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRides();
  }, []);

  const handleCreateRide = () => {
    navigate("/create-ride");
  };

  const handleViewRide = (rideId: string) => {
    navigate(`/ride/${rideId}`);
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Loading your rides...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Car className="h-6 w-6" />
            <span>My Rides</span>
          </h1>
          <p className="text-gray-600">Manage your rides and requests</p>
        </div>

        <Button onClick={handleCreateRide}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ride
        </Button>
      </div>

      {/* Tabs for different ride categories */}
      <Tabs defaultValue="offered" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="offered">
            Rides I'm Offering ({myRides.length})
          </TabsTrigger>
          <TabsTrigger value="joined">
            Rides I've Joined ({joinedRides.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            My Requests ({rideRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Rides I'm Offering */}
        <TabsContent value="offered">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Rides I'm Offering</span>
              </CardTitle>
              <CardDescription>
                Rides you've created as a driver
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myRides.length > 0 ? (
                <div className="space-y-4">
                  {myRides.map((ride) => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      showActions={false}
                      onViewDetails={handleViewRide}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>You haven't offered any rides yet</p>
                  <Button
                    variant="outline"
                    onClick={handleCreateRide}
                    className="mt-3"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Ride
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rides I've Joined */}
        <TabsContent value="joined">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Rides I've Joined</span>
              </CardTitle>
              <CardDescription>
                Rides you're participating in as a passenger
              </CardDescription>
            </CardHeader>
            <CardContent>
              {joinedRides.length > 0 ? (
                <div className="space-y-4">
                  {joinedRides.map((ride) => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      showActions={false}
                      onViewDetails={handleViewRide}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>You haven't joined any rides yet</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/search")}
                    className="mt-3"
                  >
                    Find Rides
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Requests */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>My Ride Requests</span>
              </CardTitle>
              <CardDescription>
                Requests you've sent to join rides
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rideRequests.length > 0 ? (
                <div className="space-y-4">
                  {rideRequests.map((request) => (
                    <Card
                      key={request.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">
                              Request to join ride
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            className={getRequestStatusColor(request.status)}
                          >
                            {request.status}
                          </Badge>
                        </div>

                        {request.ride && (
                          <div className="space-y-2 text-sm">
                            <p>
                              <strong>From:</strong>{" "}
                              {request.ride.fromLocation.address}
                            </p>
                            <p>
                              <strong>To:</strong>{" "}
                              {request.ride.toLocation.address}
                            </p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {new Date(
                                request.ride.departureTime
                              ).toLocaleString()}
                            </p>
                            <p>
                              <strong>Cost:</strong> ${request.ride.costPerSeat}{" "}
                              per seat
                            </p>
                          </div>
                        )}

                        {request.message && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{request.message}"
                          </p>
                        )}

                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              request.ride && handleViewRide(request.ride.id)
                            }
                          >
                            View Ride Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>You haven't made any ride requests yet</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/search")}
                    className="mt-3"
                  >
                    Search for Rides
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
