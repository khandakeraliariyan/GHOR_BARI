import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import useComparison from '../../Hooks/useComparison';
import useAxios from '../../Hooks/useAxios';
import useAuth from '../../Hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import {
    Scale, X, MapPin, Bed, Bath, Square, Tag, Star, CheckCircle, XCircle,
    ShieldCheck, Layers, Download, Share2, ArrowLeft, Loader2
} from 'lucide-react';

const ComparisonPage = () => {
    const navigate = useNavigate();
    const { selectedProperties, removeProperty, clearAllProperties, addProperty } = useComparison();
    const axiosInstance = useAxios();
    const { user } = useAuth();
    const [allProperties, setAllProperties] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, sale, rent
    const [loading, setLoading] = useState(false);

    // Fetch all properties
    const { data: propertiesData, isLoading } = useQuery({
        queryKey: ['all-properties-for-comparison', filterType],
        enabled: !!user,
        queryFn: async () => {
            const token = await user.getIdToken();
            const response = await axiosInstance.get(`/properties?listingType=${filterType === 'all' ? '' : filterType}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }
    });

    useEffect(() => {
        if (propertiesData) {
            setAllProperties(Array.isArray(propertiesData) ? propertiesData : propertiesData.properties || []);
        }
    }, [propertiesData]);

    // Filter properties based on search
    const filteredProperties = useMemo(() => {
        return allProperties.filter(p =>
            p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.addressString?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allProperties, searchQuery]);

    // Get unselected properties
    const availableForComparison = useMemo(() => {
        return filteredProperties.filter(p => !selectedProperties.find(sp => sp._id === p._id));
    }, [filteredProperties, selectedProperties]);

    const handleDownloadComparison = () => {
        // Create CSV data
        const headers = ['Property', 'Type', 'Price', 'Area', 'Rooms', 'Baths', 'Location', 'Owner', 'Status'];
        const rows = selectedProperties.map(p => [
            p.title,
            p.listingType,
            p.price,
            p.area,
            p.roomCount || p.unitCount || 'N/A',
            p.bathrooms || 'N/A',
            p.addressString,
            p.owner?.name || 'Unknown',
            p.status || 'active'
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
        element.setAttribute('download', 'property-comparison.csv');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 font-bold">Please login to compare properties</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 pt-10 pb-20">
            <div className="w-11/12 mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-600 font-bold mb-4 hover:text-blue-700 transition"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 mb-2">
                        <Scale size={32} /> Property Comparison
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Compare up to 5 properties side by side
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Side - Selected Properties for Comparison */}
                    <div className="lg:col-span-3">
                        {selectedProperties.length > 0 ? (
                            <div className="space-y-6">
                                {/* Comparison Table */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-6 py-4 text-left font-black text-gray-900">Property</th>
                                                {selectedProperties.map((prop) => (
                                                    <th key={prop._id} className="px-6 py-4 text-center">
                                                        <div className="relative group">
                                                            <button
                                                                onClick={() => removeProperty(prop._id)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                            <div className="text-left">
                                                                <p className="font-bold text-gray-900 line-clamp-2 text-xs mb-1">
                                                                    {prop.title}
                                                                </p>
                                                                <img
                                                                    src={prop.images?.[0] || prop.image || 'https://i.ibb.co.com/zTBXMRzq/4284558.jpg'}
                                                                    alt={prop.title}
                                                                    className="w-24 h-24 object-cover rounded-md"
                                                                />
                                                            </div>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Listing Type Row */}
                                            <tr className="border-b border-gray-100">
                                                <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50">Listing Type</td>
                                                {selectedProperties.map((prop) => (
                                                    <td key={prop._id} className="px-6 py-4 text-center">
                                                        <span className="inline-block bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded capitalize">
                                                            {prop.listingType}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Price Row */}
                                            <tr className="border-b border-gray-100">
                                                <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50">Price</td>
                                                {selectedProperties.map((prop) => (
                                                    <td key={prop._id} className="px-6 py-4 text-center">
                                                        <div className="text-xl font-black text-gray-900">
                                                            ৳{prop.price?.toLocaleString()}
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-medium">
                                                            {prop.listingType === 'rent' ? 'per month' : 'total'}
                                                        </p>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Area Row */}
                                            <tr className="border-b border-gray-100">
                                                <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50 flex items-center gap-2">
                                                    <Square size={16} /> Area
                                                </td>
                                                {selectedProperties.map((prop) => (
                                                    <td key={prop._id} className="px-6 py-4 text-center">
                                                        <p className="font-bold text-gray-900">{prop.area}</p>
                                                        <p className="text-xs text-gray-500">sq ft</p>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Rooms Row */}
                                            <tr className="border-b border-gray-100">
                                                <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50 flex items-center gap-2">
                                                    <Bed size={16} /> Rooms
                                                </td>
                                                {selectedProperties.map((prop) => (
                                                    <td key={prop._id} className="px-6 py-4 text-center">
                                                        <p className="font-bold text-gray-900">
                                                            {prop.roomCount || prop.unitCount || 'N/A'}
                                                        </p>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Bathrooms Row */}
                                            <tr className="border-b border-gray-100">
                                                <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50 flex items-center gap-2">
                                                    <Bath size={16} /> Bathrooms
                                                </td>
                                                {selectedProperties.map((prop) => (
                                                    <td key={prop._id} className="px-6 py-4 text-center">
                                                        <p className="font-bold text-gray-900">
                                                            {prop.bathrooms || 'N/A'}
                                                        </p>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Location Row */}
                                            <tr className="border-b border-gray-100">
                                                <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50 flex items-center gap-2">
                                                    <MapPin size={16} /> Location
                                                </td>
                                                {selectedProperties.map((prop) => (
                                                    <td key={prop._id} className="px-6 py-4 text-center text-xs">
                                                        <p className="text-gray-700 line-clamp-2">
                                                            {prop.addressString || 'Unknown'}
                                                        </p>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Owner Row */}
                                            <tr className="border-b border-gray-100">
                                                <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50">Owner</td>
                                                {selectedProperties.map((prop) => (
                                                    <td key={prop._id} className="px-6 py-4 text-center text-sm">
                                                        <p className="font-bold text-gray-900">
                                                            {prop.owner?.name || 'Unknown'}
                                                        </p>
                                                        <div className="flex items-center justify-center gap-1 mt-1">
                                                            <Star size={12} className="text-amber-500" fill="currentColor" />
                                                            <span className="text-xs font-bold text-amber-700">
                                                                {prop.ownerRating || '0'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Verification Row */}
                                            <tr className="border-b border-gray-100">
                                                <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50">Verified</td>
                                                {selectedProperties.map((prop) => {
                                                    const isVerified = Boolean(prop.ownerNidVerified || prop.isOwnerVerified || prop.verified);
                                                    return (
                                                        <td key={prop._id} className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-1">
                                                                {isVerified ? (
                                                                    <>
                                                                        <CheckCircle size={18} className="text-emerald-500" />
                                                                        <span className="text-xs font-bold text-emerald-600">Yes</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle size={18} className="text-red-500" />
                                                                        <span className="text-xs font-bold text-red-600">No</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>

                                            {/* AI Appraisal Row */}
                                            <tr>
                                                <td className="px-6 py-4 font-bold text-gray-900 bg-gradient-to-r from-orange-50 to-yellow-50 flex items-center gap-2">
                                                    <ShieldCheck size={16} className="text-orange-500" /> AI Appraisal
                                                </td>
                                                {selectedProperties.map((prop) => (
                                                    <td key={prop._id} className="px-6 py-4 text-center bg-gradient-to-r from-orange-50 to-yellow-50">
                                                        <p className="font-black text-orange-600 text-lg">
                                                            ৳{(prop.price * 0.95)?.toLocaleString()}
                                                        </p>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 flex-wrap">
                                    <button
                                        onClick={handleDownloadComparison}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-100"
                                    >
                                        <Download size={18} /> Download Comparison
                                    </button>
                                    <button
                                        onClick={() => {
                                            const tableHTML = document.querySelector('table').outerHTML;
                                            const blob = new Blob([tableHTML], { type: 'text/html' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'comparison.html';
                                            a.click();
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition shadow-lg shadow-purple-100"
                                    >
                                        <Share2 size={18} /> Share
                                    </button>
                                    <button
                                        onClick={clearAllProperties}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-100 ml-auto"
                                    >
                                        <X size={18} /> Clear All
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                                <Scale size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 font-bold text-lg">No properties selected for comparison</p>
                                <p className="text-gray-400 text-sm mt-2">Add properties from property details pages to compare</p>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Add More Properties */}
                    <div className="space-y-6">
                        {/* Search and Filter */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-20">
                            <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                <span className="text-blue-600">{selectedProperties.length}</span>
                                <span>/ 5 Selected</span>
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search Properties</label>
                                    <input
                                        type="text"
                                        placeholder="Search by name or location..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter by Type</label>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                    >
                                        <option value="all">All Properties</option>
                                        <option value="sale">For Sale</option>
                                        <option value="rent">For Rent</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Available Properties */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h4 className="font-black text-gray-900 mb-4">Add More Properties</h4>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin text-blue-500" size={24} />
                                </div>
                            ) : availableForComparison.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {availableForComparison.slice(0, 10).map((prop) => (
                                        <div
                                            key={prop._id}
                                            className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition group"
                                        >
                                            <div className="flex gap-3">
                                                <img
                                                    src={prop.images?.[0] || prop.image || 'https://i.ibb.co.com/zTBXMRzq/4284558.jpg'}
                                                    alt={prop.title}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 line-clamp-1">{prop.title}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">{prop.addressString}</p>
                                                    <p className="text-sm font-black text-gray-900 mt-1">৳{prop.price?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addProperty(prop)}
                                                disabled={selectedProperties.length >= 5}
                                                className={`w-full mt-2 py-1.5 text-xs font-bold rounded transition ${
                                                    selectedProperties.length >= 5
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                            >
                                                {selectedProperties.length >= 5 ? 'Max Limit Reached' : 'Add to Compare'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-6">No more properties available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonPage;

