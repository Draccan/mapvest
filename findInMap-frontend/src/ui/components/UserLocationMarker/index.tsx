import L from "leaflet";
import React, { useEffect, useState } from "react";
import { Popup, Marker, useMap } from "react-leaflet";

import getFormattedMessageWithScope from "../../../utils/getFormattedMessageWithScope";
import "./style.css";

const fm = getFormattedMessageWithScope("components.UserLocationMarker");

interface UserLocationMarkerProps {
    onClick?: (lng: number, lat: number) => void;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
    onClick,
}) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMap();

    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const newPosition = L.latLng(
                        pos.coords.latitude,
                        pos.coords.longitude,
                    );
                    setPosition(newPosition);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                },
            );

            return () => {
                navigator.geolocation.clearWatch(watchId);
            };
        }
    }, [map]);

    if (!position) {
        return null;
    }

    return (
        <Marker
            position={position}
            icon={L.divIcon({
                className: "c-user-location-marker",
                html: `
                    <div class="c-user-location-marker-wrapper">
                        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                                    <feOffset dx="0" dy="2" result="offsetblur"/>
                                    <feComponentTransfer>
                                        <feFuncA type="linear" slope="0.3"/>
                                    </feComponentTransfer>
                                    <feMerge>
                                        <feMergeNode/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            <path d="M 16 4 L 26 24 L 16 20 L 6 24 Z" 
                                  fill="#FF4444" 
                                  stroke="#CC0000" 
                                  stroke-width="1.5" 
                                  filter="url(#shadow)"/>
                            <circle cx="16" cy="16" r="2" fill="#FFFFFF" opacity="0.9"/>
                        </svg>
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            })}
            eventHandlers={
                onClick
                    ? {
                          click: (e) => {
                              e.originalEvent.stopPropagation();
                              onClick(position.lng, position.lat);
                          },
                      }
                    : undefined
            }
        >
            <Popup>{fm("userLocation")}</Popup>
        </Marker>
    );
};
