import AsyncStorage from '@react-native-async-storage/async-storage';
import { Report, ReportCategory } from '../types';
import { saveMedia } from './mediaStore.web';

const KEY = '@koloriti:reports';

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function load(): Promise<Report[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  return JSON.parse(raw).map((r: any) => ({
    ...r,
    createdAt: new Date(r.createdAt),
    ratings: r.ratings ?? [],
    averageRating: r.averageRating ?? 0,
    fixVerification: r.fixVerification
      ? { ...r.fixVerification, createdAt: new Date(r.fixVerification.createdAt) }
      : undefined,
  }));
}

async function save(reports: Report[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(reports));
}

export async function createReport(data: {
  category: ReportCategory;
  description: string;
  street: string;
  region: string;
  location: { latitude: number; longitude: number };
  mediaUri: string;
  mediaBlob?: Blob;
  mediaType: 'photo' | 'video';
  deviceId: string;
  reporterUserId?: string;
  reporterUserName?: string;
}): Promise<string> {
  const reports = await load();
  const id = makeId();

  let mediaUrl = data.mediaUri;
  if (data.mediaBlob) mediaUrl = await saveMedia(data.mediaBlob);

  reports.unshift({
    id,
    category: data.category,
    description: data.description,
    street: data.street,
    region: data.region,
    location: data.location,
    mediaUrl,
    mediaType: data.mediaType,
    status: 'open',
    createdAt: new Date(),
    deviceId: data.deviceId,
    reporterUserId: data.reporterUserId,
    reporterUserName: data.reporterUserName,
    ratings: [],
    averageRating: 0,
  });
  await save(reports);
  return id;
}

export async function submitFixVerification(
  reportId: string,
  mediaUri: string,
  mediaBlob: Blob | undefined,
  mediaType: 'photo' | 'video',
  userId: string,
  userName: string,
): Promise<void> {
  const reports = await load();
  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx < 0) return;
  let mediaUrl = mediaUri;
  if (mediaBlob) mediaUrl = await saveMedia(mediaBlob);
  reports[idx].fixVerification = { mediaUrl, mediaType, userId, userName, createdAt: new Date() };
  reports[idx].status = 'resolved';
  await save(reports);
}

export async function rateReport(
  reportId: string,
  userId: string,
  stars: number,
): Promise<void> {
  const reports = await load();
  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx < 0) return;
  const ratings = reports[idx].ratings ?? [];
  const existing = ratings.findIndex((r) => r.userId === userId);
  if (existing >= 0) {
    ratings[existing].stars = stars;
  } else {
    ratings.push({ userId, stars });
  }
  reports[idx].ratings = ratings;
  reports[idx].averageRating = ratings.reduce((s, r) => s + r.stars, 0) / ratings.length;
  await save(reports);
}

export async function updateReportStatus(
  reportId: string,
  status: Report['status'],
): Promise<void> {
  const reports = await load();
  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx < 0) return;
  reports[idx].status = status;
  await save(reports);
}

export async function getUserReportCount(userId: string): Promise<number> {
  const reports = await load();
  return reports.filter((r) => r.reporterUserId === userId).length;
}

export async function getUserVerificationCount(userId: string): Promise<number> {
  const reports = await load();
  return reports.filter((r) => r.fixVerification?.userId === userId).length;
}

export async function getUserRatingCount(userId: string): Promise<number> {
  const reports = await load();
  return reports.filter((r) => r.ratings?.some((rat) => rat.userId === userId)).length;
}

export async function getAllReports(): Promise<Report[]> {
  return load();
}

export async function getUserReports(userId: string): Promise<Report[]> {
  const reports = await load();
  if (!userId) return reports;
  return reports.filter((r) => !r.reporterUserId || r.reporterUserId === userId);
}

export async function getReport(id: string): Promise<Report | null> {
  const reports = await load();
  return reports.find((r) => r.id === id) ?? null;
}
