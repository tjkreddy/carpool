// Cost calculation utilities for ride sharing
import { CostBreakdown } from '@/types';

export interface CostCalculationParams {
  totalCost: number;
  driverId: string;
  passengerIds: string[];
  includeDriverInSplit?: boolean;
}

/**
 * Calculates the cost breakdown for a ride.
 * @param params - The parameters for the cost calculation.
 * @returns A cost breakdown object.
 */
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

/**
 * Calculates the cost of a ride based on distance.
 * @param distanceKm - The distance of the ride in kilometers.
 * @param fuelEfficiencyKmPerLiter - The fuel efficiency of the vehicle in km/l.
 * @param fuelPricePerLiter - The price of fuel per liter.
 * @param additionalCostsPerKm - Additional costs per kilometer (e.g., maintenance).
 * @returns The calculated cost.
 */
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

/**
 * Calculates the cost of a ride based on time.
 * @param durationMinutes - The duration of the ride in minutes.
 * @param costPerHour - The cost per hour of the driver's time.
 * @returns The calculated cost.
 */
export const calculateTimeBasedCost = (
  durationMinutes: number,
  costPerHour: number = 10
): number => {
  const hours = durationMinutes / 60;
  return Math.round(hours * costPerHour * 100) / 100;
};

/**
 * Calculates a suggested price for a ride.
 * @param distanceKm - The distance of the ride in kilometers.
 * @param durationMinutes - The duration of the ride in minutes.
 * @param numberOfSeats - The number of available seats.
 * @param options - Optional parameters for the calculation.
 * @returns The suggested price per seat.
 */
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

/**
 * Formats a number as a currency string.
 * @param amount - The amount to format.
 * @param currency - The currency to use for formatting (defaults to 'USD').
 * @returns The formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculates the savings from sharing a ride.
 * @param originalCost - The original cost of the ride.
 * @param sharedCost - The cost after sharing.
 * @returns An object containing the savings and the percentage saved.
 */
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

/**
 * Generates payment instructions for a passenger.
 * @param driverName - The name of the driver.
 * @param passengerName - The name of the passenger.
 * @param amount - The amount to be paid.
 * @returns A string with payment instructions.
 */
export const getPaymentInstructions = (
  driverName: string,
  passengerName: string,
  amount: number
): string => {
  return `${passengerName} should pay ${formatCurrency(amount)} to ${driverName}. 
Payment methods: Cash, Venmo, Zelle, or other agreed method.`;
};

/**
 * Generates a payment summary for a ride.
 * @param costBreakdown - The cost breakdown for the ride.
 * @param driverName - The name of the driver.
 * @returns A string with the payment summary.
 */
export const generatePaymentSummary = (costBreakdown: CostBreakdown, driverName: string): string => {
  const { passengerShares, costPerSeat } = costBreakdown;
  
  if (passengerShares.length === 0) {
    return "No passengers - driver covers full cost.";
  }
  
  return `Each passenger pays ${formatCurrency(costPerSeat)} to ${driverName}. 
Total collected: ${formatCurrency(passengerShares.length * costPerSeat)}`;
};