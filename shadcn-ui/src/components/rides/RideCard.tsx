import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Clock, Users, DollarSign, Star, MessageCircle } from 'lucide-react';
import { Ride } from '@/types';
import { formatCurrency } from '@/lib/costCalculator';
import { format } from 'date-fns';

interface RideCardProps {
  ride: Ride;
  showActions?: boolean;
  onJoinRide?: (rideId: string) => void;
  onMessageDriver?: (rideId: string) => void;
  onViewDetails?: (rideId: string) => void;
}

export default function RideCard({ 
  ride, 
  showActions = false, 
  onJoinRide, 
  onMessageDriver, 
  onViewDetails 
}: RideCardProps) {
  const departureTime = new Date(ride.departureTime);
  const isUpcoming = departureTime > new Date();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDriverInitials = () => {
    if (ride.driver) {
      return `${ride.driver.firstName[0]}${ride.driver.lastName[0]}`;
    }
    return 'D';
  };

  const getDriverName = () => {
    if (ride.driver) {
      return `${ride.driver.firstName} ${ride.driver.lastName}`;
    }
    return 'Driver';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                {getDriverInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{getDriverName()}</p>
              {ride.driver?.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600">{ride.driver.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
          
          <Badge className={getStatusColor(ride.status)}>
            {ride.status}
          </Badge>
        </div>

        {/* Route Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="font-medium">From:</span>
            <span className="text-gray-600">{ride.fromLocation.address}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-red-600" />
            <span className="font-medium">To:</span>
            <span className="text-gray-600">{ride.toLocation.address}</span>
          </div>
        </div>

        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium">{format(departureTime, 'MMM d')}</p>
              <p className="text-gray-600">{format(departureTime, 'h:mm a')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-purple-600" />
            <div>
              <p className="font-medium">{ride.availableSeats} seats</p>
              <p className="text-gray-600">available</p>
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(ride.costPerSeat)}
            </span>
            <span className="text-sm text-gray-600">per person</span>
          </div>
          
          {ride.type === 'offer' && (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Ride Offer
            </Badge>
          )}
        </div>

        {/* Description */}
        {ride.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {ride.description}
          </p>
        )}

        {/* Vehicle Info */}
        {ride.vehicleInfo && (
          <div className="text-xs text-gray-500 mb-4">
            🚗 {ride.vehicleInfo.year} {ride.vehicleInfo.make} {ride.vehicleInfo.model} 
            ({ride.vehicleInfo.color})
          </div>
        )}

        {/* Preferences */}
        <div className="flex flex-wrap gap-1 mb-4">
          {!ride.preferences.smokingAllowed && (
            <Badge variant="outline" className="text-xs">🚭 No Smoking</Badge>
          )}
          {!ride.preferences.petsAllowed && (
            <Badge variant="outline" className="text-xs">🐕‍🦺 No Pets</Badge>
          )}
          {ride.preferences.musicAllowed && (
            <Badge variant="outline" className="text-xs">🎵 Music OK</Badge>
          )}
        </div>

        {/* Actions */}
        {showActions && isUpcoming && ride.status === 'active' && (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onJoinRide?.(ride.id)}
            >
              Request to Join
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onMessageDriver?.(ride.id)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        )}

        {showActions && onViewDetails && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="w-full mt-2"
            onClick={() => onViewDetails(ride.id)}
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}