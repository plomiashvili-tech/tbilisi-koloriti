import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import CategoryPicker from '../components/CategoryPicker';
import RegionPicker from '../components/RegionPicker';
import { createReport, getUserReportCount } from '../lib/reports';
import { getDeviceId } from '../lib/deviceId';
import { awardPoints } from '../lib/auth.web';
import { useAuth } from '../lib/authContext.web';
import { ReportCategory, RootStackParamList, POINT_VALUES } from '../types';

type Route = RouteProp<RootStackParamList, 'Submit'>;

export default function SubmitScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { mediaUri, mediaType } = route.params;
  const mediaBlob: Blob | undefined = (route.params as any).mediaBlob;
  const { user, refreshUser } = useAuth();

  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [street, setStreet] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<any>(null);

  // Inject <video> or <img> preview
  useEffect(() => {
    const container = videoContainerRef.current as HTMLDivElement | null;
    if (!container) return;

    if (mediaType === 'video') {
      const vid = document.createElement('video');
      vid.src = mediaUri;
      vid.autoplay = true;
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      Object.assign(vid.style, { width: '100%', height: '240px', objectFit: 'cover', display: 'block', background: '#000' });
      container.appendChild(vid);
      videoRef.current = vid;
      return () => vid.remove();
    } else {
      const img = document.createElement('img');
      img.src = mediaUri;
      Object.assign(img.style, { width: '100%', height: '240px', objectFit: 'cover', display: 'block' });
      container.appendChild(img);
      return () => img.remove();
    }
  }, [mediaUri, mediaType]);

  // Get browser location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setLocation({ latitude: 41.6938, longitude: 44.8015 }) // default: Tbilisi center
      );
    } else {
      setLocation({ latitude: 41.6938, longitude: 44.8015 });
    }
  }, []);

  async function handleSubmit() {
    if (!category) { alert('Please choose a category.'); return; }
    if (!location) { alert('Getting your location, please wait…'); return; }
    setSubmitting(true);
    try {
      const deviceId = await getDeviceId();
      await (createReport as any)({
        category, description, street, region, location,
        mediaUri, mediaBlob, mediaType, deviceId,
        reporterUserId: user?.id,
        reporterUserName: user?.name,
      });
      // Award points + badges
      if (user) {
        const count = await getUserReportCount(user.id);
        const badges: string[] = [];
        if (count === 1) badges.push('first_report');
        if (count === 5) badges.push('reporter_5');
        if (count === 10) badges.push('reporter_10');
        awardPoints(user.id, POINT_VALUES.REPORT, badges);
        refreshUser();
      }
      alert('Report submitted! Thank you for helping Tbilisi. +10 points 🎉');
      navigation.navigate('Main' as never);
    } catch {
      alert('Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Media preview container — native media elements injected here */}
        <View ref={videoContainerRef} style={styles.mediaBox} />

        {/* Location */}
        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText}>
            {location
              ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
              : 'Getting location…'}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Category *</Text>
        <CategoryPicker selected={category} onSelect={setCategory} />

        {/* Street */}
        <Text style={[styles.sectionLabel, { marginTop: 20, paddingHorizontal: 16 }]}>
          Street name (optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Rustaveli Avenue, Agmashenebeli…"
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

        <Text style={[styles.sectionLabel, { marginTop: 20, paddingHorizontal: 16 }]}>
          Description (optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Describe the problem briefly…"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          multiline numberOfLines={3} maxLength={300}
        />

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnOff]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Report</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1FAEE' },
  content: { paddingBottom: 40 },
  mediaBox: { width: '100%', height: 240, backgroundColor: '#111' } as any,
  locationRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 8,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  locationPin: { fontSize: 16 },
  locationText: { fontSize: 13, color: '#457B9D', fontWeight: '500' },
  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: '#1D3557',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: 20, marginBottom: 10,
  },
  input: {
    marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 10,
    padding: 14, fontSize: 15, color: '#1D3557', textAlignVertical: 'top',
    borderWidth: 1, borderColor: '#e8e8e8', minHeight: 80,
  },
  submitBtn: {
    margin: 16, marginTop: 28, backgroundColor: '#E63946',
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  submitBtnOff: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
