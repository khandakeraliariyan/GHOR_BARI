import React from 'react';
import { Users, Home, Handshake, Star } from 'lucide-react';

const HomePageStats = () => {
    const stats = [
        {
            id: 1,
            label: "Users",
            value: "25K+",
            icon: <Users size={22} />,
        },
        {
            id: 2,
            label: "Listings",
            value: "8.5K+",
            icon: <Home size={22} />,
        },
        {
            id: 3,
            label: "Deals",
            value: "12K+",
            icon: <Handshake size={22} />,
        },
        {
            id: 4,
            label: "Reviews",
            value: "99%",
            icon: <Star size={22} />,
        },
    ];

    return (
        <section className="bg-gray-100 pb-8 pt-5 md:pb-16 pt-10">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* 2 columns on mobile, 4 on desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                    {stats.map((stat) => (
                        <div
                            key={stat.id}
                            className="bg-white flex flex-col items-center justify-center p-5 md:p-8 lg:aspect-square rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 group border border-transparent hover:border-orange-100"
                        >
                            {/* Icon Container with hover scale and color */}
                            <div className="mb-3 md:mb-6 p-3 md:p-4 rounded-xl md:rounded-2xl bg-gray-50 text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                                {stat.icon}
                            </div>

                            {/* Value with gradient */}
                            <h3 className="text-xl md:text-3xl lg:text-5xl font-extrabold text-gray-900 mb-1">
                                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                                    {stat.value}
                                </span>
                            </h3>

                            {/* Label */}
                            <p className="text-gray-400 text-[10px] md:text-xs lg:text-sm uppercase tracking-widest font-bold">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HomePageStats;
