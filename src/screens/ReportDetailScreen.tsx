import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { getReport } from '../lib/reports';
import { CATEGORIES, Report, RootStackParamList } from '../types';

type Route = RouteProp<RootStackParamList, 'ReportDetail'>;

const STATUS_META: Record<Report['status'], { label: string; color: string; icon: string }> = {
  open: { label: 'Open', color: '#E63946', icon: '🔴' },
  in_progress: { label: 'In Progress', color: '#F4A261', icon: '🟡' },
  resolved: { label: 'Resolved', color: '#2DC653', icon: '🟢' },
};

export default function ReportDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReport(route.params.reportId)
      .then(setReport)
      .finally(() => setLoading(false));
  }, [route.params.reportId]);

  const player = useVideoPlayer(
    report?.mediaType === 'video' ? report.mediaUrl : null,
    (p) => {
      p.loop = true;
      p.play();
    }
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Report not found</Text>
      </View>
    );
  }

  const cat = CATEGORIES.find((c) => c.key === report.category);
  const status = STATUS_META[report.status];

  return (
    <ScrollView style={styles.container}>
      {/* Media */}
      {report.mediaType === 'photo' ? (
        <Image source={{ uri: report.mediaUrl }} style={styles.media} resizeMode="cover" />
      ) : (
        <VideoView player={player} style={styles.media} contentFit="cover" />
      )}

      <View style={styles.body}>
        {/* Category + status */}
        <View style={styles.headerRow}>
          <View style={styles.catBadge}>
            <Text style={styles.catIcon}>{cat?.icon}</Text>
            <Text style={[styles.catLabel, { color: cat?.color }]}>{cat?.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
            <Text style={styles.statusIcon}>{status.icon}</Text>
            <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Description */}
        {report.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{report.description}</Text>
          </View>
        ) : null}

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.locationText}>
              {report.location.latitude.toFixed(5)},{' '}
              {report.location.longitude.toFixed(5)}
            </Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reported on</Text>
          <Text style={styles.dateText}>
            {report.createdAt.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1FAEE' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 16, color: '#8D99AE' },
  media: { width: '100%', height: 300, backgroundColor: '#000' },
  body: { padding: 20, gap: 4 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catIcon: { fontSize: 24 },
  catLabel: { fontSize: 18, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusIcon: { fontSize: 12 },
  statusLabel: { fontWeight: '700', fontSize: 13 },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8D99AE',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  description: { fontSize: 15, color: '#1D3557', lineHeight: 22 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationPin: { fontSize: 16 },
  locationText: { fontSize: 14, color: '#457B9D', fontWeight: '500' },
  dateText: { fontSize: 14, color: '#1D3557' },
});
