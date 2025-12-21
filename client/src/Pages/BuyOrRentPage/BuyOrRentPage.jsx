import React from 'react';
import PropertyCard from './PropertyCard';
import { Search, SlidersHorizontal, LayoutGrid, Map as MapIcon, ChevronDown } from 'lucide-react';


// dummy data for now - will be replaced with actual data later
const dummyData = [
    { id: 1, title: "Minimalist Luxury Suite", location: "Gulshan 2, Dhaka", price: "85,000", rating: 4.9, beds: 3, baths: 3, area: 2200, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
    { id: 2, title: "Executive Villa with Pool", location: "Banani DOHS, Dhaka", price: "150,000", rating: 5.0, beds: 5, baths: 4, area: 4500, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
    { id: 3, title: "Designer Penthouse", location: "Baridhara, Dhaka", price: "120,000", rating: 4.8, beds: 4, baths: 3, area: 3100, image: "https://images.unsplash.com/photo-1600607687940-4e23036c556a?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
    { id: 4, title: "Modern Studio Loft", location: "Bashundhara R/A, Dhaka", price: "45,000", rating: 4.7, beds: 1, baths: 1, area: 950, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", premium: false, verified: true },
    { id: 5, title: "Skyline View Apartment", location: "Dhanmondi, Dhaka", price: "95,000", rating: 4.9, beds: 3, baths: 3, area: 2400, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
    { id: 6, title: "Family Cozy Residence", location: "Uttara, Dhaka", price: "60,000", rating: 4.6, beds: 3, baths: 2, area: 1800, image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80", premium: false, verified: true },
    { id: 7, title: "Grand Duplex Mansion", location: "Gulshan 1, Dhaka", price: "210,000", rating: 5.0, beds: 6, baths: 6, area: 5500, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
    { id: 8, title: "Urban Chic Flat", location: "Mirpur DOHS, Dhaka", price: "35,000", rating: 4.5, beds: 2, baths: 2, area: 1200, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", premium: false, verified: true },
    { id: 9, title: "Lakeside Tranquility", location: "Nikunja 1, Dhaka", price: "75,000", rating: 4.8, beds: 3, baths: 3, area: 2100, image: "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?auto=format&fit=crop&w=800&q=80", premium: true, verified: true },
];

const BuyOrRentPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
            {/* Search and Filters Bar */}
            <div className="max-w-7xl mx-auto mb-10 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search luxury properties by location..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <SlidersHorizontal size={20} />
                        Filters
                    </button>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">9 Premium Properties</h1>
                        <p className="text-gray-500 font-medium italic">Curated collection of exceptional homes</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 shadow-sm">
                            Most Relevant <ChevronDown size={16} />
                        </button>
                        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                            <button className="p-2 bg-orange-500 text-white rounded-md shadow-inner">
                                <LayoutGrid size={20} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <MapIcon size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Property Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dummyData.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>
        </div>
    );
};

export default BuyOrRentPage;