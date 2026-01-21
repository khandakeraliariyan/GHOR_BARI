import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, X, MapPin } from "lucide-react";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapController = ({ flyTo }) => {
    const map = useMap();
    const lastTarget = useRef({ center: null, zoom: null });
    const animationFrameRef = useRef(null);

    useEffect(() => {
        if (flyTo && flyTo.center) {
            const [lat, lng] = flyTo.center;
            const newZoom = flyTo.zoom || map.getZoom();

            const lastTargetCenter = lastTarget.current.center;
            const isNewTarget = !lastTargetCenter ||
                Math.abs(lastTargetCenter.lat - lat) > 0.0001 ||
                Math.abs(lastTargetCenter.lng - lng) > 0.0001 ||
                Math.abs((lastTarget.current.zoom || 0) - newZoom) > 0.1;

            if (isNewTarget) {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
                map.stop();

                animationFrameRef.current = requestAnimationFrame(() => {
                    map.flyTo(flyTo.center, newZoom, {
                        duration: 2,
                        easeLinearity: 0.25,
                        animate: true
                    });
                    lastTarget.current = {
                        center: L.latLng(lat, lng),
                        zoom: newZoom
                    };
                });
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [flyTo, map]);
    return null;
};

const LocationMarker = ({ position, setPosition, setValue }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setValue("coordinates", { lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return position === null ? null : <Marker position={position} />;
};


// Locate Me Button
const LocateButton = ({ setValue, setPosition }) => {
    const map = useMap();
    const locateMe = () => {
        if (!navigator.geolocation) return alert("Geolocation not supported!");
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            map.flyTo([latitude, longitude], 16);

            // auto place marker like click
            setPosition({ lat: latitude, lng: longitude });

            setValue("coordinates", { lat: latitude, lng: longitude });
        });
    };

    return (
        <button
            type="button"
            onClick={locateMe}
            className="absolute z-[1000] top-14 right-3 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded shadow text-sm hover:bg-white/80 transition-all"
        >
            📍 Locate Me
        </button>

    );
};


const SearchBar = ({ onLocationSelect, setValue, setPosition }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [upazilas, setUpazilas] = useState([]);
    const searchRef = useRef(null);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [divs, dists, upz] = await Promise.all([
                    fetch("/divisions.json").then(r => r.json()),
                    fetch("/districts.json").then(r => r.json()),
                    fetch("/upzillas.json").then(r => r.json())
                ]);
                setDivisions(divs);
                setDistricts(dists);
                setUpazilas(upz);
            } catch (err) {
                console.error("Error loading location data:", err);
            }
        };
        loadData();
    }, []);

    // Handle search input
    const handleSearch = (value) => {
        setSearchQuery(value);
        
        if (!value.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const query = value.toLowerCase();
        const results = [];

        // Search divisions
        divisions.forEach(div => {
            if (div.name.toLowerCase().includes(query) || div.bn_name.includes(value)) {
                results.push({
                    type: "division",
                    name: div.name,
                    bn_name: div.bn_name,
                    lat: 23.6850,
                    lon: 90.3563,
                    zoom: 8,
                    id: div.id,
                    data: div
                });
            }
        });

        // Search districts
        districts.forEach(dist => {
            if (dist.name.toLowerCase().includes(query) || dist.bn_name.includes(value)) {
                results.push({
                    type: "district",
                    name: dist.name,
                    bn_name: dist.bn_name,
                    lat: parseFloat(dist.lat),
                    lon: parseFloat(dist.lon),
                    zoom: 11,
                    id: dist.id,
                    data: dist
                });
            }
        });

        // Search upazilas
        upazilas.forEach(upz => {
            if (upz.name.toLowerCase().includes(query) || upz.bn_name.includes(value)) {
                results.push({
                    type: "upazila",
                    name: upz.name,
                    bn_name: upz.bn_name,
                    lat: parseFloat(upz.lat),
                    lon: parseFloat(upz.lon),
                    zoom: 13,
                    id: upz.id,
                    data: upz
                });
            }
        });

        setSuggestions(results.slice(0, 8)); // Limit suggestions
        setShowSuggestions(true);
    };

    // Handle suggestion click
    const handleSelectLocation = (location) => {
        setSearchQuery(location.name);
        setShowSuggestions(false);
        
        // Set marker at location
        setPosition({ lat: location.lat, lng: location.lon });
        setValue("coordinates", { lat: location.lat, lng: location.lon });
        
        // Notify parent about selection
        onLocationSelect(location);
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={searchRef} className="absolute z-[999] top-3 left-3 w-80 max-w-full">
            <div className="relative">
                {/* Search Input */}
                <div className="flex items-center bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all">
                    <Search size={18} className="text-gray-400 ml-3" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => searchQuery && setShowSuggestions(true)}
                        placeholder="Search location, upazila..."
                        className="flex-1 px-3 py-2.5 outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSuggestions([]);
                                setShowSuggestions(false);
                            }}
                            className="pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
                        {suggestions.map((location, idx) => {
                            const typeColors = {
                                division: "bg-blue-50 border-l-4 border-blue-400",
                                district: "bg-green-50 border-l-4 border-green-400",
                                upazila: "bg-orange-50 border-l-4 border-orange-400"
                            };
                            const typeLabels = {
                                division: "Division",
                                district: "District",
                                upazila: "Upazila"
                            };

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectLocation(location)}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors ${typeColors[location.type]}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 truncate">{location.name}</div>
                                            <div className="text-xs text-gray-500">{typeLabels[location.type]}</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {showSuggestions && searchQuery && suggestions.length === 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500">
                        No locations found
                    </div>
                )}
            </div>
        </div>
    );
};


const MapPicker = ({ setValue, flyTo }) => {
    const [position, setPosition] = useState(null);

    const handleLocationSelect = (location) => {
        // This callback can be used for additional processing
        console.log("Location selected:", location);
    };

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={[23.6850, 90.3563]}
                zoom={7}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapController flyTo={flyTo} />

                {/* PASS position + setter */}
                <LocationMarker position={position} setPosition={setPosition} setValue={setValue} />

                {/* Button also receives setPosition */}
                <LocateButton setValue={setValue} setPosition={setPosition} />
            </MapContainer>

            {/* Search Bar - Outside MapContainer */}
            <SearchBar 
                onLocationSelect={handleLocationSelect}
                setValue={setValue}
                setPosition={setPosition}
            />
        </div>
    );
};

export default MapPicker;
