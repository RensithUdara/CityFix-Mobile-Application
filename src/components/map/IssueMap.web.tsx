import { createElement, useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IssueMapProps } from '../../types/map';
import { colors } from '../../theme';
export function IssueMap({ issues, selected, center, onSelect }: IssueMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, { scrollWheelZoom: false }).setView([0, 0], 2);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(instance);
    map.current = instance;
    markers.current = L.layerGroup().addTo(instance);
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      instance.remove();
      map.current = null;
      markers.current = null;
    };
  }, []);
  useEffect(() => {
    markers.current?.clearLayers();
    issues
      .filter((issue) => issue.latitude != null && issue.longitude != null)
      .forEach((issue) => {
        const label = document.createElement('span');
        label.textContent = issue.title;
        const marker = L.circleMarker([issue.latitude!, issue.longitude!], {
          radius: selected?.id === issue.id ? 13 : 9,
          color: 'white',
          weight: 3,
          fillColor: issue.status === 'Resolved' ? colors.primary : colors.orange,
          fillOpacity: 1,
        })
          .bindTooltip(label)
          .on('click', () => onSelectRef.current(issue));
        markers.current?.addLayer(marker);
      });
    if (center)
      markers.current?.addLayer(
        L.circleMarker([center.latitude, center.longitude], {
          radius: 8,
          color: 'white',
          fillColor: '#2585CC',
          fillOpacity: 1,
        }).bindTooltip('Your location'),
      );
  }, [issues, selected?.id, center]);
  const latitude = center?.latitude ?? selected?.latitude;
  const longitude = center?.longitude ?? selected?.longitude;
  useEffect(() => {
    if (latitude != null && longitude != null) map.current?.setView([latitude, longitude], 15);
  }, [latitude, longitude]);
  return createElement('div', {
    ref: container,
    'aria-label': 'Community issue map',
    style: { width: '100%', height: '100%', zIndex: 0 },
  });
}
