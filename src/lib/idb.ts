// src/lib/idb.ts
// Minimal IndexedDB helpers for storing large uploaded assets (stickers/frames/backgrounds)

type StoreName = 'stickers' | 'frames' | 'backgrounds';

const DB_NAME = 'galleryAssets';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('stickers')) {
        db.createObjectStore('stickers', { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains('frames')) {
        db.createObjectStore('frames', { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains('backgrounds')) {
        db.createObjectStore('backgrounds', { keyPath: 'name' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const putAsset = async (store: StoreName, name: string, blob: Blob): Promise<void> => {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const storeRef = tx.objectStore(store);
    storeRef.put({ name, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAsset = async (store: StoreName, name: string): Promise<Blob | null> => {
  const db = await openDB();
  return new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const storeRef = tx.objectStore(store);
    const req = storeRef.get(name);
    req.onsuccess = () => resolve(req.result ? (req.result as any).blob as Blob : null);
    req.onerror = () => reject(req.error);
  });
};

export const getAllAssets = async (store: StoreName): Promise<Array<{ name: string; blob: Blob }>> => {
  const db = await openDB();
  return new Promise<Array<{ name: string; blob: Blob }>>((resolve, reject) => {
    const results: Array<{ name: string; blob: Blob }> = [];
    const tx = db.transaction(store, 'readonly');
    const storeRef = tx.objectStore(store);
    const req = storeRef.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const value = cursor.value as { name: string; blob: Blob };
        results.push({ name: value.name, blob: value.blob });
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
  });
};

export const clearStore = async (store: StoreName): Promise<void> => {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const storeRef = tx.objectStore(store);
    storeRef.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const clearAllStores = async (): Promise<void> => {
  await Promise.all([
    clearStore('stickers'),
    clearStore('frames'),
    clearStore('backgrounds')
  ]);
};



