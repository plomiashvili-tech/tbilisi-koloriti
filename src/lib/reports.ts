import { getDb, copyMediaToStorage } from './db';
import { Report, ReportCategory } from '../types';

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function rowToReport(row: any): Report {
  return {
    id: row.id,
    category: row.category as ReportCategory,
    description: row.description ?? '',
    location: { latitude: row.latitude, longitude: row.longitude },
    mediaUrl: row.mediaPath,
    mediaType: row.mediaType as 'photo' | 'video',
    status: row.status as Report['status'],
    createdAt: new Date(row.createdAt),
    deviceId: row.deviceId ?? '',
  };
}

export async function createReport(data: {
  category: ReportCategory;
  description: string;
  location: { latitude: number; longitude: number };
  mediaUri: string;
  mediaType: 'photo' | 'video';
  deviceId: string;
}): Promise<string> {
  const db = await getDb();
  const id = makeId();
  const mediaPath = await copyMediaToStorage(data.mediaUri, data.mediaType);
  await db.runAsync(
    `INSERT INTO reports (id, category, description, latitude, longitude, mediaPath, mediaType, status, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)`,
    [
      id,
      data.category,
      data.description,
      data.location.latitude,
      data.location.longitude,
      mediaPath,
      data.mediaType,
      Date.now(),
    ]
  );
  return id;
}

export async function getAllReports(): Promise<Report[]> {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT * FROM reports ORDER BY createdAt DESC');
  return (rows as any[]).map(rowToReport);
}

export async function getUserReports(deviceId: string): Promise<Report[]> {
  // With local SQLite all reports belong to this device
  return getAllReports();
}

export async function getReport(id: string): Promise<Report | null> {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM reports WHERE id = ?', [id]);
  if (!row) return null;
  return rowToReport(row);
}
