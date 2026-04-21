const fs = require('fs');
const {
  parseArgs,
  request,
  toUnixSeconds,
  showHelpAndExit,
  validateInterval,
  chunkSymbols,
  writeCsv,
} = require('./coinalyze-client');
const { readCache, writeCache } = require('./cache');

const HELP_TEXT = `
Usage: node scripts/get-batch-indicators.js [options]

Options:
  --mode             current or history (required)
  --metrics          Comma-separated metric list (e.g., oi,funding)
  --symbols          Comma-separated symbols
  --symbols-file     File with symbols (newline or comma separated)
  --interval         Interval for history mode (e.g., daily, 1hour)
  --from             Start time (UNIX, ISO, or shorthand like 7d)
  --to               End time (UNIX or ISO)
  --convert_to_usd   true or false (for current metrics)
  --ttl              Cache TTL in seconds (default: 300)
  --csv              Output CSV file path
  --help             Show help
`;

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) showHelpAndExit(HELP_TEXT);

  const {
    mode,
    metrics,
    symbols,
    'symbols-file': symbolsFile,
    interval,
    from,
    to,
    convert_to_usd,
    ttl = 300,
    csv,
  } = args;

  if (!mode) showHelpAndExit('Error: --mode is required (current or history)');
  if (!metrics) showHelpAndExit('Error: --metrics is required');

  let symbolList = [];
  if (symbols) {
    symbolList = symbols.split(',').map((s) => s.trim()).filter(Boolean);
  } else if (symbolsFile) {
    if (!fs.existsSync(symbolsFile)) {
      console.error(`Error: symbols file not found: ${symbolsFile}`);
      process.exit(1);
    }
    const content = fs.readFileSync(symbolsFile, 'utf8');
    symbolList = content.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  } else {
    showHelpAndExit('Error: --symbols or --symbols-file is required');
  }

  const metricList = metrics.split(',').map((m) => m.trim()).filter(Boolean);
  const chunks = chunkSymbols(symbolList, 20);
  const results = [];

  for (const chunk of chunks) {
    const chunkSymbolsStr = chunk.join(',');
    const chunkResults = {};

    for (const metric of metricList) {
      let pathname;
      const params = { symbols: chunkSymbolsStr };

      if (mode === 'current') {
        if (metric === 'oi') pathname = '/open-interest';
        else if (metric === 'funding') pathname = '/funding-rate';
        else if (metric === 'predicted_funding') pathname = '/predicted-funding-rate';
        else continue;

        if (convert_to_usd) params.convert_to_usd = convert_to_usd;
      } else {
        validateInterval(interval);
        params.interval = interval;
        params.from = toUnixSeconds(from);
        params.to = toUnixSeconds(to) || Math.floor(Date.now() / 1000);

        if (metric === 'oi') pathname = '/open-interest-history';
        else if (metric === 'funding') pathname = '/funding-rate-history';
        else if (metric === 'predicted_funding') pathname = '/predicted-funding-rate-history';
        else if (metric === 'liquidation') pathname = '/liquidation-history';
        else if (metric === 'ohlcv') pathname = '/ohlcv-history';
        else if (metric === 'long_short_ratio') pathname = '/long-short-ratio-history';
        else continue;
      }

      const cachePayload = { mode, metric, params };
      let data = readCache(cachePayload, Number(ttl));

      if (!data) {
        try {
          data = await request(pathname, params);
          writeCache(cachePayload, data);
        } catch (err) {
          console.error(`Error fetching ${metric} for ${chunkSymbolsStr}: ${err.message}`);
          continue;
        }
      }

      chunkResults[metric] = data;
    }

    // Merge chunk results by symbol
    const merged = [];
    if (mode === 'current') {
      for (const symbol of chunk) {
        const row = { symbol };
        for (const metric of metricList) {
          const metricData = chunkResults[metric];
          if (Array.isArray(metricData)) {
            const found = metricData.find((d) => d.symbol === symbol);
            if (found) {
              Object.entries(found).forEach(([k, v]) => {
                if (k !== 'symbol') row[`${metric}.${k}`] = v;
              });
            }
          }
        }
        merged.push(row);
      }
    } else {
      // For history, we might have many rows per symbol.
      // This batch script simplifies by just collecting everything.
      for (const metric of metricList) {
        const metricData = chunkResults[metric];
        if (Array.isArray(metricData)) {
          metricData.forEach((d) => {
            merged.push({ metric, ...d });
          });
        }
      }
    }
    results.push(...merged);
  }

  console.log(JSON.stringify(results, null, 2));

  if (csv) {
    writeCsv(csv, results);
    console.error(`\nExported to ${csv}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
