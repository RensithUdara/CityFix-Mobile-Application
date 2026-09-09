import { Text, View } from 'react-native';
import { clusterIssues } from '../../utils/clusters';
import { useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { IssueMapProps } from '../../types/map';
import { colors } from '../../theme';
export function IssueMap({ issues, selected, center, onSelect }: IssueMapProps) {
  const map = useRef<MapView>(null);
  const [zoom, setZoom] = useState(12);
  const latitude = center?.latitude ?? selected?.latitude;
  const longitude = center?.longitude ?? selected?.longitude;
  useEffect(() => {
    if (latitude != null && longitude != null)
      map.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 },
        400,
      );
  }, [latitude, longitude]);
  return (
    <MapView
      ref={map}
      style={{ flex: 1 }}
      initialRegion={
        latitude != null && longitude != null
          ? { latitude, longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 }
          : { latitude: 0, longitude: 0, latitudeDelta: 120, longitudeDelta: 120 }
      }
      onRegionChangeComplete={(region) =>
        setZoom(Math.log2(360 / Math.max(0.0001, region.longitudeDelta)))
      }
      showsCompass
      showsScale
      onMapReady={() => {
        if (latitude != null && longitude != null)
          map.current?.animateToRegion(
            { latitude, longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 },
            0,
          );
      }}
    >
      {center && <Marker coordinate={center} title="Your location" pinColor="#2585CC" />}
      {clusterIssues(issues, zoom).map((group) =>
        group.issues.length === 1 ? (
          <Marker
            key={group.id}
            coordinate={group}
            title={group.issues[0].title}
            description={group.issues[0].status}
            pinColor={group.issues[0].status === 'Resolved' ? colors.primary : colors.orange}
            onPress={() => onSelect(group.issues[0])}
          />
        ) : (
          <Marker
            key={group.id}
            coordinate={group}
            title={`${group.issues.length} reports`}
            onPress={() => {
              if (zoom >= 19) onSelect(group.issues[0]);
              else
                map.current?.animateToRegion(
                  {
                    ...group,
                    latitudeDelta: 360 / 2 ** (zoom + 2),
                    longitudeDelta: 360 / 2 ** (zoom + 2),
                  },
                  300,
                );
            }}
          >
            <View
              style={{
                backgroundColor: colors.primary,
                borderColor: 'white',
                borderWidth: 3,
                borderRadius: 25,
                minWidth: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '800' }}>{group.issues.length}</Text>
            </View>
          </Marker>
        ),
      )}
    </MapView>
  );
}
