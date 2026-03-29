import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plane, MapPin, Calendar, Users, ChevronLeft, ChevronRight, Plus, Search, Filter,
  Home, PlaneTakeoff, Briefcase, ListChecks, User, Star, Settings, LogOut, Edit3,
  Trash2, X, Check, CloudSun, Clock, Camera, DollarSign, Bed, Sparkles, Eye, EyeOff,
  ChevronDown, Loader2, Mail, Lock, UserPlus, Globe, Tag, Package, Zap, Smartphone,
  Heart, Mountain, Utensils, ShoppingBag, Building2, Palmtree, Navigation, ArrowRight,
  CreditCard, Receipt, PieChart, Image, Hotel, MoreVertical, AlertCircle
} from 'lucide-react';

// ─── Supabase (use in-memory storage to avoid localStorage in iframe) ───
const memStorage: Record<string, string> = {};
const customStorageAdapter = {
  getItem: (key: string) => memStorage[key] ?? null,
  setItem: (key: string, value: string) => { memStorage[key] = value; },
  removeItem: (key: string) => { delete memStorage[key]; },
};
const supabase = createClient(
  'https://iwrwhaonnmtkjkyrukhd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3cndoYW9ubm10a2preXJ1a2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODkzMjcsImV4cCI6MjA4OTY2NTMyN30.lLLt7gpk60_J7I_0sNC3CmuocReBmh3VxC9H98DOhyM',
  {
    auth: {
      storage: customStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  }
);

// ─── Gemini AI ───
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

// ─── Types ───
interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  icon?: string;
}

interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
}

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  terminal: string;
}

interface Stay {
  id: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  bookingRef: string;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  tripId: string;
}

interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
  tripId: string;
}

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  guests: number;
  type: string;
  status: 'ongoing' | 'upcoming' | 'completed';
  image: string;
  itinerary: DayPlan[];
  flights: Flight[];
  stays: Stay[];
  photos: string[];
}

// ─── Mock Data ───
const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Nilgiris Family Trip',
    destination: 'Ooty, India',
    startDate: '2026-05-12',
    endDate: '2026-05-18',
    guests: 4,
    type: 'Family',
    status: 'ongoing',
    image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400&h=200&fit=crop',
    itinerary: [
      {
        day: 1, title: 'Arrival Day',
        activities: [
          { id: 'a1', time: '09:00', title: 'Arrive at Ooty Station', description: 'Take the Nilgiri Mountain Railway', icon: 'train' },
          { id: 'a2', time: '12:00', title: 'Check-in at Hotel', description: 'Sterling Ooty Elk Hill', icon: 'hotel' },
          { id: 'a3', time: '15:00', title: 'Botanical Gardens', description: 'Explore the Government Botanical Garden', icon: 'flower' },
        ]
      },
      {
        day: 2, title: 'Exploration',
        activities: [
          { id: 'a4', time: '08:00', title: 'Doddabetta Peak', description: 'Highest point in Nilgiris', icon: 'mountain' },
          { id: 'a5', time: '13:00', title: 'Lunch at local restaurant', description: 'Try local Nilgiri cuisine', icon: 'food' },
          { id: 'a6', time: '16:00', title: 'Tea Factory Visit', description: 'Learn about tea processing', icon: 'coffee' },
        ]
      },
      {
        day: 3, title: 'Adventure',
        activities: [
          { id: 'a7', time: '07:00', title: 'Pykara Boating', description: 'Boat ride at Pykara Lake', icon: 'boat' },
          { id: 'a8', time: '14:00', title: 'Pine Forest Walk', description: 'Scenic walk through pine forests', icon: 'tree' },
        ]
      }
    ],
    flights: [
      { id: 'f1', airline: 'IndiGo', flightNumber: '6E-2145', departure: '2026-05-12 06:30', arrival: '2026-05-12 08:45', terminal: 'T1' }
    ],
    stays: [
      { id: 's1', hotelName: 'Sterling Ooty Elk Hill', checkIn: '2026-05-12', checkOut: '2026-05-18', roomType: 'Deluxe Suite', bookingRef: 'STR-78234' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
    ]
  },
  {
    id: '2',
    name: 'Bali Escape',
    destination: 'Ubud, Bali',
    startDate: '2026-06-20',
    endDate: '2026-06-30',
    guests: 2,
    type: 'Adventure',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=200&fit=crop',
    itinerary: [
      {
        day: 1, title: 'Arrival in Paradise',
        activities: [
          { id: 'b1', time: '10:00', title: 'Land at Ngurah Rai', description: 'International arrival', icon: 'plane' },
          { id: 'b2', time: '14:00', title: 'Tegallalang Rice Terraces', description: 'Iconic rice paddy views', icon: 'nature' },
        ]
      },
      {
        day: 2, title: 'Temple Day',
        activities: [
          { id: 'b3', time: '09:00', title: 'Tirta Empul Temple', description: 'Sacred water temple purification', icon: 'temple' },
          { id: 'b4', time: '15:00', title: 'Ubud Monkey Forest', description: 'Walk through the sacred monkey forest', icon: 'nature' },
        ]
      }
    ],
    flights: [
      { id: 'f2', airline: 'Garuda Indonesia', flightNumber: 'GA-856', departure: '2026-06-20 01:30', arrival: '2026-06-20 09:45', terminal: 'T3' }
    ],
    stays: [
      { id: 's2', hotelName: 'Viceroy Bali', checkIn: '2026-06-20', checkOut: '2026-06-30', roomType: 'Pool Villa', bookingRef: 'VB-44521' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=300&h=300&fit=crop',
    ]
  },
  {
    id: '3',
    name: 'Paris Autumn',
    destination: 'Paris, France',
    startDate: '2026-10-10',
    endDate: '2026-10-15',
    guests: 2,
    type: 'Romantic',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=200&fit=crop',
    itinerary: [
      {
        day: 1, title: 'Bonjour Paris',
        activities: [
          { id: 'c1', time: '11:00', title: 'Eiffel Tower', description: 'Visit the iconic landmark', icon: 'landmark' },
          { id: 'c2', time: '15:00', title: 'Seine River Cruise', description: 'Afternoon river cruise', icon: 'boat' },
          { id: 'c3', time: '19:00', title: 'Dinner at Le Jules Verne', description: 'Fine dining on the Eiffel Tower', icon: 'food' },
        ]
      },
      {
        day: 2, title: 'Art & Culture',
        activities: [
          { id: 'c4', time: '09:00', title: 'Louvre Museum', description: 'See the Mona Lisa and more', icon: 'art' },
          { id: 'c5', time: '14:00', title: 'Montmartre Walk', description: 'Explore the artistic quarter', icon: 'walk' },
        ]
      }
    ],
    flights: [
      { id: 'f3', airline: 'Air France', flightNumber: 'AF-182', departure: '2026-10-10 08:00', arrival: '2026-10-10 14:30', terminal: 'T2E' }
    ],
    stays: [
      { id: 's3', hotelName: 'Hôtel Plaza Athénée', checkIn: '2026-10-10', checkOut: '2026-10-15', roomType: 'Junior Suite', bookingRef: 'HPA-91023' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=300&h=300&fit=crop',
    ]
  }
];

const DEFAULT_PACKING_ITEMS: PackingItem[] = [
  { id: 'p1', name: 'Passport', category: 'Essentials', packed: true, tripId: '1' },
  { id: 'p2', name: 'Travel Insurance', category: 'Essentials', packed: true, tripId: '1' },
  { id: 'p3', name: 'Wallet & Cards', category: 'Essentials', packed: false, tripId: '1' },
  { id: 'p4', name: 'Light Jacket', category: 'Clothing', packed: false, tripId: '1' },
  { id: 'p5', name: 'Hiking Boots', category: 'Clothing', packed: false, tripId: '1' },
  { id: 'p6', name: 'Raincoat', category: 'Clothing', packed: false, tripId: '1' },
  { id: 'p7', name: 'Power Bank', category: 'Electronics', packed: true, tripId: '1' },
  { id: 'p8', name: 'Camera Gear', category: 'Electronics', packed: false, tripId: '1' },
  { id: 'p9', name: 'Universal Adapter', category: 'Electronics', packed: false, tripId: '1' },
  { id: 'p10', name: 'Passport', category: 'Essentials', packed: false, tripId: '2' },
  { id: 'p11', name: 'Sunscreen', category: 'Essentials', packed: false, tripId: '2' },
  { id: 'p12', name: 'Swimwear', category: 'Clothing', packed: false, tripId: '2' },
  { id: 'p13', name: 'Sandals', category: 'Clothing', packed: false, tripId: '2' },
  { id: 'p14', name: 'GoPro', category: 'Electronics', packed: false, tripId: '2' },
];

const DEFAULT_EXPENSES: Expense[] = [
  { id: 'e1', amount: 4500, category: 'Transport', description: 'Train tickets to Ooty', date: '2026-05-12', tripId: '1' },
  { id: 'e2', amount: 12000, category: 'Accommodation', description: 'Hotel booking advance', date: '2026-05-10', tripId: '1' },
  { id: 'e3', amount: 2200, category: 'Food', description: 'Restaurant meals Day 1', date: '2026-05-12', tripId: '1' },
  { id: 'e4', amount: 800, category: 'Activities', description: 'Botanical Garden entry', date: '2026-05-12', tripId: '1' },
  { id: 'e5', amount: 35000, category: 'Flights', description: 'Round trip flights', date: '2026-06-15', tripId: '2' },
  { id: 'e6', amount: 85000, category: 'Accommodation', description: 'Viceroy Bali booking', date: '2026-06-01', tripId: '2' },
  { id: 'e7', amount: 15000, category: 'Flights', description: 'Air France tickets', date: '2026-09-20', tripId: '3' },
  { id: 'e8', amount: 45000, category: 'Accommodation', description: 'Hotel Plaza Athénée', date: '2026-09-25', tripId: '3' },
  { id: 'e9', amount: 8000, category: 'Food', description: 'Le Jules Verne dinner', date: '2026-10-10', tripId: '3' },
];

// ─── Utility Functions ───
const uid = () => Math.random().toString(36).slice(2, 10);
const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};
const formatDateLong = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
};
const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN');
const daysBetween = (a: string, b: string) => Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

