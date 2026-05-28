// IndexedDB store for photos and videos on web (localStorage is too small for media)
const DB_NAME = 'koloriti_media';
const STORE = 'blobs';

let _db: IDBDatabase | null = null;

function openDb(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => { _db = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}

export async function saveMedia(blob: Blob): Promise<string> {
  const db = await openDb();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMediaUrl(id: string): Promise<string | null> {
  if (!id) return null;
  // If it's already a URL (blob: or data:), return as-is
  if (id.startsWith('blob:') || id.startsWith('data:')) return id;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      if (req.result) resolve(URL.createObjectURL(req.result));
      else resolve(null);
    };
    req.onerror = () => reject(req.error);
  });
}
