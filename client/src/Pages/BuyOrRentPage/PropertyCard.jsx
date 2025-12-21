import React from 'react';
import { Bed, Bath, Square, MapPin, Star, Heart, CheckCircle } from 'lucide-react';

const PropertyCard = ({ property }) => {
    // Destructuring with fallbacks for safety
    const {
        title,
        location,
        price,
        rating,
        beds,
        baths,
        area,
        image,
        premium,
        verified
    } = property;

    return (
        <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white group cursor-pointer transition-all duration-300 hover:shadow-2xl border border-gray-100 mx-auto w-full">
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                    {premium && (
                        <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Star size={12} fill="currentColor" /> Premium
                        </span>
                    )}
                    {verified && (
                        <span className="bg-white/90 backdrop-blur-sm text-emerald-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md border border-emerald-100">
                            <CheckCircle size={12} /> Verified
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-colors shadow-md">
                    <Heart size={20} />
                </button>

                {/* Property Specs Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex justify-between text-white text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                            <Bed size={16} className="opacity-80" /> {beds}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Bath size={16} className="opacity-80" /> {baths}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Square size={16} className="opacity-80" /> {area} sqft
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {title}
                    </h3>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded">
                        <Star size={14} className="text-amber-500" fill="currentColor" />
                        <span className="text-sm font-bold text-amber-700">{rating}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                    <MapPin size={14} />
                    <span>{location}</span>
                </div>

                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">৳{price}</span>
                    <span className="text-gray-500 text-sm font-medium">/ month</span>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;