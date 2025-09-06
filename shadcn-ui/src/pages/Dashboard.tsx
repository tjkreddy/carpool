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
import { getCurrentUser } from "@/lib/auth";
import { ridesStorage, initializeDemoData } from "@/lib/storage";
import { formatCurrency } from "@/lib/costCalculator";
import { User, Ride } from "@/types";
import RideCard from "@/components/rides/RideCard";
import { useNavigate } from "react-router-dom";

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
    // Initialize demo data and get current user
    initializeDemoData();
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      // Get nearby rides (excluding user's own rides)
      const allRides = ridesStorage.getRides();
      const nearby = allRides
        .filter(
          (ride) =>
            ride.driverId !== currentUser.id &&
            ride.status === "active" &&
            !ride.passengers.includes(currentUser.id)
        )
        .slice(0, 3); // Show top 3 rides

      setNearbyRides(nearby);

      // Calculate user stats
      const userRides = ridesStorage.getUserRides(currentUser.id);
      const completedRides = userRides.filter(
        (ride) => ride.status === "completed"
      );
      const totalSaved = completedRides.reduce((sum, ride) => {
        // Estimate savings: assume solo ride would cost 3x the shared cost
        const sharedCost = ride.costPerSeat;
        const estimatedSoloCost = sharedCost * 3;
        return sum + (estimatedSoloCost - sharedCost);
      }, 0);

      setUserStats({
        totalRides: completedRides.length,
        totalSaved,
        rating: currentUser.rating || 0,
      });
    }
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
          Welcome back, {user.firstName}! 👋
        </h1>
        <p className="text-gray-600">
          Find your next ride or offer one to help fellow students
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
          <CardTitle>💡 Tips for Safe Carpooling</CardTitle>
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
