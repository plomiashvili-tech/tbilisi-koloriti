import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function CameraScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Tbilisi koloriti</Text>
      <Text style={styles.subtitle}>Report city problems</Text>

      <View style={styles.card}>
        <Text style={styles.cardIcon}>📱</Text>
        <Text style={styles.cardTitle}>Mobile app required to submit</Text>
        <Text style={styles.cardBody}>
          To take photos and report problems, install the mobile app on your phone.
          On this website you can browse all existing reports on the map.
        </Text>
      </View>

      <View style={styles.storeRow}>
        <View style={styles.storeBadge}>
          <Text style={styles.storeIcon}>🤖</Text>
          <Text style={styles.storeText}>Android</Text>
        </View>
        <View style={styles.storeBadge}>
          <Text style={styles.storeIcon}>🍎</Text>
          <Text style={styles.storeText}>iOS</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Map</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D3557',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logo: { width: 72, height: 72, borderRadius: 16, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#A8DADC', marginBottom: 32 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    marginBottom: 24,
  },
  cardIcon: { fontSize: 40, marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 10 },
  cardBody: { fontSize: 14, color: '#A8DADC', textAlign: 'center', lineHeight: 22 },
  storeRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  storeIcon: { fontSize: 20 },
  storeText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  backBtn: { paddingVertical: 10 },
  backText: { color: '#A8DADC', fontSize: 15 },
});
