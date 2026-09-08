const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('src/services/uploadPreparedPhoto.native.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function load({ upload, readError = false }) {
  let closed = false;
  const blob = { size: 100, close: () => { closed = true; } };
  class NativeRequest {
    status = 200;
    response = blob;
    open(method, uri) { assert.equal(method, 'GET'); assert.equal(uri, 'file:///normalized.jpg'); }
    send() { assert.equal(this.responseType, 'blob'); queueMicrotask(() => readError ? this.onerror() : this.onload()); }
  }
  const exports = {};
  vm.runInNewContext(source, { exports, XMLHttpRequest: NativeRequest, require: () => ({ uploadBytes: upload }), Blob: class { constructor() { throw new Error('ArrayBuffer Blob construction is unsupported'); } } });
  return { run: exports.uploadPreparedPhoto, blob, closed: () => closed };
}
test('native upload passes the original native Blob with explicit JPEG metadata and releases it', async () => {
  const fixture = load({ upload: async (target, data, metadata) => { assert.equal(target, 'target'); assert.equal(data, fixture.blob); assert.equal(metadata.contentType, 'image/jpeg'); } });
  await fixture.run('target', 'file:///normalized.jpg');
  assert.equal(fixture.closed(), true);
});
test('native upload releases resources on upload failure and rejects unreadable local photos', async () => {
  const fixture = load({ upload: async () => { throw new Error('Upload failed'); } });
  await assert.rejects(fixture.run('target', 'file:///normalized.jpg'), /Upload failed/);
  assert.equal(fixture.closed(), true);
  const unreadable = load({ readError: true, upload: async () => assert.fail('Must not upload') });
  await assert.rejects(unreadable.run('target', 'file:///normalized.jpg'), /Unable to read/);
});
