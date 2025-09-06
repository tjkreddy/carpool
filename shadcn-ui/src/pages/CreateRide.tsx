import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RideOfferForm from '@/components/rides/RideOfferForm';
import RideRequestForm from '@/components/rides/RideRequestForm';

export default function CreateRide() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/my-rides');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="offer" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="offer">Offer a Ride</TabsTrigger>
          <TabsTrigger value="request">Request a Ride</TabsTrigger>
        </TabsList>
        
        <TabsContent value="offer">
          <RideOfferForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </TabsContent>
        
        <TabsContent value="request">
          <RideRequestForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}