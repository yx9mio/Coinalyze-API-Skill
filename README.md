# Coinalyze JS Skill

JavaScript/Node.js project for accessing Coinalyze crypto futures market data, including Open Interest, Funding Rates, Predicted Funding Rates, Liquidations, OHLCV, and Long/Short Ratios.

This project is designed for market screening, derivatives analysis, batch symbol scans, and downstream data export workflows.

## Features

- Market discovery for exchanges, spot markets, and futures markets
- Current metrics for Open Interest, Funding Rate, and Predicted Funding Rate
- Historical metrics for:
  - Open Interest
  - Funding Rate
  - Predicted Funding Rate
  - Liquidations
  - OHLCV
  - Long/Short Ratio
- Multi-metric fetch in one command
- Batch fetch for large symbol lists
- Local JSON cache to reduce repeated API calls
- CSV export for analysis workflows
- Command help for every script

## Requirements

- Node.js 18 or newer
- A valid Coinalyze API key

The Coinalyze API uses API key authentication via the `api_key` header or query parameter. The public docs also state a rate limit of 40 API calls per minute per key, and that a 429 response includes a `Retry-After` header. [web:2]

## Installation

Clone or copy the project, then install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
COINALYZE_API_KEY=your_api_key_here
```

The project can load `.env` automatically using `dotenv`.

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

## Authentication

Set your API key in one of these ways.

### Linux/macOS

```bash
export COINALYZE_API_KEY="your_api_key"
```

### Windows PowerShell

```powershell
$env:COINALYZE_API_KEY="your_api_key"
```

### .env file

```env
COINALYZE_API_KEY=your_api_key_here
```

## Quick Start

List futures markets:

```bash
node scripts/get-markets.js --type future
```

Get current Open Interest:

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A
```

Get liquidation history:

```bash
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d
```

Get multiple indicators in one command:

```bash
node scripts/get-indicators.js --mode current --metrics oi,funding,predicted_funding --symbols BTCUSDT_PERP.A
```

Run batch history for many symbols:

```bash
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation --symbols-file symbols.txt --interval daily --from 7d
```

## Available Scripts

### 1. Market discovery

Use these commands to find valid exchanges and symbols before querying data.

List futures markets:

```bash
node scripts/get-markets.js --type future
```

List spot markets:

```bash
node scripts/get-markets.js --type spot
```

List exchanges:

```bash
node scripts/get-markets.js --type exchange
```

Export futures markets to CSV:

```bash
node scripts/get-markets.js --type future --csv output/futures.csv
```

### 2. Current metrics

Use these for real-time snapshots.

Get Open Interest:

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A
```

Get Open Interest for multiple symbols:

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A,ETHUSDT_PERP.A,SOLUSDT_PERP.A
```

Get Funding Rate:

```bash
node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A
```

Get Predicted Funding Rate:

```bash
node scripts/get-current-data.js --type predicted_funding --symbols BTCUSDT_PERP.A
```

