import React, { useCallback, useEffect, useState } from "react";
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

const PAGE_SIZE = 12;

const BuyOrRentPage = () => {
    const navigate = useNavigate();
    const axiosInstance = useAxios();
    const { user: authUser, loading: authLoading } = useAuth();

    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState("grid");
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    const fetchGeoFiles = useCallback(async () => {
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
    }, []);

    const fetchProperties = useCallback(async () => {
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

                const beds = prop.dunitCount ?? prop.beds ?? 0;
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

                const isVerified = !!prop.isOwnerVerified || ownerNidVerified;

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
            setCurrentPage(1); // reset page on new data
        } catch (error) {
            console.error("Error fetching properties:", error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [authUser, axiosInstance, fetchGeoFiles]);

    useEffect(() => {
        if (!authLoading) {
            setLoading(true);
            fetchProperties();
        }
    }, [authLoading, fetchProperties]);

    const handleCardClick = (id) => navigate(`/property-details/${id}`);

    // Pagination helpers
    const totalItems = properties.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [currentPage, totalPages]); // reset if pages shrink

    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    const pageItems = properties.slice(startIdx, endIdx);

    const goToPage = (p) => {
        const page = Math.min(Math.max(1, p), totalPages);
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const renderPager = () => {
        if (totalPages <= 1) return null;
        const pages = [];
        // show up to 7 page buttons, centered window
        const maxButtons = 7;
        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = start + maxButtons - 1;
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxButtons + 1);
        }
        for (let p = start; p <= end; p++) pages.push(p);

        return (
            <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white border'}`}>
                    Prev
                </button>

                {start > 1 && (
                    <>
                        <button onClick={() => goToPage(1)} className="px-3 py-2 rounded-md bg-white border">1</button>
                        {start > 2 && <span className="px-2">...</span>}
                    </>
                )}

                {pages.map((p) => (
                    <button key={p} onClick={() => goToPage(p)}
                        className={`px-3 py-2 rounded-md ${p === currentPage ? 'bg-orange-500 text-white' : 'bg-white border'}`}>
                        {p}
                    </button>
                ))}

                {end < totalPages && (
                    <>
                        {end < totalPages - 1 && <span className="px-2">...</span>}
                        <button onClick={() => goToPage(totalPages)} className="px-3 py-2 rounded-md bg-white border">{totalPages}</button>
                    </>
                )}

                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white border'}`}>
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto mb-10 space-y-6">
                {/* Search & filter UI - not functional yet, will be updated later*/}
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
                            {loading ? "Loading..." : `${totalItems} Properties`}
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
                <>
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-6">
                        {!loading &&
                            pageItems.map((property) => (
                                <div key={property._id} onClick={() => handleCardClick(property._id)}>
                                    <PropertyCard property={property} />
                                </div>
                            ))}
                    </div>

                    {renderPager()}
                </>
            ) : (
                <div className="max-w-7xl mx-auto h-[600px] bg-white rounded-3xl overflow-hidden border border-gray-100">
                    <BuyOrRentMap properties={properties} onMarkerClick={(id) => navigate(`/property-details/${id}`)} />
                </div>
            )}
        </div>
    );
};

export default BuyOrRentPage;
