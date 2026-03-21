import { Trip, PackingItem } from './types';

export const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Nilgiris Family Trip',
    destination: 'Ooty, India',
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
            type: 'Transport'
          },
          {
            id: 'a2',
            time: '04:30 PM',
            title: 'Ooty Lake Boating',
            location: 'North Lake Road',
            description: 'Enjoy a peaceful pedal boat ride as the fog settles. Great for family photos.',
            type: 'Activity',
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
            type: 'Activity'
          }
        ]
      }
    ],
    flights: [
      {
        airline: 'IndiGo',
        flightNumber: '6E-2134',
        departureTime: '08:00 AM',
        arrivalTime: '10:30 AM',
        terminal: 'T1'
      }
    ],
    stays: [
      {
        hotelName: 'Sterling Fern Hill',
        checkIn: 'May 12',
        checkOut: 'May 18',
        roomType: 'Family Suite',
        bookingRef: 'SFH-99281'
      }
    ],
    photos: [
      'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400',
      'https://images.unsplash.com/photo-1581791534721-e599df4417f7?w=400',
      'https://images.unsplash.com/photo-1590050752117-23a9d7fc0b29?w=400',
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400'
    ]
  },
  {
    id: '2',
    name: 'Bali Escape',
    destination: 'Ubud, Bali',
    dateRange: 'June 20 — June 30',
    guests: 2,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    itinerary: [],
    flights: [
      {
        airline: 'AirAsia',
        flightNumber: 'AK-123',
        departureTime: '11:00 PM',
        arrivalTime: '06:00 AM',
        terminal: 'T3'
      }
    ],
    stays: [
      {
        hotelName: 'Maya Ubud Resort',
        checkIn: 'June 20',
        checkOut: 'June 30',
        roomType: 'Pool Villa',
        bookingRef: 'MU-7712'
      }
    ],
    photos: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400'
    ]
  },
  {
    id: '3',
    name: 'Paris Autumn',
    destination: 'Paris, France',
    dateRange: 'Oct 10 — Oct 15',
    guests: 2,
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    itinerary: [],
    photos: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400'
    ]
  }
];

export const MOCK_PACKING_LIST: PackingItem[] = [
  { id: 'p1', tripId: '1', category: 'Essentials', name: 'Passport', packed: true },
  { id: 'p2', tripId: '1', category: 'Essentials', name: 'Travel Insurance', packed: false },
  { id: 'p3', tripId: '1', category: 'Clothing', name: 'Light Jacket', packed: false },
  { id: 'p4', tripId: '1', category: 'Clothing', name: 'Hiking Boots', packed: true },
  { id: 'p5', tripId: '1', category: 'Electronics', name: 'Power Bank', packed: true },
  { id: 'p6', tripId: '1', category: 'Electronics', name: 'Camera Gear', packed: false },
];
