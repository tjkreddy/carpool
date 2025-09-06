// Cost calculation utilities for ride sharing
import { CostBreakdown } from '@/types';

export interface CostCalculationParams {
  totalCost: number;
  driverId: string;
  passengerIds: string[];
  includeDriverInSplit?: boolean;
}

export const calculateRideCost = (params: CostCalculationParams): CostBreakdown => {
  const { totalCost, driverId, passengerIds, includeDriverInSplit = false } = params;
  
  const numberOfPassengers = passengerIds.length;
  
  if (numberOfPassengers === 0) {
    return {
      totalCost,
      costPerSeat: totalCost,
      numberOfPassengers: 0,
      driverShare: totalCost,
      passengerShares: [],
    };
  }

  let costPerSeat: number;
  let driverShare: number;

  if (includeDriverInSplit) {
    // Split cost equally among driver and all passengers
    const totalParticipants = numberOfPassengers + 1;
    costPerSeat = totalCost / totalParticipants;
    driverShare = costPerSeat;
  } else {
    // Passengers split the total cost, driver pays nothing
    costPerSeat = totalCost / numberOfPassengers;
    driverShare = 0;
  }

  const passengerShares = passengerIds.map(userId => ({
    userId,
    amount: Math.round(costPerSeat * 100) / 100, // Round to 2 decimal places
  }));

  return {
    totalCost,
    costPerSeat: Math.round(costPerSeat * 100) / 100,
    numberOfPassengers,
    driverShare: Math.round(driverShare * 100) / 100,
    passengerShares,
  };
};

export const calculateDistanceBasedCost = (
  distanceKm: number,
  fuelEfficiencyKmPerLiter: number = 12,
  fuelPricePerLiter: number = 1.5,
  additionalCostsPerKm: number = 0.1
): number => {
  const fuelCost = (distanceKm / fuelEfficiencyKmPerLiter) * fuelPricePerLiter;
  const additionalCosts = distanceKm * additionalCostsPerKm;
  return Math.round((fuelCost + additionalCosts) * 100) / 100;
};

export const calculateTimeBasedCost = (
  durationMinutes: number,
  costPerHour: number = 10
): number => {
  const hours = durationMinutes / 60;
  return Math.round(hours * costPerHour * 100) / 100;
};

export const calculateSuggestedPrice = (
  distanceKm: number,
  durationMinutes: number,
  numberOfSeats: number,
  options: {
    fuelEfficiency?: number;
    fuelPrice?: number;
    wearAndTearRate?: number;
    timeValue?: number;
    profitMargin?: number;
  } = {}
): number => {
  const {
    fuelEfficiency = 12,
    fuelPrice = 1.5,
    wearAndTearRate = 0.15,
    timeValue = 8,
    profitMargin = 0.1,
  } = options;

  // Calculate base costs
  const fuelCost = calculateDistanceBasedCost(distanceKm, fuelEfficiency, fuelPrice, wearAndTearRate);
  const timeCost = calculateTimeBasedCost(durationMinutes, timeValue);
  
  // Total cost including profit margin
  const totalCost = (fuelCost + timeCost) * (1 + profitMargin);
  
  // Cost per seat
  const costPerSeat = totalCost / numberOfSeats;
  
  return Math.round(costPerSeat * 100) / 100;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculateSavings = (
  originalCost: number,
  sharedCost: number
): { savings: number; percentage: number } => {
  const savings = originalCost - sharedCost;
  const percentage = originalCost > 0 ? (savings / originalCost) * 100 : 0;
  
  return {
    savings: Math.round(savings * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
  };
};

// Payment method helpers for manual payments (no integration)
export const getPaymentInstructions = (
  driverName: string,
  passengerName: string,
  amount: number
): string => {
  return `${passengerName} should pay ${formatCurrency(amount)} to ${driverName}. 
Payment methods: Cash, Venmo, Zelle, or other agreed method.`;
};

export const generatePaymentSummary = (costBreakdown: CostBreakdown, driverName: string): string => {
  const { passengerShares, costPerSeat } = costBreakdown;
  
  if (passengerShares.length === 0) {
    return "No passengers - driver covers full cost.";
  }
  
  return `Each passenger pays ${formatCurrency(costPerSeat)} to ${driverName}. 
Total collected: ${formatCurrency(passengerShares.length * costPerSeat)}`;
};