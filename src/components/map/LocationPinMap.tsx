import { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { MapCenter } from '../../types/map';
export type PinMapProps = {
  point: MapCenter | null;
  focus: MapCenter | null;
  onChange: (point: MapCenter) => void;
};
export function LocationPinMap({ point, focus, onChange }: PinMapProps) {
  const ref = useRef<MapView>(null);
  useEffect(() => {
    if (focus)
      ref.current?.animateToRegion({ ...focus, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 300);
  }, [focus]);
  return (
    <MapView
      ref={ref}
      style={{ flex: 1 }}
      initialRegion={
        focus
          ? { ...focus, latitudeDelta: 0.02, longitudeDelta: 0.02 }
          : { latitude: 0, longitude: 0, latitudeDelta: 120, longitudeDelta: 120 }
      }
      onPress={(e) => onChange(e.nativeEvent.coordinate)}
    >
      {point && (
        <Marker
          draggable
          coordinate={point}
          title="Selected location"
          onDragEnd={(e) => onChange(e.nativeEvent.coordinate)}
        />
      )}
    </MapView>
  );
}
