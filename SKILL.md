---
name: coinalyze-js
description: JavaScript skill for Coinalyze API to fetch crypto futures market data including Open Interest, Funding Rates, Liquidations, OHLCV, and Long/Short Ratios.
---

# Coinalyze JS Skill

This skill provides access to Coinalyze cryptocurrency futures market data through JavaScript/Node.js scripts. It supports market discovery, current metrics, historical metrics, multi-metric queries, batch fetching, local caching, and CSV export.

## Key Capabilities

- **Market Discovery**: List supported exchanges, futures markets, and spot markets before querying any metric.
- **Current Metrics**: Get current Open Interest, Funding Rate, and Predicted Funding Rate for one or more symbols.
- **Historical Metrics**: Retrieve time-series data for:
  - Open Interest history
  - Funding Rate history
  - Predicted Funding Rate history
  - Liquidation history
  - OHLCV history
  - Long/Short Ratio history
- **Multi-Metric Fetch**: Query multiple indicators in a single command.
- **Batch Fetching**: Automatically split large symbol lists into groups of up to 20 symbols per request.
- **Local Cache**: Store query results in local JSON cache files to reduce repeated API calls.
- **CSV Export**: Save results from market, current, history, indicator, and batch commands into CSV files.

## API Authentication

The Coinalyze API requires an `api_key`. This skill reads the key from the environment variable `COINALYZE_API_KEY`. [web:2]

### Environment Setup

Linux/macOS:

```bash
export COINALYZE_API_KEY="your_api_key"
```

Or use a `.env` file:

```env
COINALYZE_API_KEY=your_api_key_here
```

## Project Structure

```text
coinalyze-js-skill/
├── .env.example
├── SKILL.md
├── README.md
├── package.json
├── symbols.txt
├── test.js
├── .github/
│   └── workflows/
│       └── node-ci.yml
└── scripts/
    ├── cache.js
    ├── coinalyze-client.js
    ├── get-markets.js
    ├── get-current-data.js
    ├── get-history.js
    ├── get-indicators.js
    └── get-batch-indicators.js
```

## Installation

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env
```

## Usage Guide

### 1. Market Discovery

Use this first to find valid symbols and exchanges.

```bash
node scripts/get-markets.js --type future
node scripts/get-markets.js --type spot
node scripts/get-markets.js --type exchange
```

### 2. Current Metrics

Use this for real-time snapshots.

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A
node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A
node scripts/get-current-data.js --type predicted_funding --symbols BTCUSDT_PERP.A
```

### 3. Historical Metrics

Use this for time-series analysis.

```bash
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d
node scripts/get-history.js --type funding --symbols BTCUSDT_PERP.A --interval 1hour --from 3d
node scripts/get-history.js --type ohlcv --symbols BTCUSDT_PERP.A --interval 4hour --from 14d
```

## Command Examples

### Market discovery examples

```bash
node scripts/get-markets.js --type future
node scripts/get-markets.js --type future --csv output/futures.csv
```

