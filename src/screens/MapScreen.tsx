import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllReports } from '../lib/reports';
import { CATEGORIES, Report, RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function buildMapHtml(reports: Report[]): string {
  const markers = reports
    .map((r) => {
      const cat = CATEGORIES.find((c) => c.key === r.category);
      return `
        L.circleMarker([${r.location.latitude}, ${r.location.longitude}], {
          radius: 10,
          fillColor: "${cat?.color ?? '#8D99AE'}",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        })
        .bindTooltip("${cat?.icon ?? ''} ${cat?.label ?? r.category}", { permanent: false })
        .on('click', function() { window.ReactNativeWebView.postMessage("${r.id}"); })
        .addTo(map);
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([41.6938, 44.8015], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    ${markers}
  </script>
</body>
</html>`;
}

export default function MapScreen() {
  const navigation = useNavigation<Nav>();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapHtml, setMapHtml] = useState(buildMapHtml([]));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllReports();
      setReports(data);
      setMapHtml(buildMapHtml(data));
    } catch {
      Alert.alert('Error', 'Could not load reports. Is the emulator running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function handleMessage(reportId: string) {
    navigation.navigate('ReportDetail', { reportId });
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: mapHtml }}
        style={styles.map}
        originWhitelist={['*']}
        onMessage={(e) => handleMessage(e.nativeEvent.data)}
        javaScriptEnabled
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Camera')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{reports.length} reports</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: { fontSize: 32, color: '#fff', lineHeight: 36 },
  badge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(29,53,87,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
