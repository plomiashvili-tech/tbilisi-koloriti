import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getUserReports } from '../lib/reports';
import { getDeviceId } from '../lib/deviceId';
import { CATEGORIES, Report, RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_LABELS: Record<Report['status'], { label: string; color: string }> = {
  open: { label: 'Open', color: '#E63946' },
  in_progress: { label: 'In Progress', color: '#F4A261' },
  resolved: { label: 'Resolved', color: '#2DC653' },
};

export default function MyReportsScreen() {
  const navigation = useNavigation<Nav>();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const deviceId = await getDeviceId();
      const data = await getUserReports(deviceId);
      setReports(data);
    } catch {
      // silent fail on refresh
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No reports yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button on the map to report a problem
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load(true);
          }}
          tintColor="#E63946"
        />
      }
      renderItem={({ item }) => {
        const cat = CATEGORIES.find((c) => c.key === item.category);
        const status = STATUS_LABELS[item.status];
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
            activeOpacity={0.75}
          >
            <Image source={{ uri: item.mediaUrl }} style={styles.thumb} />
            <View style={styles.info}>
              <View style={styles.row}>
                <Text style={styles.categoryIcon}>{cat?.icon}</Text>
                <Text style={styles.categoryLabel}>{cat?.label}</Text>
                <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>
                    {status.label}
                  </Text>
                </View>
              </View>
              {item.description ? (
                <Text style={styles.desc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <Text style={styles.date}>
                {item.createdAt.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1D3557' },
  emptySubtitle: { fontSize: 14, color: '#8D99AE', textAlign: 'center', paddingHorizontal: 40 },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  thumb: { width: 90, height: 90, backgroundColor: '#eee' },
  info: { flex: 1, padding: 12, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryIcon: { fontSize: 16 },
  categoryLabel: { fontSize: 14, fontWeight: '700', color: '#1D3557', flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  desc: { fontSize: 13, color: '#8D99AE', lineHeight: 18 },
  date: { fontSize: 12, color: '#aaa' },
});
