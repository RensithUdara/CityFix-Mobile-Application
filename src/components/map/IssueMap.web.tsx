import { clusterIssues } from '../../utils/clusters';
import { createElement, useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IssueMapProps } from '../../types/map';
import { colors } from '../../theme';
export function IssueMap({ issues, selected, center, onSelect }: IssueMapProps) {
  const [zoom, setZoom] = useState(2);
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
    instance.on('zoomend', () => setZoom(instance.getZoom()));
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
    clusterIssues(issues, zoom).forEach((group) => {
      if (group.issues.length > 1) {
        const marker = L.marker([group.latitude, group.longitude], {
          icon: L.divIcon({
            className: 'cityfix-cluster',
            html: `<div style="background:#24674f;color:white;border:3px solid white;border-radius:50%;width:42px;height:42px;display:grid;place-items:center;font-weight:800">${group.issues.length}</div>`,
            iconSize: [42, 42],
            iconAnchor: [21, 21],
          }),
        })
          .bindTooltip(`${group.issues.length} reports`)
          .on('click', () => {
            if (zoom >= 19) onSelectRef.current(group.issues[0]);
            else map.current?.setView([group.latitude, group.longitude], Math.min(19, zoom + 2));
          });
        markers.current?.addLayer(marker);
        return;
      }
      const issue = group.issues[0];
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
  }, [issues, selected?.id, center, zoom]);
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
