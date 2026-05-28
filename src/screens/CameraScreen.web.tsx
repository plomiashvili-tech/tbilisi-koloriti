import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MAX_SECS = 10;

export default function CameraScreen() {
  const navigation = useNavigation<Nav>();
  const containerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [facing, setFacing] = useState<'user' | 'environment'>('environment');
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(MAX_SECS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async (facingMode: 'user' | 'environment') => {
    stopStream();
    setLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setError('Camera access denied. Please allow camera permissions in your browser.');
    } finally {
      setLoading(false);
    }
  }, [stopStream]);

  // Mount: create the <video> element and attach it to the container div
  useEffect(() => {
    const container = containerRef.current as HTMLDivElement | null;
    if (!container) return;

    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    Object.assign(video.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%',
      objectFit: 'cover', background: '#000',
    });
    container.appendChild(video);
    videoRef.current = video;
    startCamera(facing);

    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      video.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flipCamera = useCallback(() => {
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    startCamera(next);
  }, [facing, startCamera]);

  // Photo
  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d')!;
    if (facing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const uri = URL.createObjectURL(blob);
        navigation.navigate('Submit', { mediaUri: uri, mediaType: 'photo', mediaBlob: blob } as any);
      },
      'image/jpeg',
      0.85
    );
  }, [facing, navigation]);

  // Video
  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4';

    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const uri = URL.createObjectURL(blob);
      navigation.navigate('Submit', { mediaUri: uri, mediaType: 'video', mediaBlob: blob } as any);
    };

    recorder.start(100); // collect in 100ms chunks
    setRecording(true);
    setCountdown(MAX_SECS);

    let secs = MAX_SECS;
    timerRef.current = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) stopRecording();
    }, 1000);
  }, [navigation]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }, []);

  return (
    <View style={styles.container}>
      {/* Camera viewport — the <video> element is injected here */}
      <View ref={containerRef} style={styles.viewport} />

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>Starting camera…</Text>
        </View>
      )}

      {error && (
        <View style={styles.overlay}>
          <Text style={styles.errorIcon}>📷</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => startCamera(facing)}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Top bar */}
      {!loading && !error && (
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'photo' && styles.modeBtnOn]}
              onPress={() => !recording && setMode('photo')}
            >
              <Text style={[styles.modeTxt, mode === 'photo' && styles.modeTxtOn]}>📷 Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'video' && styles.modeBtnOn]}
              onPress={() => !recording && setMode('video')}
            >
              <Text style={[styles.modeTxt, mode === 'video' && styles.modeTxtOn]}>🎥 Video</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.iconBtn} onPress={flipCamera}>
            <Text style={styles.iconText}>↺</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recording badge */}
      {recording && (
        <View style={styles.recBadge}>
          <View style={styles.recDot} />
          <Text style={styles.recText}>{countdown}s remaining</Text>
        </View>
      )}

      {/* Shutter */}
      {!loading && !error && (
        <View style={styles.bottomBar}>
          {mode === 'photo' ? (
            <TouchableOpacity style={styles.shutter} onPress={takePhoto}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.shutter, recording && styles.shutterRec]}
              onPress={recording ? stopRecording : startRecording}
            >
              <View style={[styles.shutterInner, recording && styles.shutterInnerRec]} />
            </TouchableOpacity>
          )}
          <Text style={styles.hint}>
            {mode === 'photo' ? 'Tap to take photo' : recording ? 'Tap to stop' : `Tap to record (max ${MAX_SECS}s)`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  viewport: { position: 'absolute', inset: 0 } as any,
  overlay: {
    position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', gap: 16,
  } as any,
  overlayText: { color: '#fff', fontSize: 15 },
  errorIcon: { fontSize: 48 },
  errorText: { color: '#fff', fontSize: 14, textAlign: 'center', maxWidth: 280 },
  retryBtn: {
    marginTop: 8, backgroundColor: '#E63946', paddingHorizontal: 24,
    paddingVertical: 10, borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  topBar: {
    position: 'absolute', top: 20, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16,
  } as any,
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  iconText: { color: '#fff', fontSize: 18 },
  modeRow: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20, padding: 3, gap: 2,
  },
  modeBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  modeBtnOn: { backgroundColor: '#fff' },
  modeTxt: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 13 },
  modeTxtOn: { color: '#1D3557' },
  recBadge: {
    position: 'absolute', top: 80, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 16,
    paddingVertical: 7, borderRadius: 20, gap: 8,
  } as any,
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E63946' },
  recText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  bottomBar: {
    position: 'absolute', bottom: 48, left: 0, right: 0,
    alignItems: 'center', gap: 12,
  } as any,
  shutter: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 4, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  shutterRec: { borderColor: '#E63946' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  shutterInnerRec: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#E63946' },
  hint: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
});
