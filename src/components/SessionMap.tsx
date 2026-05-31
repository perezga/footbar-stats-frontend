import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { GeoPoint } from '../api/types.js';

const ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  location: GeoPoint;
}

export function SessionMap({ location }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const coords = location.coordinates;
    const [lng, lat] = coords;
    if (typeof lng !== 'number' || typeof lat !== 'number') return;

    if (!mapRef.current) {
      mapRef.current = L.map(ref.current, { zoomControl: true }).setView([lat, lng], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
      L.marker([lat, lng], { icon: ICON }).addTo(mapRef.current);
    } else {
      mapRef.current.setView([lat, lng], 16);
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [location]);

  return <div ref={ref} className="h-64 w-full rounded-xl border border-slate-800" />;
}
