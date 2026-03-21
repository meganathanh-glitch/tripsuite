export interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  type: 'travel' | 'activity' | 'food' | 'stay';
  image?: string;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  dinner?: string;
  stay?: string;
}

export interface Flight {
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  terminal: string;
}

export interface Stay {
  hotelName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  bookingRef: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  dateRange: string;
  guests: number;
  status: 'ongoing' | 'upcoming' | 'completed';
  image: string;
  itinerary: DayPlan[];
  flights?: Flight[];
  stays?: Stay[];
  photos?: string[];
}

export interface PackingItem {
  id: string;
  tripId: string;
  category: string;
  name: string;
  packed: boolean;
}

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Stay' | 'Activities' | 'Shopping';
  description: string;
  date: string;
}

export interface TripBudget {
  tripId: string;
  totalBudget: number;
}

export type Screen = 'home' | 'trips' | 'add' | 'packing' | 'profile' | 'trip-detail' | 'budget' | 'explore';
