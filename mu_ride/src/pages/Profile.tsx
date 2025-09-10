import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Edit3,
  Star,
  Car,
  MapPin,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import {
  getCurrentUserFromSupabase,
  updateProfile,
  getCollegeById,
} from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { User as UserType, Rating } from "@/types";

/**
 * A page that displays and allows editing of the user's profile.
 * It shows user information, activity stats, and recent reviews.
 * @returns The rendered page component.
 */
export default function Profile() {
  const [user, setUser] = useState<UserType | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({
    totalRides: 0,
    completedRides: 0,
    rating: 0,
    totalRatings: 0,
  });
  const [recentRatings, setRecentRatings] = useState<Rating[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = await getCurrentUserFromSupabase();
      setUser(currentUser);

      if (currentUser) {
        setFormData({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          phoneNumber: currentUser.phoneNumber,
        });

        // Calculate user stats from Supabase
        const { data: userRides, error: ridesError } = await supabase
          .from("rides")
          .select("*")
          .eq("driver_id", currentUser.id);

        if (ridesError) {
          console.error("Error fetching user rides:", ridesError);
        }

        const rides = userRides || [];
        const completedRides = rides.filter(
          (ride) => ride.status === "completed"
        );

        // For now, we'll set basic stats - ratings would need a ratings table
        setStats({
          totalRides: rides.length,
          completedRides: completedRides.length,
          rating: 0, // Would need ratings table
          totalRatings: 0, // Would need ratings table
        });

        // Get recent ratings - placeholder for now
        setRecentRatings([]);
      }
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      const updatedUser = await updateProfile(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      });

      setUser(updatedUser);
      setEditing(false);
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      });
    }
    setEditing(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-500 fill-current"
            : i < rating
            ? "text-yellow-500 fill-current opacity-50"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  const college = getCollegeById(user.collegeId);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <User className="h-6 w-6" />
          <span>My Profile</span>
        </h1>
        <p className="text-gray-600">
          Manage your account information and view your activity
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                {!editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={user.isVerified ? "default" : "secondary"}>
                      {user.isVerified ? "Verified" : "Pending Verification"}
                    </Badge>
                    {stats.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {stats.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Editable Fields */}
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-gray-600">
                          {user.phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">College</p>
                      <p className="text-sm text-gray-600">
                        {college?.name || "Unknown College"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Ratings */}
          {recentRatings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>
                  What other users are saying about you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRatings.map((rating) => (
                    <div
                      key={rating.id}
                      className="border-l-4 border-l-blue-500 pl-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {renderStars(rating.score)}
                          <span className="text-sm font-medium">
                            {rating.score}/5
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-gray-600 italic">
                          "{rating.comment}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        As a {rating.type}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="h-5 w-5" />
                <span>Activity Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.totalRides}
                </div>
                <p className="text-sm text-gray-600">Total Rides</p>
              </div>

              <Separator />

              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.completedRides}
                </div>
                <p className="text-sm text-gray-600">Completed Rides</p>
              </div>

              <Separator />

              {stats.rating > 0 && (
                <>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      {renderStars(stats.rating)}
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.rating.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Average Rating ({stats.totalRatings} reviews)
                    </p>
                  </div>

                  <Separator />
                </>
              )}

              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {user.isVerified ? "Verified" : "Unverified"}
                </div>
                <p className="text-sm text-gray-600">Account Status</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Car className="mr-2 h-4 w-4" />
                View My Rides
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Star className="mr-2 h-4 w-4" />
                My Reviews
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
