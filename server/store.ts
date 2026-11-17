import fs from 'node:fs';
import path from 'node:path';
import {
  CURRENT_SCHEMA_VERSION,
  createInitialDatabase,
  type DatabaseState,
} from './seedData';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'findikoo-db.json');

let memoryDb: DatabaseState | null = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getDb(): DatabaseState {
  if (memoryDb) return memoryDb;
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<DatabaseState>;
      if (parsed.schemaVersion === CURRENT_SCHEMA_VERSION && Array.isArray(parsed.users)) {
        memoryDb = {
          ...(parsed as DatabaseState),
          passwordResets: Array.isArray(parsed.passwordResets) ? parsed.passwordResets : [],
        };
        return memoryDb;
      }
    } catch {
      // Re-initialize cleanly if file is corrupted or from an older schema
    }
  }
  memoryDb = createInitialDatabase();
  saveDb(memoryDb);
  return memoryDb;
}

export function saveDb(nextDb: DatabaseState): void {
  ensureDir();
  memoryDb = nextDb;
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(nextDb, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function appendAuditLog(
  db: DatabaseState,
  actorId: string,
  actorEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  details: string
): void {
  db.auditLogs.unshift({
    id: uid('aud'),
    actorId,
    actorEmail,
    action,
    targetType,
    targetId,
    details,
    createdAt: new Date().toISOString(),
  });
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
}
