import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { SearchCriteria } from '@/types';

interface SearchFiltersProps {
  onSearch: (criteria: SearchCriteria) => void;
  onClear: () => void;
}

export default function SearchFilters({ onSearch, onClear }: SearchFiltersProps) {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    fromCity: '',
    toCity: '',
    departureDate: undefined,
    maxCostPerSeat: undefined,
    availableSeats: undefined,
    genderPreference: undefined,
  });

  const handleSearch = () => {
    const searchCriteria: SearchCriteria = {};
    
    if (criteria.fromCity?.trim()) {
      searchCriteria.fromCity = criteria.fromCity.trim();
    }
    if (criteria.toCity?.trim()) {
      searchCriteria.toCity = criteria.toCity.trim();
    }
    if (criteria.departureDate) {
      searchCriteria.departureDate = criteria.departureDate;
    }
    if (criteria.maxCostPerSeat !== undefined && criteria.maxCostPerSeat > 0) {
      searchCriteria.maxCostPerSeat = criteria.maxCostPerSeat;
    }
    if (criteria.availableSeats !== undefined && criteria.availableSeats > 0) {
      searchCriteria.availableSeats = criteria.availableSeats;
    }
    if (criteria.genderPreference && criteria.genderPreference !== 'any') {
      searchCriteria.genderPreference = criteria.genderPreference;
    }

    onSearch(searchCriteria);
  };

  const handleClear = () => {
    setCriteria({
      fromCity: '',
      toCity: '',
      departureDate: undefined,
      maxCostPerSeat: undefined,
      availableSeats: undefined,
      genderPreference: undefined,
    });
    onClear();
  };

  const updateCriteria = (updates: Partial<SearchCriteria>) => {
    setCriteria(prev => ({ ...prev, ...updates }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Search Filters</span>
        </CardTitle>
        <CardDescription>
          Filter rides by your preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fromCity">From City</Label>
            <Input
              id="fromCity"
              placeholder="San Francisco"
              value={criteria.fromCity || ''}
              onChange={(e) => updateCriteria({ fromCity: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="toCity">To City</Label>
            <Input
              id="toCity"
              placeholder="Los Angeles"
              value={criteria.toCity || ''}
              onChange={(e) => updateCriteria({ toCity: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departureDate">Departure Date</Label>
            <Input
              id="departureDate"
              type="date"
              value={criteria.departureDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateCriteria({ 
                departureDate: e.target.value ? new Date(e.target.value) : undefined 
              })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxCost">Max Cost per Seat</Label>
            <Input
              id="maxCost"
              type="number"
              min="0"
              step="0.01"
              placeholder="50.00"
              value={criteria.maxCostPerSeat || ''}
              onChange={(e) => updateCriteria({ 
                maxCostPerSeat: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="seats">Min Available Seats</Label>
            <Select
              value={criteria.availableSeats?.toString() || ''}
              onValueChange={(value) => updateCriteria({ 
                availableSeats: value ? parseInt(value) : undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}+ seat{num > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="genderPreference">Driver Gender Preference</Label>
          <Select
            value={criteria.genderPreference || ''}
            onValueChange={(value: 'male' | 'female' | 'any' | '') => updateCriteria({ 
              genderPreference: value || undefined 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="male">Male drivers only</SelectItem>
              <SelectItem value="female">Female drivers only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="mr-2 h-4 w-4" />
            Search Rides
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}