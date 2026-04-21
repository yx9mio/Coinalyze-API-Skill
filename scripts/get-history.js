const { parseArgs, request, toUnixSeconds, normalizeSeries, showHelpAndExit, validateInterval, ensureMaxSymbols, writeCsv } = require('./coinalyze-client');

const TYPE_TO_PATH = {
  oi: '/open-interest-history',
  funding: '/funding-rate-history',
  predicted_funding: '/predicted-funding-rate-history',
  liquidation: '/liquidation-history',
  ohlcv: '/ohlcv-history',
  long_short_ratio: '/long-short-ratio-history',
};

const HELP = `
Usage:
  node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d
  node scripts/get-history.js --type oi --symbols BTCUSDT_PERP.A --interval 1hour --from 3d --csv output/oi-history.csv

Options:
  --type             oi | funding | predicted_funding | liquidation | ohlcv | long_short_ratio
  --symbols          Comma-separated symbols, max 20 per request
  --interval         1min | 5min | 15min | 30min | 1hour | 2hour | 4hour | 6hour | 12hour | daily
  --from             Unix time, ISO date, or relative time like 7d / 12h / 30m
  --to               Unix time, ISO date, or relative time
  --convert_to_usd   true | false
  --csv              Optional CSV output path
  --help             Show this help message
`;

(async () => {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) showHelpAndExit(HELP);
    if (!args.symbols) throw new Error('Missing --symbols');
    if (!args.interval) throw new Error('Missing --interval');

    const symbols = ensureMaxSymbols(args.symbols);
    validateInterval(args.interval);

    const type = args.type || 'oi';
    const path = TYPE_TO_PATH[type];
    if (!path) {
      throw new Error('Invalid --type. Use oi, funding, predicted_funding, liquidation, ohlcv, or long_short_ratio');
    }

    const params = {
      symbols: symbols.join(','),
      interval: args.interval,
      from: toUnixSeconds(args.from),
      to: toUnixSeconds(args.to) || Math.floor(Date.now() / 1000),
      convert_to_usd: args.convert_to_usd || 'false',
    };

    const data = await request(path, params);
    const normalized = Array.isArray(data)
      ? data.map((item) => ({
          symbol: item.symbol,
          history: normalizeSeries(type, item.history || item.data || []),
          ...Object.fromEntries(Object.entries(item).filter(([k]) => !['history', 'data'].includes(k))),
        }))
      : data;

    const csvRows = Array.isArray(normalized)
      ? normalized.flatMap((item) => (item.history || []).map((row) => ({ symbol: item.symbol, ...row })))
      : [normalized];

    if (args.csv) writeCsv(args.csv, csvRows);
    console.log(JSON.stringify({ type, interval: args.interval, symbols, csv: args.csv || null, data: normalized }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
