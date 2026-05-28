import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
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
          radius: 11, fillColor: "${cat?.color ?? '#8D99AE'}",
          color: "#fff", weight: 2, opacity: 1, fillOpacity: 0.9
        })
        .bindTooltip("${cat?.icon ?? ''} ${cat?.label ?? r.category}${r.region ? ' · ' + r.region : ''}", { permanent: false })
        .on('click', function() { window.parent.postMessage({type:'report',id:"${r.id}"},'*'); })
        .addTo(map);
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>* { margin:0;padding:0;box-sizing:border-box; } html,body,#map { width:100%;height:100%; }</style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([41.6938, 44.8015], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution:'© OpenStreetMap',maxZoom:19
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
  const [mapHtml, setMapHtml] = useState('');
  const iframeRef = useRef<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllReports();
      setReports(data);
      setMapHtml(buildMapHtml(data));
    } catch {
      setMapHtml(buildMapHtml([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'report') {
        navigation.navigate('ReportDetail', { reportId: e.data.id });
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {mapHtml ? (
        <iframe
          ref={iframeRef}
          srcDoc={mapHtml}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' } as any}
          title="map"
        />
      ) : null}

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      )}

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{reports.length} reports</Text>
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Camera')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
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
  fab: {
    position: 'absolute', bottom: 32, right: 24,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#E63946',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 8,
  } as any,
  fabIcon: { fontSize: 32, color: '#fff', lineHeight: 36 },
});
