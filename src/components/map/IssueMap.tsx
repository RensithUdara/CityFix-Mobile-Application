import MapView, { Marker } from 'react-native-maps';
import { Issue } from '../../types/issue';
import { colors } from '../../theme';
export function IssueMap({ issues, selected, onSelect }: { issues: Issue[]; selected?: Issue; onSelect: (issue: Issue) => void }) {
  return <MapView style={{ flex: 1 }} region={{ latitude: selected?.latitude ?? 6.9147, longitude: selected?.longitude ?? 79.8585, latitudeDelta: 0.025, longitudeDelta: 0.025 }}>{issues.map(issue => <Marker key={issue.id} coordinate={{ latitude: issue.latitude, longitude: issue.longitude }} title={issue.title} description={issue.status} pinColor={issue.status === 'Resolved' ? colors.primary : colors.orange} onPress={() => onSelect(issue)} />)}</MapView>;
}
