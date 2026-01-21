import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Home, Handshake, ShieldCheck, Building2 } from 'lucide-react';
import useAxios from '../Hooks/useAxios';

const HomePageStats = () => {
    const axios = useAxios();

    // Fetch public stats from API
    const { data: statsData, isLoading } = useQuery({
        queryKey: ['public-stats'],
        queryFn: async () => {
            const res = await axios.get('/public/stats');
            return res.data;
        }
    });

    // Format numbers with K suffix for large numbers
    const formatNumber = (num) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K+`;
        }
        return num.toString();
    };

    const stats = [
        {
            id: 1,
            label: "Active Property Listings",
            value: isLoading ? "..." : formatNumber(statsData?.activeListings || 0),
            icon: <Home size={22} />,
        },
        {
            id: 2,
            label: "Successful Deals",
            value: isLoading ? "..." : formatNumber(statsData?.successfulDeals || 0),
            icon: <Handshake size={22} />,
        },
        {
            id: 3,
            label: "Verified Users",
            value: isLoading ? "..." : formatNumber(statsData?.verifiedUsers || 0),
            icon: <ShieldCheck size={22} />,
        },
        {
            id: 4,
            label: "Total Properties",
            value: isLoading ? "..." : formatNumber(statsData?.totalProperties || 0),
            icon: <Building2 size={22} />,
        },
    ];

    return (
        <section className="bg-gray-100 py-12 md:py-20">
            <div className="w-11/12 mx-auto">
                {/* 2 columns on mobile, 4 on desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat) => (
                        <div
                            key={stat.id}
                            className="group relative bg-white flex flex-col items-center justify-center p-6 md:p-8 lg:p-10 rounded-lg shadow-lg hover:shadow-2xl border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Decorative gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-yellow-50/0 group-hover:from-orange-50/50 group-hover:to-yellow-50/30 transition-all duration-300"></div>
                            
                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center justify-center w-full">
                                {/* Icon Container with enhanced styling */}
                                <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 group-hover:shadow-xl group-hover:shadow-orange-300 group-hover:scale-110 transition-all duration-300">
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
