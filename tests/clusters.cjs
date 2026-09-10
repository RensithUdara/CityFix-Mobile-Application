const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript'),
  vm = require('node:vm'),
  fs = require('node:fs');
const exportsObject = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync('src/utils/clusters.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: exportsObject },
);
test('nearby reports cluster at low zoom and separate on zooming in without losing reports', () => {
  const items = [
    { id: 'a', latitude: 6.1, longitude: 80.1 },
    { id: 'b', latitude: 6.1008, longitude: 80.1008 },
    { id: 'c', latitude: null, longitude: null },
  ];
  assert.equal(exportsObject.clusterIssues(items, 2).length, 1);
  assert.equal(exportsObject.clusterIssues(items, 19).length, 2);
  assert.equal(exportsObject.clusterIssues(items, 2)[0].issues.length, 2);
});
