import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useAxios from "../../Hooks/useAxios";
import PropertyCard from "./PropertyCard";
import BuyOrRentMap from "./BuyOrRentMap";
import {
    Search,
    SlidersHorizontal,
    LayoutGrid,
    Map as MapIcon,
    ChevronDown,
} from "lucide-react";
import useAuth from "../../Hooks/useAuth";

const BuyOrRentPage = () => {
    const navigate = useNavigate();
    const axiosInstance = useAxios();
    const { user: authUser, loading: authLoading } = useAuth();

    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState("grid");
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchGeoFiles = async () => {
        const [divisionsRes, districtsRes, upzillasRes] = await Promise.all([
            fetch("/divisions.json"),
            fetch("/districts.json"),
            fetch("/upzillas.json"),
        ]);
        const [divisions, districts, upzillas] = await Promise.all([
            divisionsRes.json(),
            districtsRes.json(),
            upzillasRes.json(),
        ]);
        const divisionMap = new Map(divisions.map((d) => [d.id, d.name]));
        const districtMap = new Map(districts.map((d) => [d.id, d.name]));
        const upzilaMap = new Map(upzillas.map((u) => [u.id, u.name]));
        return { divisionMap, districtMap, upzilaMap };
    };

    const fetchProperties = async () => {
        try {
            if (!authUser) {
                console.log("User not logged in");
                setProperties([]);
                return;
            }

            const token = await authUser.getIdToken();
            const res = await axiosInstance.get("/active-properties", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!Array.isArray(res.data)) {
                console.error("Unexpected API response format:", res.data);
                setProperties([]);
                return;
            }

            const { divisionMap, districtMap, upzilaMap } = await fetchGeoFiles();

            // batch owner emails
            const ownerEmails = Array.from(new Set(res.data.map((p) => p.owner?.email).filter(Boolean)));

            let ownerInfoMap = new Map();
            if (ownerEmails.length) {
                const ownersRes = await axiosInstance.get(`/users-by-emails?emails=${encodeURIComponent(ownerEmails.join(","))}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (Array.isArray(ownersRes.data)) {
                    ownersRes.data.forEach((u) => ownerInfoMap.set(u.email, u));
                }
            }

            const safeProperties = res.data.map((prop) => {
                const imageUrl = Array.isArray(prop.images) && prop.images.length > 0 ? prop.images[0] : prop.image || null;

                const beds = prop.unitCount ?? prop.beds ?? 0;
                const baths = prop.bathrooms ?? prop.baths ?? 0;
                const area = prop.areaSqFt ?? prop.area ?? 0;
                const rating = prop.rating?.average ?? prop.rating ?? 0;
                const listingType = prop.listingType ?? "rent";

                const addressObj = prop.address || {};
                const street = addressObj.street || "";
                const upazilaName = upzilaMap.get(addressObj.upazila_id) || "";
                const districtName = districtMap.get(addressObj.district_id) || "";
                const divisionName = divisionMap.get(addressObj.division_id) || "";
                const addressString = [street, upazilaName, districtName, divisionName].filter(Boolean).join(", ");

                const ownerEmail = prop.owner?.email;
                const ownerInfo = ownerInfoMap.get(ownerEmail) || {};
                const ownerRating = ownerInfo.rating?.average ?? ownerInfo.rating ?? 0;
                const ownerNidVerified = !!ownerInfo.nidVerified;

                // check if the user if varified
                const isVerified = !!prop.isOwnerVerified || ownerNidVerified;

                // premium rules
                const isPremium = (listingType === "rent" && Number(prop.price) > 50000) ||
                    (listingType === "sale" && Number(prop.price) > 100000);

                return {
                    ...prop,
                    image: imageUrl,
                    images: prop.images || [],
                    beds,
                    baths,
                    area,
                    rating,
                    listingType,
                    addressString,
                    ownerRating,
                    ownerNidVerified,
                    isVerified,
                    isPremium,
                };
            });

            setProperties(safeProperties);
        } catch (error) {
            console.error("Error fetching properties:", error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            setLoading(true);
            fetchProperties();
        }
    }, [authLoading, authUser]);

    const handleCardClick = (id) => navigate(`/property/${id}`);

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto mb-10 space-y-6">
                {/* Search & filter UI */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input placeholder="Search luxury properties by location..." className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm bg-white" />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all shadow-sm border ${showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
                        <SlidersHorizontal size={20} /> Filters
                    </button>
                </div>

                {/* header with view toggle */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
                            {loading ? "Loading..." : `${properties.length} Properties`}
                        </h1>
                        <p className="text-gray-500 font-medium italic">Curated collection of exceptional homes</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-orange-500 text-white shadow-inner" : "text-gray-400 hover:text-gray-600"}`}>
                                <LayoutGrid size={20} />
                            </button>
                            <button onClick={() => setViewMode("map")} className={`p-2 rounded-md transition-all ${viewMode === "map" ? "bg-orange-500 text-white shadow-inner" : "text-gray-400 hover:text-gray-600"}`}>
                                <MapIcon size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === "grid" ? (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {!loading &&
                        properties.map((property) => (
                            <div key={property._id} onClick={() => handleCardClick(property._id)}>
                                <PropertyCard property={property} />
                            </div>
                        ))}
                </div>
            ) : (
                <div className="max-w-7xl mx-auto h-[600px] bg-white rounded-3xl overflow-hidden border border-gray-100">
                    <BuyOrRentMap properties={properties} onMarkerClick={(id) => navigate(`/property/${id}`)} />
                </div>
            )}
        </div>
    );
};

export default BuyOrRentPage;