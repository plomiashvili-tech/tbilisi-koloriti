import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: May 2026</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>What we collect</Text>
        <Text style={styles.body}>
          When you submit a report, we collect: the photo or video you take, the GPS
          coordinates of the problem, your chosen category, and an optional description.
          We also store an anonymous device identifier so you can see your own reports.
          We do not collect your name, phone number, or email address.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>How we use it</Text>
        <Text style={styles.body}>
          Your reports are used solely to display city infrastructure problems on the
          shared map so that residents and authorities can see and address them.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Data storage</Text>
        <Text style={styles.body}>
          Reports are stored on secure cloud servers. Media files (photos/videos) are
          stored in Firebase Storage. We do not sell or share your data with third parties.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Your rights</Text>
        <Text style={styles.body}>
          You can request deletion of your reports by contacting us. Since reports are
          anonymous, we use your device ID to identify them.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Contact</Text>
        <Text style={styles.body}>
          For any questions about this policy, contact: plomiashvili@gmail.com
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1FAEE' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#1D3557', marginBottom: 4 },
  updated: { fontSize: 12, color: '#8D99AE', marginBottom: 24 },
  section: { marginBottom: 20 },
  heading: { fontSize: 15, fontWeight: '700', color: '#E63946', marginBottom: 6 },
  body: { fontSize: 14, color: '#1D3557', lineHeight: 22 },
});
