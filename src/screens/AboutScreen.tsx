import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ROWS = [
  { icon: '🗺️', label: 'Map data', value: 'OpenStreetMap contributors' },
  { icon: '🔒', label: 'Data stored', value: 'Anonymously, no account needed' },
  { icon: '📍', label: 'Location', value: 'Used only when submitting a report' },
  { icon: '📷', label: 'Camera', value: 'Used only to capture a report' },
];

export default function AboutScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Image source={require('../../assets/icon.png')} style={styles.icon} />
        <Text style={styles.appName}>Tbilisi koloriti</Text>
        <Text style={styles.tagline}>Report city problems together</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <View style={styles.card}>
        {ROWS.map((r) => (
          <View key={r.label} style={styles.row}>
            <Text style={styles.rowIcon}>{r.icon}</Text>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Text style={styles.rowValue}>{r.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.privacyBtn}
        onPress={() => navigation.navigate('Privacy')}
      >
        <Text style={styles.privacyText}>Privacy Policy</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Made with ❤️ for Tbilisi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1FAEE', alignItems: 'center', padding: 20 },
  hero: { alignItems: 'center', paddingVertical: 28 },
  icon: { width: 80, height: 80, borderRadius: 18, marginBottom: 12 },
  appName: { fontSize: 22, fontWeight: '800', color: '#1D3557' },
  tagline: { fontSize: 14, color: '#457B9D', marginTop: 4 },
  version: { fontSize: 12, color: '#8D99AE', marginTop: 4 },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  rowIcon: { fontSize: 20 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 13, fontWeight: '700', color: '#1D3557' },
  rowValue: { fontSize: 12, color: '#8D99AE', marginTop: 2 },
  privacyBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#457B9D',
    marginBottom: 24,
  },
  privacyText: { color: '#457B9D', fontWeight: '700', fontSize: 14 },
  footer: { fontSize: 13, color: '#8D99AE' },
});
