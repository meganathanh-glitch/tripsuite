/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Home, 
  Map as MapIcon, 
  Plus, 
  Briefcase, 
  User, 
  ChevronRight, 
  Calendar, 
  Users, 
  Cloud, 
  Sun, 
  Search,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Car,
  Camera,
  Utensils,
  Bed,
  ArrowLeft,
  Settings,
  Award,
  Globe,
  LogOut,
  X,
  Wallet,
  Filter,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plane,
  Hotel,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  ShoppingBag,
  Coffee
} from 'lucide-react';
import { MOCK_TRIPS, MOCK_PACKING_LIST } from './constants';
import { Trip, Screen, PackingItem, Expense } from './types';
import { supabase } from './supabase';

// --- Components ---

const BottomNav = ({ activeTab, onTabChange }: { activeTab: Screen, onTabChange: (tab: Screen) => void }) => {
  const tabs: { id: Screen; icon: any; label: string }[] = [
    { id: 'trips', icon: MapIcon, label: 'Trips' },
    { id: 'add', icon: Plus, label: 'Add' },
    { id: 'budget', icon: Wallet, label: 'Budget' },
    { id: 'packing', icon: Briefcase, label: 'Packing' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass px-4 py-3 flex justify-between items-center z-50 rounded-t-3xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id || (activeTab === 'trip-detail' && tab.id === 'trips');
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${
              isActive ? 'text-mountain-primary scale-110' : 'text-slate-400'
            }`}
          >
            <tab.icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
            {isActive && (
              <div className="absolute -top-1 w-8 h-1 bg-mountain-primary rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

const TripBadge = ({ status }: { status: Trip['status'] }) => {
  const styles = {
    ongoing: 'bg-emerald-100 text-emerald-700',
    upcoming: 'bg-blue-100 text-blue-700',
    completed: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

// --- Screens ---

const SignInScreen = ({ onSignIn, onNavigateToRegister }: { onSignIn: (email: string, password: string) => Promise<void>, onNavigateToRegister: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSignIn(email, password);
    } catch (err) {
      console.error('SignInScreen handleSubmit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      alert(error.message);
    } else {
      alert("Password reset email sent! Check your inbox.");
    }
  };

  const handleGoogleSignIn = () => {
    alert("Google Sign-In coming soon! Please use email/password for now.");
    // supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col justify-center py-12 px-6"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-mountain-primary rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-mountain-primary/20">
          <Globe size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-black font-headline tracking-tight text-slate-900">TripSuite</h1>
        <p className="text-slate-500 font-medium mt-2">Your ultimate travel companion.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@example.com"
            className="w-full bg-white p-4 rounded-2xl font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20 border-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white p-4 pr-12 rounded-2xl font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20 border-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={handleForgotPassword}
            className="text-[10px] font-black uppercase tracking-widest text-mountain-primary hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-mountain-primary text-white p-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-mountain-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:scale-100"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-surface-container-low px-4 text-slate-400">Or continue with</span></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-slate-900 p-5 rounded-3xl font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </form>

      <p className="text-center mt-8 text-sm font-medium text-slate-500">
        Don't have an account?{' '}
        <button onClick={onNavigateToRegister} className="text-mountain-primary font-black hover:underline">
          Register
        </button>
      </p>
    </motion.div>
  );
};

const RegisterScreen = ({ onRegister, onNavigateToSignIn }: { onRegister: (name: string, email: string, password: string) => Promise<void>, onNavigateToSignIn: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    setLoading(true);
    try {
      await onRegister(name, email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col justify-center py-12 px-6"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-mountain-primary rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-mountain-primary/20">
          <Globe size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-black font-headline tracking-tight text-slate-900">Create Account</h1>
        <p className="text-slate-500 font-medium mt-2">Start your journey with TripSuite.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full bg-white p-4 rounded-2xl font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20 border-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@example.com"
            className="w-full bg-white p-4 rounded-2xl font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20 border-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white p-4 pr-12 rounded-2xl font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20 border-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-white p-4 rounded-2xl font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20 border-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-mountain-primary text-white p-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-mountain-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:scale-100"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center mt-8 text-sm font-medium text-slate-500">
        Already have an account?{' '}
        <button onClick={onNavigateToSignIn} className="text-mountain-primary font-black hover:underline">
          Sign In
        </button>
      </p>
    </motion.div>
  );
};

const getDaysUntil = (dateRange: string) => {
  if (!dateRange || typeof dateRange !== 'string') return 0;
  try {
    const startDateStr = dateRange.split(' — ')[0];
    const startDate = new Date(startDateStr);
    const today = new Date();
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  } catch (e) {
    return 0;
  }
};

const TripsListScreen = ({ trips, onSelectTrip, userName }: { trips: Trip[], onSelectTrip: (trip: Trip) => void, userName: string }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || trip.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-24"
    >
      {/* Compact Welcome Header */}
      <header className="flex justify-between items-center bg-gradient-to-r from-mountain-primary/10 to-transparent -mx-6 px-6 py-4 rounded-b-[40px] mb-2">
        <div>
          <h1 className="text-2xl font-black font-headline tracking-tighter text-mountain-primary leading-tight">TripSuite</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-body">Welcome back, {userName}</p>
        </div>
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-3 py-2 rounded-2xl shadow-sm border border-white/50">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Sun size={18} />
          </div>
          <div className="text-left">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">Ooty, IN</div>
            <div className="text-xs font-black text-slate-900 leading-none">24°C • Sunny</div>
          </div>
        </div>
      </header>

      <div className="px-1">
        <h2 className="text-3xl font-black font-headline tracking-tight text-slate-900">My Trips</h2>
        <p className="text-slate-500 text-sm font-medium">Your world adventures, all in one place.</p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white p-4 pl-12 rounded-2xl font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'upcoming', 'ongoing', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-mountain-primary text-white shadow-md' 
                  : 'bg-white text-slate-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filteredTrips.length > 0 ? filteredTrips.map((trip) => (
          <motion.div 
            key={trip.id}
            onClick={() => onSelectTrip(trip)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-surface-container-lowest rounded-3xl overflow-hidden flex h-32 cursor-pointer shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-32 h-full relative">
              <img 
                src={trip.image} 
                alt={trip.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <TripBadge status={trip.status} />
                <h3 className="text-lg font-bold font-headline mt-1 line-clamp-1">{trip.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{trip.dateRange}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{trip.guests} Guests</span>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-12 text-slate-400 italic font-medium">No trips found matching your search.</div>
        )}
      </div>
    </motion.div>
  );
};

const CreateTripScreen = ({ onCreate }: { onCreate: (trip: Partial<Trip>) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    guests: 1,
    type: 'Mountain'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Trip name is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onCreate({
      name: formData.name,
      destination: formData.destination,
      dateRange: `${formData.startDate} — ${formData.endDate}`,
      guests: formData.guests,
      status: 'upcoming',
      image: formData.type === 'Beach' 
        ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
        : formData.type === 'City'
        ? 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'
        : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      itinerary: []
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8 pb-24"
    >
      <header>
        <h1 className="text-4xl font-black font-headline tracking-tight">New Trip</h1>
        <p className="text-slate-500 font-medium">Where to next?</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Trip Name</label>
            <input 
              value={formData.name}
              onChange={e => {
                setFormData({...formData, name: e.target.value});
                if (errors.name) setErrors({...errors, name: ''});
              }}
              placeholder="e.g. Summer Getaway"
              className={`w-full bg-surface-container-lowest p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ${errors.name ? 'ring-rose-500/50' : 'focus:ring-mountain-primary/20'}`}
            />
            {errors.name && <p className="text-rose-500 text-[10px] font-bold ml-4 uppercase tracking-widest">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Destination</label>
            <input 
              value={formData.destination}
              onChange={e => {
                setFormData({...formData, destination: e.target.value});
                if (errors.destination) setErrors({...errors, destination: ''});
              }}
              placeholder="e.g. Manali, India"
              className={`w-full bg-surface-container-lowest p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ${errors.destination ? 'ring-rose-500/50' : 'focus:ring-mountain-primary/20'}`}
            />
            {errors.destination && <p className="text-rose-500 text-[10px] font-bold ml-4 uppercase tracking-widest">{errors.destination}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Start Date</label>
              <input 
                type="date"
                value={formData.startDate}
                onChange={e => {
                  setFormData({...formData, startDate: e.target.value});
                  if (errors.startDate) setErrors({...errors, startDate: ''});
                }}
                className={`w-full bg-surface-container-lowest p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ${errors.startDate ? 'ring-rose-500/50' : 'focus:ring-mountain-primary/20'}`}
              />
              {errors.startDate && <p className="text-rose-500 text-[10px] font-bold ml-4 uppercase tracking-widest">{errors.startDate}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">End Date</label>
              <input 
                type="date"
                value={formData.endDate}
                onChange={e => {
                  setFormData({...formData, endDate: e.target.value});
                  if (errors.endDate) setErrors({...errors, endDate: ''});
                }}
                className={`w-full bg-surface-container-lowest p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 ${errors.endDate ? 'ring-rose-500/50' : 'focus:ring-mountain-primary/20'}`}
              />
              {errors.endDate && <p className="text-rose-500 text-[10px] font-bold ml-4 uppercase tracking-widest">{errors.endDate}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Guests</label>
              <input 
                type="number"
                min="1"
                value={formData.guests}
                onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})}
                className="w-full bg-surface-container-lowest p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Trip Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full bg-surface-container-lowest p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20 appearance-none"
              >
                <option>Mountain</option>
                <option>Beach</option>
                <option>City</option>
                <option>Adventure</option>
                <option>Cultural</option>
                <option>Road Trip</option>
                <option>Cruise</option>
              </select>
            </div>
          </div>
        </div>
        <button 
          type="submit"
          className="w-full bg-mountain-primary text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-mountain-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Create Trip
        </button>
      </form>
    </motion.div>
  );
};

const GEMINI_API_KEY = 'AIzaSyC3UVbfNOHrMqOVkLMbODFnnsFZ9aAMwGE';

const TripDetailScreen = ({ trip, onBack, expenses, onUpdateTrip }: { trip: Trip, onBack: () => void, expenses: Expense[], onUpdateTrip: (trip: Trip) => void }) => {
  const [activeDay, setActiveDay] = useState(1);
  const [activeTab, setActiveTab] = useState('Itinerary');
  const [showAiModal, setShowAiModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOptions, setAiOptions] = useState({
    style: 'Adventure',
    budget: 'Mid',
    interests: [] as string[]
  });
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const daysUntil = trip.status === 'upcoming' ? getDaysUntil(trip.dateRange) : 0;

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a detailed day-by-day itinerary for a trip to ${trip.destination}. 
              Trip Dates: ${trip.dateRange}. 
              Style: ${aiOptions.style}. 
              Budget: ${aiOptions.budget}. 
              Interests: ${aiOptions.interests.join(', ')}.
              Return a JSON array of days, each with a 'day' number, 'title', and an 'activities' array.
              Each activity should have 'time', 'title', 'location', 'description', and 'type' (one of: Transport, Sightseeing, Food, Activity, Shopping, Rest).
              IMPORTANT: Return ONLY the JSON array, no other text.`
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No content received from AI');
      }

      const generatedItinerary = JSON.parse(text);
      
      const formattedItinerary = generatedItinerary.map((day: any) => ({
        ...day,
        activities: (day.activities || []).map((act: any) => ({
          ...act,
          id: Math.random().toString(36).substr(2, 9)
        }))
      }));

      onUpdateTrip({ ...trip, itinerary: formattedItinerary });
      setShowAiModal(false);
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert(`Failed to generate itinerary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiSearch = async (day: number) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Suggest 3 activities or places for ${searchQuery} in ${trip.destination}.
              Return a JSON array of objects with 'title', 'location', 'description', and 'type' (one of: Transport, Sightseeing, Food, Activity, Shopping, Rest).
              IMPORTANT: Return ONLY the JSON array, no other text.`
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No content received from AI');
      }

      const suggestions = JSON.parse(text);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('AI Search Error:', error);
      alert(`Failed to get suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddActivity = (day: number, activity: any) => {
    const newItinerary = [...trip.itinerary];
    const dayIndex = newItinerary.findIndex(d => d.day === day);
    
    const newActivity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      time: activity.time || '10:00 AM'
    };

    if (dayIndex > -1) {
      newItinerary[dayIndex].activities.push(newActivity);
    } else {
      newItinerary.push({
        day,
        title: `Day ${day}`,
        activities: [newActivity]
      });
    }

    onUpdateTrip({ ...trip, itinerary: newItinerary.sort((a, b) => a.day - b.day) });
    setAiSuggestions([]);
    setSearchQuery('');
  };

  const handleDeleteActivity = (day: number, activityId: string) => {
    const newItinerary = trip.itinerary.map(d => {
      if (d.day === day) {
        return { ...d, activities: d.activities.filter(a => a.id !== activityId) };
      }
      return d;
    });
    onUpdateTrip({ ...trip, itinerary: newItinerary });
  };

  const handleAddDay = () => {
    const nextDay = trip.itinerary.length > 0 ? Math.max(...trip.itinerary.map(d => d.day)) + 1 : 1;
    const newItinerary = [...trip.itinerary, { day: nextDay, title: `Day ${nextDay}`, activities: [] }];
    onUpdateTrip({ ...trip, itinerary: newItinerary.sort((a, b) => a.day - b.day) });
    setActiveDay(nextDay);
  };

  const handleToggleLock = () => {
    onUpdateTrip({ ...trip, isLocked: !trip.isLocked });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Transport': return <Car size={16} />;
      case 'Sightseeing': return <MapPin size={16} />;
      case 'Food': return <Utensils size={16} />;
      case 'Activity': return <Camera size={16} />;
      case 'Shopping': return <ShoppingBag size={16} />;
      case 'Rest': return <Coffee size={16} />;
      default: return <MapPin size={16} />;
    }
  };

  const tripExpenses = expenses.filter(e => e.tripId === trip.id);
  const totalSpent = tripExpenses.reduce((sum, e) => sum + e.amount, 0);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Itinerary':
        return (
          <div className="mt-8 space-y-8 relative">
            {/* AI Generate Button */}
            {!trip.isLocked && (
              <button 
                onClick={() => setShowAiModal(true)}
                className="w-full bg-gradient-to-r from-mountain-primary to-emerald-600 text-white p-4 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-mountain-primary/20 hover:scale-[1.02] transition-transform"
              >
                <Sparkles size={20} />
                AI Generate Itinerary
              </button>
            )}

            {/* Finalize/Edit Toggle */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                Itinerary 
                {trip.isLocked && (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} /> Finalized
                  </span>
                )}
              </h2>
              <button 
                onClick={handleToggleLock}
                className={`p-2 rounded-xl transition-all ${trip.isLocked ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
              >
                {trip.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
              </button>
            </div>

            {/* AI Search Bar per Day */}
            {!trip.isLocked && (
              <div className="relative">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAiSearch(activeDay);
                    }
                  }}
                  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                  placeholder={`Search suggestions for Day ${activeDay}...`}
                  className="w-full bg-white p-4 pr-12 rounded-2xl font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20"
                />
                <button 
                  type="button"
                  onClick={() => {
                    handleAiSearch(activeDay);
                  }}
                  disabled={isSearching}
                  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 20 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-mountain-primary"
                >
                  {isSearching ? <div className="w-5 h-5 border-2 border-mountain-primary border-t-transparent rounded-full animate-spin" /> : <Search size={20} />}
                </button>
              </div>
            )}

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">AI Suggestions</div>
                {aiSuggestions.map((s, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-mountain-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-mountain-primary/5 text-mountain-primary flex items-center justify-center">
                        {getActivityIcon(s.type)}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{s.title}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{s.location}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddActivity(activeDay, s)}
                      className="bg-mountain-primary text-white p-2 rounded-xl"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Activities List */}
            <div className="relative space-y-10">
              {trip.itinerary.find(d => d.day === activeDay)?.activities.length ? (
                <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-slate-200" />
              ) : null}
              
              {trip.itinerary.find(d => d.day === activeDay)?.activities.map((activity) => (
                <div key={activity.id} className="relative pl-10 group">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-mountain-primary/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-mountain-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black text-mountain-primary uppercase tracking-widest">
                        <Clock size={12} /> {activity.time}
                      </div>
                      {!trip.isLocked && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleDeleteActivity(activeDay, activity.id)} className="text-rose-500 p-1"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold font-headline">{activity.title}</h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                      <MapPin size={12} /> {activity.location}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{activity.description}</p>
                    
                    <div className="flex gap-2 mt-2">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!trip.isLocked && (
                <button 
                  onClick={() => setShowAddActivityModal(true)}
                  className="w-full border-2 border-dashed border-slate-200 p-6 rounded-[32px] flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-mountain-primary/30 hover:text-mountain-primary transition-all"
                >
                  <Plus size={24} />
                  <span className="text-xs font-black uppercase tracking-widest">Add Activity</span>
                </button>
              )}

              {trip.itinerary.find(d => d.day === activeDay)?.activities.length === 0 && (
                <div className="text-center py-12 text-slate-400 italic font-medium">No activities planned for this day.</div>
              )}
            </div>
          </div>
        );
      case 'Flights':
        return (
          <div className="mt-8 space-y-4">
            {trip.flights && trip.flights.length > 0 ? trip.flights.map((flight, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Plane size={20} />
                    </div>
                    <div>
                      <div className="font-bold">{flight.airline}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{flight.flightNumber}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-mountain-primary">Terminal {flight.terminal}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <div>
                    <div className="text-2xl font-black font-headline">{flight.departureTime}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Departure</div>
                  </div>
                  <div className="flex-1 flex items-center justify-center px-4">
                    <div className="h-[1px] flex-1 bg-slate-100 relative">
                      <Plane size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black font-headline">{flight.arrivalTime}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Arrival</div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400 italic font-medium">No flight details added.</div>
            )}
          </div>
        );
      case 'Stays':
        return (
          <div className="mt-8 space-y-4">
            {trip.stays && trip.stays.length > 0 ? trip.stays.map((stay, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Hotel size={20} />
                  </div>
                  <div>
                    <div className="font-bold">{stay.hotelName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ref: {stay.bookingRef}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Check-in</div>
                    <div className="font-bold text-sm">{stay.checkIn}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Check-out</div>
                    <div className="font-bold text-sm">{stay.checkOut}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Room Type</div>
                    <div className="font-bold text-sm">{stay.roomType}</div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400 italic font-medium">No accommodation details added.</div>
            )}
          </div>
        );
      case 'Budget':
        return (
          <div className="mt-8 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Trip Spending</div>
              <div className="text-3xl font-black font-headline text-mountain-primary">₹{totalSpent.toLocaleString()}</div>
            </div>
            <div className="space-y-3">
              {tripExpenses.map(expense => (
                <div key={expense.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <div className="font-bold text-sm">{expense.description}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{expense.category}</div>
                  </div>
                  <div className="text-sm font-black text-on-surface">-₹{expense.amount}</div>
                </div>
              ))}
              {tripExpenses.length === 0 && (
                <div className="text-center py-12 text-slate-400 italic font-medium">No expenses logged for this trip.</div>
              )}
            </div>
          </div>
        );
      case 'Photos':
        return (
          <div className="mt-8 grid grid-cols-2 gap-4">
            {trip.photos && trip.photos.length > 0 ? trip.photos.map((photo, i) => (
              <div key={i} className="aspect-square rounded-3xl overflow-hidden shadow-sm">
                <img src={photo} alt={`Trip photo ${i+1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )) : (
              <div className="col-span-2 text-center py-12 text-slate-400 italic font-medium">No photos uploaded yet.</div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="pb-24 relative z-0"
    >
      {/* Hero Header */}
      <div className="relative h-80 -mx-6 -mt-12 overflow-hidden">
        <img 
          src={trip.image} 
          alt={trip.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-surface-container-low" />
        <button 
          onClick={onBack}
          className="absolute top-16 left-6 w-10 h-10 rounded-full glass flex items-center justify-center text-white z-20"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TripBadge status={trip.status} />
            {daysUntil > 0 && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                {daysUntil} days left
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black font-headline mt-2 text-on-surface">{trip.name}</h1>
          <p className="text-slate-500 font-medium">{trip.dateRange} • {trip.guests} Guests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mt-8 overflow-x-auto pb-2 scrollbar-hide">
        {['Itinerary', 'Flights', 'Stays', 'Budget', 'Photos'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-bold uppercase tracking-widest pb-2 whitespace-nowrap transition-all relative ${
              tab === activeTab ? 'text-mountain-primary' : 'text-slate-400'
            }`}
          >
            {tab}
            {tab === activeTab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mountain-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Day Selector (only for Itinerary) */}
      {activeTab === 'Itinerary' && (
        <div className="flex gap-3 mt-8 overflow-x-auto pb-2 scrollbar-hide items-center">
          {trip.itinerary.map(day => (
            <button
              key={day.day}
              onClick={() => setActiveDay(day.day)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                activeDay === day.day 
                  ? 'bg-mountain-primary text-white shadow-lg shadow-mountain-primary/20' 
                  : 'bg-surface-container-lowest text-slate-500'
              }`}
            >
              Day {day.day}
            </button>
          ))}
          {!trip.isLocked && (
            <button 
              onClick={handleAddDay}
              className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-mountain-primary/10 hover:text-mountain-primary transition-all shrink-0"
            >
              <Plus size={20} />
            </button>
          )}
          {trip.itinerary.length === 0 && (
            <div className="text-slate-400 font-medium text-sm italic">No itinerary planned yet.</div>
          )}
        </div>
      )}

      {renderTabContent()}

      {/* AI Generate Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isGenerating) setShowAiModal(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md z-0"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-8 space-y-8 shadow-2xl overflow-hidden z-10 pointer-events-auto"
            >
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 border-4 border-mountain-primary border-t-transparent rounded-full animate-spin" />
                  <h3 className="text-xl font-black font-headline">Crafting your adventure...</h3>
                  <p className="text-slate-500 text-sm">Gemini is exploring the best spots in {trip.destination} for you.</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-mountain-primary/10 text-mountain-primary flex items-center justify-center">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-headline">AI Planner</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Powered by Gemini</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowAiModal(false);
                  }} 
                  className="text-slate-300 p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Travel Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Adventure', 'Relaxed', 'Cultural', 'Family', 'Foodie'].map(style => (
                      <button 
                        key={style}
                        onClick={() => setAiOptions({...aiOptions, style})}
                        className={`p-3 rounded-2xl text-xs font-bold transition-all ${aiOptions.style === style ? 'bg-mountain-primary text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Budget</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Budget', 'Mid', 'Luxury'].map(b => (
                      <button 
                        key={b}
                        onClick={() => setAiOptions({...aiOptions, budget: b})}
                        className={`p-3 rounded-2xl text-xs font-bold transition-all ${aiOptions.budget === b ? 'bg-mountain-primary text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {['Hiking', 'Museums', 'Nightlife', 'Shopping', 'Beach', 'History', 'Nature'].map(interest => (
                      <button 
                        key={interest}
                        onClick={() => {
                          const newInterests = aiOptions.interests.includes(interest)
                            ? aiOptions.interests.filter(i => i !== interest)
                            : [...aiOptions.interests, interest];
                          setAiOptions({...aiOptions, interests: newInterests});
                        }}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${aiOptions.interests.includes(interest) ? 'bg-mountain-primary/10 text-mountain-primary border-mountain-primary/20 border' : 'bg-slate-50 text-slate-400 border-transparent border'}`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => { window.alert('GENERATE CLICKED'); handleAiGenerate(); }}
                  disabled={isGenerating}
                  style={{ position: 'relative', zIndex: 9999, pointerEvents: 'auto' }}
                  className="w-full bg-mountain-primary text-white p-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-mountain-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    "Generate Itinerary"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Add Activity Modal */}
      <AnimatePresence>
        {showAddActivityModal && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddActivityModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black font-headline">Add Activity</h3>
                <button onClick={() => setShowAddActivityModal(false)} className="text-slate-400"><X size={24} /></button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleAddActivity(activeDay, {
                    title: formData.get('title'),
                    time: formData.get('time'),
                    location: formData.get('location'),
                    description: formData.get('description'),
                    type: formData.get('type')
                  });
                  setShowAddActivityModal(false);
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Title</label>
                  <input name="title" required className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm focus:outline-none" placeholder="Activity name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Time</label>
                    <input name="time" type="time" required className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category</label>
                    <select name="type" className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm focus:outline-none appearance-none">
                      <option>Transport</option>
                      <option>Sightseeing</option>
                      <option>Food</option>
                      <option>Activity</option>
                      <option>Shopping</option>
                      <option>Rest</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Location</label>
                  <input name="location" required className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm focus:outline-none" placeholder="Where to?" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Description</label>
                  <textarea name="description" className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm focus:outline-none h-24 resize-none" placeholder="Details..." />
                </div>
                <button type="submit" className="w-full bg-mountain-primary text-white p-5 rounded-3xl font-black uppercase tracking-widest shadow-lg shadow-mountain-primary/20">
                  Save Activity
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PackingListScreen = ({ items, onToggle, onAddItem, trips }: { items: PackingItem[], onToggle: (id: string) => void, onAddItem: (cat: string, name: string, tripId: string) => void, trips: Trip[] }) => {
  const [newItemName, setNewItemName] = useState<{ [key: string]: string }>({});
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || '');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(i => i.category)));
    return cats;
  }, [items]);

  const handleAdd = (cat: string) => {
    if (!newItemName[cat] || !selectedTripId) return;
    onAddItem(cat, newItemName[cat], selectedTripId);
    setNewItemName({ ...newItemName, [cat]: '' });
    setIsAdding(null);
  };

  const filteredItems = items.filter(i => i.tripId === selectedTripId);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-24"
    >
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tight">Packing List</h1>
          <p className="text-slate-500 font-medium">Don't leave anything behind.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black font-headline text-mountain-primary">
            {filteredItems.filter(i => i.packed).length}/{filteredItems.length}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Packed</div>
        </div>
      </header>

      {/* Trip Selector */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Select Trip</label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {trips.map(trip => (
            <button
              key={trip.id}
              onClick={() => setSelectedTripId(trip.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedTripId === trip.id
                  ? 'bg-mountain-primary text-white shadow-md shadow-mountain-primary/20'
                  : 'bg-surface-container-lowest text-slate-500'
              }`}
            >
              {trip.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {categories.map(cat => (
          <section key={cat} className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 pb-2">{cat}</h2>
            <div className="space-y-3">
              {filteredItems.filter(i => i.category === cat).map(item => (
                <button
                  key={item.id}
                  onClick={() => onToggle(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    item.packed ? 'bg-mountain-primary/5 text-slate-400' : 'bg-surface-container-lowest text-on-surface shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.packed ? (
                      <CheckCircle2 size={20} className="text-mountain-primary" />
                    ) : (
                      <Circle size={20} className="text-slate-300" />
                    )}
                    <span className={`font-bold text-sm ${item.packed ? 'line-through' : ''}`}>{item.name}</span>
                  </div>
                </button>
              ))}

              {isAdding === cat ? (
                <div className="flex gap-2">
                  <input 
                    autoFocus
                    value={newItemName[cat] || ''}
                    onChange={e => setNewItemName({ ...newItemName, [cat]: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleAdd(cat)}
                    placeholder="Item name..."
                    className="flex-1 bg-surface-container-lowest p-4 rounded-2xl font-bold text-sm focus:outline-none"
                  />
                  <button 
                    onClick={() => handleAdd(cat)}
                    className="bg-mountain-primary text-white p-4 rounded-2xl"
                  >
                    <Plus size={20} />
                  </button>
                  <button 
                    onClick={() => setIsAdding(null)}
                    className="bg-slate-100 text-slate-500 p-4 rounded-2xl"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAdding(cat)}
                  className="w-full border-2 border-dashed border-slate-200 p-4 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-mountain-primary/30 hover:text-mountain-primary transition-all"
                >
                  <Plus size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Add Item</span>
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
    </motion.div>
  );
};

const BudgetScreen = ({ trips, expenses, onAddExpense }: { trips: Trip[], expenses: Expense[], onAddExpense: (expense: Partial<Expense>) => void }) => {
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food' as Expense['category'],
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const tripExpenses = expenses.filter(e => e.tripId === selectedTripId);
  const totalSpent = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = 500000; // Mock budget in Rupees
  const remaining = totalBudget - totalSpent;
  const progress = Math.min((totalSpent / totalBudget) * 100, 100);

  const categoryIcons = {
    Food: Utensils,
    Transport: Car,
    Stay: Bed,
    Activities: Camera,
    Shopping: Briefcase
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      tripId: selectedTripId,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date
    });
    setFormData({ amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] });
    setShowAddForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-24"
    >
      <header className="bg-gradient-to-br from-mountain-primary to-emerald-900 -mx-6 px-6 py-10 rounded-b-[40px] text-white shadow-xl">
        <h1 className="text-4xl font-black font-headline tracking-tight">Budget</h1>
        <p className="text-white/70 font-medium">Track your spending on the go.</p>
      </header>

      {/* Trip Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {trips.map(trip => (
          <button
            key={trip.id}
            onClick={() => setSelectedTripId(trip.id)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedTripId === trip.id 
                ? 'bg-mountain-primary text-white shadow-md' 
                : 'bg-white text-slate-400'
            }`}
          >
            {trip.name}
          </button>
        ))}
      </div>

      {/* Overview Card */}
      <section className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Spent</div>
            <div className="text-3xl font-black font-headline text-mountain-primary">₹{totalSpent.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Remaining</div>
            <div className="text-lg font-bold text-slate-700">₹{remaining.toLocaleString()}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full rounded-full ${progress > 90 ? 'bg-rose-500' : 'bg-mountain-primary'}`}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>0%</span>
            <span>Budget: ₹{totalBudget.toLocaleString()}</span>
            <span>100%</span>
          </div>
        </div>
      </section>

      {/* Expenses List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-headline">Expenses</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-10 h-10 rounded-full bg-mountain-primary text-white flex items-center justify-center shadow-lg shadow-mountain-primary/20 hover:scale-110 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {tripExpenses.length > 0 ? tripExpenses.map(expense => {
            const Icon = categoryIcons[expense.category];
            return (
              <div key={expense.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{expense.description}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{expense.category} • {expense.date}</div>
                  </div>
                </div>
                <div className="text-sm font-black text-on-surface">-₹{expense.amount}</div>
              </div>
            );
          }) : (
            <div className="text-center py-12 text-slate-400 italic font-medium">No expenses recorded for this trip.</div>
          )}
        </div>
      </section>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black font-headline">Add Expense</h3>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Amount</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                    className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm focus:outline-none appearance-none"
                  >
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Stay</option>
                    <option>Activities</option>
                    <option>Shopping</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Description</label>
                  <input 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="e.g. Dinner at Savoy"
                    className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-mountain-primary text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-mountain-primary/20 mt-4"
                >
                  Save Expense
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ExploreScreen = () => {
  const destinations = [
    { name: 'Swiss Alps', country: 'Switzerland', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80', tag: 'Mountain' },
    { name: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80', tag: 'Beach' },
    { name: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', tag: 'Cultural' },
    { name: 'Amalfi Coast', country: 'Italy', image: 'https://images.unsplash.com/photo-1633321088355-d0f81134ca3b?auto=format&fit=crop&w=800&q=80', tag: 'Coastal' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-24"
    >
      <header>
        <h1 className="text-4xl font-black font-headline tracking-tight">Explore</h1>
        <p className="text-slate-500 font-medium">Discover your next adventure.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {destinations.map((dest, i) => (
          <div key={i} className="relative h-64 rounded-[40px] overflow-hidden group shadow-lg">
            <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-6 right-6">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {dest.tag}
              </span>
            </div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl font-black font-headline text-white">{dest.name}</h3>
              <p className="text-white/70 text-sm font-medium">{dest.country}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const ProfileScreen = ({ trips, userName, onLogout }: { trips: Trip[], userName: string, onLogout: () => void }) => {
  const totalPhotos = trips.reduce((sum, trip) => sum + (trip.photos?.length || 0), 0);
  const countries = new Set(trips.map(t => t.destination?.split(',').pop()?.trim()).filter(Boolean)).size;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-24"
    >
      <header className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-surface-container-highest p-1">
            <img 
              src="https://picsum.photos/seed/traveler/200/200" 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-mountain-primary text-white p-2 rounded-full">
            <Award size={16} />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tighter">{userName}</h1>
          <p className="text-slate-500 font-medium">Gold Explorer • Since 2022</p>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: 'Trips', value: trips.length.toString(), icon: Globe },
          { label: 'Countries', value: countries.toString(), icon: MapIcon },
          { label: 'Photos', value: totalPhotos >= 1000 ? `${(totalPhotos/1000).toFixed(1)}k` : totalPhotos.toString(), icon: Camera },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-container-lowest p-4 rounded-3xl text-center flex flex-col items-center gap-2 shadow-sm">
            <stat.icon size={16} className="text-mountain-primary" />
            <div className="text-xl font-black font-headline">{stat.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Preferences */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-headline">Preferences</h2>
        <div className="space-y-3">
          {[
            { label: 'Travel Style', value: 'Adventure & Luxury', icon: Briefcase },
            { label: 'Notifications', value: 'Enabled', icon: Sun },
            { label: 'Account Settings', value: '', icon: Settings },
          ].map(pref => (
            <button key={pref.label} className="w-full bg-surface-container-lowest p-5 rounded-3xl flex items-center justify-between hover:bg-white/60 transition-colors shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <pref.icon size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">{pref.label}</div>
                  {pref.value && <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{pref.value}</div>}
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
        </div>
      </section>

      {/* Bottom Actions */}
      <section className="space-y-3 pt-4">
        <button 
          onClick={onLogout}
          className="w-full bg-rose-50 p-5 rounded-3xl flex items-center gap-4 shadow-sm hover:bg-rose-100 transition-colors text-rose-600"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <LogOut size={20} />
          </div>
          <span className="font-bold text-sm">Log Out</span>
        </button>
      </section>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentScreen, setCurrentScreen] = useState<Screen>('signin');
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('trips');
    return saved ? JSON.parse(saved) : MOCK_TRIPS;
  });
  const [packingItems, setPackingItems] = useState<PackingItem[]>(() => {
    const saved = localStorage.getItem('packingItems');
    return saved ? JSON.parse(saved) : MOCK_PACKING_LIST;
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  React.useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setIsLoggedIn(true);
        setUserName(session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Traveler');
        setCurrentScreen('trips');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsLoggedIn(true);
        setUserName(session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Traveler');
        setCurrentScreen('trips');
      } else {
        setIsLoggedIn(false);
        setUserName('');
        setCurrentScreen('signin');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    localStorage.setItem('trips', JSON.stringify(trips));
  }, [trips]);

  React.useEffect(() => {
    localStorage.setItem('packingItems', JSON.stringify(packingItems));
  }, [packingItems]);

  React.useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleSignIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Sign in error:', error.message);
      alert(error.message);
      throw error;
    }
    if (data.session) {
      setIsLoggedIn(true);
      setUserName(data.session.user.user_metadata.full_name || data.session.user.email?.split('@')[0] || 'Traveler');
      setCurrentScreen('trips');
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });
    if (error) {
      alert(error.message);
      throw error;
    } else {
      alert("Registration successful! Please check your email for verification if required.");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
  };

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setCurrentScreen('trip-detail');
  };

  const handleCreateTrip = (newTrip: Partial<Trip>) => {
    const trip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTrip.name || 'New Trip',
      destination: newTrip.destination || '',
      dateRange: newTrip.dateRange || '',
      guests: newTrip.guests || 1,
      status: 'upcoming',
      image: newTrip.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      itinerary: [],
      flights: [],
      stays: [],
      photos: []
    };
    setTrips([trip, ...trips]);
    setCurrentScreen('trips');
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
    setSelectedTrip(updatedTrip);
  };

  const handleTogglePacking = (id: string) => {
    setPackingItems(prev => prev.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
  };

  const handleAddPackingItem = (category: string, name: string, tripId: string) => {
    const newItem: PackingItem = {
      id: Math.random().toString(36).substr(2, 9),
      category,
      name,
      packed: false,
      tripId
    };
    setPackingItems([...packingItems, newItem]);
  };

  const handleAddExpense = (newExpense: Partial<Expense>) => {
    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      tripId: newExpense.tripId || '',
      amount: newExpense.amount || 0,
      category: newExpense.category || 'Food',
      description: newExpense.description || '',
      date: newExpense.date || new Date().toISOString().split('T')[0]
    };
    setExpenses([expense, ...expenses]);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'trips':
        return <TripsListScreen trips={trips} onSelectTrip={handleSelectTrip} userName={userName} />;
      case 'add':
        return <CreateTripScreen onCreate={handleCreateTrip} />;
      case 'budget':
        return <BudgetScreen trips={trips} expenses={expenses} onAddExpense={handleAddExpense} />;
      case 'packing':
        return <PackingListScreen items={packingItems} onToggle={handleTogglePacking} onAddItem={handleAddPackingItem} trips={trips} />;
      case 'profile':
        return <ProfileScreen trips={trips} userName={userName} onLogout={handleLogout} />;
      case 'explore':
        return <ExploreScreen />;
      case 'signin':
        return <SignInScreen onSignIn={handleSignIn} onNavigateToRegister={() => setCurrentScreen('register')} />;
      case 'register':
        return <RegisterScreen onRegister={handleRegister} onNavigateToSignIn={() => setCurrentScreen('signin')} />;
      case 'trip-detail':
        return selectedTrip ? (
          <TripDetailScreen 
            trip={selectedTrip} 
            onBack={() => setCurrentScreen('trips')} 
            expenses={expenses} 
            onUpdateTrip={handleUpdateTrip}
          />
        ) : <TripsListScreen trips={trips} onSelectTrip={handleSelectTrip} userName={userName} />;
      default:
        return <TripsListScreen trips={trips} onSelectTrip={handleSelectTrip} userName={userName} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low mountain-pattern">
      <main className="max-w-md mx-auto px-6 pt-12 min-h-screen relative">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>
      
      {currentScreen !== 'trip-detail' && currentScreen !== 'signin' && currentScreen !== 'register' && (
        <BottomNav 
          activeTab={currentScreen} 
          onTabChange={(tab) => {
            setCurrentScreen(tab);
          }} 
        />
      )}
    </div>
  );
}
