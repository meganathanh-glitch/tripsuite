import { Trip, PackingItem } from './types';

export const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Nilgiris Family Trip',
    dateRange: 'May 12 — May 18',
    guests: 4,
    status: 'ongoing',
    image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800',
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Lake Mist',
        activities: [
          {
            id: 'a1',
            time: '10:30 AM',
            title: 'Arrive at Coimbatore Airport',
            location: 'CJB Airport Terminal 1',
            description: 'Private cab will be waiting at Gate 4. 3-hour drive to Ooty via Mettupalayam ghat roads.',
            type: 'travel'
          },
          {
            id: 'a2',
            time: '04:30 PM',
            title: 'Ooty Lake Boating',
            location: 'North Lake Road',
            description: 'Enjoy a peaceful pedal boat ride as the fog settles. Great for family photos.',
            type: 'activity',
            image: 'https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=800&q=80'
          }
        ],
        dinner: 'Savoy IHCL',
        stay: 'Sterling Fern Hill'
      },
      {
        day: 2,
        title: 'Tea Trails & Peaks',
        activities: [
          {
            id: 'a3',
            time: '09:00 AM',
            title: 'Tea Museum Visit',
            location: 'Doddabetta Road',
            description: 'Learn about the history of tea in the Nilgiris and taste fresh brews.',
            type: 'activity'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Bali Escape',
    dateRange: 'June 20 — June 30',
    guests: 2,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    itinerary: []
  },
  {
    id: '3',
    name: 'Paris Autumn',
    dateRange: 'Oct 10 — Oct 15',
    guests: 2,
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    itinerary: []
  }
];

export const MOCK_PACKING_LIST: PackingItem[] = [
  { id: 'p1', category: 'Essentials', name: 'Passport', packed: true },
  { id: 'p2', category: 'Essentials', name: 'Travel Insurance', packed: false },
  { id: 'p3', category: 'Clothing', name: 'Light Jacket', packed: false },
  { id: 'p4', category: 'Clothing', name: 'Hiking Boots', packed: true },
  { id: 'p5', category: 'Electronics', name: 'Power Bank', packed: true },
  { id: 'p6', category: 'Electronics', name: 'Camera Gear', packed: false },
];
