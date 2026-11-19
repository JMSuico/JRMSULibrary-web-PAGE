import assert from 'node:assert/strict';
import {
  readPersistedValue,
  writePersistedValue,
  removePersistedValue,
  clearAllAdminCaches,
  buildStateStorageKey,
  ADMIN_STATE_PREFIX,
  PUBLIC_STATE_PREFIX,
} from '../statePersistence';
import { setCacheEntry, getCacheEntry } from '../swrCache';

class MockStorage implements Storage {
  private store = new Map<string, string>();
  public throwOnWrite = false;
  get length(): number { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void {
    if (this.throwOnWrite) throw new Error('QuotaExceededError');
    this.store.set(key, value);
  }
}

const mockSession = new MockStorage();
const mockLocal = new MockStorage();
(globalThis as unknown as { window: Record<string, unknown> }).window = {
  sessionStorage: mockSession,
  localStorage: mockLocal,
};

// 1. Write & read typed state in sessionStorage
writePersistedValue(`${ADMIN_STATE_PREFIX}books:page`, 4, 'session');
assert.equal(readPersistedValue<number>(`${ADMIN_STATE_PREFIX}books:page`, 1, 'session'), 4);

// 2. Validator rejects corrupted type cleanly
const isPosInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 1;
writePersistedValue(`${ADMIN_STATE_PREFIX}books:bad`, 'oops', 'session');
assert.equal(readPersistedValue<number>(`${ADMIN_STATE_PREFIX}books:bad`, 1, 'session', isPosInt), 1);

// 3. Adversarial: malformed raw JSON inside storage degrades safely to fallback
mockSession.setItem(buildStateStorageKey(`${ADMIN_STATE_PREFIX}books:corrupt`), '{bad-json[');
assert.equal(readPersistedValue<string>(`${ADMIN_STATE_PREFIX}books:corrupt`, 'safe-default', 'session'), 'safe-default');

// 4. Adversarial: expired maxAgeMs TTL invalidates & deletes entry
mockSession.setItem(
  buildStateStorageKey(`${ADMIN_STATE_PREFIX}books:expired`),
  JSON.stringify({ v: 'stale-val', ts: Date.now() - 120_000 }),
);
assert.equal(readPersistedValue<string>(`${ADMIN_STATE_PREFIX}books:expired`, 'fresh-fallback', 'session', undefined, 5_000), 'fresh-fallback');
assert.equal(mockSession.getItem(buildStateStorageKey(`${ADMIN_STATE_PREFIX}books:expired`)), null);

// 5. Adversarial: storage quota/private-mode exception never throws
mockSession.throwOnWrite = true;
assert.doesNotThrow(() => writePersistedValue(`${PUBLIC_STATE_PREFIX}quota:test`, { page: 9 }, 'session'));
mockSession.throwOnWrite = false;

// 6. Security: Admin vs Public isolation on clearAllAdminCaches()
writePersistedValue(`${PUBLIC_STATE_PREFIX}collection:tab`, 'online', 'session');
writePersistedValue('scroll:admin:books', { y: 920, containerTop: 0, containerLeft: 0, horizontalLeft: 0, anchorId: '42' }, 'session');
writePersistedValue('scroll:public:collection:online', { y: 640, containerTop: 0, containerLeft: 0, horizontalLeft: 0, anchorId: null }, 'session');
setCacheEntry('admin:batches', [{ id: 1 }], true);
setCacheEntry('public:settings', { ok: true }, true);

clearAllAdminCaches();

assert.equal(readPersistedValue<number>(`${ADMIN_STATE_PREFIX}books:page`, 1, 'session'), 1);
assert.equal(readPersistedValue<unknown>('scroll:admin:books', null, 'session'), null);
assert.equal(getCacheEntry('admin:batches', true), undefined);
assert.equal(readPersistedValue<string>(`${PUBLIC_STATE_PREFIX}collection:tab`, 'newly-acquired', 'session'), 'online');
assert.equal(
  readPersistedValue<{ y: number }>('scroll:public:collection:online', { y: 0 }, 'session').y,
  640,
);
assert.deepEqual(getCacheEntry<{ ok: boolean }>('public:settings', true)?.data, { ok: true });

// 7. Targeted removal
removePersistedValue(`${PUBLIC_STATE_PREFIX}collection:tab`, 'session');
assert.equal(readPersistedValue<string>(`${PUBLIC_STATE_PREFIX}collection:tab`, 'newly-acquired', 'session'), 'newly-acquired');

console.log('ALL_7_STATE_PERSISTENCE_AND_ADVERSARIAL_TESTS_PASSED');
