import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import { VideoView, useVideoPlayer } from 'expo-video';
import CategoryPicker from '../components/CategoryPicker';
import RegionPicker from '../components/RegionPicker';
import { createReport } from '../lib/reports';
import { getDeviceId } from '../lib/deviceId';
import { ReportCategory, RootStackParamList } from '../types';

type Route = RouteProp<RootStackParamList, 'Submit'>;

export default function SubmitScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { mediaUri, mediaType } = route.params;

  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [street, setStreet] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const player = useVideoPlayer(mediaType === 'video' ? mediaUri : null, (p) => {
    p.loop = true;
    p.play();
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  async function handleSubmit() {
    if (!category) {
      Alert.alert('Select category', 'Please choose a category for this report.');
      return;
    }
    if (!location) {
      Alert.alert('Location unavailable', 'Waiting for GPS location. Please try again.');
      return;
    }

    setSubmitting(true);
    try {
      const deviceId = await getDeviceId();
      await createReport({
        category,
        description,
        street,
        region,
        location,
        mediaUri,
        mediaType,
        deviceId,
      });
      Alert.alert('Submitted!', 'Your report has been submitted. Thank you!', [
        { text: 'OK', onPress: () => navigation.navigate('Main' as never) },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not submit report. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Media preview */}
        {mediaType === 'photo' ? (
          <Image source={{ uri: mediaUri }} style={styles.media} resizeMode="cover" />
        ) : (
          <VideoView player={player} style={styles.media} contentFit="cover" />
        )}

        {/* Location */}
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            {location
              ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
              : 'Getting location...'}
          </Text>
        </View>

        {/* Category */}
        <Text style={styles.sectionLabel}>Category *</Text>
        <CategoryPicker selected={category} onSelect={setCategory} />

        {/* Street */}
        <Text style={[styles.sectionLabel, { marginTop: 20, paddingHorizontal: 16 }]}>
          Street name (optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Rustaveli Avenue, Agmashenebeli..."
          placeholderTextColor="#aaa"
          value={street}
          onChangeText={setStreet}
          maxLength={100}
        />

        {/* Region */}
        <Text style={[styles.sectionLabel, { marginTop: 20, paddingHorizontal: 16 }]}>
          Region / Neighbourhood (optional)
        </Text>
        <RegionPicker value={region} onChange={setRegion} />

        {/* Description */}
        <Text style={[styles.sectionLabel, { marginTop: 20, paddingHorizontal: 16 }]}>
          Description (optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Describe the problem briefly..."
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          maxLength={300}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1FAEE' },
  content: { paddingBottom: 40 },
  media: {
    width: '100%',
    height: 240,
    backgroundColor: '#000',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  locationIcon: { fontSize: 16 },
  locationText: { fontSize: 13, color: '#457B9D', fontWeight: '500' },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D3557',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#1D3557',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    minHeight: 80,
  },
  submitBtn: {
    margin: 16,
    marginTop: 28,
    backgroundColor: '#E63946',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
