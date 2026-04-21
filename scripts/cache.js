const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(process.cwd(), '.cache');

function ensureCacheDir() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function makeCacheKey(payload) {
  return crypto
    .createHash('sha1')
    .update(JSON.stringify(payload))
    .digest('hex');
}

function getCachePath(key) {
  ensureCacheDir();
  return path.join(CACHE_DIR, `${key}.json`);
}

function readCache(payload, ttlSeconds = 300) {
  const key = makeCacheKey(payload);
  const file = getCachePath(key);

  if (!fs.existsSync(file)) return null;

  const stat = fs.statSync(file);
  const ageSeconds = (Date.now() - stat.mtimeMs) / 1000;

  if (ageSeconds > ttlSeconds) return null;

  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeCache(payload, data) {
  const key = makeCacheKey(payload);
  const file = getCachePath(key);

  ensureCacheDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');

  return file;
}

module.exports = {
  readCache,
  writeCache,
  makeCacheKey,
};