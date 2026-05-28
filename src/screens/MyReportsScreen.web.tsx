import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getUserReports } from '../lib/reports';
import { getLeaderboard } from '../lib/auth.web';
import { useAuth } from '../lib/authContext.web';
import { CATEGORIES, Report, RootStackParamList, BADGES } from '../types';
import type { AuthUser as AU } from '../lib/auth.web';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_LABELS: Record<Report['status'], { label: string; color: string }> = {
  open:        { label: 'Open',        color: '#E63946' },
  in_progress: { label: 'In Progress', color: '#F4A261' },
  resolved:    { label: 'Resolved',    color: '#2DC653' },
};

function ProfileCard({ user }: { user: AU }) {
  const earnedBadges = BADGES.filter((b) => user.badges.includes(b.id));

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsNum}>{user.points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>

      {earnedBadges.length > 0 && (
        <View style={styles.badgesRow}>
          {earnedBadges.map((b) => (
            <View key={b.id} style={styles.badge}>
              <Text style={styles.badgeIcon}>{b.icon}</Text>
              <Text style={styles.badgeLabel}>{b.label}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.pointsGuide}>
        <Text style={styles.guideTitle}>How to earn points:</Text>
        <Text style={styles.guideRow}>📸 Submit a problem report   +10 pts</Text>
        <Text style={styles.guideRow}>🔧 Verify a fix with photo   +15 pts</Text>
        <Text style={styles.guideRow}>⭐ Rate a fixed problem        +2 pts</Text>
      </View>
    </View>
  );
}

function LeaderboardCard() {
  const top = getLeaderboard();
  if (top.length === 0) return null;

  return (
    <View style={styles.leaderCard}>
      <Text style={styles.leaderTitle}>🏆  Top Contributors</Text>
      {top.map((u, i) => (
        <View key={u.id} style={styles.leaderRow}>
          <Text style={styles.leaderRank}>#{i + 1}</Text>
          <View style={styles.leaderAvatar}>
            <Text style={styles.leaderAvatarTxt}>{u.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.leaderName} numberOfLines={1}>{u.name}</Text>
          {u.badges.slice(0, 3).map((bid) => {
            const b = BADGES.find((x) => x.id === bid);
            return b ? <Text key={bid} style={styles.leaderBadge}>{b.icon}</Text> : null;
          })}
          <Text style={styles.leaderPts}>{u.points} pts</Text>
        </View>
      ))}
    </View>
  );
}

export default function MyReportsScreen() {
  const navigation = useNavigation<Nav>();
  const { user, refreshUser } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserReports(user?.id ?? '');
      setReports(data);
    } finally {
      setLoading(false);
    }
    refreshUser(); // keep points fresh
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#E63946" /></View>;
  }

  const ListHeader = (
    <>
      {user && <ProfileCard user={user} />}
      <LeaderboardCard />
      <Text style={styles.myReportsTitle}>My Reports ({reports.length})</Text>
    </>
  );

  if (reports.length === 0) {
    return (
      <ScrollView>
        {ListHeader}
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No reports yet</Text>
          <Text style={styles.emptySubtitle}>Tap + on the map to report a problem</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={ListHeader}
      renderItem={({ item }) => {
        const cat = CATEGORIES.find((c) => c.key === item.category);
        const status = STATUS_LABELS[item.status];
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
            activeOpacity={0.75}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardIcon}>{cat?.icon}</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.cardCategory}>{cat?.label}</Text>
                <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
                  <Text style={[styles.statusTxt, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
              {item.region || item.street ? (
                <Text style={styles.cardAddr} numberOfLines={1}>
                  {[item.street, item.region].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
              ) : null}
              <View style={styles.cardMeta}>
                <Text style={styles.cardDate}>
                  {item.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
                {(item.ratings?.length ?? 0) > 0 && (
                  <Text style={styles.cardRating}>⭐ {(item.averageRating ?? 0).toFixed(1)}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 10 },

  // Profile card
  profileCard: {
    backgroundColor: '#1D3557', borderRadius: 16, padding: 18, marginBottom: 14,
  },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#E63946', justifyContent: 'center', alignItems: 'center',
  },
  avatarTxt: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  profileEmail: { color: '#8D99AE', fontSize: 12, marginTop: 2 },
  pointsBox: { alignItems: 'center' },
  pointsNum: { color: '#FFB703', fontSize: 28, fontWeight: '800' },
  pointsLabel: { color: '#8D99AE', fontSize: 11 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap' as any, gap: 8, marginBottom: 14 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  badgeIcon: { fontSize: 14 },
  badgeLabel: { color: '#A8DADC', fontSize: 12, fontWeight: '600' },
  pointsGuide: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12,
  },
  guideTitle: { color: '#A8DADC', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  guideRow: { color: '#8D99AE', fontSize: 12, marginBottom: 3 },

  // Leaderboard
  leaderCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  leaderTitle: { fontSize: 15, fontWeight: '700', color: '#1D3557', marginBottom: 12 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  leaderRank: { fontSize: 13, color: '#8D99AE', width: 24 },
  leaderAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#E63946', justifyContent: 'center', alignItems: 'center',
  },
  leaderAvatarTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  leaderName: { flex: 1, fontSize: 14, color: '#1D3557', fontWeight: '600' },
  leaderBadge: { fontSize: 16 },
  leaderPts: { fontSize: 13, color: '#457B9D', fontWeight: '700' },

  myReportsTitle: { fontSize: 14, fontWeight: '700', color: '#1D3557', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },

  // Report cards
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  cardLeft: { width: 60, backgroundColor: '#F1FAEE', justifyContent: 'center', alignItems: 'center' },
  cardIcon: { fontSize: 26 },
  cardBody: { flex: 1, padding: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardCategory: { fontSize: 14, fontWeight: '700', color: '#1D3557', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusTxt: { fontSize: 11, fontWeight: '700' },
  cardAddr: { fontSize: 12, color: '#457B9D', marginBottom: 2 },
  cardDesc: { fontSize: 13, color: '#8D99AE' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  cardDate: { fontSize: 11, color: '#aaa' },
  cardRating: { fontSize: 12, color: '#FFB703' },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1D3557' },
  emptySubtitle: { fontSize: 14, color: '#8D99AE', textAlign: 'center', paddingHorizontal: 40 },
});
