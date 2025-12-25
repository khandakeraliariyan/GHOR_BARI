import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
            className="absolute z-[1000] top-3 right-3 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded shadow text-sm hover:bg-white/80"
        >
            📍 Locate Me
        </button>

    );
};


const MapPicker = ({ setValue, flyTo }) => {
    const [position, setPosition] = useState(null);

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
        </div>
    );
};

export default MapPicker;
