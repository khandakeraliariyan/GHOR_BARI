import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Navigation } from "lucide-react";
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

const PropertyDetailsMap = ({ location, title }) => {
    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={[location.lat, location.lng]}
                zoom={15}
                className="h-full w-full"
                zoomControl={false} // Clean UI, you can keep it true if you prefer
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[location.lat, location.lng]}>
                    <Popup>{title}</Popup>
                </Marker>

                {/* The Custom Button */}
                <LocateButton targetLocation={location} />
            </MapContainer>
        </div>
    );
};

export default PropertyDetailsMap;