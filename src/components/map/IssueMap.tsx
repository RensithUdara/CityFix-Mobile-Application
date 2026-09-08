import { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { IssueMapProps } from '../../types/map';
import { colors } from '../../theme';
export function IssueMap({ issues, selected, center, onSelect }: IssueMapProps) {
  const map = useRef<MapView>(null);
  const latitude = center?.latitude ?? selected?.latitude;
  const longitude = center?.longitude ?? selected?.longitude;
  useEffect(() => { if (latitude != null && longitude != null) map.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 }, 400); }, [latitude, longitude]);
  return <MapView ref={map} style={{ flex: 1 }} initialRegion={latitude != null && longitude != null ? { latitude, longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 } : { latitude: 0, longitude: 0, latitudeDelta: 120, longitudeDelta: 120 }} showsCompass showsScale onMapReady={() => { if (latitude != null && longitude != null) map.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 }, 0); }}>
    {center && <Marker coordinate={center} title="Your location" pinColor="#2585CC" />}
    {issues.filter(issue => issue.latitude != null && issue.longitude != null).map(issue => <Marker key={issue.id} coordinate={{ latitude: issue.latitude!, longitude: issue.longitude! }} title={issue.title} description={issue.status} pinColor={issue.status === 'Resolved' ? colors.primary : colors.orange} onPress={() => onSelect(issue)} />)}
  </MapView>;
}
