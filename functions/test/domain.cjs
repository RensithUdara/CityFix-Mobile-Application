const { test } = require('node:test');
const assert = require('node:assert/strict');
const { achievements, adjust, contribution, publicIssue } = require('../src/domain');
test('analytics reverses old contributions when reports change or are removed', () => {
  const createdAt = { toMillis: () => Date.UTC(2026, 0, 1) },
    updatedAt = { toMillis: () => Date.UTC(2026, 0, 3) };
  const original = contribution({
    ownerId: 'alice',
    category: 'Roads',
    severity: 'High',
    status: 'Reported',
    createdAt,
    updatedAt,
  });
  const resolved = { ...original, status: 'Resolved', resolutionHours: 48 };
  const summary = adjust(adjust(adjust({}, original, 1), original, -1), resolved, 1);
  assert.equal(summary.total, 1);
  assert.equal(summary.byStatus.Reported, 0);
  assert.equal(summary.byStatus.Resolved, 1);
  assert.equal(summary.resolutionHours, 48);
  adjust(summary, resolved, -1);
  assert.equal(summary.total, 0);
  assert.equal(summary.resolutionHours, 0);
});
test('badges have thresholds and points cannot be negative', () => {
  assert.deepEqual(achievements(-1, -2), { reports: 0, resolved: 0, points: 0, badges: [] });
  const result = achievements(5, 1);
  assert.equal(result.points, 35);
  assert.deepEqual(result.badges, ['first-step', 'local-observer', 'positive-change']);
});
test('integration output excludes account ids, confirmation identities and storage paths', () => {
  const issue = publicIssue('abc', {
    ownerId: 'private',
    confirmedBy: { alice: true },
    photos: [{ url: 'image', path: 'private/path' }],
  });
  assert.equal(issue.confirmations, 1);
  assert.equal(issue.ownerId, undefined);
  assert.equal(issue.confirmedBy, undefined);
  assert.deepEqual(issue.photos, [{ url: 'image' }]);
});
