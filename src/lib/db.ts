import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('tbilisi_koloriti.db');
  await _db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS reports (
      id          TEXT PRIMARY KEY,
      category    TEXT NOT NULL,
      description TEXT DEFAULT '',
      latitude    REAL NOT NULL,
      longitude   REAL NOT NULL,
      mediaPath   TEXT NOT NULL,
      mediaType   TEXT NOT NULL,
      status      TEXT DEFAULT 'open',
      createdAt   INTEGER NOT NULL
    );
  `);
  return _db;
}

export async function copyMediaToStorage(uri: string, mediaType: 'photo' | 'video'): Promise<string> {
  const dir = Paths.document + '/reports/';
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

  const ext = mediaType === 'photo' ? 'jpg' : 'mp4';
  const dest = `${dir}${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}
