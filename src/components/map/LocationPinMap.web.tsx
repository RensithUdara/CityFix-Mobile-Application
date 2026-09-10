import { createElement, useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapCenter } from '../../types/map';
type PinMapProps = {
  point: MapCenter | null;
  focus: MapCenter | null;
  onChange: (point: MapCenter) => void;
};
export function LocationPinMap({ point, focus, onChange }: PinMapProps) {
  const container = useRef<HTMLDivElement>(null),
    map = useRef<L.Map | null>(null),
    marker = useRef<L.Marker | null>(null),
    change = useRef(onChange);
  change.current = onChange;
  useEffect(() => {
    if (!container.current) return;
    const m = L.map(container.current).setView([0, 0], 2);
    map.current = m;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    m.on('click', (e) => change.current({ latitude: e.latlng.lat, longitude: e.latlng.lng }));
    const observer = new ResizeObserver(() => m.invalidateSize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      m.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);
  useEffect(() => {
    if (focus) map.current?.setView([focus.latitude, focus.longitude], 15);
  }, [focus]);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!point) {
      marker.current?.remove();
      marker.current = null;
      return;
    }
    if (marker.current) marker.current.setLatLng([point.latitude, point.longitude]);
    else {
      const pin = L.marker([point.latitude, point.longitude], {
        draggable: true,
        icon: L.divIcon({
          className: 'cityfix-pin',
          html: '<div style="width:28px;height:28px;background:#24634c;border:4px solid white;border-radius:50%;box-shadow:0 2px 8px #0005"></div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      }).addTo(m);
      pin.on('dragend', () => {
        const p = pin.getLatLng();
        change.current({ latitude: p.lat, longitude: p.lng });
      });
      marker.current = pin;
    }
  }, [point]);
  return createElement('div', {
    ref: container,
    'aria-label': 'Choose report location on map',
    style: { width: '100%', height: '100%' },
  });
}
