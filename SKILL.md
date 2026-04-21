---
name: coinalyze-js
description: JavaScript skill for Coinalyze API to fetch crypto futures market data including Open Interest, Funding Rates, Liquidations, OHLCV, and Long/Short Ratios.
---

# Coinalyze JS Skill

This skill provides access to Coinalyze's cryptocurrency futures market data through JavaScript/Node.js scripts. It supports market discovery, current metrics, historical metrics, multi-metric queries, batch fetching, local caching, and CSV export.

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

### Environment setup

Linux/macOS:

```bash
export COINALYZE_API_KEY="your_api_key"
```

Or use a `.env` file:

```env
COINALYZE_API_KEY=your_api_key_here
```

The project can load `.env` automatically with `dotenv`.

## Project Structure

```text
coinalyze-js-skill/
├── .env.example
├── SKILL.md
├── README.md
├── package.json
├── symbols.txt
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

- List futures markets:
  ```bash
  node scripts/get-markets.js --type future
  ```

- List spot markets:
  ```bash
  node scripts/get-markets.js --type spot
  ```

- List exchanges:
  ```bash
  node scripts/get-markets.js --type exchange
  ```

### 2. Current Metrics

Use this to get real-time snapshots for one or more symbols.

- Open Interest:
  ```bash
  node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A
  ```

- Funding Rate:
  ```bash
  node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A
  ```

- Predicted Funding Rate:
  ```bash
  node scripts/get-current-data.js --type predicted_funding --symbols BTCUSDT_PERP.A
  ```

### 3. Historical Metrics

Use this for time-series analysis.

- Liquidation history:
  ```bash
  node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d
  ```

- Funding history:
  ```bash
  node scripts/get-history.js --type funding --symbols BTCUSDT_PERP.A --interval 1hour --from 3d
  ```

- OHLCV history:
  ```bash
  node scripts/get-history.js --type ohlcv --symbols BTCUSDT_PERP.A --interval 4hour --from 14d
  ```

## Command Examples

### Market discovery examples

Get futures market list:

```bash
node scripts/get-markets.js --type future
```

Get spot market list:

```bash
node scripts/get-markets.js --type spot
```

Get exchanges:

```bash
node scripts/get-markets.js --type exchange
```

Save futures markets to CSV:

```bash
node scripts/get-markets.js --type future --csv output/futures.csv
```

### Current metric examples

Get OI for one symbol:

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A
```

Get OI for multiple symbols:

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A,ETHUSDT_PERP.A,SOLUSDT_PERP.A
```

Get funding rate:

```bash
node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A
```

Get predicted funding:

```bash
node scripts/get-current-data.js --type predicted_funding --symbols BTCUSDT_PERP.A
```

Convert values to USD when supported:

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A --convert_to_usd true
```

Export current metric to CSV:

```bash
node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A --csv output/current-funding.csv
```

### Historical metric examples

Get liquidation history for 7 days:

```bash
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d
```

Get hourly funding history for 3 days:

```bash
node scripts/get-history.js --type funding --symbols BTCUSDT_PERP.A --interval 1hour --from 3d
```

Get OHLCV history for 14 days:

```bash
node scripts/get-history.js --type ohlcv --symbols BTCUSDT_PERP.A --interval 4hour --from 14d
```

Get long/short ratio history:

```bash
node scripts/get-history.js --type long_short_ratio --symbols BTCUSDT_PERP.A --interval daily --from 30d
```

Get OI history between two dates:

```bash
node scripts/get-history.js --type oi --symbols BTCUSDT_PERP.A --interval daily --from 2026-04-01 --to 2026-04-21
```

Export historical data to CSV:

```bash
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 30d --csv output/liquidation-history.csv
```

### Multi-metric examples

Get several current indicators in one command:

```bash
node scripts/get-indicators.js --mode current --metrics oi,funding,predicted_funding --symbols BTCUSDT_PERP.A
```

Get several history indicators for one symbol:

```bash
node scripts/get-indicators.js --mode history --metrics oi,liquidation,long_short_ratio --symbols BTCUSDT_PERP.A --interval daily --from 7d
```

Get several history indicators for multiple symbols:

```bash
node scripts/get-indicators.js --mode history --metrics oi,funding --symbols BTCUSDT_PERP.A,ETHUSDT_PERP.A --interval 1hour --from 3d
```

Export combined indicators to CSV:

```bash
node scripts/get-indicators.js --mode history --metrics oi,liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d --csv output/combined-indicators.csv
```

### Batch examples

Run batch current metrics from a symbols file:

```bash
node scripts/get-batch-indicators.js --mode current --metrics oi,funding --symbols-file symbols.txt
```

Run batch historical metrics from a symbols file:

```bash
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation,long_short_ratio --symbols-file symbols.txt --interval daily --from 7d
```

Run batch history with cache TTL:

```bash
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation --symbols-file symbols.txt --interval daily --from 7d --ttl 300
```

Export batch results to CSV:

```bash
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation --symbols-file symbols.txt --interval daily --from 7d --csv output/batch-history.csv
```

### Help examples

Show help for market commands:

```bash
node scripts/get-markets.js --help
```

Show help for current metrics:

```bash
node scripts/get-current-data.js --help
```

Show help for historical metrics:

```bash
node scripts/get-history.js --help
```

Show help for combined indicators:

```bash
node scripts/get-indicators.js --help
```

Show help for batch mode:

```bash
node scripts/get-batch-indicators.js --help
```

## Supported Parameters

### Common arguments

- `--symbols`: Comma-separated list of symbols
- `--symbols-file`: File containing symbols separated by newline or comma
- `--type`: Metric type for single-metric scripts
- `--mode`: `current` or `history` for multi-metric scripts
- `--metrics`: Comma-separated list of metric names
- `--interval`: Historical timeframe
- `--from`: Start time, accepts UNIX timestamp, ISO date, or shorthand such as `7d`, `12h`, `30m`
- `--to`: End time, same format as `--from`
- `--convert_to_usd`: `true` or `false`
- `--csv`: Output CSV file path
- `--ttl`: Cache TTL in seconds for batch mode
- `--help`: Show usage information

### Supported intervals

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

### Supported metric names

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
```

## Output Format

All scripts print JSON to stdout. This makes them easy to redirect into files, pipe into `jq`, parse in automation, or export into CSV for further analysis.

Example:

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A > output/oi.json
```

## Best Practices

- **Resolve symbols first**: Call market discovery before requesting metrics.
- **Use valid symbol format**: Example: `BTCUSDT_PERP.A`.
- **Respect rate limits**: The API is limited to 40 calls per minute per API key. [web:2]
- **Handle 429 correctly**: The API returns HTTP 429 and includes `Retry-After` when rate limit is exceeded. [web:2]
- **Use batch mode for large symbol sets**: Current and history requests support up to 20 symbols per request. [web:2]
- **Use cache for repeated scans**: This reduces repeated requests during screening workflows.
- **Use CSV export for downstream analysis**: Useful for spreadsheets, dashboards, or data pipelines.

## Rate Limits and Constraints

- Authentication uses the `api_key` header or query parameter. [web:2]
- The API is limited to 40 calls per minute per API key. [web:2]
- When the limit is exceeded, the API returns HTTP 429 and includes a `Retry-After` header. [web:2]
- Current and historical symbol queries support up to 20 symbols per request. [web:2]
- Historical endpoints use interval values such as `1min`, `5min`, `15min`, `30min`, `1hour`, `2hour`, `4hour`, `6hour`, `12hour`, and `daily`. [web:2]

## Error Handling

The scripts validate common errors before sending requests where possible.

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

This skill is designed for crypto futures market analysis and screening workflows. It is best suited for monitoring leverage, funding pressure, liquidation events, and long/short positioning across exchanges.
