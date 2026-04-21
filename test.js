const assert = require('assert');

const {
  parseArgs,
  toUnixSeconds,
  validateInterval,
  ensureMaxSymbols,
  chunkSymbols,
} = require('./scripts/coinalyze-client');

const {
  readCache,
  writeCache,
} = require('./scripts/cache');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    passed += 1;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(err.message);
    failed += 1;
  }
}

test('parseArgs parses flags and values', () => {
  const args = parseArgs([
    '--type', 'oi',
    '--symbols', 'BTCUSDT_PERP.A,ETHUSDT_PERP.A',
    '--help'
  ]);
  assert.strictEqual(args.type, 'oi');
  assert.strictEqual(args.symbols, 'BTCUSDT_PERP.A,ETHUSDT_PERP.A');
  assert.strictEqual(args.help, true);
});

test('toUnixSeconds supports relative days', () => {
  const ts = toUnixSeconds('1d');
  assert.ok(Number.isInteger(ts));
});

test('toUnixSeconds supports ISO date', () => {
  const ts = toUnixSeconds('2026-04-01');
  assert.ok(Number.isInteger(ts));
  assert.ok(ts > 0);
});

test('validateInterval accepts valid interval', () => {
  validateInterval('1hour');
  validateInterval('daily');
});

test('validateInterval rejects invalid interval', () => {
  let threw = false;
  try {
    validateInterval('3hour');
  } catch {
    threw = true;
  }
  assert.strictEqual(threw, true);
});

test('ensureMaxSymbols accepts up to 20 symbols', () => {
  const symbols = Array.from({ length: 20 }, (_, i) => `SYM${i}_PERP.A`).join(',');
  const result = ensureMaxSymbols(symbols);
  assert.strictEqual(result.length, 20);
});

test('ensureMaxSymbols rejects more than 20 symbols', () => {
  const symbols = Array.from({ length: 21 }, (_, i) => `SYM${i}_PERP.A`).join(',');
  let threw = false;
  try {
    ensureMaxSymbols(symbols);
  } catch {
    threw = true;
  }
  assert.strictEqual(threw, true);
});

test('chunkSymbols splits into groups of 20', () => {
  const symbols = Array.from({ length: 45 }, (_, i) => `SYM${i}_PERP.A`);
  const chunks = chunkSymbols(symbols, 20);
  assert.strictEqual(chunks.length, 3);
  assert.strictEqual(chunks[0].length, 20);
  assert.strictEqual(chunks[1].length, 20);
  assert.strictEqual(chunks[2].length, 5);
});

test('cache write and read works', () => {
  const payload = {
    pathname: '/open-interest',
    params: { symbols: 'BTCUSDT_PERP.A' }
  };
  const data = [{ symbol: 'BTCUSDT_PERP.A', value: 123 }];

  writeCache(payload, data);
  const cached = readCache(payload, 300);

  assert.ok(Array.isArray(cached));
  assert.strictEqual(cached[0].symbol, 'BTCUSDT_PERP.A');
  assert.strictEqual(cached[0].value, 123);
});

process.on('exit', () => {
  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);
  if (failed > 0) process.exitCode = 1;
});