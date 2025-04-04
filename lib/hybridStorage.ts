import { openDB } from 'idb';

const DB_NAME = 'GhibliImageUsageDB_drewgrant';
const STORE_NAME = 'usage';

// 初始化 DB
async function initDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        }
    });
}

export async function getUsageCount(id: string): Promise<number> {
    try {
        const db = await initDB();
        const fromDB = await db.get(STORE_NAME, id);
        if (typeof fromDB === 'number') {
            localStorage.setItem(id, String(fromDB)); // sync to localStorage
            return fromDB;
        }
    } catch {
        // fallback to localStorage
        console.log('Failed to get usage count from DB, falling back to localStorage');
    }

    const fromLS = localStorage.getItem(id);
    return fromLS ? parseInt(fromLS) : 0;
}

export async function incrementUsage(id: string): Promise<number> {
    const current = await getUsageCount(id);
    const next = current + 1;

    try {
        const db = await initDB();
        await db.put(STORE_NAME, next, id);
    } catch {
        // fallback
    }

    localStorage.setItem(id, String(next));
    return next;
}
