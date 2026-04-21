const { parseArgs, request, toUnixSeconds, normalizeSeries, showHelpAndExit, validateInterval, ensureMaxSymbols, writeCsv } = require('./coinalyze-client');

const CURRENT_MAP = {
  oi: '/open-interest',
  funding: '/funding-rate',
  predicted_funding: '/predicted-funding-rate',
};

const HISTORY_MAP = {
  oi: '/open-interest-history',
  funding: '/funding-rate-history',
  predicted_funding: '/predicted-funding-rate-history',
  liquidation: '/liquidation-history',
  ohlcv: '/ohlcv-history',
  long_short_ratio: '/long-short-ratio-history',
};

const HELP = `
Usage:
  node scripts/get-indicators.js --mode current --metrics oi,funding --symbols BTCUSDT_PERP.A
  node scripts/get-indicators.js --mode history --metrics oi,liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d
  node scripts/get-indicators.js --mode history --metrics oi,liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d --csv output/indicators.csv

Options:
  --mode             current | history
  --metrics          Comma-separated metrics
  --symbols          Comma-separated symbols, max 20 per request
  --interval         Required for history mode. Valid values: 1min, 5min, 15min, 30min, 1hour, 2hour, 4hour, 6hour, 12hour, daily
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
    if (!args.mode) throw new Error('Missing --mode');
    if (!args.metrics) throw new Error('Missing --metrics');
    if (!args.symbols) throw new Error('Missing --symbols');

    const metrics = args.metrics.split(',').map((x) => x.trim()).filter(Boolean);
    const mode = args.mode;
    const symbols = ensureMaxSymbols(args.symbols);
    const convert_to_usd = args.convert_to_usd || 'false';

    if (mode === 'history') {
      if (!args.interval) throw new Error('Missing --interval for history mode');
      validateInterval(args.interval);
    }

    const results = {};
    const csvRows = [];

    for (const metric of metrics) {
      if (mode === 'current') {
        const path = CURRENT_MAP[metric];
        if (!path) throw new Error(`Unsupported current metric: ${metric}`);
        const data = await request(path, {
          symbols: symbols.join(','),
          convert_to_usd,
        });
        results[metric] = data;
        if (Array.isArray(data)) {
          data.forEach((row) => csvRows.push({ metric, ...row }));
        } else {
          csvRows.push({ metric, ...data });
        }
      } else if (mode === 'history') {
        const path = HISTORY_MAP[metric];
        if (!path) throw new Error(`Unsupported history metric: ${metric}`);
        const data = await request(path, {
          symbols: symbols.join(','),
          interval: args.interval,
          from: toUnixSeconds(args.from),
          to: toUnixSeconds(args.to),
          convert_to_usd,
        });
        const normalized = Array.isArray(data)
          ? data.map((item) => ({
              symbol: item.symbol,
              history: normalizeSeries(metric, item.history || item.data || []),
              ...Object.fromEntries(Object.entries(item).filter(([k]) => !['history', 'data'].includes(k))),
            }))
          : data;
        results[metric] = normalized;
        if (Array.isArray(normalized)) {
          normalized.forEach((item) => {
            (item.history || []).forEach((row) => csvRows.push({ symbol: item.symbol, metric, ...row }));
          });
        } else {
          csvRows.push({ metric, ...normalized });
        }
      } else {
        throw new Error('Invalid --mode. Use current or history');
      }
    }

    if (args.csv) writeCsv(args.csv, csvRows);

    console.log(JSON.stringify({
      mode,
      metrics,
      symbols,
      interval: args.interval,
      csv: args.csv || null,
      data: results,
    }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
