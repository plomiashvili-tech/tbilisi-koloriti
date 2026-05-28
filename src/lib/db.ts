import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('tbilisi_koloriti.db');
  await _db.execAsync(`PRAGMA journal_mode = WAL;`);
  await _db.execAsync(`
    CREATE TABLE IF NOT EXISTS reports (
      id          TEXT PRIMARY KEY,
      category    TEXT NOT NULL,
      description TEXT DEFAULT '',
      street      TEXT DEFAULT '',
      region      TEXT DEFAULT '',
      latitude    REAL NOT NULL,
      longitude   REAL NOT NULL,
      mediaPath   TEXT NOT NULL,
      mediaType   TEXT NOT NULL,
      status      TEXT DEFAULT 'open',
      createdAt   INTEGER NOT NULL
    );
  `);
  // Migrate existing installs that lack street/region columns
  const ver = await _db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((ver?.user_version ?? 0) < 1) {
    try { await _db.execAsync(`ALTER TABLE reports ADD COLUMN street TEXT DEFAULT ''`); } catch {}
    try { await _db.execAsync(`ALTER TABLE reports ADD COLUMN region TEXT DEFAULT ''`); } catch {}
    await _db.execAsync(`PRAGMA user_version = 1`);
  }
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
