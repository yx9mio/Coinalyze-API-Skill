require('dotenv').config();

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://api.coinalyze.net/v1';
const VALID_INTERVALS = new Set(['1min', '5min', '15min', '30min', '1hour', '2hour', '4hour', '6hour', '12hour', 'daily']);

function getApiKey() {
  const key = process.env.COINALYZE_API_KEY;
  if (!key) {
    throw new Error('Missing COINALYZE_API_KEY environment variable');
  }
  return key;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function toUnixSeconds(input) {
  if (!input) return undefined;
  if (/^\d+$/.test(input)) return Number(input);
  const now = new Date();
  const m = String(input).match(/^(\d+)([dhm])$/i);
  if (m) {
    const value = Number(m[1]);
    const unit = m[2].toLowerCase();
    const ms = unit === 'd' ? value * 86400000 : unit === 'h' ? value * 3600000 : value * 60000;
    return Math.floor((now.getTime() - ms) / 1000);
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date/time input: ${input}`);
  }
  return Math.floor(date.getTime() / 1000);
}

function showHelpAndExit(text) {
  console.log(text.trim());
  process.exit(0);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateInterval(interval) {
  if (!interval) return;
  if (!VALID_INTERVALS.has(interval)) {
    throw new Error(`Invalid --interval: ${interval}. Valid values: ${Array.from(VALID_INTERVALS).join(', ')}`);
  }
}

function ensureMaxSymbols(symbols) {
  const list = String(symbols).split(',').map((x) => x.trim()).filter(Boolean);
  if (list.length > 20) {
    throw new Error(`Too many symbols: ${list.length}. Coinalyze supports maximum 20 symbols per request.`);
  }
  return list;
}

async function request(pathname, params = {}, options = {}) {
  const url = new URL(`${BASE_URL}${pathname}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  const maxRetries = Number(options.maxRetries ?? 2);
  let attempt = 0;

  while (true) {
    const response = await fetch(url, {
      headers: {
        api_key: getApiKey(),
        accept: 'application/json',
      },
    });

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get('Retry-After') || 0);
      if (attempt >= maxRetries) {
        throw new Error(`Rate limit exceeded (429). Retry-After: ${retryAfter || 'unknown'} seconds`);
      }
      const backoffMs = retryAfter > 0 ? retryAfter * 1000 : Math.min(1000 * 2 ** attempt, 8000);
      await sleep(backoffMs);
      attempt += 1;
      continue;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return response.json();
  }
}

function normalizeSeries(metric, rows) {
  if (!Array.isArray(rows)) return rows;
  return rows.map((row) => ({ metric, ...row }));
}

function flattenObject(obj, prefix = '') {
  const out = {};
  for (const [key, value] of Object.entries(obj || {})) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flattenObject(value, nextKey));
    } else {
      out[nextKey] = value;
    }
  }
  return out;
}

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function writeCsv(filePath, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    fs.writeFileSync(filePath, '');
    return;
  }
  const flattened = rows.map((row) => flattenObject(row));
  const headers = Array.from(new Set(flattened.flatMap((row) => Object.keys(row))));
  const lines = [headers.join(',')];
  for (const row of flattened) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(','));
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`);
}

module.exports = {
  parseArgs,
  request,
  toUnixSeconds,
  normalizeSeries,
  showHelpAndExit,
  validateInterval,
  ensureMaxSymbols,
  writeCsv,
  VALID_INTERVALS,
};