Convert to USD when supported:

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A --convert_to_usd true
```

Export current metrics to CSV:

```bash
node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A --csv output/current-funding.csv
```

### 3. Historical metrics

Use these for time-series analysis.

Get liquidation history for 7 days:

```bash
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d
```

Get funding history for 3 days in 1-hour granularity:

```bash
node scripts/get-history.js --type funding --symbols BTCUSDT_PERP.A --interval 1hour --from 3d
```

Get OHLCV history for 14 days in 4-hour granularity:

```bash
node scripts/get-history.js --type ohlcv --symbols BTCUSDT_PERP.A --interval 4hour --from 14d
```

Get long/short ratio history:

```bash
node scripts/get-history.js --type long_short_ratio --symbols BTCUSDT_PERP.A --interval daily --from 30d
```

Get Open Interest history between two dates:

```bash
node scripts/get-history.js --type oi --symbols BTCUSDT_PERP.A --interval daily --from 2026-04-01 --to 2026-04-21
```

Export history to CSV:

```bash
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 30d --csv output/liquidation-history.csv
```

### 4. Multi-metric commands

Use one command to collect several indicators at once.

Get several current indicators:

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

### 5. Batch commands

Use batch mode when scanning many symbols or reading from a file.

Run batch current metrics from `symbols.txt`:

```bash
node scripts/get-batch-indicators.js --mode current --metrics oi,funding --symbols-file symbols.txt
```

Run batch history metrics:

```bash
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation,long_short_ratio --symbols-file symbols.txt --interval daily --from 7d
```

Use cache TTL:

```bash
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation --symbols-file symbols.txt --interval daily --from 7d --ttl 300
```

Export batch result to CSV:

```bash
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation --symbols-file symbols.txt --interval daily --from 7d --csv output/batch-history.csv
```

## CLI Parameters

### Common parameters

- `--symbols`: Comma-separated symbol list
- `--symbols-file`: File with symbols separated by newline or comma
- `--type`: Metric type for single-metric scripts
- `--mode`: `current` or `history`
- `--metrics`: Comma-separated metric names
- `--interval`: Historical interval
- `--from`: Start time, supports UNIX timestamp, ISO date, or shorthand like `7d`, `12h`, `30m`
- `--to`: End time, same format as `--from`
- `--convert_to_usd`: `true` or `false`
- `--csv`: Output CSV path
- `--ttl`: Cache TTL in seconds
- `--help`: Show command help

### Supported intervals

The public docs show historical granularity values such as `1min`, `5min`, `15min`, `30min`, `1hour`, `2hour`, `4hour`, `6hour`, `12hour`, and `daily`. [web:2]

### Supported current metrics

- `oi`
- `funding`
- `predicted_funding`

### Supported historical metrics

- `oi`
- `funding`
- `predicted_funding`
- `liquidation`
- `ohlcv`
- `long_short_ratio`

## NPM Scripts

Use predefined package scripts for common tasks:

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

All scripts print JSON to stdout.

This makes it easy to:
- save responses into files
- pipe output into `jq`
- parse results in automation
- export data into CSV for spreadsheets and dashboards

Example:

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A > output/oi.json
```

## Caching

The batch script can cache results locally as JSON so repeated scans do not always hit the API. This helps reduce repeated calls under Coinalyze's 40-calls-per-minute limit. [web:2]

Example:

```bash
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation --symbols-file symbols.txt --interval daily --from 7d --ttl 300
```

## CSV Export

Every main command can export to CSV using `--csv`.

Examples:

```bash
node scripts/get-markets.js --type future --csv output/futures.csv
node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A --csv output/funding.csv
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 30d --csv output/liquidation.csv
node scripts/get-indicators.js --mode history --metrics oi,liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d --csv output/combined.csv
```

## Command Help

Every script supports `--help`.

Examples:

```bash
node scripts/get-markets.js --help
node scripts/get-current-data.js --help
node scripts/get-history.js --help
node scripts/get-indicators.js --help
node scripts/get-batch-indicators.js --help
```

## Rate Limits and Constraints

The Coinalyze API documentation states:
- authentication uses `api_key` in header or query parameter, [web:2]
- the rate limit is 40 API calls per minute per key, [web:2]
- a 429 response includes `Retry-After`, [web:2]
- historical responses are returned in ascending order, [web:2]
- intraday history retains only about 1500–2000 datapoints, while daily data is kept longer, [web:2]
- requests for symbol-based metric endpoints support up to 20 symbols per request, and each symbol still consumes one API call. [web:2]

## Best Practices

- Resolve symbols first with market discovery. [file:1]
- Use the symbol format `SYMBOL_TYPE.EXCHANGE`, such as `BTCUSDT_PERP.A`. [file:1]
- Use batch mode for larger scans because symbol-based requests are capped at 20 symbols per request. [web:2]
- Respect the rate limit and retry logic when you receive a 429 response. [web:2]
- Cache repeated scans to reduce unnecessary requests. [web:2]
- Export CSV when you want to analyze results in external tools.

## Common Errors

Typical failures include:
- missing `COINALYZE_API_KEY`,
- invalid symbol format,
- unsupported metric name,
- invalid `--interval`,
- missing `--interval` in history mode,
- too many symbols in single-request mode,
- rate limit exceeded.

## Suggested Workflow

1. Discover valid futures symbols with `get-markets.js`. [file:1]
2. Query current OI or funding with `get-current-data.js`. [file:1]
3. Pull history with `get-history.js` for deeper analysis. [file:1]
4. Use `get-indicators.js` for multiple indicators on the same symbols.
5. Use `get-batch-indicators.js` when scanning many symbols under API limits. [web:2]

## Notes

This project is best suited for crypto futures monitoring, leverage analysis, funding pressure checks, liquidation tracking, and long/short positioning analysis across supported exchanges.
