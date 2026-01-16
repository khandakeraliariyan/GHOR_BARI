import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import MyPropertyCard from './MyPropertyCard';
import MyRequestedProperties from './MyRequestedProperties';
import useAuth from '../../Hooks/useAuth';
import useAxios from '../../Hooks/useAxios';
import { PlusCircle, Building2, Activity, Users, Star, Loader2, FileText, Clock, Home, FileText as FileTextIcon } from 'lucide-react';

const ListProperty = () => {
    const { user } = useAuth();
    const axios = useAxios();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('listings');

    // Fetch User Listings
    const { data: properties = [], isLoading: propertiesLoading } = useQuery({
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

    // Fetch User Applications
    const { data: applications = [], isLoading: applicationsLoading } = useQuery({
        queryKey: ['my-applications', user?.email],
        queryFn: async () => {
            if (!user) return [];

            const token = await user.getIdToken();

            const res = await axios.get(`/my-applications?email=${user.email}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data;
        },
    });


    const stats = [
        {
            label: "Total Properties Listed",
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
            label: "Pending Properties",
            value: properties?.filter(p => p.status === 'pending').length || 0,
            icon: <Clock className="text-blue-600" />,
            bg: "bg-blue-50"
        },
        {
            label: "My Applications",
            value: applications?.length || 0,
            icon: <FileText className="text-orange-600" />,
            bg: "bg-orange-100/50"
        },
    ];

    return (
        <div className="bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100 min-h-screen py-12">
            <div className="w-11/12 mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
                            My <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Properties</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate('/add-property')}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-bold uppercase tracking-widest shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-95 transition-all"
                    >
                        <PlusCircle size={20} /> Add New Property
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="bg-white p-10 rounded-lg border-2 border-gray-200 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,146,60,0.2)] hover:border-orange-300 group cursor-default"
                        >
                            <div className="flex items-center justify-center gap-4 mb-3">
                                <div className={`${stat.bg} w-14 h-14 rounded-md flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
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
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    {activeTab === 'listings' ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    My Listings ({properties.length || 0})
                                </h2>
                                <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setActiveTab('listings')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                                activeTab === 'listings'
                                                    ? 'bg-orange-500 text-white shadow-inner'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            My Listings
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('requests')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                                activeTab === 'requests'
                                                    ? 'bg-orange-500 text-white shadow-inner'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            My Requested Properties
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {propertiesLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                                    <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Listings...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {properties.length > 0 ? (
                                        properties.map(property => (
                                            <MyPropertyCard key={property._id} property={property} />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-100 rounded-lg">
                                            <p className="text-gray-400 font-medium">No properties found. Start by adding one!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    My Requested Properties ({applications.length || 0})
                                </h2>
                                <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setActiveTab('listings')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                                activeTab === 'listings'
                                                    ? 'bg-orange-500 text-white shadow-inner'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            My Listings
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('requests')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                                activeTab === 'requests'
                                                    ? 'bg-orange-500 text-white shadow-inner'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            My Requested Properties
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <MyRequestedProperties />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListProperty;