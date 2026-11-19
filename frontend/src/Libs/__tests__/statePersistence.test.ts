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
import {
  setCacheEntry,
  getCacheEntry,
  subscribeCacheKey,
  revalidateCacheByPrefix,
} from '../swrCache';
import { findPageForItemIndex } from '../../Hooks/usePagination';

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

// 8. Non-destructive SWR revalidation preserves cached data while marking entries stale
const cachedBooks = [{ id: 101, title: 'Clean Code' }];
const cachedBookDetail = { id: 101, copies: 5 };
const unrelatedFeatured = [{ id: 999 }];

setCacheEntry('admin:books:list', cachedBooks, true);
setCacheEntry('admin:books:detail:101', cachedBookDetail, false);
const unrelatedEntryBefore = setCacheEntry('public:books:featured', unrelatedFeatured, true);
assert.ok(unrelatedEntryBefore.updatedAt > 0);

let invalidateCalls = 0;
let dataSnapshotDuringInvalidate: Array<{ id: number; title: string }> | undefined;
let updatedAtDuringInvalidate = -1;
const unsubMatching = subscribeCacheKey(
  'admin:books:list',
  () => {
    // onChange listener registered for active query hook simulation
  },
  () => {
    invalidateCalls += 1;
    const snapshot = getCacheEntry<Array<{ id: number; title: string }>>('admin:books:list', true);
    dataSnapshotDuringInvalidate = snapshot?.data;
    updatedAtDuringInvalidate = snapshot?.updatedAt ?? -1;
  },
);

let unrelatedChangeCalls = 0;
let unrelatedInvalidateCalls = 0;
const unsubUnrelated = subscribeCacheKey(
  'public:books:featured',
  () => {
    unrelatedChangeCalls += 1;
  },
  () => {
    unrelatedInvalidateCalls += 1;
  },
);

revalidateCacheByPrefix('admin:books:');

assert.equal(invalidateCalls, 1);
assert.deepEqual(dataSnapshotDuringInvalidate, cachedBooks);
assert.equal(updatedAtDuringInvalidate, 0);

const listEntryAfter = getCacheEntry<Array<{ id: number; title: string }>>('admin:books:list', true);
assert.ok(listEntryAfter !== undefined);
assert.deepEqual(listEntryAfter.data, cachedBooks);
assert.equal(listEntryAfter.updatedAt, 0);

const rawPersistedList = mockLocal.getItem('jrmsu_swr:admin:books:list');
assert.ok(rawPersistedList !== null);
const parsedPersistedList = JSON.parse(rawPersistedList) as { data: unknown; updatedAt: number };
assert.deepEqual(parsedPersistedList.data, cachedBooks);
assert.equal(parsedPersistedList.updatedAt, 0);

const detailEntryAfter = getCacheEntry<{ id: number; copies: number }>('admin:books:detail:101', false);
assert.ok(detailEntryAfter !== undefined);
assert.deepEqual(detailEntryAfter.data, cachedBookDetail);
assert.equal(detailEntryAfter.updatedAt, 0);

assert.equal(unrelatedChangeCalls, 0);
assert.equal(unrelatedInvalidateCalls, 0);
const unrelatedEntryAfter = getCacheEntry<Array<{ id: number }>>('public:books:featured', true);
assert.ok(unrelatedEntryAfter !== undefined);
assert.deepEqual(unrelatedEntryAfter.data, unrelatedFeatured);
assert.equal(unrelatedEntryAfter.updatedAt, unrelatedEntryBefore.updatedAt);

unsubMatching();
unsubUnrelated();

// 9. Pagination target page lookup (including adversarial negative and zero inputs)
assert.equal(findPageForItemIndex(0, 10), 1);
assert.equal(findPageForItemIndex(9, 10), 1);
assert.equal(findPageForItemIndex(10, 10), 2);
assert.equal(findPageForItemIndex(19, 10), 2);
assert.equal(findPageForItemIndex(20, 10), 3);
assert.equal(findPageForItemIndex(45, 20), 3);
assert.equal(findPageForItemIndex(-1, 10), 1);
assert.equal(findPageForItemIndex(-99, 10), 1);
assert.equal(findPageForItemIndex(15, 0), 1);
assert.equal(findPageForItemIndex(15, -5), 1);
assert.equal(findPageForItemIndex(-1, 0), 1);

console.log('ALL_9_STATE_PERSISTENCE_AND_ADVERSARIAL_TESTS_PASSED');
