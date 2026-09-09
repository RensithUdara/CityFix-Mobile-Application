const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function setup() {
  let state = { online: false, ready: false, entries: [] };
  let uid = 'alice';
  let online;
  let stored = {};
  let calls = [];
  let fail = false;
  let failRemoval = false;
  let sequence = 0;
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync('src/services/syncQueue.ts', 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const modules = {
    '@react-native-community/netinfo': {
      addEventListener: (fn) => {
        online = fn;
        fn({ isConnected: false });
        return () => {};
      },
    },
    'react-native': {
      AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) },
    },
    'firebase/firestore': { collection: () => ({}), doc: () => ({ id: 'draft' + ++sequence }) },
    '../config/firebase': { firebase: () => ({ auth: { currentUser: { uid } }, firestore: {} }) },
    '../store/queueStore': {
      useQueueStore: {
        getState: () => state,
        setState: (patch) => {
          state = { ...state, ...patch };
        },
      },
    },
    './queuePersistence': {
      readQueue: async (id) => JSON.parse(JSON.stringify(stored[id] || [])),
      writeQueue: async (id, value) => {
        if (failRemoval && value.length === 0) throw new Error('Device storage unavailable');
        stored[id] = JSON.parse(JSON.stringify(value));
      },
      preservePhotos: async (u, id, p) => p.map((photo) => ({ ...photo, uri: 'persistent/' + id })),
      removePhotos: async () => {},
    },
    './issues': {
      createIssue: async (input, progress, id) => {
        calls.push({ uid, id, input });
        if (fail) throw new Error('Connection lost');
        return id;
      },
    },
    '../utils/errors': { errorMessage: (e) => e.message },
  };
  vm.runInNewContext(code, {
    exports,
    require: (name) => modules[name],
    setInterval: () => 1,
    clearInterval() {},
    setTimeout,
    clearTimeout,
  });
  return {
    api: exports,
    get state() {
      return state;
    },
    get stored() {
      return stored;
    },
    calls,
    connect: () => online({ isConnected: true, isInternetReachable: true }),
    setUid: (v) => (uid = v),
    setFail: (v) => (fail = v),
    setFailRemoval: (v) => (failRemoval = v),
  };
}
const tick = () => new Promise((resolve) => setImmediate(resolve));
test('a failed queue save after upload retains the stable report for safe retry', async () => {
  const f = setup();
  const stop = f.api.startSyncQueue('alice');
  await tick();
  f.connect();
  await tick();
  f.setFailRemoval(true);
  const result = await f.api.submitOrQueue({ photos: [{ uri: 'temporary' }] });
  assert.equal(result.submitted, false);
  assert.equal(f.state.entries[0].id, result.id);
  assert.equal(f.stored.alice[0].id, result.id);
  f.setFailRemoval(false);
  await f.api.retryQueuedReport(result.id);
  await tick();
  await f.api.syncPendingReports();
  assert.equal(f.stored.alice.length, 0);
  assert.equal(f.calls[1].id, result.id);
  stop();
});
test('offline photos survive restart, upload once with stable id and leave an empty queue', async () => {
  const f = setup();
  let stop = f.api.startSyncQueue('alice');
  await tick();
  const result = await f.api.submitOrQueue({
    title: 'Road repair',
    photos: [{ uri: 'temporary' }],
  });
  assert.equal(result.submitted, false);
  assert.equal(f.stored.alice[0].input.photos[0].uri, 'persistent/' + result.id);
  stop();
  stop = f.api.startSyncQueue('alice');
  await tick();
  f.connect();
  await f.api.syncPendingReports();
  await tick();
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].id, result.id);
  assert.equal(f.stored.alice.length, 0);
  stop();
});
test('empty sync cannot block later drafts; failed uploads retain photos for retry', async () => {
  const f = setup();
  const stop = f.api.startSyncQueue('alice');
  await tick();
  f.connect();
  await tick();
  f.setFail(true);
  const result = await f.api.submitOrQueue({
    title: 'Road repair',
    photos: [{ uri: 'temporary' }],
  });
  assert.equal(result.submitted, false);
  assert.equal(f.state.entries[0].state, 'failed');
  f.setFail(false);
  await f.api.retryQueuedReport(result.id);
  await tick();
  await f.api.syncPendingReports();
  assert.equal(f.stored.alice.length, 0);
  stop();
});
test('another account cannot upload the previous account drafts', async () => {
  const f = setup();
  const stop = f.api.startSyncQueue('alice');
  await tick();
  await f.api.submitOrQueue({ photos: [{ uri: 'temporary' }] });
  stop();
  f.setUid('bob');
  const stopBob = f.api.startSyncQueue('bob');
  await tick();
  f.connect();
  await tick();
  assert.equal(f.calls.length, 0);
  assert.equal(f.stored.alice.length, 1);
  stopBob();
});
