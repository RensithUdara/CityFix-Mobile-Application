import { createElement } from 'react';
import { Issue } from '../../types/issue';
export function IssueMap({ selected }: { issues: Issue[]; selected?: Issue; onSelect: (issue: Issue) => void }) {
  const lat = selected?.latitude ?? 6.9147;
  const lon = selected?.longitude ?? 79.8585;
  const bbox = `${lon - 0.012},${lat - 0.008},${lon + 0.012},${lat + 0.008}`;
  return createElement('iframe', { title: 'Neighborhood map from OpenStreetMap', src: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`, style: { border: 0, width: '100%', height: '100%', minHeight: 370 }, loading: 'lazy' });
}
