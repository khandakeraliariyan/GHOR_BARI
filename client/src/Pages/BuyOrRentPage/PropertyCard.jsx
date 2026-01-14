import React from "react";
import { Bed, Bath, Square, MapPin, Star, Heart, CheckCircle, Tag, Layers, XCircle } from "lucide-react";

const PropertyCard = ({ property }) => {
    const {
        title,
        price,
        area,
        image,
        images = [],
        addressString,
        listingType,
        propertyType,
        owner,
        ownerRating,
        ownerNidVerified,
        isOwnerVerified,
        verified,
        isPremium,
        // Dynamic fields based on propertyType
        roomCount,
        bathrooms,
        floorCount,
        totalUnits,
        // Legacy fields for backward compatibility
        unitCount,
        baths,
    } = property;

    const imageUrl = Array.isArray(images) && images.length > 0
        ? images[0]
        : image || "https://i.ibb.co.com/zTBXMRzq/4284558.jpg";

    const displayAddress = addressString || "Unknown location";
    const priceSuffix = listingType === "sale" ? " / total" : " / month";

    const premiumFlag = typeof isPremium === "boolean"
        ? isPremium
        : (listingType === "rent" ? Number(price) > 50000 : Number(price) > 100000);

    const verifiedFlag = Boolean(ownerNidVerified ?? isOwnerVerified ?? property.isOwnerVerified ?? property.isVerified ?? verified);
    const ownerName = owner?.name || owner?.email || "Unknown";

    return (
        <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white group cursor-pointer transition-all duration-300 hover:shadow-2xl border border-gray-100 mx-auto w-full flex flex-col h-[440px]">
            <div className="relative h-64 overflow-hidden">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
                    <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md uppercase">
                        <Tag size={12} /> {listingType}
                    </span>

                    {premiumFlag && (
                        <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Star size={12} fill="currentColor" /> Premium
                        </span>
                    )}

                    <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border
                            ${verifiedFlag ? "bg-white/60 text-emerald-700 border-emerald-200" : "bg-white/40 text-red-600 border-red-100"}`}
                        style={{ backdropFilter: "saturate(120%) blur(4px)" }}
                    >
                        {verifiedFlag ? <><CheckCircle size={12} /> Verified</> : <><XCircle size={12} /> Unverified</>}
                    </span>
                </div>

                <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-colors shadow-md">
                    <Heart size={20} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex justify-between text-white text-sm font-medium">
                        {propertyType === "building" ? (
                            <>
                                <div className="flex items-center gap-1.5"><Layers size={16} className="opacity-80" /> {floorCount || unitCount || "N/A"} Floors</div>
                                <div className="flex items-center gap-1.5"><Bed size={16} className="opacity-80" /> {totalUnits || "N/A"} Units</div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-1.5"><Bed size={16} className="opacity-80" /> {roomCount || unitCount || "N/A"} Rooms</div>
                                <div className="flex items-center gap-1.5"><Bath size={16} className="opacity-80" /> {bathrooms || baths || "N/A"} Baths</div>
                            </>
                        )}
                        <div className="flex items-center gap-1.5"><Square size={16} className="opacity-80" /> {area} sqft</div>
                    </div>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">{title}</h3>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded ml-2 bg-amber-50 shrink-0">
                            <Star size={14} className="text-amber-500" fill="currentColor" />
                            <span className="text-sm font-bold text-amber-700">{ownerRating || "0"}</span>
                        </div>
                    </div>

                    <div className="text-gray-500 text-sm mb-2">
                        <p className="leading-relaxed line-clamp-2">
                            <MapPin size={14} className="inline-block mr-1 -mt-0.5" />
                            {displayAddress}
                        </p>
                    </div>

                    <hr className="border-t border-gray-200 my-2" />

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <span className="font-medium">Owner:</span>
                        <span className="font-bold">{ownerName}</span>
                    </div>
                </div>

                <div className="bg-gray-100 p-3 rounded-xl">
                    <div className="flex items-baseline justify-between">
                        <div>
                            <span className="text-2xl font-black text-slate-900">৳{price}</span>
                            <span className="text-gray-500 text-sm font-medium ml-2">{priceSuffix}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;