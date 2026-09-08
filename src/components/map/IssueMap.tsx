import MapView, { Marker } from 'react-native-maps';
import { Issue } from '../../types/issue';
import { colors } from '../../theme';
import { EmptyState } from '../ui/EmptyState';
export function IssueMap({
  issues,
  selected,
  onSelect,
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
  return (
    <MapView
      style={{ flex: 1 }}
      region={{
        latitude: selected.latitude,
        longitude: selected.longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      }}
    >
      {issues
        .filter((issue) => issue.latitude != null && issue.longitude != null)
        .map((issue) => (
          <Marker
            key={issue.id}
            coordinate={{ latitude: issue.latitude!, longitude: issue.longitude! }}
            title={issue.title}
            description={issue.status}
            pinColor={issue.status === 'Resolved' ? colors.primary : colors.orange}
            onPress={() => onSelect(issue)}
          />
        ))}
    </MapView>
  );
}
