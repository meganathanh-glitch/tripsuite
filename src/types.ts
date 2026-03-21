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

export interface Trip {
  id: string;
  name: string;
  dateRange: string;
  guests: number;
  status: 'ongoing' | 'upcoming' | 'completed';
  image: string;
  itinerary: DayPlan[];
}

export interface PackingItem {
  id: string;
  category: string;
  name: string;
  packed: boolean;
}

export type Screen = 'home' | 'trips' | 'add' | 'packing' | 'profile' | 'trip-detail';
