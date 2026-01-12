import React, { useState } from 'react';
import {
    School, Hospital, Plane, Bus, ShoppingBag, MapPin, Loader2, Train,
    Trees, UtensilsCrossed, Church, Banknote, Fuel, Shield, Hotel, Dumbbell,
    ChevronDown, ChevronUp
} from 'lucide-react';

const NearbyPlaces = ({ nearbyPlaces, isLoading, onPlaceClick }) => {
    const [expandedCategories, setExpandedCategories] = useState({});
    const DEFAULT_SHOW_COUNT = 3;

    const categoryConfig = {
        education: { icon: School, label: 'Education', color: 'bg-blue-50 text-blue-600', iconColor: 'text-blue-500' },
        healthcare: { icon: Hospital, label: 'Healthcare', color: 'bg-red-50 text-red-600', iconColor: 'text-red-500' },
        airports: { icon: Plane, label: 'Airports', color: 'bg-purple-50 text-purple-600', iconColor: 'text-purple-500' },
        busStations: { icon: Bus, label: 'Bus Stations', color: 'bg-green-50 text-green-600', iconColor: 'text-green-500' },
        railStations: { icon: Train, label: 'Rail Stations', color: 'bg-emerald-50 text-emerald-600', iconColor: 'text-emerald-500' },
        shopping: { icon: ShoppingBag, label: 'Shopping', color: 'bg-orange-50 text-orange-600', iconColor: 'text-orange-500' },
        parks: { icon: Trees, label: 'Parks', color: 'bg-lime-50 text-lime-600', iconColor: 'text-lime-500' },
        restaurants: { icon: UtensilsCrossed, label: 'Restaurants & Cafes', color: 'bg-rose-50 text-rose-600', iconColor: 'text-rose-500' },
        religious: { icon: Church, label: 'Religious Places', color: 'bg-amber-50 text-amber-600', iconColor: 'text-amber-500' },
        banks: { icon: Banknote, label: 'Banks & ATMs', color: 'bg-teal-50 text-teal-600', iconColor: 'text-teal-500' },
        fuelStations: { icon: Fuel, label: 'Fuel Stations', color: 'bg-yellow-50 text-yellow-600', iconColor: 'text-yellow-500' },
        police: { icon: Shield, label: 'Police Stations', color: 'bg-indigo-50 text-indigo-600', iconColor: 'text-indigo-500' },
        hotels: { icon: Hotel, label: 'Hotels', color: 'bg-pink-50 text-pink-600', iconColor: 'text-pink-500' },
        gyms: { icon: Dumbbell, label: 'Gyms', color: 'bg-violet-50 text-violet-600', iconColor: 'text-violet-500' }
    };

    const toggleCategory = (categoryKey) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryKey]: !prev[categoryKey]
        }));
    };

    if (isLoading) {
        return (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-orange-500" size={32} />
                </div>
            </div>
        );
    }

    if (!nearbyPlaces) {
        return null;
    }

    const hasPlaces = Object.values(nearbyPlaces).some(category => category.length > 0);

    if (!hasPlaces) {
        return (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-4">Nearby Places</h3>
                <p className="text-gray-500 text-sm">No nearby places found in this area.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6">Nearby Places</h3>
            <div className="space-y-6">
                {Object.entries(categoryConfig).map(([key, config]) => {
                    const places = nearbyPlaces[key] || [];
                    if (places.length === 0) return null;

                    const Icon = config.icon;
                    const isExpanded = expandedCategories[key];
                    const displayPlaces = isExpanded ? places : places.slice(0, DEFAULT_SHOW_COUNT);
                    const hasMore = places.length > DEFAULT_SHOW_COUNT;

                    return (
                        <div key={key}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-xl ${config.color}`}>
                                        <Icon size={18} className={config.iconColor} />
                                    </div>
                                    <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{config.label}</h4>
                                    <span className="text-xs font-semibold text-gray-400">({places.length})</span>
                                </div>
                                {hasMore && (
                                    <button
                                        onClick={() => toggleCategory(key)}
                                        className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                                    >
                                        {isExpanded ? (
                                            <>
                                                <ChevronUp size={14} /> Show Less
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown size={14} /> Show All
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {displayPlaces.map((place, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => onPlaceClick && onPlaceClick(place)}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <MapPin size={14} className="text-gray-400 shrink-0" />
                                            <span className="text-xs font-semibold text-gray-700 truncate">{place.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 ml-2 shrink-0">
                                            {place.distance} km
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NearbyPlaces;

