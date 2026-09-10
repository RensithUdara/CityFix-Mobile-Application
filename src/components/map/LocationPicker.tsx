import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { colors } from '../../theme';
import { MapCenter } from '../../types/map';
import { Place, searchPlaces, reversePlace } from '../../services/places';
import { currentLocation } from '../../services/device';
import { LocationPinMap } from './LocationPinMap';
type Props = {
  value: string;
  point: MapCenter | null;
  onChange: (address: string, point: MapCenter | null) => void;
  error?: string;
  disabled?: boolean;
};
export function LocationPicker({ value, point, onChange, error, disabled }: Props) {
  const [query, setQuery] = useState(''),
    [suggestions, setSuggestions] = useState<Place[]>([]),
    [searching, setSearching] = useState(false),
    [message, setMessage] = useState('');
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState<MapCenter | null>(null),
    [focus, setFocus] = useState<MapCenter | null>(null),
    [address, setAddress] = useState(''),
    [locating, setLocating] = useState(false);
  const sequence = useRef(0);
  const selectPin = (p: MapCenter) => {
    if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) return;
    const next = {
      latitude: Math.max(-90, Math.min(90, p.latitude)),
      longitude: ((((p.longitude + 180) % 360) + 360) % 360) - 180,
    };
    sequence.current++;
    setAddress(`${next.latitude.toFixed(5)}, ${next.longitude.toFixed(5)}`);
    setDraft(next);
  };
  useEffect(() => {
    setSuggestions([]);
    setMessage('');
    if (query.trim().length < 3) {
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const places = await searchPlaces(query, controller.signal);
        if (active) {
          setSuggestions(places);
          if (!places.length) setMessage('No matches. Try a nearby street or place a pin.');
        }
      } catch {
        if (active) setMessage('Search is unavailable. Enter an address or choose a map pin.');
      } finally {
        clearTimeout(timeout);
        if (active) setSearching(false);
      }
    }, 650);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  useEffect(() => {
    if (!open || !draft) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const version = ++sequence.current;
    setAddress(`${draft.latitude.toFixed(5)}, ${draft.longitude.toFixed(5)}`);
    void reversePlace(draft, controller.signal)
      .then((label) => {
        if (sequence.current === version) setAddress(label);
      })
      .catch(() => {});
    return () => {
      sequence.current++;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [draft, open]);
  const gps = async () => {
    setLocating(true);
    setMessage('');
    try {
      const p = await currentLocation();
      if (open) {
        selectPin(p);
        setFocus(p);
      } else {
        setQuery('');
        onChange(`${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`, p);
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setLocating(false);
    }
  };
  return (
    <View style={{ gap: 12 }}>
      <Field
        label="Location"
        value={value}
        editable={!disabled && !locating}
        maxLength={300}
        placeholder="Search a street, area, or landmark"
        error={error}
        onChangeText={(text) => {
          onChange(text, null);
          setQuery(text);
        }}
      />
      {searching && <Text style={{ color: colors.muted }}>Searching places…</Text>}
      {suggestions.map((place) => (
        <Pressable
          key={place.id}
          accessibilityRole="button"
          accessibilityLabel={`Select location ${place.label}`}
          onPress={() => {
            setQuery('');
            setSuggestions([]);
            onChange(place.label, place);
          }}
          style={{
            padding: 14,
            borderRadius: 12,
            backgroundColor: colors.surface,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <Icon name="map-pin" color={colors.primary} />
          <Text style={{ flex: 1, color: colors.ink }}>{place.label}</Text>
        </Pressable>
      ))}
      <Text style={{ fontSize: 11, color: colors.muted }}>
        Address search: Photon · © OpenStreetMap contributors
      </Text>
      <Button
        secondary
        icon="map-pin"
        label="Choose location on map"
        disabled={disabled}
        onPress={() => {
          setQuery('');
          setDraft(point);
          setFocus(point);
          setAddress(value);
          setOpen(true);
        }}
      />
      <Button
        secondary
        icon="navigation"
        label={
          locating
            ? 'Finding your location…'
            : point
              ? 'Update GPS location'
              : 'Use my current location'
        }
        disabled={disabled || locating}
        onPress={() => void gps()}
      />
      {point && (
        <>
          <Text style={{ color: colors.primary, fontSize: 12 }}>GPS coordinates attached.</Text>
          <Pressable accessibilityRole="link" onPress={() => onChange(value, null)}>
            <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>
              Remove map pin
            </Text>
          </Pressable>
        </>
      )}
      {!!message && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {message}
        </Text>
      )}
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            style={{
              flex: 1,
              padding: 20,
              gap: 15,
              maxWidth: 900,
              width: '100%',
              alignSelf: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                accessibilityRole="header"
                style={{ fontSize: 23, fontWeight: '800', color: colors.ink }}
              >
                Pin the exact place
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close location picker"
                onPress={() => setOpen(false)}
                style={{ padding: 12 }}
              >
                <Icon name="x" />
              </Pressable>
            </View>
            <Text style={{ color: colors.muted }}>
              Tap the map or drag the pin. Your selection is saved only when you confirm.
            </Text>
            <View style={{ flex: 1, minHeight: 180, borderRadius: 18, overflow: 'hidden' }}>
              {open && <LocationPinMap point={draft} focus={focus} onChange={selectPin} />}
            </View>
            <ScrollView style={{ maxHeight: 160 }}>
              <Text style={{ color: colors.ink, lineHeight: 22 }}>
                {draft ? address : 'Choose a point on the map to continue.'}
              </Text>
              {draft && (
                <Text style={{ color: colors.muted }}>
                  {draft.latitude.toFixed(5)}, {draft.longitude.toFixed(5)}
                </Text>
              )}
              {!!message && <Text style={{ color: colors.danger }}>{message}</Text>}
            </ScrollView>
            <Button
              secondary
              label={locating ? 'Finding your location…' : 'Center on my location'}
              disabled={locating}
              onPress={() => void gps()}
            />
            <Button
              label="Use this location"
              disabled={!draft || locating}
              onPress={() => {
                if (draft) {
                  onChange(address, draft);
                  setQuery('');
                  setOpen(false);
                }
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
