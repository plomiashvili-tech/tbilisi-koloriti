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
        .bindTooltip("${cat?.icon ?? ''} ${cat?.label ?? r.category}", { permanent: false })
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

      <View style={styles.webNote}>
        <Text style={styles.webNoteText}>📱 Install the mobile app to submit reports</Text>
      </View>
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
  webNote: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  webNoteText: { fontSize: 13, color: '#1D3557', fontWeight: '600' },
});
