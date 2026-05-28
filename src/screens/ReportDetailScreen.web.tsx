import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getReport, submitFixVerification, rateReport, updateReportStatus, getUserVerificationCount, getUserRatingCount } from '../lib/reports';
import { getMediaUrl } from '../lib/mediaStore.web';
import { awardPoints } from '../lib/auth.web';
import { useAuth } from '../lib/authContext.web';
import { CATEGORIES, Report, RootStackParamList, POINT_VALUES, BADGES } from '../types';

type Route = RouteProp<RootStackParamList, 'ReportDetail'>;

const STATUS_META: Record<Report['status'], { label: string; color: string; icon: string }> = {
  open:        { label: 'Open',        color: '#E63946', icon: '🔴' },
  in_progress: { label: 'In Progress', color: '#F4A261', icon: '🟡' },
  resolved:    { label: 'Resolved',    color: '#2DC653', icon: '🟢' },
};

// ─── Inline camera overlay for fix verification ──────────────────────────────
function FixCamera({
  onCapture,
  onClose,
}: {
  onCapture: (blob: Blob, url: string) => void;
  onClose: () => void;
}) {
  const containerRef = useRef<any>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        stream = s;
        streamRef.current = s;
        const vid = document.createElement('video');
        vid.srcObject = s;
        vid.autoplay = true;
        vid.playsInline = true;
        Object.assign(vid.style, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
        const container = containerRef.current as HTMLDivElement | null;
        if (container) container.appendChild(vid);
        videoElRef.current = vid;
        vid.onloadedmetadata = () => setReady(true);
      })
      .catch(() => setError('Camera access denied. Please allow camera and try again.'));

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const vid = videoElRef.current;
    if (!vid) return;
    const canvas = document.createElement('canvas');
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    canvas.getContext('2d')!.drawImage(vid, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(blob, url);
      },
      'image/jpeg',
      0.85,
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.cameraOverlay]}>
      <View ref={containerRef} style={{ flex: 1 }} />
      {error ? (
        <View style={styles.cameraError}>
          <Text style={styles.cameraErrorText}>{error}</Text>
          <TouchableOpacity style={styles.camBtn} onPress={onClose}>
            <Text style={styles.camBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.camCloseBtn} onPress={onClose}>
            <Text style={styles.camCloseTxt}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.cameraHint}>Point camera at the fixed problem</Text>
          <TouchableOpacity
            style={[styles.snapBtn, !ready && { opacity: 0.4 }]}
            onPress={capture}
            disabled={!ready}
          >
            <View style={styles.snapInner} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Fix photo preview before confirming ─────────────────────────────────────
function FixPreview({
  url,
  onConfirm,
  onRetake,
  loading,
}: {
  url: string;
  onConfirm: () => void;
  onRetake: () => void;
  loading: boolean;
}) {
  const containerRef = useRef<any>(null);

  useEffect(() => {
    const img = document.createElement('img');
    img.src = url;
    Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
    const c = containerRef.current as HTMLDivElement | null;
    if (c) c.appendChild(img);
    return () => img.remove();
  }, [url]);

  return (
    <View style={[StyleSheet.absoluteFill, styles.cameraOverlay]}>
      <View ref={containerRef} style={{ flex: 1 }} />
      <View style={styles.previewControls}>
        <Text style={styles.previewTitle}>Confirm fix photo?</Text>
        <View style={styles.previewBtns}>
          <TouchableOpacity style={styles.retakeBtn} onPress={onRetake} disabled={loading}>
            <Text style={styles.retakeBtnTxt}>↺ Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, loading && { opacity: 0.6 }]}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmBtnTxt}>✓ Confirm Fix</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Star rating widget ───────────────────────────────────────────────────────
