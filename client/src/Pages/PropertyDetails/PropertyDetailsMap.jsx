import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import { Navigation } from "lucide-react";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

// Sub-component to handle "Locate Me" logic
const LocateButton = ({ targetLocation }) => {
    const map = useMap();

    const handleLocate = () => {
        map.flyTo([targetLocation.lat, targetLocation.lng], 16, {
            duration: 1.5,
        });
    };

    return (
        <button
            onClick={handleLocate}
            className="absolute bottom-6 right-6 z-[1000] bg-white text-orange-600 p-3 rounded-2xl shadow-xl hover:bg-orange-50 transition-all border border-gray-100 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest active:scale-95"
            title="Recenter Map"
        >
            <Navigation size={16} className="fill-orange-600" />
            Locate Property
        </button>
    );
};

// Route component wrapper to use useMap hook
const RouteDisplayWrapper = ({ from, to }) => {
    return (
        <RouteDisplayInner from={from} to={to} />
    );
};

// Route component to fetch and display route
const RouteDisplayInner = ({ from, to }) => {
    const [route, setRoute] = useState(null);
    const map = useMap();

    useEffect(() => {
        if (!from || !to) {
            setRoute(null);
            return;
        }

        // Fetch route from OSRM API
        const fetchRoute = async () => {
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.code === "Ok" && data.routes && data.routes.length > 0) {
                    const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    setRoute(coordinates);
                    
                    // Fit map to show both points and route
                    const bounds = L.latLngBounds([from, to, ...coordinates]);
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } catch (error) {
                console.error("Error fetching route:", error);
            }
        };

        fetchRoute();
    }, [from, to, map]);

    if (!route) return null;

    return (
        <Polyline
            positions={route}
            color="#f97316"
            weight={4}
            opacity={0.7}
            dashArray="10, 5"
        />
    );
};

// Create custom icon for nearby places based on category
const createCustomIcon = (color, category) => {
    const categoryIcons = {
        education: '🏫',
        healthcare: '🏥',
        airports: '✈️',
        busStations: '🚌',
        railStations: '🚂',
        shopping: '🛒',
        parks: '🌳',
        restaurants: '🍽️',
        religious: '🕌',
        banks: '🏦',
        fuelStations: '⛽',
        police: '🚔',
        hotels: '🏨',
        gyms: '💪'
    };

    const emoji = categoryIcons[category] || '📍';

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        ">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

const PropertyDetailsMap = ({ location, title, nearbyPlaces, selectedPlace, onPlaceSelect }) => {
    // Category colors
    const categoryColors = {
        education: '#3B82F6',      // blue
        healthcare: '#EF4444',    // red
        airports: '#A855F7',     // purple
        busStations: '#10B981',  // green
        railStations: '#059669',  // emerald
        shopping: '#F97316',     // orange
        parks: '#84CC16',        // lime
        restaurants: '#F43F5E',   // rose
        religious: '#F59E0B',    // amber
        banks: '#14B8A6',        // teal
        fuelStations: '#EAB308', // yellow
        police: '#6366F1',       // indigo
        hotels: '#EC4899',       // pink
        gyms: '#8B5CF6'          // violet
    };

    // Category labels
    const categoryLabels = {
        education: 'Education',
        healthcare: 'Healthcare',
        airports: 'Airport',
        busStations: 'Bus Station',
        railStations: 'Rail Station',
        shopping: 'Shopping',
        parks: 'Park',
        restaurants: 'Restaurant/Cafe',
        religious: 'Religious Place',
        banks: 'Bank/ATM',
        fuelStations: 'Fuel Station',
        police: 'Police Station',
        hotels: 'Hotel',
        gyms: 'Gym'
    };

    // Flatten all nearby places into a single array
    const allPlaces = nearbyPlaces ? [
        ...(nearbyPlaces.education || []).map(p => ({ ...p, category: 'education' })),
        ...(nearbyPlaces.healthcare || []).map(p => ({ ...p, category: 'healthcare' })),
        ...(nearbyPlaces.airports || []).map(p => ({ ...p, category: 'airports' })),
        ...(nearbyPlaces.busStations || []).map(p => ({ ...p, category: 'busStations' })),
        ...(nearbyPlaces.railStations || []).map(p => ({ ...p, category: 'railStations' })),
        ...(nearbyPlaces.shopping || []).map(p => ({ ...p, category: 'shopping' })),
        ...(nearbyPlaces.parks || []).map(p => ({ ...p, category: 'parks' })),
        ...(nearbyPlaces.restaurants || []).map(p => ({ ...p, category: 'restaurants' })),
        ...(nearbyPlaces.religious || []).map(p => ({ ...p, category: 'religious' })),
        ...(nearbyPlaces.banks || []).map(p => ({ ...p, category: 'banks' })),
        ...(nearbyPlaces.fuelStations || []).map(p => ({ ...p, category: 'fuelStations' })),
        ...(nearbyPlaces.police || []).map(p => ({ ...p, category: 'police' })),
        ...(nearbyPlaces.hotels || []).map(p => ({ ...p, category: 'hotels' })),
        ...(nearbyPlaces.gyms || []).map(p => ({ ...p, category: 'gyms' }))
    ] : [];

    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={[location.lat, location.lng]}
                zoom={15}
                className="h-full w-full"
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Property Marker */}
                <Marker position={[location.lat, location.lng]}>
                    <Popup>
                        <div className="font-bold">{title}</div>
                        <div className="text-xs text-gray-500">Property Location</div>
                    </Popup>
                </Marker>

                {/* Route Display */}
                {selectedPlace && (
                    <RouteDisplayWrapper
                        from={location} 
                        to={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                    />
                )}

                {/* Nearby Places Markers */}
                {allPlaces.map((place, idx) => {
                    const color = categoryColors[place.category] || '#6B7280';
                    const customIcon = createCustomIcon(color, place.category);
                    const isSelected = selectedPlace && selectedPlace.lat === place.lat && selectedPlace.lng === place.lng;
                    
                    return (
                        <Marker
                            key={`${place.category}-${idx}`}
                            position={[place.lat, place.lng]}
                            icon={customIcon}
                            eventHandlers={{
                                click: () => {
                                    if (onPlaceSelect) {
                                        if (isSelected) {
                                            onPlaceSelect(null); // Deselect if clicking same place
                                        } else {
                                            onPlaceSelect(place);
                                        }
                                    }
                                }
                            }}
                        >
                            <Popup>
                                <div>
                                    <div className="font-bold text-sm">{place.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {categoryLabels[place.category] || place.category}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {place.distance} km away
                                    </div>
                                    {onPlaceSelect && (
                                        <button
                                            onClick={() => {
                                                if (isSelected) {
                                                    onPlaceSelect(null);
                                                } else {
                                                    onPlaceSelect(place);
                                                }
                                            }}
                                            className="mt-2 text-xs text-orange-600 font-semibold hover:underline"
                                        >
                                            {isSelected ? 'Hide Route' : 'Show Route'}
                                        </button>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* The Custom Button */}
                <LocateButton targetLocation={location} />
            </MapContainer>
        </div>
    );
};

export default PropertyDetailsMap;