### Current metric examples

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A,ETHUSDT_PERP.A,SOLUSDT_PERP.A
node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A --csv output/current-funding.csv
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A --convert_to_usd true
```

### Historical metric examples

```bash
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d
node scripts/get-history.js --type funding --symbols BTCUSDT_PERP.A --interval 1hour --from 3d
node scripts/get-history.js --type long_short_ratio --symbols BTCUSDT_PERP.A --interval daily --from 30d
node scripts/get-history.js --type oi --symbols BTCUSDT_PERP.A --interval daily --from 2026-04-01 --to 2026-04-21
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 30d --csv output/liquidation-history.csv
```

### Multi-metric examples

```bash
node scripts/get-indicators.js --mode current --metrics oi,funding,predicted_funding --symbols BTCUSDT_PERP.A
node scripts/get-indicators.js --mode history --metrics oi,liquidation,long_short_ratio --symbols BTCUSDT_PERP.A --interval daily --from 7d
node scripts/get-indicators.js --mode history --metrics oi,funding --symbols BTCUSDT_PERP.A,ETHUSDT_PERP.A --interval 1hour --from 3d
node scripts/get-indicators.js --mode history --metrics oi,liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d --csv output/combined-indicators.csv
```

### Batch examples

```bash
node scripts/get-batch-indicators.js --mode current --metrics oi,funding --symbols-file symbols.txt
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation,long_short_ratio --symbols-file symbols.txt --interval daily --from 7d
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation --symbols-file symbols.txt --interval daily --from 7d --ttl 300
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation --symbols-file symbols.txt --interval daily --from 7d --csv output/batch-history.csv
```

### Help examples

```bash
node scripts/get-markets.js --help
node scripts/get-current-data.js --help
node scripts/get-history.js --help
node scripts/get-indicators.js --help
node scripts/get-batch-indicators.js --help
```

## Supported Parameters

- `--symbols`: Comma-separated list of symbols
- `--symbols-file`: File containing symbols separated by newline or comma
- `--type`: Metric type for single-metric scripts
- `--mode`: `current` or `history`
- `--metrics`: Comma-separated metric names
- `--interval`: Historical timeframe
- `--from`: UNIX timestamp, ISO date, or shorthand like `7d`, `12h`, `30m`
- `--to`: End time in the same format as `--from`
- `--convert_to_usd`: `true` or `false`
- `--csv`: Output CSV file path
- `--ttl`: Cache TTL in seconds for batch mode
- `--help`: Show usage information

## Supported Intervals

- `1min`
- `5min`
- `15min`
- `30min`
- `1hour`
- `2hour`
- `4hour`
- `6hour`
- `12hour`
- `daily`

The Coinalyze docs list these interval values for historical endpoints. [web:2]

## Supported Metrics

Current mode:
- `oi`
- `funding`
- `predicted_funding`

History mode:
- `oi`
- `funding`
- `predicted_funding`
- `liquidation`
- `ohlcv`
- `long_short_ratio`

## NPM Scripts

```bash
npm run markets:future
npm run markets:spot
npm run markets:exchange
npm run current:oi
npm run current:funding
npm run current:predicted-funding
npm run history:oi
npm run history:funding
npm run history:liquidation
npm run history:ohlcv
npm run history:long-short
npm run indicators:current
npm run indicators:history
npm run batch:current
npm run batch:history
npm run help:markets
npm run help:current
npm run help:history
npm run help:indicators
npm run help:batch
npm test
```

## Output Format

All scripts print JSON to stdout. This makes them easy to redirect into files, pipe into `jq`, parse in automation, or export into CSV for further analysis.

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A > output/oi.json
```

## Best Practices

- **Resolve symbols first**: Call market discovery before requesting metrics.
- **Use valid symbol format**: Example: `BTCUSDT_PERP.A`. [file:1]
- **Respect rate limits**: The API is limited to 40 calls per minute per API key. [web:2]
- **Handle 429 correctly**: The API returns HTTP 429 and includes `Retry-After`. [web:2]
- **Use batch mode for large symbol sets**: Current and history requests support up to 20 symbols per request. [web:2]
- **Use cache for repeated scans**: This reduces repeated requests during screening workflows.
- **Use CSV export for downstream analysis**: Useful for spreadsheets, dashboards, or pipelines.

## Rate Limits and Constraints

- Authentication uses `api_key` in header or query parameter. [web:2]
- The API is limited to 40 calls per minute per API key. [web:2]
- When the limit is exceeded, the API returns HTTP 429 and includes a `Retry-After` header. [web:2]
- Historical data are returned in ascending order. [web:2]
- Intraday historical data retain only about 1500 to 2000 datapoints, while daily data keep older history. [web:2]
- Current and historical symbol queries support up to 20 symbols per request, and each symbol still consumes one API call. [web:2]

## Error Handling

Typical failures:
- Missing `COINALYZE_API_KEY`
- Invalid symbol format
- Invalid `--interval`
- Missing `--interval` in history mode
- Too many symbols in single-request mode
- Unsupported metric name
- API rate limit exceeded

## Recommended Workflow

1. Discover valid futures symbols with `get-markets.js`.
2. Query current OI or funding with `get-current-data.js`.
3. Use `get-history.js` for deeper time-series analysis.
4. Use `get-indicators.js` when you want several indicators for the same symbols.
5. Use `get-batch-indicators.js` when scanning many symbols at once.

## Notes

This skill is best suited for crypto futures monitoring, leverage analysis, funding pressure checks, liquidation tracking, and long/short positioning analysis across supported exchanges.