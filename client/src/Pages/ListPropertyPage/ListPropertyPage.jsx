import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import MyPropertyCard from './MyPropertyCard';
import useAuth from '../../Hooks/useAuth';
import useAxios from '../../Hooks/useAxios';
import { PlusCircle, Building2, Activity, Users, Star, Loader2 } from 'lucide-react';

const ListProperty = () => {
    const { user } = useAuth();
    const axios = useAxios();
    const navigate = useNavigate();

    // Fetch User Listings
    const { data: properties = [], isLoading } = useQuery({
        queryKey: ['my-properties', user?.email],
        queryFn: async () => {
            if (!user) return [];

            const token = await user.getIdToken(); // get Firebase token

            const res = await axios.get(`/my-properties?email=${user.email}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data;
        },
    });


    const stats = [
        {
            label: "Total Properties",
            value: properties?.length || 0,
            icon: <Building2 className="text-orange-500" />,
            bg: "bg-orange-50"
        },
        {
            label: "Active Listings",
            value: properties?.filter(p => p.status === 'active').length || 0,
            icon: <Activity className="text-yellow-600" />,
            bg: "bg-yellow-50"
        },
        {
            label: "Total Requests",
            value: "12", // Placeholder for seeker requests - will need to debug later
            icon: <Users className="text-orange-600" />,
            bg: "bg-orange-100/50"
        },
    ];

    return (
        <div className="bg-[#F8FAFC] min-h-screen py-12 px-4">
            <div className="w-11/12 mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">My <span className="text-orange-500">Properties</span></h1>
                        <p className="text-gray-500 mt-1 font-medium">Manage your property listings and track performance</p>
                    </div>
                    <button
                        onClick={() => navigate('/add-property')}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-95 transition-all"
                    >
                        <PlusCircle size={20} /> Add New Property
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="bg-white p-10 rounded-[2.5rem] border border-gray-50 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,146,60,0.2)] group cursor-default"
                        >
                            <div className="flex items-center justify-center gap-4 mb-3">
                                <div className={`${stat.bg} w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                                    {React.cloneElement(stat.icon, { size: 26 })}
                                </div>
                                <div className="text-4xl font-black text-gray-900 tracking-tight">
                                    {stat.value}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="text-center">
                                <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
                                    {stat.label}
                                </div>
                                {/* Gradient Bar */}
                                <div className="h-1.5 w-8 bg-gradient-to-r from-orange-500 to-yellow-400 mx-auto mt-3 rounded-full opacity-0 group-hover:opacity-100 group-hover:w-12 transition-all duration-500" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Listings Section */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Your Listings</h2>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Listings...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {properties.length > 0 ? (
                                properties.map(property => (
                                    <MyPropertyCard key={property._id} property={property} />
                                ))
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[2rem]">
                                    <p className="text-gray-400 font-medium">No properties found. Start by adding one!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListProperty;