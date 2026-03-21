/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  X
} from 'lucide-react';
import { MOCK_TRIPS, MOCK_PACKING_LIST } from './constants';
import { Trip, Screen, PackingItem } from './types';

// --- Components ---

const BottomNav = ({ activeTab, onTabChange }: { activeTab: Screen, onTabChange: (tab: Screen) => void }) => {
  const tabs: { id: Screen; icon: any; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'trips', icon: MapIcon, label: 'Trips' },
    { id: 'add', icon: Plus, label: 'Add' },
    { id: 'packing', icon: Briefcase, label: 'Packing' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass px-6 py-3 flex justify-between items-center z-50 rounded-t-3xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id || (activeTab === 'trip-detail' && tab.id === 'trips');
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              isActive ? 'text-mountain-primary scale-110' : 'text-slate-400'
            }`}
          >
            <tab.icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="w-1 h-1 bg-mountain-primary rounded-full mt-0.5"
              />
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

const HomeScreen = ({ trips, onSelectTrip }: { trips: Trip[], onSelectTrip: (trip: Trip) => void }) => {
  const ongoingTrip = trips.find(t => t.status === 'ongoing');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-24"
    >
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tighter text-mountain-primary">TripSuite</h1>
          <p className="text-slate-500 font-medium font-body">Welcome back, Meganathan</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden">
          <img src="https://picsum.photos/seed/traveler/100/100" alt="Profile" referrerPolicy="no-referrer" />
        </div>
      </header>

      {/* Weather Widget */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 flex items-center justify-between relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
          <Sun size={120} className="text-mountain-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-mountain-primary font-bold uppercase tracking-widest text-xs mb-1">
            <Cloud size={14} />
            Ooty, India
          </div>
          <div className="text-4xl font-black font-headline">24°C</div>
          <p className="text-slate-500 text-sm font-medium">Partly cloudy • High 26°</p>
        </div>
        <div className="text-right relative z-10">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Forecast</div>
          <div className="flex gap-3">
            {['Mon', 'Tue', 'Wed'].map(day => (
              <div key={day} className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500">{day}</span>
                <Sun size={16} className="text-amber-500 my-1" />
                <span className="text-xs font-bold">25°</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ongoing Trip */}
      {ongoingTrip && (
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold font-headline">Ongoing Trip</h2>
            <button className="text-xs font-bold text-mountain-primary uppercase tracking-widest">View All</button>
          </div>
          <div 
            onClick={() => onSelectTrip(ongoingTrip)}
            className="relative h-64 rounded-3xl overflow-hidden shadow-xl cursor-pointer group"
          >
            <img 
              src={ongoingTrip.image} 
              alt={ongoingTrip.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <TripBadge status="ongoing" />
              <h3 className="text-2xl font-black font-headline mt-2">{ongoingTrip.name}</h3>
              <div className="flex items-center gap-4 mt-1 text-white/80 text-sm font-medium">
                <span className="flex items-center gap-1"><Calendar size={14} /> {ongoingTrip.dateRange}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {ongoingTrip.guests} Guests</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4">
        <button className="glass p-5 rounded-3xl flex flex-col items-start gap-3 hover:bg-white/60 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-mountain-primary/10 text-mountain-primary flex items-center justify-center">
            <Plus size={20} />
          </div>
          <div className="text-left">
            <div className="font-bold text-sm">New Trip</div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Start Planning</div>
          </div>
        </button>
        <button className="glass p-5 rounded-3xl flex flex-col items-start gap-3 hover:bg-white/60 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Search size={20} />
          </div>
          <div className="text-left">
            <div className="font-bold text-sm">Explore</div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Find Destinations</div>
          </div>
        </button>
      </section>
    </motion.div>
  );
};

const TripsListScreen = ({ trips, onSelectTrip }: { trips: Trip[], onSelectTrip: (trip: Trip) => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-24"
    >
      <header>
        <h1 className="text-4xl font-black font-headline tracking-tight">My Trips</h1>
        <p className="text-slate-500 font-medium">Your world adventures, all in one place.</p>
      </header>

      <div className="space-y-6">
        {trips.map((trip) => (
          <div 
            key={trip.id}
            onClick={() => onSelectTrip(trip)}
            className="bg-surface-container-lowest rounded-3xl overflow-hidden flex h-32 cursor-pointer hover:shadow-md transition-shadow"
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
          </div>
        ))}
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name: formData.name,
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
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Summer Getaway"
              className="w-full bg-surface-container-lowest p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Destination</label>
            <input 
              required
              value={formData.destination}
              onChange={e => setFormData({...formData, destination: e.target.value})}
              placeholder="e.g. Manali, India"
              className="w-full bg-surface-container-lowest p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Start Date</label>
              <input 
                required
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full bg-surface-container-lowest p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">End Date</label>
              <input 
                required
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                className="w-full bg-surface-container-lowest p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-mountain-primary/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Guests</label>
              <input 
                required
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

const TripDetailScreen = ({ trip, onBack }: { trip: Trip, onBack: () => void }) => {
  const [activeDay, setActiveDay] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="pb-24"
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
          className="absolute top-16 left-6 w-10 h-10 rounded-full glass flex items-center justify-center text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <TripBadge status={trip.status} />
          <h1 className="text-4xl font-black font-headline mt-2 text-on-surface">{trip.name}</h1>
          <p className="text-slate-500 font-medium">{trip.dateRange} • {trip.guests} Guests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mt-8 overflow-x-auto pb-2 scrollbar-hide">
        {['Itinerary', 'Flights', 'Stays', 'Budget', 'Photos'].map(tab => (
          <button 
            key={tab}
            className={`text-sm font-bold uppercase tracking-widest pb-2 whitespace-nowrap transition-all ${
              tab === 'Itinerary' ? 'text-mountain-primary border-b-2 border-mountain-primary' : 'text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Day Selector */}
      <div className="flex gap-3 mt-8 overflow-x-auto pb-2 scrollbar-hide">
        {trip.itinerary.length > 0 ? trip.itinerary.map(day => (
          <button
            key={day.day}
            onClick={() => setActiveDay(day.day)}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeDay === day.day 
                ? 'bg-mountain-primary text-white shadow-lg shadow-mountain-primary/20' 
                : 'bg-surface-container-lowest text-slate-500'
            }`}
          >
            Day {day.day}
          </button>
        )) : (
          <div className="text-slate-400 font-medium text-sm italic">No itinerary planned yet.</div>
        )}
      </div>

      {/* Itinerary Content */}
      <div className="mt-8 space-y-10 relative">
        {trip.itinerary.length > 0 && <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-slate-200" />}
        
        {trip.itinerary.find(d => d.day === activeDay)?.activities.map((activity) => (
          <div key={activity.id} className="relative pl-10">
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-mountain-primary/10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-mountain-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-mountain-primary uppercase tracking-widest">
                <Clock size={12} /> {activity.time}
              </div>
              <h3 className="text-xl font-bold font-headline">{activity.title}</h3>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                <MapPin size={12} /> {activity.location}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{activity.description}</p>
              
              {activity.image && (
                <div className="mt-4 rounded-3xl overflow-hidden h-48">
                  <img src={activity.image} alt={activity.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="flex gap-2 mt-2">
                {activity.type === 'travel' && <div className="p-2 rounded-xl bg-slate-100 text-slate-500"><Car size={16} /></div>}
                {activity.type === 'activity' && <div className="p-2 rounded-xl bg-slate-100 text-slate-500"><Camera size={16} /></div>}
              </div>
            </div>
          </div>
        ))}

        {/* Footer Info */}
        {trip.itinerary.find(d => d.day === activeDay)?.dinner && (
          <div className="bg-surface-container-lowest p-4 rounded-3xl flex items-center justify-between mt-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Utensils size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dinner</div>
                <div className="text-sm font-bold">{trip.itinerary.find(d => d.day === activeDay)?.dinner}</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const PackingListScreen = ({ items, onToggle, onAddItem }: { items: PackingItem[], onToggle: (id: string) => void, onAddItem: (cat: string, name: string) => void }) => {
  const [newItemName, setNewItemName] = useState<{ [key: string]: string }>({});
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(i => i.category)));
    return cats;
  }, [items]);

  const handleAdd = (cat: string) => {
    if (!newItemName[cat]) return;
    onAddItem(cat, newItemName[cat]);
    setNewItemName({ ...newItemName, [cat]: '' });
    setIsAdding(null);
  };

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
            {items.filter(i => i.packed).length}/{items.length}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Packed</div>
        </div>
      </header>

      <div className="space-y-8">
        {categories.map(cat => (
          <section key={cat} className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 pb-2">{cat}</h2>
            <div className="space-y-3">
              {items.filter(i => i.category === cat).map(item => (
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

const ProfileScreen = () => {
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
          <h1 className="text-3xl font-black font-headline tracking-tighter">Meganathan</h1>
          <p className="text-slate-500 font-medium">Gold Explorer • Since 2022</p>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: 'Trips', value: '12', icon: Globe },
          { label: 'Countries', value: '8', icon: MapIcon },
          { label: 'Photos', value: '1.2k', icon: Camera },
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
        <button className="w-full bg-surface-container-lowest p-5 rounded-3xl flex items-center gap-4 shadow-sm hover:bg-white/60 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <Settings size={20} />
          </div>
          <span className="font-bold text-sm">Settings</span>
        </button>
        <button className="w-full bg-rose-50 p-5 rounded-3xl flex items-center gap-4 shadow-sm hover:bg-rose-100 transition-colors text-rose-600">
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
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [packingItems, setPackingItems] = useState<PackingItem[]>(MOCK_PACKING_LIST);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setCurrentScreen('trip-detail');
  };

  const handleCreateTrip = (newTrip: Partial<Trip>) => {
    const trip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTrip.name || 'New Trip',
      dateRange: newTrip.dateRange || '',
      guests: newTrip.guests || 1,
      status: 'upcoming',
      image: newTrip.image || '',
      itinerary: []
    };
    setTrips([trip, ...trips]);
    setCurrentScreen('trips');
  };

  const handleTogglePacking = (id: string) => {
    setPackingItems(prev => prev.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
  };

  const handleAddPackingItem = (category: string, name: string) => {
    const newItem: PackingItem = {
      id: Math.random().toString(36).substr(2, 9),
      category,
      name,
      packed: false
    };
    setPackingItems([...packingItems, newItem]);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen trips={trips} onSelectTrip={handleSelectTrip} />;
      case 'trips':
        return <TripsListScreen trips={trips} onSelectTrip={handleSelectTrip} />;
      case 'add':
        return <CreateTripScreen onCreate={handleCreateTrip} />;
      case 'packing':
        return <PackingListScreen items={packingItems} onToggle={handleTogglePacking} onAddItem={handleAddPackingItem} />;
      case 'profile':
        return <ProfileScreen />;
      case 'trip-detail':
        return selectedTrip ? (
          <TripDetailScreen trip={selectedTrip} onBack={() => setCurrentScreen('trips')} />
        ) : <HomeScreen trips={trips} onSelectTrip={handleSelectTrip} />;
      default:
        return <HomeScreen trips={trips} onSelectTrip={handleSelectTrip} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low mountain-pattern">
      <main className="max-w-md mx-auto px-6 pt-12 min-h-screen relative">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>
      
      {currentScreen !== 'trip-detail' && (
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
