import React from 'react';
import { Users, Home, Handshake, Star } from 'lucide-react';

const HomePageStats = () => {
    const stats = [
        {
            id: 1,
            label: "Active Users",
            value: "250K+",
            icon: <Users size={22} />,
        },
        {
            id: 2,
            label: "Listings",
            value: "80.5K+",
            icon: <Home size={22} />,
        },
        {
            id: 3,
            label: "Deals",
            value: "48K+",
            icon: <Handshake size={22} />,
        },
        {
            id: 4,
            label: "Positive Reviews",
            value: "97%",
            icon: <Star size={22} />,
        },
    ];

    return (
        <section className="bg-gradient-to-b from-white to-gray-50 py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* 2 columns on mobile, 4 on desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat) => (
                        <div
                            key={stat.id}
                            className="group relative bg-white flex flex-col items-center justify-center p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Decorative gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-yellow-50/0 group-hover:from-orange-50/50 group-hover:to-yellow-50/30 transition-all duration-300"></div>
                            
                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center justify-center w-full">
                                {/* Icon Container with enhanced styling */}
                                <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 group-hover:shadow-xl group-hover:shadow-orange-300 group-hover:scale-110 transition-all duration-300">
                                    {stat.icon}
                                </div>

                                {/* Value with enhanced gradient */}
                                <h3 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-2 md:mb-3">
                                    <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:via-orange-700 group-hover:to-yellow-600 transition-all duration-300">
                                        {stat.value}
                                    </span>
                                </h3>

                                {/* Label with better styling */}
                                <p className="text-gray-500 group-hover:text-gray-700 text-[10px] md:text-xs lg:text-sm uppercase tracking-wider font-semibold text-center transition-colors duration-300">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HomePageStats;
