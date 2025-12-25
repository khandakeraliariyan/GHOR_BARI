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

            // Check if this is a new target (different from last target)
            const lastTargetCenter = lastTarget.current.center;
            const isNewTarget = !lastTargetCenter ||
                Math.abs(lastTargetCenter.lat - lat) > 0.0001 ||
                Math.abs(lastTargetCenter.lng - lng) > 0.0001 ||
                Math.abs((lastTarget.current.zoom || 0) - newZoom) > 0.1;

            if (isNewTarget) {
                // Cancel any pending animation frame
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }

                // Stop any ongoing animation
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

        // Cleanup on unmount
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [flyTo, map]);
    return null;
};


const LocationMarker = ({ setValue }) => {
    const [position, setPosition] = useState(null);
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setValue("coordinates", { lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return position === null ? null : <Marker position={position} />;
};

const MapPicker = ({ setValue, flyTo }) => {
    return (
        <MapContainer
            center={[23.6850, 90.3563]}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController flyTo={flyTo} />
            <LocationMarker setValue={setValue} />
        </MapContainer>
    );
};

export default MapPicker;