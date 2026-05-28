// Web version: uses localStorage instead of SQLite
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Report, ReportCategory } from '../types';

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
  }));
}

async function save(reports: Report[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(reports));
}

export async function createReport(data: {
  category: ReportCategory;
  description: string;
  location: { latitude: number; longitude: number };
  mediaUri: string;
  mediaType: 'photo' | 'video';
  deviceId: string;
}): Promise<string> {
  const reports = await load();
  const id = makeId();
  reports.unshift({
    id,
    category: data.category,
    description: data.description,
    location: data.location,
    mediaUrl: data.mediaUri,
    mediaType: data.mediaType,
    status: 'open',
    createdAt: new Date(),
    deviceId: data.deviceId,
  });
  await save(reports);
  return id;
}

export async function getAllReports(): Promise<Report[]> {
  return load();
}

export async function getUserReports(_deviceId: string): Promise<Report[]> {
  return load();
}

export async function getReport(id: string): Promise<Report | null> {
  const reports = await load();
  return reports.find((r) => r.id === id) ?? null;
}
