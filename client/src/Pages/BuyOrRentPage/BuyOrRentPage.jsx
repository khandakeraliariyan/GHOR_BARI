import React, { useState } from 'react';
import { useNavigate } from 'react-router'; // Assuming you use react-router
import PropertyCard from './PropertyCard';
import { Search, SlidersHorizontal, LayoutGrid, Map as MapIcon, ChevronDown, Check } from 'lucide-react';

const dummyData = [
    { id: 1, title: "Minimalist Luxury Suite", location: "Gulshan 2, Dhaka", price: "85,000", rating: 4.9, beds: 3, baths: 3, area: 2200, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
    { id: 2, title: "Executive Villa with Pool", location: "Banani DOHS, Dhaka", price: "150,000", rating: 5.0, beds: 5, baths: 4, area: 4500, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
    { id: 3, title: "Designer Penthouse", location: "Baridhara, Dhaka", price: "120,000", rating: 4.8, beds: 4, baths: 3, area: 3100, image: "https://images.unsplash.com/photo-1600607687940-4e23036c556a?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
    { id: 4, title: "Modern Studio Loft", location: "Bashundhara R/A, Dhaka", price: "45,000", rating: 4.7, beds: 1, baths: 1, area: 950, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", premium: false, verified: true },
    { id: 5, title: "Skyline View Apartment", location: "Dhanmondi, Dhaka", price: "95,000", rating: 4.9, beds: 3, baths: 3, area: 2400, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
    { id: 6, title: "Family Cozy Residence", location: "Uttara, Dhaka", price: "60,000", rating: 4.6, beds: 3, baths: 2, area: 1800, image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80", premium: false, verified: true },
    { id: 7, title: "Grand Duplex Mansion", location: "Gulshan 1, Dhaka", price: "210,000", rating: 5.0, beds: 6, baths: 6, area: 5500, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
    { id: 8, title: "Urban Chic Flat", location: "Mirpur DOHS, Dhaka", price: "35,000", rating: 4.5, beds: 2, baths: 2, area: 1200, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", premium: false, verified: true },
    { id: 9, title: "Lakes lakeside Tranquility", location: "Nikunja 1, Dhaka", price: "75,000", rating: 4.8, beds: 3, baths: 3, area: 2100, image: "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
];

const BuyOrRentPage = () => {
    const navigate = useNavigate();
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

    const handleCardClick = (id) => {
        navigate(`/property/${id}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto mb-10 space-y-6">
                {/* Search and Filters Toggle */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search luxury properties by location..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm bg-white"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all shadow-sm border ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <SlidersHorizontal size={20} />
                        Filters
                    </button>
                </div>

                {/* Custom Filter Panel - Based on provided image */}
                {showFilters && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Price Range */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-800 tracking-wide">Price Range (৳)</label>
                            <div className="flex flex-col gap-2">
                                <input type="number" placeholder="Min" className="w-full p-3 rounded-lg border border-gray-100 bg-slate-50 text-sm outline-none focus:border-orange-400 transition-colors" />
                                <input type="number" placeholder="Max" className="w-full p-3 rounded-lg border border-gray-100 bg-slate-50 text-sm outline-none focus:border-orange-400 transition-colors" />
                            </div>
                        </div>

                        {/* Bedrooms */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-800 tracking-wide">Bedrooms</label>
                            <div className="flex gap-2">
                                {['2', '3', '4', '5+'].map((num) => (
                                    <button key={num} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-sm font-medium hover:border-orange-500 hover:text-orange-500 transition-all active:bg-orange-50">
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Property Type */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-800 tracking-wide">Property Type</label>
                            <div className="relative">
                                <select className="w-full p-3 appearance-none rounded-lg border border-gray-100 bg-slate-50 text-sm outline-none focus:border-orange-400 cursor-pointer">
                                    <option>All Types</option>
                                    <option>Apartment</option>
                                    <option>Duplex</option>
                                    <option>Penthouse</option>
                                    <option>Studio</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Specials */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-800 tracking-wide">Special</label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded bg-white flex items-center justify-center group-hover:border-orange-500 transition-colors">
                                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm opacity-0 group-hover:opacity-20"></div>
                                    </div>
                                    <span className="text-sm text-gray-600 font-medium">Premium Only</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded bg-white flex items-center justify-center group-hover:border-orange-500 transition-colors">
                                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm opacity-0 group-hover:opacity-20"></div>
                                    </div>
                                    <span className="text-sm text-gray-600 font-medium">Verified Owners</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
                            {dummyData.length} Premium Properties
                        </h1>
                        <p className="text-gray-500 font-medium italic">Curated collection of exceptional homes</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* More options dropdown placeholder */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                                Most Relevant <ChevronDown size={16} />
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-20">
                                {['Price: Low to High', 'Price: High to Low', 'Newest First', 'Highest Rating'].map((opt) => (
                                    <button key={opt} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-slate-50 hover:text-orange-600 transition-colors">
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* View Toggler */}
                        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-orange-500 text-white shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-orange-500 text-white shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <MapIcon size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Logic */}
            {viewMode === 'grid' ? (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {dummyData.map((property) => (
                        <div key={property.id} onClick={() => handleCardClick(property.id)}>
                            <PropertyCard property={property} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="max-w-7xl mx-auto h-[600px] bg-slate-200 rounded-3xl flex items-center justify-center border-4 border-dashed border-slate-300">
                    <div className="text-center">
                        <MapIcon size={48} className="mx-auto text-slate-400 mb-4" />
                        <p className="text-xl font-bold text-slate-500">Interactive Map View is yet to be implemented</p>
                        <button onClick={() => setViewMode('grid')} className="mt-4 text-orange-500 font-bold hover:underline">
                            Back to Grid View
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyOrRentPage;