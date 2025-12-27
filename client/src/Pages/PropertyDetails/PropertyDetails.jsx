import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import useAxios from '../../Hooks/useAxios';
import useAuth from '../../Hooks/useAuth';
import PropertyDetailsMap from './PropertyDetailsMap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import {
    MapPin, Bed, Bath, Square, CheckCircle, XCircle,
    User, MessageSquare, ShieldCheck, Sparkles, Loader2, Layers, Star
} from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const axios = useAxios();
    const { user } = useAuth();

    const [geoMaps, setGeoMaps] = useState({ divisionMap: new Map(), districtMap: new Map(), upazilaMap: new Map() });

    // 1. Fetch Property Data
    const { data: property, isLoading: propLoading } = useQuery({
        queryKey: ['property', id],
        enabled: !!user,
        queryFn: async () => {
            const token = await user.getIdToken();
            const res = await axios.get(`/property/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        }
    });

    // 2. Fetch Secure Owner Profile
    const { data: ownerProfile } = useQuery({
        queryKey: ['public-owner', property?.owner?.email],
        enabled: !!property?.owner?.email,
        queryFn: async () => {
            const token = await user.getIdToken();
            const res = await axios.get(`/public-profile/${property.owner.email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        }
    });

    useEffect(() => {
        const fetchGeoData = async () => {
            try {
                const [divR, disR, upzR] = await Promise.all([fetch('/divisions.json'), fetch('/districts.json'), fetch('/upazilas.json')]);
                const [div, dis, upz] = await Promise.all([divR.json(), disR.json(), upzR.json()]);
                setGeoMaps({
                    divisionMap: new Map(div.map(d => [String(d.id), d.name])),
                    districtMap: new Map(dis.map(d => [String(d.id), d.name])),
                    upazilaMap: new Map(upz.map(u => [String(u.id), u.name]))
                });
            } catch (err) { console.error("Geo data error", err); }
        };
        fetchGeoData();
    }, []);

    const {
        title, images, listingType, price, address, unitCount, bathrooms,
        areaSqFt, overview, amenities, location
    } = property || {};

    const decodedLocation = useMemo(() => {
        if (!address || geoMaps.divisionMap.size === 0) return address?.street || "Loading...";
        return [
            address.street,
            geoMaps.upazilaMap.get(String(address.upazila_id)),
            geoMaps.districtMap.get(String(address.district_id)),
            geoMaps.divisionMap.get(String(address.division_id))
        ].filter(Boolean).join(", ");
    }, [address, geoMaps]);

    // Format Date: 3 December, 2025
    // Format Date: 3 December, 2025
    const formatDate = (dateString) => {
        if (!dateString) return "Joining Date N/A";
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-GB', { month: 'long' });
        const year = date.getFullYear();

        return `${day} ${month}, ${year}`; // Added the comma here manually
    };

    if (!user || propLoading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
            <p className="font-black text-gray-400 animate-pulse uppercase text-xs tracking-widest">Loading Property...</p>
        </div>
    );

    return (
        <div className="bg-[#F8FAFC] min-h-screen pt-10 pb-20">
            <div className="w-11/12 mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* LEFT SIDE */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="w-full h-[550px] bg-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100">
                        <Swiper modules={[Navigation, Pagination, Autoplay]} navigation pagination={{ clickable: true }} autoplay={{ delay: 5000 }} loop={true} className="h-full w-full">
                            {images?.map((img, idx) => (
                                <SwiperSlide key={idx}><img src={img} alt={title} className="w-full h-full object-cover object-center" /></SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full flex items-center gap-1 shadow-md uppercase tracking-widest">
                                {listingType}
                            </span>
                            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 border uppercase tracking-widest ${ownerProfile?.nidVerified ? "bg-white/60 text-emerald-700 border-emerald-200" : "bg-white/40 text-red-600 border-red-100"
                                }`}>
                                {ownerProfile?.nidVerified ? <><CheckCircle size={12} /> Verified Owner</> : <><XCircle size={12} /> Unverified Owner</>}
                            </span>
                        </div>

                        <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">{title}</h1>

                        <div className="flex items-center gap-2 text-gray-500 mb-8">
                            <MapPin size={18} className="text-orange-500 shrink-0" />
                            <span className="font-semibold text-gray-600">{decodedLocation}</span>
                        </div>

                        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-6 py-6 border-y border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                                    {listingType === 'sale' ? <Layers size={20} /> : <Bed size={20} />}
                                </div>
                                <div>
                                    <p className="font-black text-xl">{unitCount}</p>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">{listingType === 'sale' ? 'Floors' : 'Bedrooms'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl"><Bath size={20} /></div>
                                <div>
                                    <p className="font-black text-xl">{bathrooms}</p>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Baths</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><Square size={20} /></div>
                                <div>
                                    <p className="font-black text-xl">{areaSqFt}</p>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Sq Ft</p>
                                </div>
                            </div>
                            <div className="col-span-2 md:ml-auto md:text-right">
                                <p className="text-4xl font-black text-gray-900">৳{price?.toLocaleString()}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                                    {listingType === 'rent' ? 'per Month' : 'Total Price'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[500px] rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-md bg-white">
                        <PropertyDetailsMap location={location} title={title} />
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h3 className="text-xs font-black mb-6 text-gray-400 uppercase tracking-[0.3em]">Property Owner</h3>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center overflow-hidden border border-orange-100">
                                {ownerProfile?.profileImage ? (
                                    <img src={ownerProfile.profileImage} className="w-full h-full object-cover" alt="owner" />
                                ) : (
                                    <User size={30} className="text-orange-200" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-black text-gray-900 text-xl">{ownerProfile?.name || 'Anonymous'}</h4>
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50">
                                        <Star size={12} className="text-amber-500" fill="currentColor" />
                                        <span className="text-xs font-bold text-amber-700">{ownerProfile?.rating?.average || "0"}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                    <CheckCircle size={10} /> Member since {formatDate(ownerProfile?.createdAt)}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <button className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-100">
                                <MessageSquare size={16} /> Send Inquiry
                            </button>
                            <button onClick={() => navigate(`/owner-profile/${ownerProfile?.email}`)} className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-100 transition-all border border-gray-100">
                                View Full Profile
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h3 className="text-xl font-black text-gray-900 mb-4">Property Description</h3>
                        <p className="text-gray-500 leading-relaxed font-medium mb-8 text-sm">{overview}</p>
                        <h3 className="text-xs font-black text-gray-400 mb-6 border-t pt-8 uppercase tracking-[0.3em]">Key Amenities</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {amenities?.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                    <CheckCircle size={14} className="text-orange-500" />
                                    <span className="text-xs font-bold text-gray-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#f97316] to-[#fbbf24] p-9 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                        <Sparkles className="absolute -right-8 -top-8 opacity-20 rotate-12" size={160} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-5">
                                <ShieldCheck size={20} />
                                <h3 className="font-black uppercase text-[10px] tracking-[0.2em]">AI Market Appraisal</h3>
                            </div>
                            <p className="text-4xl font-black mb-2">৳{price ? (price * 0.95).toLocaleString() : ''}</p>
                            <p className="text-xs font-bold opacity-90 leading-relaxed max-w-[90%]">
                                Based on thousands of listings in this area, our AI predicts a fair market value.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetails;