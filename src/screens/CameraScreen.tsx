import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  CameraView,
  CameraType,
  CameraMode,
  useCameraPermissions,
  useMicrophonePermissions,
} from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const MAX_DURATION = 10;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CameraScreen() {
  const navigation = useNavigation<Nav>();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [mode, setMode] = useState<CameraMode>('picture');
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(MAX_DURATION);
  const [flash, setFlash] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!cameraPermission) return <View style={styles.container} />;

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is required</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestCameraPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePhoto() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo) navigation.navigate('Submit', { mediaUri: photo.uri, mediaType: 'photo' });
  }

  async function startRecording() {
    if (!cameraRef.current) return;
    if (!micPermission?.granted) {
      await requestMicPermission();
    }
    setRecording(true);
    setCountdown(MAX_DURATION);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: MAX_DURATION });
      if (video) navigation.navigate('Submit', { mediaUri: video.uri, mediaType: 'video' });
    } catch {
      Alert.alert('Error', 'Could not record video.');
    } finally {
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  function stopRecording() {
    cameraRef.current?.stopRecording();
    if (timerRef.current) clearInterval(timerRef.current);
  }

  const canCapture = !recording;

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode={mode}
        enableTorch={flash}
      />

      {/* Top controls */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.iconText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'picture' && styles.modeBtnActive]}
            onPress={() => !recording && setMode('picture')}
          >
            <Text style={[styles.modeBtnText, mode === 'picture' && styles.modeBtnTextActive]}>
              Photo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'video' && styles.modeBtnActive]}
            onPress={() => !recording && setMode('video')}
          >
            <Text style={[styles.modeBtnText, mode === 'video' && styles.modeBtnTextActive]}>
              Video
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => setFlash((f) => !f)}>
          <Text style={styles.iconText}>{flash ? '⚡' : '🔦'}</Text>
        </TouchableOpacity>
      </View>

      {/* Recording countdown */}
      {recording && (
        <View style={styles.countdownContainer}>
          <View style={styles.recDot} />
          <Text style={styles.countdownText}>{countdown}s</Text>
        </View>
      )}

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.flipBtn}
          onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
        >
          <Text style={styles.flipText}>↺</Text>
        </TouchableOpacity>

        {mode === 'picture' ? (
          <TouchableOpacity
            style={[styles.captureBtn, !canCapture && styles.captureBtnDisabled]}
            onPress={takePhoto}
            disabled={!canCapture}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.captureBtn, recording && styles.captureBtnRecording]}
            onPress={recording ? stopRecording : startRecording}
          >
            <View
              style={[
                styles.captureInner,
                recording && styles.captureInnerRecording,
              ]}
            />
          </TouchableOpacity>
        )}

        <View style={{ width: 48 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1D3557',
    gap: 16,
  },
  permissionText: { color: '#fff', fontSize: 16 },
  permissionBtn: {
    backgroundColor: '#E63946',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  topBar: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { color: '#fff', fontSize: 18 },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    padding: 3,
  },
  modeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modeBtnActive: { backgroundColor: '#fff' },
  modeBtnText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 13 },
  modeBtnTextActive: { color: '#1D3557' },
  countdownContainer: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E63946',
  },
  countdownText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  bottomBar: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  flipBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipText: { color: '#fff', fontSize: 26 },
  captureBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnDisabled: { opacity: 0.5 },
  captureBtnRecording: { borderColor: '#E63946' },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  captureInnerRecording: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#E63946',
  },
});
