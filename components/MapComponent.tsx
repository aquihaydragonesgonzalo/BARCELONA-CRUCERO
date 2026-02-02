import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { ItineraryItem, UserLocation, Coords } from '../types';
import { GPX_WAYPOINTS, BARCELONA_TRACK } from '../constants';

// Fix Leaflet's default icon path issues in some bundlers
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

interface MapComponentProps {
    activities: ItineraryItem[];
    userLocation: UserLocation | null;
    focusedLocation: Coords | null;
}

export const MapComponent: React.FC<MapComponentProps> = ({ activities, userLocation, focusedLocation }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const userAccuracyCircleRef = useRef<L.Circle | null>(null);
    const staticLayersRef = useRef<L.LayerGroup | null>(null);

    // Initialize Map with Layers
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;
        
        // 1. Capa Callejero (Voyager)
        const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { 
            maxZoom: 18, 
            attribution: '&copy; OpenStreetMap' 
        });

        // 2. Capa Satélite (Esri World Imagery)
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
        });

        // Inicializar mapa con la capa callejero por defecto
        const map = L.map(mapContainerRef.current, { 
            zoomControl: false,
            layers: [streetLayer] 
        }).setView([41.38, 2.17], 13);
        
        // Control de Capas (arriba a la derecha)
        const baseMaps = {
            "Mapa": streetLayer,
            "Satélite": satelliteLayer
        };
        
        // Añadir control de capas con estilo customizado vía CSS global si fuera necesario, 
        // pero el defecto de Leaflet funciona bien.
        L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(map);

        staticLayersRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
        
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Update Static Layers (Activities, Track, Waypoints)
    useEffect(() => {
        const map = mapInstanceRef.current;
        const staticGroup = staticLayersRef.current;
        if (!map || !staticGroup) return;
        
        staticGroup.clearLayers();

        // Activity Markers
        activities.forEach(act => {
            const marker = L.marker([act.coords.lat, act.coords.lng], { icon: defaultIcon });
            const navUrl = act.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${act.coords.lat},${act.coords.lng}`;
            
            const popupContent = `
                <div style="padding: 4px; min-width: 180px; font-family: 'Roboto Condensed', sans-serif;">
                <h3 style="margin: 0 0 4px 0; font-weight: 800; color: #1e3a8a; font-size: 14px; text-transform: uppercase;">${act.title}</h3>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #475569; line-height: 1.4;">${act.description}</p>
                <a href="${navUrl}" target="_blank" style="display: block; width: 100%; text-align: center; background-color: #1e3a8a; color: white; text-decoration: none; font-weight: 700; font-size: 11px; padding: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    INICIAR RUTA
                </a>
                </div>
            `;

            marker.bindPopup(popupContent, { maxWidth: 240 });
            staticGroup.addLayer(marker);
        });

        // GPX Waypoints
        GPX_WAYPOINTS.forEach(wpt => {
            const circleMarker = L.circleMarker([wpt.lat, wpt.lng], {
                radius: 6,
                fillColor: "#BE123C",
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });
            circleMarker.bindPopup(`<div style="font-size: 12px; font-weight: bold; color: #BE123C;">${wpt.name}</div>`);
            staticGroup.addLayer(circleMarker);
        });

        // Track Line
        const trackLine = L.polyline(BARCELONA_TRACK, { color: '#1e3a8a', weight: 4, opacity: 0.7, dashArray: '8, 12' });
        staticGroup.addLayer(trackLine);
    }, [activities]);

    // Update User Location
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !userLocation) return;
        
        const userPos: L.LatLngExpression = [userLocation.lat, userLocation.lng];

        // Accuracy Circle
        if (userAccuracyCircleRef.current) {
            userAccuracyCircleRef.current.setLatLng(userPos);
            if (userLocation.accuracy) userAccuracyCircleRef.current.setRadius(userLocation.accuracy);
        } else {
            userAccuracyCircleRef.current = L.circle(userPos, {
                radius: userLocation.accuracy || 0,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.15,
                weight: 1
            }).addTo(map);
        }

        // Pulsing Marker
        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(userPos);
        } else {
            const userIcon = L.divIcon({ 
                className: 'user-marker', 
                html: `
                    <div style="position: relative; width: 18px; height: 18px;">
                        <div style="position: absolute; top: 0; left: 0; background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5); z-index: 2;"></div>
                        <div style="position: absolute; top: 0; left: 0; background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; animation: user-pulse 2s infinite; z-index: 1;"></div>
                    </div>
                `, 
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            });
            userMarkerRef.current = L.marker(userPos, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        }
    }, [userLocation]);

    // Fly to Focus
    useEffect(() => { 
        if (mapInstanceRef.current && focusedLocation) {
            mapInstanceRef.current.flyTo([focusedLocation.lat, focusedLocation.lng], 16, { duration: 1.5 }); 
        }
    }, [focusedLocation]);

    return <div ref={mapContainerRef} className="w-full h-full z-0" />;
};