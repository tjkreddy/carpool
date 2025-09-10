import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Users, Clock, DollarSign, Settings } from "lucide-react";
import { CreateRideData } from "@/types";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromSupabase } from "@/lib/auth";

interface RideOfferFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * A component that provides a form for users to offer a ride.
 * It collects details about the route, time, cost, and preferences.
 * @param {RideOfferFormProps} props - The component props.
 * @returns The rendered component.
 */
export default function RideOfferForm({
  onSuccess,
  onCancel,
}: RideOfferFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CreateRideData>({
    type: "offer",
    fromLocation: {
      address: "",
      city: "",
      state: "",
    },
    toLocation: {
      address: "",
      city: "",
      state: "",
    },
    departureTime: new Date(),
    availableSeats: 1,
    costPerSeat: 0,
    description: "",
    preferences: {
      smokingAllowed: false,
      petsAllowed: false,
      musicAllowed: true,
      genderPreference: "any",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await getCurrentUserFromSupabase();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Validate form data
      if (!formData.fromLocation.address || !formData.toLocation.address) {
        throw new Error("Please fill in both pickup and destination addresses");
      }

      if (formData.availableSeats < 1 || formData.availableSeats > 8) {
        throw new Error("Available seats must be between 1 and 8");
      }

      if (formData.costPerSeat < 0) {
        throw new Error("Cost per seat cannot be negative");
      }

      // Create the ride in Supabase
      const { data: newRide, error: rideError } = await supabase
        .from("rides")
        .insert({
          driver_id: user.id,
          type: "offer",
          from_address: formData.fromLocation.address,
          from_city: formData.fromLocation.city,
          from_state: formData.fromLocation.state,
          from_latitude: null, // TODO: Add geocoding for actual coordinates
          from_longitude: null,
          to_address: formData.toLocation.address,
          to_city: formData.toLocation.city,
          to_state: formData.toLocation.state,
          to_latitude: null,
          to_longitude: null,
          departure_time: formData.departureTime.toISOString(),
          available_seats: formData.availableSeats,
          cost_per_seat: formData.costPerSeat,
          description: formData.description || null,
          status: "active",
          smoking_allowed: formData.preferences.smokingAllowed,
          pets_allowed: formData.preferences.petsAllowed,
          music_allowed: formData.preferences.musicAllowed,
          gender_preference: formData.preferences.genderPreference,
        })
        .select()
        .single();

      if (rideError) {
        console.error("Error creating ride:", rideError);
        throw new Error(`Failed to create ride: ${rideError.message}`);
      }

      console.log("Ride created successfully:", newRide);
      onSuccess();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "Failed to create ride");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: Partial<CreateRideData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateLocation = (
    type: "from" | "to",
    updates: Partial<typeof formData.fromLocation>
  ) => {
    const locationKey = type === "from" ? "fromLocation" : "toLocation";
    setFormData((prev) => ({
      ...prev,
      [locationKey]: { ...prev[locationKey], ...updates },
    }));
  };

  const updatePreferences = (updates: Partial<typeof formData.preferences>) => {
    setFormData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Offer a Ride</span>
          </CardTitle>
          <CardDescription>
            Share your ride with fellow students and split the costs
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Route Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromAddress">Pickup Location</Label>
                  <Input
                    id="fromAddress"
                    placeholder="e.g., University Campus, Main Gate"
                    value={formData.fromLocation.address}
                    onChange={(e) =>
                      updateLocation("from", { address: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromCity">City</Label>
                  <Input
                    id="fromCity"
                    placeholder="San Francisco"
                    value={formData.fromLocation.city}
                    onChange={(e) =>
                      updateLocation("from", { city: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="toAddress">Destination</Label>
                  <Input
                    id="toAddress"
                    placeholder="e.g., Downtown, Airport, Home"
                    value={formData.toLocation.address}
                    onChange={(e) =>
                      updateLocation("to", { address: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toCity">City</Label>
                  <Input
                    id="toCity"
                    placeholder="San Francisco"
                    value={formData.toLocation.city}
                    onChange={(e) =>
                      updateLocation("to", { city: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Trip Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <Input
                    id="departureTime"
                    type="datetime-local"
                    value={formData.departureTime.toISOString().slice(0, 16)}
                    onChange={(e) =>
                      updateFormData({
                        departureTime: new Date(e.target.value),
                      })
                    }
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableSeats">Available Seats</Label>
                  <Select
                    value={formData.availableSeats.toString()}
                    onValueChange={(value) =>
                      updateFormData({ availableSeats: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} seat{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPerSeat">Cost per Seat ($)</Label>
                <Input
                  id="costPerSeat"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="25.00"
                  value={formData.costPerSeat}
                  onChange={(e) =>
                    updateFormData({
                      costPerSeat: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
                <p className="text-xs text-gray-600">
                  Split gas, tolls, and parking costs fairly
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Additional Details (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Meeting point details, car info, or any special instructions..."
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData({ description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Ride Preferences</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smokingAllowed"
                      checked={formData.preferences.smokingAllowed}
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          smokingAllowed: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="smokingAllowed">Smoking allowed</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="petsAllowed"
                      checked={formData.preferences.petsAllowed}
                      onCheckedChange={(checked) =>
                        updatePreferences({ petsAllowed: checked as boolean })
                      }
                    />
                    <Label htmlFor="petsAllowed">Pets allowed</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="musicAllowed"
                      checked={formData.preferences.musicAllowed}
                      onCheckedChange={(checked) =>
                        updatePreferences({ musicAllowed: checked as boolean })
                      }
                    />
                    <Label htmlFor="musicAllowed">Music allowed</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genderPreference">
                    Passenger Gender Preference
                  </Label>
                  <Select
                    value={formData.preferences.genderPreference}
                    onValueChange={(value: "male" | "female" | "any") =>
                      updatePreferences({ genderPreference: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="male">Male passengers only</SelectItem>
                      <SelectItem value="female">
                        Female passengers only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating Ride..." : "Offer Ride"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
