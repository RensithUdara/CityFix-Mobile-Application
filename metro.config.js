const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const config = getDefaultConfig(__dirname);
// Generated exports and browser artifacts must not be watched as application source.
const generated = ['dist', 'test-results', 'playwright-report'].map((folder) => {
  const absolute = path.resolve(__dirname, folder).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${absolute}(?:[/\\\\]|$)`);
});
const existing = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  ...generated,
];
module.exports = config;
