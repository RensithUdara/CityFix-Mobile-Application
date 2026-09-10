import { MapCenter } from '../types/map';
export type Place = MapCenter & { label: string; id: string };
const endpoint = (process.env.EXPO_PUBLIC_GEOCODER_URL || 'https://photon.komoot.io').replace(
  /\/$/,
  '',
);
export function parsePlaces(data: any): Place[] {
  return (Array.isArray(data?.features) ? data.features : []).flatMap((f: any, i: number) => {
    const [longitude, latitude] = f.geometry?.coordinates || [];
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    )
      return [];
    const p = f.properties || {};
    const label = [
      ...new Set(
        [
          p.name,
          [p.housenumber, p.street].filter(Boolean).join(' '),
          p.city || p.town || p.village,
          p.state,
          p.country,
        ].filter(Boolean),
      ),
    ]
      .join(', ')
      .slice(0, 300);
    return label ? [{ id: `${p.osm_type}-${p.osm_id}-${i}`, label, latitude, longitude }] : [];
  });
}
export async function searchPlaces(query: string, signal: AbortSignal): Promise<Place[]> {
  const response = await fetch(`${endpoint}/api/?q=${encodeURIComponent(query.trim())}&limit=5`, {
    signal,
  });
  if (!response.ok)
    throw new Error('Address search is unavailable. You can still place a pin on the map.');
  return parsePlaces(await response.json());
}
export async function reversePlace(point: MapCenter, signal: AbortSignal): Promise<string> {
  const response = await fetch(
    `${endpoint}/reverse?lat=${point.latitude}&lon=${point.longitude}&limit=1`,
    { signal },
  );
  if (!response.ok) throw new Error('Address lookup unavailable.');
  return (
    parsePlaces(await response.json())[0]?.label ||
    `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`
  );
}