const statusColor = (s: string) => {
  switch (s) {
    case 'ongoing': return 'bg-emerald-100 text-emerald-700';
    case 'upcoming': return 'bg-blue-100 text-blue-700';
    case 'completed': return 'bg-gray-100 text-gray-500';
    default: return 'bg-gray-100 text-gray-500';
  }
};

// ─── In-Memory Storage (localStorage blocked in iframe) ───
const memoryStore: Record<string, string> = {};
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = memoryStore[key];
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveToStorage<T>(key: string, value: T) {
  try { memoryStore[key] = JSON.stringify(value); } catch {}
}

// ─── Toast config ───
const toastOptions = {
  duration: 3000,
  style: { fontSize: '13px', padding: '8px 14px', borderRadius: '8px', maxWidth: '340px' },
};

// ──────────────────────────────────────────
// MAIN APP
// ──────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<string>('home');
  const [prevScreen, setPrevScreen] = useState<string>('home');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>(() => loadFromStorage('ts_trips', DEFAULT_TRIPS));
  const [packingItems, setPackingItems] = useState<PackingItem[]>(() => loadFromStorage('ts_packing', DEFAULT_PACKING_ITEMS));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('ts_expenses', DEFAULT_EXPENSES));

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    // Failsafe: if loading takes more than 3 seconds, just show auth
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

  // Persist data
  useEffect(() => { saveToStorage('ts_trips', trips); }, [trips]);
  useEffect(() => { saveToStorage('ts_packing', packingItems); }, [packingItems]);
  useEffect(() => { saveToStorage('ts_expenses', expenses); }, [expenses]);

  const navigate = (s: string) => { setPrevScreen(screen); setScreen(s); };
  const selectedTrip = trips.find(t => t.id === selectedTripId) || null;

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    setExpenses(prev => prev.filter(e => e.tripId !== id));
    setPackingItems(prev => prev.filter(p => p.tripId !== id));
    if (selectedTripId === id) { setSelectedTripId(null); navigate('home'); }
    toast.success('Trip deleted');
  };

  if (loading) return (
    <div className="w-full max-w-[428px] h-full flex flex-col items-center justify-center bg-white">
      <div className="w-[48px] h-[48px] rounded-xl bg-primary flex items-center justify-center mb-3">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M5 20L14 4L23 20H5Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
          <circle cx="14" cy="15" r="3" stroke="white" strokeWidth="2"/>
        </svg>
      </div>
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <p className="text-[11px] text-on-surface-muted mt-2">Loading TripSuite...</p>
    </div>
  );

  if (!session) return (
    <>
      <Toaster position="top-center" toastOptions={toastOptions} />
      <AuthScreen onLogin={setSession} />
    </>
  );

  return (
    <div className="w-full max-w-[428px] h-full flex flex-col bg-surface relative overflow-hidden">
      <Toaster position="top-center" toastOptions={toastOptions} />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="flex-1 overflow-y-auto overflow-x-hidden"
        >
          {screen === 'home' && (
            <HomeScreen
              trips={trips}
              onSelectTrip={(id) => { setSelectedTripId(id); navigate('trip-detail'); }}
              onNavigate={navigate}
            />
          )}
          {screen === 'create-trip' && (
            <CreateTripScreen
              onBack={() => navigate('home')}
              onCreate={(trip) => { setTrips(prev => [trip, ...prev]); navigate('home'); toast.success('Trip created!'); }}
            />
          )}
          {screen === 'trip-detail' && selectedTrip && (
            <TripDetailScreen
              trip={selectedTrip}
              expenses={expenses.filter(e => e.tripId === selectedTrip.id)}
              onBack={() => navigate('home')}
              onUpdate={(updates) => updateTrip(selectedTrip.id, updates)}
              onDelete={() => deleteTrip(selectedTrip.id)}
              onAddExpense={(exp) => setExpenses(prev => [...prev, exp])}
              onDeleteExpense={(id) => setExpenses(prev => prev.filter(e => e.id !== id))}
            />
          )}
          {screen === 'budget' && (
            <BudgetScreen
              trips={trips}
              expenses={expenses}
              onAddExpense={(exp) => setExpenses(prev => [...prev, exp])}
              onDeleteExpense={(id) => setExpenses(prev => prev.filter(e => e.id !== id))}
            />
          )}
          {screen === 'packing' && (
            <PackingScreen
              trips={trips}
              items={packingItems}
              onToggle={(id) => setPackingItems(prev => prev.map(i => i.id === id ? { ...i, packed: !i.packed } : i))}
              onAdd={(item) => setPackingItems(prev => [...prev, item])}
              onDelete={(id) => setPackingItems(prev => prev.filter(i => i.id !== id))}
            />
          )}
          {screen === 'profile' && (
            <ProfileScreen
              session={session}
              tripCount={trips.length}
              onLogout={async () => { await supabase.auth.signOut(); setSession(null); }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Nav */}
      {!['create-trip', 'trip-detail'].includes(screen) && (
        <nav className="h-[52px] bg-white border-t border-surface-container flex items-center justify-around flex-shrink-0" data-testid="bottom-nav">
          {[
            { id: 'home', icon: Home, label: 'Trips' },
            { id: 'create-trip', icon: Plus, label: 'Add' },
            { id: 'budget', icon: DollarSign, label: 'Budget' },
            { id: 'packing', icon: ListChecks, label: 'Packing' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map(tab => (
            <button
              key={tab.id}
              data-testid={`nav-${tab.id}`}
              onClick={() => navigate(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                screen === tab.id ? 'text-primary' : 'text-on-surface-muted'
              }`}
            >
              {tab.id === 'create-trip' ? (
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center -mt-4 shadow-md">
                  <tab.icon size={18} />
                </div>
              ) : (
                <>
                  <tab.icon size={18} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </>
              )}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// AUTH SCREEN
// ──────────────────────────────────────────
function AuthScreen({ onLogin }: { onLogin: (s: Session) => void }) {
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Email is required'); return; }
    setBusy(true);

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        toast.success('Password reset email sent!');
        setMode('signin');
      } else if (mode === 'register') {
        if (!password || password.length < 6) { toast.error('Password must be at least 6 characters'); setBusy(false); return; }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          onLogin(data.session);
          toast.success('Account created!');
        } else {
          toast.success('Check your email to confirm your account');
          setMode('signin');
        }
      } else {
        if (!password) { toast.error('Password is required'); setBusy(false); return; }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) onLogin(data.session);
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    }
    setBusy(false);
  };

  return (
    <div className="w-full max-w-[428px] h-full mx-auto flex flex-col bg-surface">
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-[48px] h-[48px] rounded-xl bg-primary flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M5 20L14 4L23 20H5Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="14" cy="15" r="3" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h1 className="text-[22px] font-bold font-[Manrope] text-on-surface leading-tight">TripSuite</h1>
            <p className="text-[11px] text-on-surface-muted">Plan smarter, travel better</p>
          </div>
        </div>

        <h2 className="text-[18px] font-semibold font-[Manrope] text-on-surface mb-4">
          {mode === 'signin' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted" />
            <input
              data-testid="input-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-[40px] pl-9 pr-3 text-[13px] bg-white border border-surface-container rounded-lg outline-none focus:border-primary transition-colors"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted" />
              <input
                data-testid="input-password"
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-[40px] pl-9 pr-10 text-[13px] bg-white border border-surface-container rounded-lg outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                data-testid="toggle-password"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          )}

          {mode === 'signin' && (
            <button
              type="button"
              data-testid="btn-forgot-password"
              onClick={() => setMode('forgot')}
              className="text-[12px] text-primary self-end -mt-1"
            >
              Forgot password?
            </button>
          )}

          <button
            type="submit"
            data-testid="btn-auth-submit"
            disabled={busy}
            className="h-[44px] bg-primary text-white text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity mt-1"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signin' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
          </button>

          <button
            type="button"
            data-testid="btn-google-auth"
            onClick={() => toast('Google OAuth coming soon', { icon: '🔜' })}
            className="h-[44px] bg-white border border-surface-container text-[13px] font-medium rounded-lg flex items-center justify-center gap-2 text-on-surface"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-[12px] text-on-surface-muted text-center mt-4">
          {mode === 'signin' ? "Don't have an account? " : mode === 'register' ? 'Already have an account? ' : 'Remember your password? '}
          <button
            data-testid="btn-toggle-auth-mode"
            onClick={() => setMode(mode === 'signin' ? 'register' : 'signin')}
            className="text-primary font-medium"
          >
            {mode === 'signin' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// HOME SCREEN
// ──────────────────────────────────────────
function HomeScreen({
  trips,
  onSelectTrip,
  onNavigate,
}: {
  trips: Trip[];
  onSelectTrip: (id: string) => void;
  onNavigate: (s: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let list = trips;
    if (filter !== 'all') list = list.filter(t => t.status === filter);
    if (search) list = list.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [trips, filter, search]);

  return (
    <div className="px-4 pt-3 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <path d="M5 20L14 4L23 20H5Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="14" cy="15" r="3" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <span className="text-[16px] font-bold font-[Manrope] text-on-surface">TripSuite</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-surface-container rounded-lg px-2.5 py-1.5">
          <CloudSun size={14} className="text-warning" />
          <span className="text-[11px] font-medium text-on-surface">28°C</span>
          <span className="text-[10px] text-on-surface-muted">Chennai</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-2.5">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-muted" />
        <input
          data-testid="input-search-trips"
          type="text"
          placeholder="Search trips..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-[36px] pl-8 pr-3 text-[12px] bg-white border border-surface-container rounded-lg outline-none focus:border-primary"
        />
      </div>

      {/* Title + Filters */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[18px] font-bold font-[Manrope] text-on-surface" data-testid="text-my-trips">My Trips</h2>
        <span className="text-[11px] text-on-surface-muted">{filtered.length} trips</span>
      </div>

      <div className="flex gap-1.5 mb-3">
        {['all', 'ongoing', 'upcoming', 'completed'].map(f => (
          <button
            key={f}
            data-testid={`filter-${f}`}
            onClick={() => setFilter(f)}
            className={`h-[28px] px-2.5 text-[10px] font-medium rounded-full border transition-colors capitalize ${
              filter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-on-surface-muted border-surface-container'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Trip Cards */}
      <div className="flex flex-col gap-[8px]">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[13px] text-on-surface-muted">
            <MapPin size={24} className="mx-auto mb-2 opacity-40" />
            No trips found
          </div>
        )}
        {filtered.map(trip => (
          <button
            key={trip.id}
            data-testid={`trip-card-${trip.id}`}
            onClick={() => onSelectTrip(trip.id)}
            className="flex items-center gap-2.5 bg-white rounded-xl border border-surface-container p-2 h-[70px] text-left transition-all hover:shadow-sm active:scale-[0.98]"
          >
            <img
              src={trip.image}
              alt={trip.name}
              className="w-[56px] h-[56px] rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-on-surface truncate pr-2">{trip.name}</h3>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 capitalize ${statusColor(trip.status)}`}>
                  {trip.status}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-on-surface-muted flex-shrink-0" />
                <span className="text-[11px] text-on-surface-muted truncate">{trip.destination}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-on-surface-muted flex items-center gap-0.5">
                  <Calendar size={9} /> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
                <span className="text-[10px] text-on-surface-muted flex items-center gap-0.5">
                  <Users size={9} /> {trip.guests}
                </span>
              </div>
            </div>
            <ChevronRight size={14} className="text-on-surface-muted flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// CREATE TRIP SCREEN
// ──────────────────────────────────────────
function CreateTripScreen({ onBack, onCreate }: { onBack: () => void; onCreate: (t: Trip) => void }) {
  const [form, setForm] = useState({
    name: '', destination: '', startDate: '', endDate: '', guests: '2', type: 'Adventure'
  });

  const tripTypes = ['Adventure', 'Family', 'Romantic', 'Business', 'Solo', 'Friends'];

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error('Trip name is required'); return; }
    if (!form.destination.trim()) { toast.error('Destination is required'); return; }
    if (!form.startDate || !form.endDate) { toast.error('Dates are required'); return; }

    const trip: Trip = {
      id: uid(),
      name: form.name,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      guests: parseInt(form.guests) || 2,
      type: form.type,
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop',
      itinerary: [],
      flights: [],
      stays: [],
      photos: [],
    };
    onCreate(trip);
  };

  return (
    <div className="px-4 pt-3 pb-4">
      <div className="flex items-center gap-2 mb-4">
        <button data-testid="btn-back-create" onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-surface-container">
          <ChevronLeft size={16} />
        </button>
        <h1 className="text-[20px] font-bold font-[Manrope]">New Trip</h1>
      </div>

      <div className="flex flex-col gap-[10px]">
        <label className="text-[12px] font-medium text-on-surface-muted">Trip Name</label>
        <input
          data-testid="input-trip-name"
          type="text"
          placeholder="e.g., Bali Adventure"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          className="h-[40px] px-3 text-[13px] bg-white border border-surface-container rounded-lg outline-none focus:border-primary"
        />

        <label className="text-[12px] font-medium text-on-surface-muted">Destination</label>
        <input
          data-testid="input-trip-destination"
          type="text"
          placeholder="e.g., Ubud, Bali"
          value={form.destination}
          onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
          className="h-[40px] px-3 text-[13px] bg-white border border-surface-container rounded-lg outline-none focus:border-primary"
        />

        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <label className="text-[12px] font-medium text-on-surface-muted">Start Date</label>
            <input
              data-testid="input-trip-start"
              type="date"
              value={form.startDate}
              onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
              className="h-[40px] w-full px-3 text-[13px] bg-white border border-surface-container rounded-lg outline-none focus:border-primary mt-1"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-on-surface-muted">End Date</label>
            <input
              data-testid="input-trip-end"
              type="date"
              value={form.endDate}
              onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
              className="h-[40px] w-full px-3 text-[13px] bg-white border border-surface-container rounded-lg outline-none focus:border-primary mt-1"
            />
          </div>
        </div>

        <label className="text-[12px] font-medium text-on-surface-muted">Guests</label>
        <input
          data-testid="input-trip-guests"
          type="number"
          min="1"
          value={form.guests}
          onChange={e => setForm(p => ({ ...p, guests: e.target.value }))}
          className="h-[40px] px-3 text-[13px] bg-white border border-surface-container rounded-lg outline-none focus:border-primary"
        />

        <label className="text-[12px] font-medium text-on-surface-muted">Trip Type</label>
        <div className="flex flex-wrap gap-1.5">
          {tripTypes.map(t => (
            <button
              key={t}
              data-testid={`type-${t.toLowerCase()}`}
              onClick={() => setForm(p => ({ ...p, type: t }))}
              className={`h-[30px] px-3 text-[11px] font-medium rounded-full border transition-colors ${
                form.type === t ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-muted border-surface-container'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          data-testid="btn-create-trip"
          onClick={handleCreate}
          className="h-[44px] bg-primary text-white text-[14px] font-semibold rounded-lg mt-2 active:scale-[0.98] transition-transform"
        >
          Create Trip
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// TRIP DETAIL SCREEN
// ──────────────────────────────────────────
function TripDetailScreen({
  trip,
  expenses,
  onBack,
  onUpdate,
  onDelete,
  onAddExpense,
  onDeleteExpense,
}: {
  trip: Trip;
  expenses: Expense[];
  onBack: () => void;
  onUpdate: (u: Partial<Trip>) => void;
  onDelete: () => void;
  onAddExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
}) {
  const [tab, setTab] = useState('itinerary');
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showStayModal, setShowStayModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const tabs = [
    { id: 'itinerary', label: 'Itinerary', icon: MapPin },
    { id: 'flights', label: 'Flights', icon: PlaneTakeoff },
    { id: 'stays', label: 'Stays', icon: Hotel },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'photos', label: 'Photos', icon: Image },
  ];

  const numDays = Math.max(daysBetween(trip.startDate, trip.endDate), 1);
  const currentDayPlan = trip.itinerary.find(d => d.day === selectedDay);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const deleteActivity = (actId: string) => {
    const newItinerary = trip.itinerary.map(d => ({
      ...d,
      activities: d.activities.filter(a => a.id !== actId)
    }));
    onUpdate({ itinerary: newItinerary });
    toast.success('Activity removed');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="relative h-[140px] flex-shrink-0">
        <img src={trip.image} alt={trip.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <button data-testid="btn-back-detail" onClick={onBack} className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-lg flex items-center justify-center text-white">
            <ChevronLeft size={16} />
          </button>
          <div className="relative">
            <button data-testid="btn-trip-menu" onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-lg flex items-center justify-center text-white">
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-9 bg-white rounded-lg shadow-lg border border-surface-container overflow-hidden z-20 min-w-[130px]">
                <button
                  data-testid="btn-edit-trip"
                  onClick={() => { setShowMenu(false); setShowEditModal(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-surface-container-low"
                >
                  <Edit3 size={12} /> Edit Trip
                </button>
                <button
                  data-testid="btn-delete-trip"
                  onClick={() => { setShowMenu(false); if (confirm('Delete this trip?')) onDelete(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-danger hover:bg-red-50"
                >
                  <Trash2 size={12} /> Delete Trip
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-2 left-3 right-3">
          <h1 className="text-[20px] font-bold font-[Manrope] text-white leading-tight">{trip.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-white/80 flex items-center gap-0.5">
              <MapPin size={10} /> {trip.destination}
            </span>
            <span className="text-[11px] text-white/80 flex items-center gap-0.5">
              <Calendar size={10} /> {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </span>
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full capitalize ${statusColor(trip.status)}`}>
              {trip.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-surface-container bg-white flex-shrink-0 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            data-testid={`tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1 px-3 h-[36px] text-[11px] font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id ? 'text-primary border-primary' : 'text-on-surface-muted border-transparent'
            }`}
          >
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {/* ITINERARY TAB */}
        {tab === 'itinerary' && (
          <div>
            {/* Day Selector */}
            <div className="flex gap-1.5 overflow-x-auto mb-2 pb-1">
              {Array.from({ length: numDays }, (_, i) => i + 1).map(d => (
                <button
                  key={d}
                  data-testid={`day-${d}`}
                  onClick={() => setSelectedDay(d)}
                  className={`h-[32px] min-w-[56px] px-2.5 text-[11px] font-medium rounded-full border flex-shrink-0 transition-colors ${
                    selectedDay === d ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-muted border-surface-container'
                  }`}
                >
                  Day {d}
                </button>
              ))}
            </div>

            {/* AI Generate Button */}
            <button
              data-testid="btn-ai-generate"
              onClick={() => setShowAiModal(true)}
              className="w-full h-[36px] bg-gradient-to-r from-primary to-emerald-500 text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 mb-2 active:scale-[0.98] transition-transform"
            >
              <Sparkles size={13} /> Generate with AI
            </button>

            {/* Activities */}
            {currentDayPlan && currentDayPlan.activities.length > 0 ? (
              <div className="flex flex-col gap-[6px]">
                {currentDayPlan.activities.map((act, i) => (
                  <div
                    key={act.id}
                    data-testid={`activity-${act.id}`}
                    className="flex gap-2 group"
                  >
                    {/* Timeline */}
                    <div className="flex flex-col items-center w-5 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      {i < currentDayPlan.activities.length - 1 && <div className="w-0.5 flex-1 bg-surface-container mt-0.5" />}
                    </div>
                    {/* Card */}
                    <div className="flex-1 bg-white rounded-lg border border-surface-container p-2 mb-0.5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Clock size={10} className="text-primary flex-shrink-0" />
                            <span className="text-[10px] text-primary font-medium">{act.time}</span>
                          </div>
                          <h4 className="text-[12px] font-semibold text-on-surface mt-0.5">{act.title}</h4>
                          <p className="text-[10px] text-on-surface-muted mt-0.5">{act.description}</p>
                        </div>
                        <button
                          data-testid={`delete-activity-${act.id}`}
                          onClick={() => deleteActivity(act.id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-on-surface-muted hover:text-danger transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[12px] text-on-surface-muted">
                <Calendar size={20} className="mx-auto mb-1.5 opacity-40" />
                No activities for Day {selectedDay}
                <br />
                <span className="text-[10px]">Use AI to generate an itinerary</span>
              </div>
            )}
          </div>
        )}

        {/* FLIGHTS TAB */}
        {tab === 'flights' && (
          <div>
            <button
              data-testid="btn-add-flight"
              onClick={() => setShowFlightModal(true)}
              className="w-full h-[36px] bg-primary text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 mb-2"
            >
              <Plus size={13} /> Add Flight
            </button>
            {trip.flights.length === 0 ? (
              <div className="text-center py-6 text-[12px] text-on-surface-muted">
                <PlaneTakeoff size={20} className="mx-auto mb-1.5 opacity-40" />
                No flights added
              </div>
            ) : (
              <div className="flex flex-col gap-[8px]">
                {trip.flights.map(fl => (
                  <div key={fl.id} data-testid={`flight-${fl.id}`} className="bg-white rounded-lg border border-surface-container p-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PlaneTakeoff size={12} className="text-primary" />
                        <span className="text-[12px] font-semibold">{fl.airline}</span>
                        <span className="text-[10px] text-on-surface-muted">{fl.flightNumber}</span>
                      </div>
                      <button
                        data-testid={`delete-flight-${fl.id}`}
                        onClick={() => {
                          onUpdate({ flights: trip.flights.filter(f => f.id !== fl.id) });
                          toast.success('Flight removed');
                        }}
                        className="text-on-surface-muted hover:text-danger"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div>
                        <p className="text-[10px] text-on-surface-muted">Departure</p>
                        <p className="text-[11px] font-medium">{fl.departure}</p>
                      </div>
                      <ArrowRight size={12} className="text-on-surface-muted" />
                      <div className="text-right">
                        <p className="text-[10px] text-on-surface-muted">Arrival</p>
                        <p className="text-[11px] font-medium">{fl.arrival}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-on-surface-muted mt-1">Terminal: {fl.terminal}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STAYS TAB */}
        {tab === 'stays' && (
          <div>
            <button
              data-testid="btn-add-stay"
              onClick={() => setShowStayModal(true)}
              className="w-full h-[36px] bg-primary text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 mb-2"
            >
              <Plus size={13} /> Add Stay
            </button>
            {trip.stays.length === 0 ? (
              <div className="text-center py-6 text-[12px] text-on-surface-muted">
                <Hotel size={20} className="mx-auto mb-1.5 opacity-40" />
                No stays added
              </div>
            ) : (
              <div className="flex flex-col gap-[8px]">
                {trip.stays.map(st => (
                  <div key={st.id} data-testid={`stay-${st.id}`} className="bg-white rounded-lg border border-surface-container p-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Hotel size={12} className="text-primary" />
                        <span className="text-[12px] font-semibold">{st.hotelName}</span>
                      </div>
                      <button
                        data-testid={`delete-stay-${st.id}`}
                        onClick={() => {
                          onUpdate({ stays: trip.stays.filter(s => s.id !== st.id) });
                          toast.success('Stay removed');
                        }}
                        className="text-on-surface-muted hover:text-danger"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <div>
                        <p className="text-[10px] text-on-surface-muted">Check-in</p>
                        <p className="text-[11px] font-medium">{formatDateLong(st.checkIn)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-muted">Check-out</p>
                        <p className="text-[11px] font-medium">{formatDateLong(st.checkOut)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-on-surface-muted">{st.roomType}</span>
                      <span className="text-[10px] text-on-surface-muted">Ref: {st.bookingRef}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BUDGET TAB */}
        {tab === 'budget' && (
          <div>
            <div className="bg-white rounded-lg border border-surface-container p-2.5 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-on-surface-muted">Total Expenses</span>
                <span className="text-[16px] font-bold text-on-surface">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex gap-2 mt-1.5">
                {Object.entries(expenses.reduce((acc, e) => {
                  acc[e.category] = (acc[e.category] || 0) + e.amount;
                  return acc;
                }, {} as Record<string, number>)).slice(0, 3).map(([cat, amt]) => (
                  <span key={cat} className="text-[9px] bg-surface-container-low rounded px-1.5 py-0.5">
                    {cat}: {formatCurrency(amt)}
                  </span>
                ))}
              </div>
            </div>
            <button
              data-testid="btn-add-trip-expense"
              onClick={() => setShowExpenseModal(true)}
              className="w-full h-[36px] bg-primary text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 mb-2"
            >
              <Plus size={13} /> Add Expense
            </button>
            <div className="flex flex-col gap-[6px]">
              {expenses.map(exp => (
                <div key={exp.id} data-testid={`expense-${exp.id}`} className="flex items-center justify-between bg-white rounded-lg border border-surface-container px-2.5 py-2 h-[44px]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-on-surface truncate">{exp.description}</p>
                    <p className="text-[9px] text-on-surface-muted">{exp.category} · {formatDate(exp.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-on-surface">{formatCurrency(exp.amount)}</span>
                    <button
                      data-testid={`delete-expense-${exp.id}`}
                      onClick={() => { onDeleteExpense(exp.id); toast.success('Expense removed'); }}
                      className="text-on-surface-muted hover:text-danger"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHOTOS TAB */}
        {tab === 'photos' && (
          <div>
            {trip.photos.length === 0 ? (
              <div className="text-center py-6 text-[12px] text-on-surface-muted">
                <Camera size={20} className="mx-auto mb-1.5 opacity-40" />
                No photos yet
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {trip.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`Photo ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                    data-testid={`photo-${i}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAiModal && (
        <AiItineraryModal
          trip={trip}
          onClose={() => setShowAiModal(false)}
          onGenerate={(itinerary) => {
            onUpdate({ itinerary });
            setShowAiModal(false);
            toast.success('Itinerary generated!');
          }}
        />
      )}

      {showFlightModal && (
        <Modal title="Add Flight" onClose={() => setShowFlightModal(false)}>
          <FlightForm
            onSubmit={(fl) => {
              onUpdate({ flights: [...trip.flights, fl] });
              setShowFlightModal(false);
              toast.success('Flight added');
            }}
          />
        </Modal>
      )}

      {showStayModal && (
        <Modal title="Add Stay" onClose={() => setShowStayModal(false)}>
          <StayForm
            onSubmit={(st) => {
              onUpdate({ stays: [...trip.stays, st] });
              setShowStayModal(false);
              toast.success('Stay added');
            }}
          />
        </Modal>
      )}

      {showExpenseModal && (
        <Modal title="Add Expense" onClose={() => setShowExpenseModal(false)}>
          <ExpenseForm
            tripId={trip.id}
            onSubmit={(exp) => {
              onAddExpense(exp);
              setShowExpenseModal(false);
              toast.success('Expense added');
            }}
          />
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Edit Trip" onClose={() => setShowEditModal(false)}>
          <EditTripForm
            trip={trip}
            onSubmit={(updates) => {
              onUpdate(updates);
              setShowEditModal(false);
              toast.success('Trip updated');
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// BUDGET SCREEN (GLOBAL)
// ──────────────────────────────────────────
function BudgetScreen({
  trips,
  expenses,
  onAddExpense,
  onDeleteExpense,
}: {
  trips: Trip[];
  expenses: Expense[];
  onAddExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
}) {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '');
  const [showModal, setShowModal] = useState(false);

  const tripExpenses = expenses.filter(e => e.tripId === selectedTripId);
  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
  const totalTrip = tripExpenses.reduce((s, e) => s + e.amount, 0);

  const categoryBreakdown = tripExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryColors: Record<string, string> = {
    Transport: 'bg-blue-400',
    Accommodation: 'bg-purple-400',
    Food: 'bg-orange-400',
    Activities: 'bg-green-400',
    Flights: 'bg-cyan-400',
    Shopping: 'bg-pink-400',
    Other: 'bg-gray-400',
  };

  return (
    <div className="px-4 pt-3 pb-2">
      <h1 className="text-[18px] font-bold font-[Manrope] mb-2" data-testid="text-budget-title">Budget</h1>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-surface-container p-2.5 mb-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-on-surface-muted">Total across all trips</span>
          <span className="text-[15px] font-bold text-on-surface">{formatCurrency(totalAll)}</span>
        </div>
      </div>

      {/* Trip Tabs */}
      <div className="flex gap-1.5 overflow-x-auto mb-2 pb-1">
        {trips.map(t => (
          <button
            key={t.id}
            data-testid={`budget-trip-${t.id}`}
            onClick={() => setSelectedTripId(t.id)}
            className={`h-[28px] px-2.5 text-[10px] font-medium rounded-full border whitespace-nowrap flex-shrink-0 transition-colors ${
              selectedTripId === t.id ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-muted border-surface-container'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Trip Budget Card */}
      <div className="bg-white rounded-lg border border-surface-container p-2.5 mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-on-surface-muted">Trip Total</span>
          <span className="text-[14px] font-bold">{formatCurrency(totalTrip)}</span>
        </div>
        {/* Category breakdown bar */}
        {totalTrip > 0 && (
          <div className="h-1.5 rounded-full overflow-hidden flex mb-1.5">
            {Object.entries(categoryBreakdown).map(([cat, amt]) => (
              <div
                key={cat}
                className={`h-full ${categoryColors[cat] || 'bg-gray-400'}`}
                style={{ width: `${(amt / totalTrip) * 100}%` }}
              />
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {Object.entries(categoryBreakdown).map(([cat, amt]) => (
            <span key={cat} className="text-[9px] text-on-surface-muted flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${categoryColors[cat] || 'bg-gray-400'}`} />
              {cat}: {formatCurrency(amt)}
            </span>
          ))}
        </div>
      </div>

      <button
        data-testid="btn-add-global-expense"
        onClick={() => setShowModal(true)}
        className="w-full h-[36px] bg-primary text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 mb-2"
      >
        <Plus size={13} /> Add Expense
      </button>

      {/* Expense List */}
      <div className="flex flex-col gap-[6px]">
        {tripExpenses.length === 0 && (
          <div className="text-center py-4 text-[12px] text-on-surface-muted">No expenses for this trip</div>
        )}
        {tripExpenses.map(exp => (
          <div key={exp.id} data-testid={`global-expense-${exp.id}`} className="flex items-center justify-between bg-white rounded-lg border border-surface-container px-2.5 py-2 h-[44px]">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${categoryColors[exp.category] || 'bg-gray-400'}`} />
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-on-surface truncate">{exp.description}</p>
                <p className="text-[9px] text-on-surface-muted">{exp.category} · {formatDate(exp.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold">{formatCurrency(exp.amount)}</span>
              <button
                data-testid={`delete-global-expense-${exp.id}`}
                onClick={() => { onDeleteExpense(exp.id); toast.success('Expense removed'); }}
                className="text-on-surface-muted hover:text-danger"
              >
                <X size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Add Expense" onClose={() => setShowModal(false)}>
          <ExpenseForm
            tripId={selectedTripId}
            onSubmit={(exp) => {
              onAddExpense(exp);
              setShowModal(false);
              toast.success('Expense added');
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// PACKING SCREEN
// ──────────────────────────────────────────
function PackingScreen({
  trips,
  items,
  onToggle,
  onAdd,
  onDelete,
}: {
  trips: Trip[];
  items: PackingItem[];
  onToggle: (id: string) => void;
  onAdd: (item: PackingItem) => void;
  onDelete: (id: string) => void;
}) {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '');
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  const tripItems = items.filter(i => i.tripId === selectedTripId);
  const categories = ['Essentials', 'Clothing', 'Electronics'];
  const packed = tripItems.filter(i => i.packed).length;
  const total = tripItems.length;

  const addItem = (category: string) => {
    const text = newItemText[category]?.trim();
    if (!text) return;
    onAdd({ id: uid(), name: text, category, packed: false, tripId: selectedTripId });
    setNewItemText(prev => ({ ...prev, [category]: '' }));
  };

  return (
    <div className="px-4 pt-3 pb-2">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[18px] font-bold font-[Manrope]" data-testid="text-packing-title">Packing List</h1>
        <span className="text-[11px] bg-primary text-white px-2 py-0.5 rounded-full font-medium" data-testid="text-pack-counter">
          {packed}/{total}
        </span>
      </div>

      {/* Trip Tabs */}
      <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1">
        {trips.map(t => (
          <button
            key={t.id}
            data-testid={`packing-trip-${t.id}`}
            onClick={() => setSelectedTripId(t.id)}
            className={`h-[28px] px-2.5 text-[10px] font-medium rounded-full border whitespace-nowrap flex-shrink-0 transition-colors ${
              selectedTripId === t.id ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-muted border-surface-container'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface-container rounded-full mb-3 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: total > 0 ? `${(packed / total) * 100}%` : '0%' }} />
      </div>

      {categories.map(cat => {
        const catItems = tripItems.filter(i => i.category === cat);
        return (
          <div key={cat} className="mb-3">
            <h3 className="text-[13px] font-semibold text-on-surface mb-1">{cat}</h3>
            <div className="flex flex-col">
              {catItems.map(item => (
                <div
                  key={item.id}
                  data-testid={`packing-item-${item.id}`}
                  className="flex items-center h-[44px] border-b border-surface-container group"
                >
                  <button
                    data-testid={`toggle-pack-${item.id}`}
                    onClick={() => onToggle(item.id)}
                    className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.packed ? 'bg-primary border-primary' : 'border-surface-container'
                    }`}
                  >
                    {item.packed && <Check size={11} className="text-white" />}
                  </button>
                  <span className={`flex-1 ml-2.5 text-[13px] ${item.packed ? 'line-through text-on-surface-muted' : 'text-on-surface'}`}>
                    {item.name}
                  </span>
                  <button
                    data-testid={`delete-pack-${item.id}`}
                    onClick={() => { onDelete(item.id); toast.success('Item removed'); }}
                    className="opacity-0 group-hover:opacity-100 text-on-surface-muted hover:text-danger transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {/* Add inline */}
              <div className="flex items-center h-[38px] gap-1.5">
                <input
                  data-testid={`input-add-packing-${cat.toLowerCase()}`}
                  type="text"
                  placeholder={`Add to ${cat}...`}
                  value={newItemText[cat] || ''}
                  onChange={e => setNewItemText(prev => ({ ...prev, [cat]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addItem(cat)}
                  className="flex-1 h-[32px] px-2.5 text-[12px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary"
                />
                <button
                  data-testid={`btn-add-packing-${cat.toLowerCase()}`}
                  onClick={() => addItem(cat)}
                  className="w-[32px] h-[32px] bg-primary text-white rounded-lg flex items-center justify-center"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────
// PROFILE SCREEN
// ──────────────────────────────────────────
function ProfileScreen({
  session,
  tripCount,
  onLogout,
}: {
  session: Session;
  tripCount: number;
  onLogout: () => void;
}) {
  const email = session.user.email || 'traveler@tripsuite.app';
  const name = session.user.user_metadata?.full_name || email.split('@')[0];
  const level = tripCount >= 10 ? 'Diamond Explorer' : tripCount >= 5 ? 'Gold Explorer' : tripCount >= 2 ? 'Silver Explorer' : 'New Explorer';

  const prefs = [
    { icon: Globe, label: 'Language', value: 'English' },
    { icon: DollarSign, label: 'Currency', value: 'INR (₹)' },
    { icon: MapPin, label: 'Home Base', value: 'Chennai, India' },
    { icon: Heart, label: 'Travel Style', value: 'Adventure' },
    { icon: Settings, label: 'Notifications', value: 'Enabled' },
    { icon: AlertCircle, label: 'Help & Support', value: '' },
  ];

  return (
    <div className="px-4 pt-3 pb-2">
      {/* Profile Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-[64px] h-[64px] rounded-full bg-primary flex items-center justify-center text-white text-[24px] font-bold font-[Manrope] flex-shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-[18px] font-bold font-[Manrope]" data-testid="text-profile-name">{name}</h2>
          <p className="text-[11px] text-on-surface-muted">{email}</p>
          <span className="text-[10px] text-primary font-medium" data-testid="text-explorer-level">{level}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Trips', value: tripCount },
          { label: 'Countries', value: Math.min(tripCount, 3) },
          { label: 'Photos', value: tripCount * 4 },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg border border-surface-container h-[48px] flex flex-col items-center justify-center">
            <span className="text-[15px] font-bold text-primary">{stat.value}</span>
            <span className="text-[9px] text-on-surface-muted">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Preferences */}
      <h3 className="text-[14px] font-semibold font-[Manrope] mb-1.5">Preferences</h3>
      <div className="flex flex-col">
        {prefs.map((pref, i) => (
          <button
            key={pref.label}
            data-testid={`pref-${pref.label.toLowerCase().replace(/\s/g, '-')}`}
            onClick={() => toast('Coming soon', { icon: '🔜' })}
            className="flex items-center h-[44px] border-b border-surface-container text-left group"
          >
            <pref.icon size={14} className="text-on-surface-muted flex-shrink-0" />
            <span className="flex-1 ml-2.5 text-[13px] text-on-surface">{pref.label}</span>
            {pref.value && <span className="text-[11px] text-on-surface-muted mr-1">{pref.value}</span>}
            <ChevronRight size={12} className="text-on-surface-muted" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        data-testid="btn-logout"
        onClick={onLogout}
        className="w-full h-[40px] mt-4 bg-red-50 text-danger text-[13px] font-medium rounded-lg flex items-center justify-center gap-1.5"
      >
        <LogOut size={14} /> Sign Out
      </button>
    </div>
  );
}

// ──────────────────────────────────────────
// MODAL WRAPPER
// ──────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[428px] bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-4 py-2.5 border-b border-surface-container">
          <h3 className="text-[15px] font-semibold font-[Manrope]">{title}</h3>
          <button data-testid="btn-close-modal" onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-low">
            <X size={14} />
          </button>
        </div>
        <div className="px-4 py-3">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────
// FLIGHT FORM
// ──────────────────────────────────────────
function FlightForm({ onSubmit }: { onSubmit: (f: Flight) => void }) {
  const [form, setForm] = useState({ airline: '', flightNumber: '', departure: '', arrival: '', terminal: '' });

  return (
    <div className="flex flex-col gap-[10px]">
      <input data-testid="input-airline" placeholder="Airline" value={form.airline} onChange={e => setForm(p => ({ ...p, airline: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <input data-testid="input-flight-number" placeholder="Flight Number" value={form.flightNumber} onChange={e => setForm(p => ({ ...p, flightNumber: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <input data-testid="input-departure" type="datetime-local" placeholder="Departure" value={form.departure} onChange={e => setForm(p => ({ ...p, departure: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <input data-testid="input-arrival" type="datetime-local" placeholder="Arrival" value={form.arrival} onChange={e => setForm(p => ({ ...p, arrival: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <input data-testid="input-terminal" placeholder="Terminal" value={form.terminal} onChange={e => setForm(p => ({ ...p, terminal: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <button
        data-testid="btn-submit-flight"
        onClick={() => {
          if (!form.airline || !form.flightNumber) { toast.error('Airline and flight number required'); return; }
          onSubmit({ ...form, id: uid() });
        }}
        className="h-[44px] bg-primary text-white text-[13px] font-semibold rounded-lg mt-1"
      >
        Add Flight
      </button>
    </div>
  );
}

// ──────────────────────────────────────────
// STAY FORM
// ──────────────────────────────────────────
function StayForm({ onSubmit }: { onSubmit: (s: Stay) => void }) {
  const [form, setForm] = useState({ hotelName: '', checkIn: '', checkOut: '', roomType: '', bookingRef: '' });

  return (
    <div className="flex flex-col gap-[10px]">
      <input data-testid="input-hotel-name" placeholder="Hotel Name" value={form.hotelName} onChange={e => setForm(p => ({ ...p, hotelName: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <div className="grid grid-cols-2 gap-[10px]">
        <input data-testid="input-checkin" type="date" value={form.checkIn} onChange={e => setForm(p => ({ ...p, checkIn: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
        <input data-testid="input-checkout" type="date" value={form.checkOut} onChange={e => setForm(p => ({ ...p, checkOut: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      </div>
      <input data-testid="input-room-type" placeholder="Room Type" value={form.roomType} onChange={e => setForm(p => ({ ...p, roomType: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <input data-testid="input-booking-ref" placeholder="Booking Reference" value={form.bookingRef} onChange={e => setForm(p => ({ ...p, bookingRef: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <button
        data-testid="btn-submit-stay"
        onClick={() => {
          if (!form.hotelName) { toast.error('Hotel name is required'); return; }
          onSubmit({ ...form, id: uid() });
        }}
        className="h-[44px] bg-primary text-white text-[13px] font-semibold rounded-lg mt-1"
      >
        Add Stay
      </button>
    </div>
  );
}

// ──────────────────────────────────────────
// EXPENSE FORM
// ──────────────────────────────────────────
function ExpenseForm({ tripId, onSubmit }: { tripId: string; onSubmit: (e: Expense) => void }) {
  const [form, setForm] = useState({ amount: '', category: 'Food', description: '', date: '' });
  const categories = ['Transport', 'Accommodation', 'Food', 'Activities', 'Flights', 'Shopping', 'Other'];

  return (
    <div className="flex flex-col gap-[10px]">
      <input data-testid="input-expense-amount" type="number" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <select data-testid="select-expense-category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary">
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <input data-testid="input-expense-desc" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <input data-testid="input-expense-date" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <button
        data-testid="btn-submit-expense"
        onClick={() => {
          if (!form.amount || !form.description) { toast.error('Amount and description required'); return; }
          onSubmit({ id: uid(), amount: parseFloat(form.amount), category: form.category, description: form.description, date: form.date || new Date().toISOString().split('T')[0], tripId });
        }}
        className="h-[44px] bg-primary text-white text-[13px] font-semibold rounded-lg mt-1"
      >
        Add Expense
      </button>
    </div>
  );
}

// ──────────────────────────────────────────
// EDIT TRIP FORM
// ──────────────────────────────────────────
function EditTripForm({ trip, onSubmit }: { trip: Trip; onSubmit: (u: Partial<Trip>) => void }) {
  const [form, setForm] = useState({
    name: trip.name,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    guests: String(trip.guests),
  });

  return (
    <div className="flex flex-col gap-[10px]">
      <input data-testid="input-edit-name" placeholder="Trip Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <input data-testid="input-edit-destination" placeholder="Destination" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <div className="grid grid-cols-2 gap-[10px]">
        <input data-testid="input-edit-start" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
        <input data-testid="input-edit-end" type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      </div>
      <input data-testid="input-edit-guests" type="number" min="1" placeholder="Guests" value={form.guests} onChange={e => setForm(p => ({ ...p, guests: e.target.value }))} className="h-[40px] px-3 text-[13px] bg-surface-container-low border border-surface-container rounded-lg outline-none focus:border-primary" />
      <button
        data-testid="btn-submit-edit"
        onClick={() => {
          onSubmit({ name: form.name, destination: form.destination, startDate: form.startDate, endDate: form.endDate, guests: parseInt(form.guests) || 2 });
        }}
        className="h-[44px] bg-primary text-white text-[13px] font-semibold rounded-lg mt-1"
      >
        Save Changes
      </button>
    </div>
  );
}

// ──────────────────────────────────────────
// AI ITINERARY MODAL
// ──────────────────────────────────────────
function AiItineraryModal({
  trip,
  onClose,
  onGenerate,
}: {
  trip: Trip;
  onClose: () => void;
  onGenerate: (itinerary: DayPlan[]) => void;
}) {
  const [travelStyle, setTravelStyle] = useState('balanced');
  const [budget, setBudget] = useState('moderate');
  const [interests, setInterests] = useState<string[]>(['culture', 'food']);
  const [generating, setGenerating] = useState(false);

  const styles = ['relaxed', 'balanced', 'packed'];
  const budgets = ['budget', 'moderate', 'luxury'];
  const allInterests = ['culture', 'food', 'nature', 'adventure', 'shopping', 'nightlife', 'history', 'photography'];

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const generate = async () => {
    if (!geminiKey) {
      toast.error('Gemini API key not configured');
      return;
    }

    setGenerating(true);
    try {
      const numDays = Math.max(daysBetween(trip.startDate, trip.endDate), 1);
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const prompt = `Generate a ${numDays}-day travel itinerary for ${trip.destination}.
Travel style: ${travelStyle}
Budget: ${budget}
Interests: ${interests.join(', ')}
Number of travelers: ${trip.guests}

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
[
  {
    "day": 1,
    "title": "Day Title",
    "activities": [
      {
        "id": "unique_id",
        "time": "09:00",
        "title": "Activity Name",
        "description": "Short description",
        "icon": "type"
      }
    ]
  }
]
Include 3-5 activities per day with realistic times.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const text = response.text || '';
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Could not parse AI response');

      const itinerary: DayPlan[] = JSON.parse(jsonMatch[0]);
      onGenerate(itinerary);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate itinerary');
    }
    setGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[428px] bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-4 py-2.5 border-b border-surface-container z-10">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-primary" />
            <h3 className="text-[15px] font-semibold font-[Manrope]">AI Itinerary</h3>
          </div>
          <button data-testid="btn-close-ai" onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-low">
            <X size={14} />
          </button>
        </div>

        <div className="px-4 py-3 flex flex-col gap-3">
          <div>
            <label className="text-[12px] font-medium text-on-surface-muted mb-1.5 block">Travel Style</label>
            <div className="flex gap-1.5">
              {styles.map(s => (
                <button
                  key={s}
                  data-testid={`style-${s}`}
                  onClick={() => setTravelStyle(s)}
                  className={`flex-1 h-[32px] text-[11px] font-medium rounded-lg border capitalize transition-colors ${
                    travelStyle === s ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-muted border-surface-container'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-on-surface-muted mb-1.5 block">Budget Level</label>
            <div className="flex gap-1.5">
              {budgets.map(b => (
                <button
                  key={b}
                  data-testid={`budget-${b}`}
                  onClick={() => setBudget(b)}
                  className={`flex-1 h-[32px] text-[11px] font-medium rounded-lg border capitalize transition-colors ${
                    budget === b ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-muted border-surface-container'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-on-surface-muted mb-1.5 block">Interests</label>
            <div className="flex flex-wrap gap-1.5">
              {allInterests.map(i => (
                <button
                  key={i}
                  data-testid={`interest-${i}`}
                  onClick={() => toggleInterest(i)}
                  className={`h-[28px] px-2.5 text-[10px] font-medium rounded-full border capitalize transition-colors ${
                    interests.includes(i) ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-muted border-surface-container'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <button
            data-testid="btn-generate-itinerary"
            onClick={generate}
            disabled={generating}
            className="h-[44px] bg-gradient-to-r from-primary to-emerald-500 text-white text-[13px] font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
          >
            {generating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generate Itinerary
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