function StarRating({
  average,
  count,
  userStars,
  onRate,
}: {
  average: number;
  count: number;
  userStars: number;
  onRate: (stars: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <View>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => onRate(s)}
            style={styles.starBtn}
          >
            <Text style={[styles.starIcon, (hovered || userStars) >= s && styles.starFilled]}>
              {(hovered || userStars) >= s ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {count > 0 && (
        <Text style={styles.ratingMeta}>
          {average.toFixed(1)} / 5  ({count} {count === 1 ? 'rating' : 'ratings'})
        </Text>
      )}
      {userStars > 0 && (
        <Text style={styles.ratingYours}>You rated {userStars} ★</Text>
      )}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ReportDetailScreen() {
  const route = useRoute<Route>();
  const { user, refreshUser } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [cameraState, setCameraState] = useState<'hidden' | 'camera' | 'preview'>('hidden');
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState('');
  const [submittingFix, setSubmittingFix] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const mediaContainerRef = useRef<any>(null);
  const fixMediaContainerRef = useRef<any>(null);

  const loadReport = useCallback(() => {
    setLoading(true);
    getReport(route.params.reportId).then(setReport).finally(() => setLoading(false));
  }, [route.params.reportId]);

  useEffect(() => { loadReport(); }, [loadReport]);

  // Inject problem media
  useEffect(() => {
    const container = mediaContainerRef.current as HTMLDivElement | null;
    if (!container || !report) return;
    let el: HTMLElement;
    (async () => {
      const url = (await getMediaUrl(report.mediaUrl)) ?? report.mediaUrl;
      if (report.mediaType === 'video') {
        const vid = document.createElement('video');
        vid.src = url; vid.autoplay = true; vid.loop = true;
        vid.muted = true; vid.controls = true; vid.playsInline = true;
        Object.assign(vid.style, { width: '100%', height: '280px', objectFit: 'cover', display: 'block', background: '#000' });
        el = vid;
      } else {
        const img = document.createElement('img');
        img.src = url;
        Object.assign(img.style, { width: '100%', height: '280px', objectFit: 'cover', display: 'block' });
        el = img;
      }
      container.appendChild(el);
    })();
    return () => { if (el) el.remove(); };
  }, [report?.id]);

  // Inject fix verification media
  useEffect(() => {
    const container = fixMediaContainerRef.current as HTMLDivElement | null;
    if (!container || !report?.fixVerification) return;
    let el: HTMLElement;
    (async () => {
      const fv = report.fixVerification!;
      const url = (await getMediaUrl(fv.mediaUrl)) ?? fv.mediaUrl;
      if (fv.mediaType === 'video') {
        const vid = document.createElement('video');
        vid.src = url; vid.autoplay = true; vid.loop = true;
        vid.muted = true; vid.controls = true; vid.playsInline = true;
        Object.assign(vid.style, { width: '100%', height: '200px', objectFit: 'cover', display: 'block', background: '#000' });
        el = vid;
      } else {
        const img = document.createElement('img');
        img.src = url;
        Object.assign(img.style, { width: '100%', height: '200px', objectFit: 'cover', display: 'block', borderRadius: '8px' });
        el = img;
      }
      container.appendChild(el);
    })();
    return () => { if (el) el.remove(); };
  }, [report?.fixVerification?.mediaUrl]);

  async function handleAdminStatus(newStatus: Report['status']) {
    if (!report) return;
    setStatusUpdating(true);
    await updateReportStatus(report.id, newStatus);
    setStatusUpdating(false);
    loadReport();
  }

  async function handleConfirmFix() {
    if (!report || !capturedBlob || !user) return;
    setSubmittingFix(true);
    try {
      await submitFixVerification(report.id, capturedUrl, capturedBlob, 'photo', user.id, user.name);
      const verifyCount = await getUserVerificationCount(user.id);
      const badges: string[] = [];
      if (verifyCount === 1) badges.push('first_fix');
      if (verifyCount === 5) badges.push('verifier_5');
      awardPoints(user.id, POINT_VALUES.FIX_VERIFY, badges);
      refreshUser();
      setCameraState('hidden');
      loadReport();
      alert(`Fix verified! +${POINT_VALUES.FIX_VERIFY} points 🎉`);
    } catch {
      alert('Could not submit fix. Please try again.');
    } finally {
      setSubmittingFix(false);
    }
  }

  async function handleRate(stars: number) {
    if (!report || !user) return;
    const alreadyRated = report.ratings?.some((r) => r.userId === user.id);
    await rateReport(report.id, user.id, stars);
    if (!alreadyRated) {
      const rateCount = await getUserRatingCount(user.id);
      const badges: string[] = [];
      if (rateCount === 5) badges.push('rater_5');
      awardPoints(user.id, POINT_VALUES.RATE, badges);
      refreshUser();
    }
    loadReport();
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#E63946" /></View>;
  if (!report) return <View style={styles.center}><Text style={styles.notFound}>Report not found</Text></View>;

  const cat = CATEGORIES.find((c) => c.key === report.category);
  const status = STATUS_META[report.status];
  const userStars = report.ratings?.find((r) => r.userId === user?.id)?.stars ?? 0;
  const canVerifyFix = !!user && report.status !== 'resolved';
  const canRate = !!user && report.status === 'resolved';

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Problem media */}
        <View ref={mediaContainerRef} style={styles.mediaBox} />

        <View style={styles.body}>
          {/* Category + status */}
          <View style={styles.headerRow}>
            <View style={styles.catBadge}>
              <Text style={styles.catIcon}>{cat?.icon}</Text>
              <Text style={[styles.catLabel, { color: cat?.color }]}>{cat?.label}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
              <Text>{status.icon}</Text>
              <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          {/* Reporter */}
          {report.reporterUserName && (
            <View style={styles.reporterRow}>
              <Text style={styles.reporterText}>🙋 Reported by {report.reporterUserName}</Text>
            </View>
          )}

          {/* ── ADMIN CONTROLS ── */}
          {user?.isAdmin && (
            <View style={styles.adminPanel}>
              <Text style={styles.adminTitle}>⚙️  Admin — Change Status</Text>
              <View style={styles.adminBtns}>
                {(['open', 'in_progress', 'resolved'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.adminBtn, report.status === s && styles.adminBtnActive]}
                    onPress={() => handleAdminStatus(s)}
                    disabled={statusUpdating || report.status === s}
                  >
                    <Text style={[styles.adminBtnTxt, report.status === s && styles.adminBtnTxtActive]}>
                      {STATUS_META[s].icon} {STATUS_META[s].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {report.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{report.description}</Text>
            </View>
          ) : null}

          {/* Address */}
          {(report.street || report.region) ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address</Text>
              {report.street ? <Text style={styles.addressText}>🛣️  {report.street}</Text> : null}
              {report.region ? <Text style={styles.addressText}>📌  {report.region}</Text> : null}
            </View>
          ) : null}

          {/* GPS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GPS Coordinates</Text>
            <Text style={styles.locationText}>
              📍 {report.location.latitude.toFixed(5)}, {report.location.longitude.toFixed(5)}
            </Text>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reported on</Text>
            <Text style={styles.dateText}>
              {report.createdAt.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </Text>
          </View>

          {/* ── FIX VERIFICATION ── */}
          {report.fixVerification ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅  Fix Verified</Text>
              <View ref={fixMediaContainerRef} style={styles.fixMediaBox} />
              <Text style={styles.fixMeta}>
                Verified by {report.fixVerification.userName} · {new Date(report.fixVerification.createdAt).toLocaleDateString('en-GB')}
              </Text>
            </View>
          ) : canVerifyFix ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔧  Verify Fix</Text>
              <Text style={styles.verifyHint}>
                If you can see this problem has been fixed, take a photo to verify it and earn {POINT_VALUES.FIX_VERIFY} points!
              </Text>
              <TouchableOpacity style={styles.verifyBtn} onPress={() => setCameraState('camera')}>
                <Text style={styles.verifyBtnTxt}>📷  Take Fix Photo</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ── STAR RATING ── */}
          {canRate && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⭐  Rate this Fix</Text>
              <Text style={styles.verifyHint}>
                How well was this problem resolved? Rate it and earn {POINT_VALUES.RATE} points.
              </Text>
              <StarRating
                average={report.averageRating ?? 0}
                count={report.ratings?.length ?? 0}
                userStars={userStars}
                onRate={handleRate}
              />
            </View>
          )}

          {/* Show average on non-resolved reports if ratings exist */}
          {!canRate && (report.ratings?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⭐  Community Rating</Text>
              <Text style={styles.ratingMeta}>
                {(report.averageRating ?? 0).toFixed(1)} / 5  ({report.ratings.length} {report.ratings.length === 1 ? 'rating' : 'ratings'})
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Camera overlay — renders on top */}
      {cameraState === 'camera' && (
        <FixCamera
          onCapture={(blob, url) => {
            setCapturedBlob(blob);
            setCapturedUrl(url);
            setCameraState('preview');
          }}
          onClose={() => setCameraState('hidden')}
        />
      )}

      {cameraState === 'preview' && (
        <FixPreview
          url={capturedUrl}
          onConfirm={handleConfirmFix}
          onRetake={() => setCameraState('camera')}
          loading={submittingFix}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1FAEE' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 16, color: '#8D99AE' },
  mediaBox: { width: '100%', height: 280, backgroundColor: '#000' } as any,
  body: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catIcon: { fontSize: 24 },
  catLabel: { fontSize: 18, fontWeight: '700' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 6 },
  statusLabel: { fontWeight: '700', fontSize: 13 },
  reporterRow: { marginBottom: 8 },
  reporterText: { fontSize: 13, color: '#8D99AE' },

  // Admin panel
  adminPanel: {
    backgroundColor: '#1D3557',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  adminTitle: { color: '#A8DADC', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  adminBtns: { flexDirection: 'row', gap: 8 },
  adminBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: '#457B9D',
    alignItems: 'center',
  },
  adminBtnActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
  adminBtnTxt: { color: '#A8DADC', fontSize: 12, fontWeight: '600' },
  adminBtnTxtActive: { color: '#fff' },

  section: { marginTop: 18 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#8D99AE', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  description: { fontSize: 15, color: '#1D3557', lineHeight: 22 },
  addressText: { fontSize: 14, color: '#1D3557', marginBottom: 4 },
  locationText: { fontSize: 14, color: '#457B9D', fontWeight: '500' },
  dateText: { fontSize: 14, color: '#1D3557' },

  // Fix verification
  fixMediaBox: { width: '100%', height: 200, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden', marginBottom: 8 } as any,
  fixMeta: { fontSize: 13, color: '#2DC653', fontWeight: '600' },
  verifyHint: { fontSize: 13, color: '#8D99AE', marginBottom: 12, lineHeight: 18 },
  verifyBtn: {
    backgroundColor: '#2DC653', borderRadius: 10, paddingVertical: 13,
    alignItems: 'center',
  },
  verifyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Star rating
  starsRow: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  starBtn: { padding: 2 },
  starIcon: { fontSize: 30, color: '#ddd' },
  starFilled: { color: '#FFB703' },
  ratingMeta: { fontSize: 13, color: '#8D99AE', marginTop: 2 },
  ratingYours: { fontSize: 12, color: '#457B9D', marginTop: 4 },

  // Camera overlay
  cameraOverlay: { backgroundColor: '#000', zIndex: 999 } as any,
  cameraError: { padding: 24, alignItems: 'center', gap: 16 },
  cameraErrorText: { color: '#fff', textAlign: 'center', fontSize: 15 },
  camBtn: { backgroundColor: '#E63946', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  camBtnText: { color: '#fff', fontWeight: '700' },
  cameraControls: {
    position: 'absolute' as any, bottom: 0, left: 0, right: 0,
    paddingBottom: 40, paddingTop: 20,
    alignItems: 'center', gap: 16,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' as any,
  },
  camCloseBtn: {
    position: 'absolute' as any, top: -220, right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  camCloseTxt: { color: '#fff', fontSize: 18 },
  cameraHint: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  snapBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)',
  },
  snapInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },

  // Preview overlay
  previewControls: {
    position: 'absolute' as any, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', padding: 24, gap: 16,
  },
  previewTitle: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  previewBtns: { flexDirection: 'row', gap: 12 },
  retakeBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10,
    borderWidth: 1, borderColor: '#fff', alignItems: 'center',
  },
  retakeBtnTxt: { color: '#fff', fontWeight: '700' },
  confirmBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 10,
    backgroundColor: '#2DC653', alignItems: 'center',
  },
  confirmBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
