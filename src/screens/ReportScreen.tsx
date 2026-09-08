import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { CategoryFilter } from '../components/issues/CategoryFilter';
import { useIssueStore } from '../store/issueStore';
import { Category, NewIssue } from '../types/issue';
import { currentLocation, pickPhotos } from '../services/device';
import { LocalPhoto, MAX_REPORT_PHOTOS } from '../types/photo';
import { PhotoPicker } from '../components/issues/PhotoPicker';
import { usePreferencesStore } from '../store/preferencesStore';
import { errorMessage } from '../utils/errors';
import { colors } from '../theme';
type FormData = Pick<NewIssue, 'title' | 'description' | 'address'>;
export function ReportScreen({ navigation }: NativeStackScreenProps<RootStackParams, 'Report'>) {
  const { control, handleSubmit, setValue } = useForm<FormData>({
    defaultValues: { title: '', description: '', address: '' },
  });
  const [category, setCategory] = useState<Category>('Roads');
  const [severity, setSeverity] = useState<NewIssue['severity']>(
    usePreferencesStore.getState().defaultSeverity,
  );
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [progress, setProgress] = useState('');
  const [picking, setPicking] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [located, setLocated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const addIssue = useIssueStore((s) => s.addIssue);
  const choosePhoto = async (camera: boolean) => {
    try {
      setError('');
      setPicking(true);
      const selected = await pickPhotos(camera, MAX_REPORT_PHOTOS - photos.length);
      setPhotos((current) => [...current, ...selected].slice(0, MAX_REPORT_PHOTOS));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to select photo. Please try again.');
    } finally {
      setPicking(false);
    }
  };
  const locate = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await currentLocation();
      setCoords(result);
      setLocated(true);
      setValue('address', `${result.latitude.toFixed(5)}, ${result.longitude.toFixed(5)}`, {
        shouldValidate: true,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to find your location.');
    } finally {
      setBusy(false);
    }
  };
  const submit = handleSubmit(async (data) => {
    if (photos.length < 1) {
      setError('Add at least one photo before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const id = await addIssue(
        {
          ...data,
          title: data.title.trim(),
          description: data.description.trim(),
          address: data.address.trim(),
          category,
          severity,
          photos,
          ...coords,
        },
        setProgress,
      );
      navigation.replace('IssueDetails', { id });
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });
  return (
    <Screen>
      <View style={{ maxWidth: 720, width: '100%', alignSelf: 'center', gap: 26 }}>
        <SectionHeader
          title="Let’s make it better."
          subtitle="A minute of your time can make a difference for everyone."
        />
        <View style={styles.note}>
          <Icon name="heart" size={18} color={colors.primary} />
          <Text style={styles.noteText}>Every report is a step toward a happier neighborhood.</Text>
        </View>
        <PhotoPicker
          photos={photos}
          onAdd={choosePhoto}
          disabled={picking || submitting}
          onRemove={(id) => setPhotos((current) => current.filter((photo) => photo.id !== id))}
          onCover={(id) =>
            setPhotos((current) => [
              ...current.filter((photo) => photo.id === id),
              ...current.filter((photo) => photo.id !== id),
            ])
          }
        />
        <Text style={styles.label}>02 / Tell us a little more</Text>
        <CategoryFilter all={false} value={category} onChange={(v) => setCategory(v as Category)} />
        <Controller
          control={control}
          name="title"
          rules={{
            validate: (v) => v.trim().length >= 5 || 'Use at least 5 characters for the title.',
            maxLength: { value: 90, message: 'Keep the title under 90 characters.' },
          }}
          render={({ field, fieldState }) => (
            <Field
              label="Issue title"
              placeholder="e.g. Broken streetlight near the library"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          rules={{
            validate: (v) =>
              v.trim().length >= 15 || 'Please add at least 15 characters of detail.',
          }}
          render={({ field, fieldState }) => (
            <Field
              label="What’s happening?"
              maxLength={5000}
              multiline
              placeholder="Describe the issue and anything that would help the team…"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>How urgent is it?</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['Low', 'Medium', 'High'] as const).map((s) => (
              <Pressable
                key={s}
                accessibilityRole="button"
                accessibilityState={{ selected: severity === s }}
                onPress={() => setSeverity(s)}
                style={[
                  styles.severity,
                  severity === s && { borderColor: colors.primary, backgroundColor: colors.pale },
                ]}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 5,
                    backgroundColor:
                      s === 'High'
                        ? colors.danger
                        : s === 'Medium'
                          ? colors.orange
                          : colors.primary,
                  }}
                />
                <Text style={styles.label}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={styles.label}>03 / Pin the place</Text>
        <Controller
          control={control}
          name="address"
          rules={{ validate: (v) => v.trim().length >= 5 || 'Please enter a street or location.' }}
          render={({ field, fieldState }) => (
            <Field
              label="Location"
              maxLength={300}
              placeholder="Street, area, or nearest landmark"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          secondary
          icon="navigation"
          label={
            busy
              ? 'Finding your location…'
              : located
                ? 'Update GPS location'
                : 'Use my current location'
          }
          onPress={locate}
          disabled={busy}
        />
        <Text style={styles.hint}>
          {located
            ? 'GPS coordinates attached.'
            : 'Without GPS, your address is saved without a map pin.'}
        </Text>
        {!!error && (
          <Text accessibilityRole="alert" style={{ color: colors.danger }}>
            {error}
          </Text>
        )}
        <Button
          icon="plus-circle"
          label={submitting ? progress || 'Preparing photos…' : 'Submit report'}
          onPress={submit}
          disabled={busy || submitting || picking}
        />
        <Text style={[styles.hint, { textAlign: 'center', lineHeight: 20 }]}>
          Reports are shared with the CityFix community.
        </Text>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  note: {
    backgroundColor: colors.pale,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  noteText: { color: colors.primary, fontSize: 12, flex: 1, lineHeight: 20 },
  label: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  hint: { color: colors.muted, fontSize: 11 },
  severity: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
