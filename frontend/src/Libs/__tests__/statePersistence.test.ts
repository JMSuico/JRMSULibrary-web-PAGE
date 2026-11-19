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
import {
  evaluateCmsSyncAction,
  type CmsSyncDecision,
} from '../../Hooks/useModalSafeCmsSync';

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

// 10. Multi-prefix non-destructive revalidation across all Admin prefixes + public:personnel
const multiModulePrefixes = [
  'admin:batches',
  'admin:batch-history',
  'admin:sections',
  'admin:content',
  'admin:eresources',
  'admin:email',
  'admin:users',
  'admin:analytics',
  'admin:reports',
  'admin:settings',
  'admin:recycle',
  'admin:dashboard',
  'public:personnel',
] as const;

const sentinelKey = 'public:sentinel:keep';
const sentinelData = [{ id: 777, label: 'Unchanged' }];
const sentinelBefore = setCacheEntry(sentinelKey, sentinelData, true);
assert.ok(sentinelBefore.updatedAt > 0);

let sentinelChangeCalls = 0;
let sentinelInvalidateCalls = 0;
const unsubSentinel = subscribeCacheKey(
  sentinelKey,
  () => { sentinelChangeCalls += 1; },
  () => { sentinelInvalidateCalls += 1; },
);

const prefixState = multiModulePrefixes.map((prefix, idx) => {
  const key = `${prefix}:items`;
  const payload = [{ id: idx + 1, prefix }];
  const initialEntry = setCacheEntry(key, payload, true);
  assert.ok(initialEntry.updatedAt > 0);

  let changeCount = 0;
  let invalidateCount = 0;
  let dataAtInvalidate: typeof payload | undefined;
  let updatedAtAtInvalidate = -1;

  const unsubscribe = subscribeCacheKey(
    key,
    () => { changeCount += 1; },
    () => {
      invalidateCount += 1;
      const snap = getCacheEntry<typeof payload>(key, true);
      dataAtInvalidate = snap?.data;
      updatedAtAtInvalidate = snap?.updatedAt ?? -1;
    },
  );

  return {
    prefix,
    key,
    payload,
    unsubscribe,
    getCounts: () => ({ changeCount, invalidateCount, dataAtInvalidate, updatedAtAtInvalidate }),
  };
});

for (const { prefix } of prefixState) {
  revalidateCacheByPrefix(prefix);
}

for (const item of prefixState) {
  const counts = item.getCounts();
  assert.equal(counts.invalidateCount, 1, `Expected 1 invalidate for ${item.prefix}`);
  assert.equal(counts.changeCount, 0, `Expected 0 onChange calls for ${item.prefix}`);
  assert.deepEqual(counts.dataAtInvalidate, item.payload);
  assert.equal(counts.updatedAtAtInvalidate, 0);

  const memAfter = getCacheEntry<typeof item.payload>(item.key, true);
  assert.ok(memAfter !== undefined, `Expected memory cache retained for ${item.key}`);
  assert.deepEqual(memAfter.data, item.payload);
  assert.equal(memAfter.updatedAt, 0);

  const rawStored = mockLocal.getItem(`jrmsu_swr:${item.key}`);
  assert.ok(rawStored !== null, `Expected storage entry retained for ${item.key}`);
  const parsedStored = JSON.parse(rawStored) as { data: unknown; updatedAt: number };
  assert.deepEqual(parsedStored.data, item.payload);
  assert.equal(parsedStored.updatedAt, 0);

  item.unsubscribe();
}

assert.equal(sentinelChangeCalls, 0);
assert.equal(sentinelInvalidateCalls, 0);
const sentinelAfter = getCacheEntry<typeof sentinelData>(sentinelKey, true);
assert.ok(sentinelAfter !== undefined);
assert.deepEqual(sentinelAfter.data, sentinelData);
assert.equal(sentinelAfter.updatedAt, sentinelBefore.updatedAt);
unsubSentinel();

// 11. Modal-safe CMS sync decision contract (busy deferral, self-echo window, boundary checks)
const expectDecision = (actual: CmsSyncDecision, expected: CmsSyncDecision): void => {
  assert.equal(actual, expected);
};

// Disabled always defers (even outside or inside self-echo window)
expectDecision(
  evaluateCmsSyncAction({ enabled: false, isBusy: false, lastLocalSaveAt: 0, nowMs: 50_000, selfEchoWindowMs: 2_500 }),
  'defer',
);
expectDecision(
  evaluateCmsSyncAction({ enabled: false, isBusy: false, lastLocalSaveAt: 10_000, nowMs: 10_100, selfEchoWindowMs: 2_500 }),
  'defer',
);

// Busy modal/save always defers (takes precedence over skip_echo and sync)
expectDecision(
  evaluateCmsSyncAction({ enabled: true, isBusy: true, lastLocalSaveAt: 0, nowMs: 50_000, selfEchoWindowMs: 2_500 }),
  'defer',
);
expectDecision(
  evaluateCmsSyncAction({ enabled: true, isBusy: true, lastLocalSaveAt: 10_000, nowMs: 10_100, selfEchoWindowMs: 2_500 }),
  'defer',
);

// Self-echo window suppresses immediate echo when enabled and not busy
expectDecision(
  evaluateCmsSyncAction({ enabled: true, isBusy: false, lastLocalSaveAt: 10_000, nowMs: 10_000, selfEchoWindowMs: 2_500 }),
  'skip_echo',
);
expectDecision(
  evaluateCmsSyncAction({ enabled: true, isBusy: false, lastLocalSaveAt: 10_000, nowMs: 12_499, selfEchoWindowMs: 2_500 }),
  'skip_echo',
);

// Exact boundary (nowMs - lastLocalSaveAt === selfEchoWindowMs) and past window trigger sync
expectDecision(
  evaluateCmsSyncAction({ enabled: true, isBusy: false, lastLocalSaveAt: 10_000, nowMs: 12_500, selfEchoWindowMs: 2_500 }),
  'sync',
);
expectDecision(
  evaluateCmsSyncAction({ enabled: true, isBusy: false, lastLocalSaveAt: 10_000, nowMs: 15_000, selfEchoWindowMs: 2_500 }),
  'sync',
);

// No prior local save (<= 0) or zero echo window triggers sync when enabled and idle
expectDecision(
  evaluateCmsSyncAction({ enabled: true, isBusy: false, lastLocalSaveAt: 0, nowMs: 100, selfEchoWindowMs: 2_500 }),
  'sync',
);
expectDecision(
  evaluateCmsSyncAction({ enabled: true, isBusy: false, lastLocalSaveAt: -1, nowMs: 0, selfEchoWindowMs: 2_500 }),
  'sync',
);
expectDecision(
  evaluateCmsSyncAction({ enabled: true, isBusy: false, lastLocalSaveAt: 10_000, nowMs: 10_000, selfEchoWindowMs: 0 }),
  'sync',
);

console.log('ALL_11_STATE_PERSISTENCE_AND_ADVERSARIAL_TESTS_PASSED');
