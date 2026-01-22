'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({
  lat,
  lng,
  onPick,
}: {
  lat: number;
  lng: number;
  onPick: (lat: number, lng: number) => void;
}) {
  const center: [number, number] = [54.7388, 55.9721]; // Уфа
  const pos: [number, number] = [lat || center[0], lng || center[1]];

  return (
    <div className="card" style={{ padding: 12 }}>
      <MapContainer center={pos} zoom={12} scrollWheelZoom style={{ height: 320, width: '100%', borderRadius: 14 }}>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onPick={onPick} />
        <Marker position={pos} icon={icon} />
      </MapContainer>
      <div className="muted" style={{ marginTop: 8 }}>Кликни по карте, чтобы поставить точку (lat/lng).</div>
    </div>
  );
}
