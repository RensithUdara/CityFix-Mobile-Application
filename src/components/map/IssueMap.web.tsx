import { createElement } from 'react';
import { Issue } from '../../types/issue';
import { EmptyState } from '../ui/EmptyState';
export function IssueMap({
  selected,
}: {
  issues: Issue[];
  selected?: Issue;
  onSelect: (issue: Issue) => void;
}) {
  if (selected?.latitude == null || selected.longitude == null)
    return (
      <EmptyState
        title="No map location"
        description="Choose a report with GPS coordinates to see its location."
      />
    );
  const lat = selected.latitude;
  const lon = selected.longitude;
  const bbox = `${lon - 0.012},${lat - 0.008},${lon + 0.012},${lat + 0.008}`;
  return createElement('iframe', {
    title: 'Neighborhood map from OpenStreetMap',
    src: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`,
    style: { border: 0, width: '100%', height: '100%', minHeight: 370 },
    loading: 'lazy',
  });
}
