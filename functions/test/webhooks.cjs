const { test } = require('node:test');
const assert = require('node:assert/strict');
const { publicAddress } = require('../src/webhooks');
test('webhook receivers reject local, private, metadata and reserved IPv4 addresses', () => {
  for (const ip of [
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '192.168.1.2',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '224.1.2.3',
    '198.18.1.1',
    '::1',
  ])
    assert.equal(publicAddress(ip), false, ip);
  assert.equal(publicAddress('8.8.8.8'), true);
});
