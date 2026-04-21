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
- Local smoke tests with `node test.js`
- GitHub Actions CI support

## Requirements

- Node.js 18 or newer
- A valid Coinalyze API key

The Coinalyze API uses API key authentication via the `api_key` header or query parameter, has a rate limit of 40 calls per minute per key, and returns `Retry-After` on HTTP 429 responses. [web:2]

## Installation

Install dependencies:

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
├── .gitignore
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

## Available Commands

### Market discovery

```bash
node scripts/get-markets.js --type future
node scripts/get-markets.js --type spot
node scripts/get-markets.js --type exchange
node scripts/get-markets.js --type future --csv output/futures.csv
```

### Current metrics

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A,ETHUSDT_PERP.A,SOLUSDT_PERP.A
node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A
node scripts/get-current-data.js --type predicted_funding --symbols BTCUSDT_PERP.A
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A --convert_to_usd true
node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A --csv output/current-funding.csv
```

### Historical metrics

```bash
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d
node scripts/get-history.js --type funding --symbols BTCUSDT_PERP.A --interval 1hour --from 3d
node scripts/get-history.js --type ohlcv --symbols BTCUSDT_PERP.A --interval 4hour --from 14d
node scripts/get-history.js --type long_short_ratio --symbols BTCUSDT_PERP.A --interval daily --from 30d
node scripts/get-history.js --type oi --symbols BTCUSDT_PERP.A --interval daily --from 2026-04-01 --to 2026-04-21
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 30d --csv output/liquidation-history.csv
```

### Multi-metric commands

```bash
node scripts/get-indicators.js --mode current --metrics oi,funding,predicted_funding --symbols BTCUSDT_PERP.A
node scripts/get-indicators.js --mode history --metrics oi,liquidation,long_short_ratio --symbols BTCUSDT_PERP.A --interval daily --from 7d
node scripts/get-indicators.js --mode history --metrics oi,funding --symbols BTCUSDT_PERP.A,ETHUSDT_PERP.A --interval 1hour --from 3d
node scripts/get-indicators.js --mode history --metrics oi,liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d --csv output/combined-indicators.csv
```

### Batch commands

```bash
node scripts/get-batch-indicators.js --mode current --metrics oi,funding --symbols-file symbols.txt
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation,long_short_ratio --symbols-file symbols.txt --interval daily --from 7d
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation --symbols-file symbols.txt --interval daily --from 7d --ttl 300
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation --symbols-file symbols.txt --interval daily --from 7d --csv output/batch-history.csv
```

### Help commands

```bash
node scripts/get-markets.js --help
node scripts/get-current-data.js --help
node scripts/get-history.js --help
node scripts/get-indicators.js --help
node scripts/get-batch-indicators.js --help
```

## Supported Intervals

Historical endpoints support intervals such as `1min`, `5min`, `15min`, `30min`, `1hour`, `2hour`, `4hour`, `6hour`, `12hour`, and `daily`. [web:2]

## Output and Export

All commands print JSON to stdout, which makes them easy to redirect into files, pipe into `jq`, or feed into other automation.

```bash
node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A > output/oi.json
```

CSV export is available through `--csv`:

```bash
node scripts/get-markets.js --type future --csv output/futures.csv
node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A --csv output/funding.csv
node scripts/get-history.js --type liquidation --symbols BTCUSDT_PERP.A --interval daily --from 30d --csv output/liquidation.csv
node scripts/get-indicators.js --mode history --metrics oi,liquidation --symbols BTCUSDT_PERP.A --interval daily --from 7d --csv output/combined.csv
```

## Caching

Batch mode can cache results locally as JSON so repeated scans do not always hit the API. This helps reduce repeated calls under Coinalyze's 40-calls-per-minute limit. [web:2]

Example:

```bash
node scripts/get-batch-indicators.js --mode history --metrics oi,liquidation --symbols-file symbols.txt --interval daily --from 7d --ttl 300
```

## Testing

Run the local smoke tests:

```bash
npm test
```

Or directly:

```bash
node test.js
```

These tests should cover utility functions such as argument parsing, interval validation, symbol chunking, and basic cache behavior.

## GitHub Actions

If `.github/workflows/node-ci.yml` is present, CI can run automatically on push and pull request using Node 18 and Node 20.

Typical CI steps:
- install dependencies,
- run `node test.js`.

## Rate Limits and Constraints

The Coinalyze API documentation states:
- authentication uses `api_key` in header or query parameter, [web:2]
- the rate limit is 40 API calls per minute per key, [web:2]
- a 429 response includes `Retry-After`, [web:2]
- historical data are returned in ascending order, [web:2]
- intraday history retains only about 1500 to 2000 datapoints, while daily data is kept longer, [web:2]
- requests for symbol-based metric endpoints support up to 20 symbols per request, and each symbol still consumes one API call. [web:2]

## Best Practices

- Resolve symbols first with market discovery. [file:1]
- Use the symbol format `SYMBOL_TYPE.EXCHANGE`, such as `BTCUSDT_PERP.A`. [file:1]
- Use batch mode for larger scans because symbol-based requests are capped at 20 symbols per request. [web:2]
- Respect rate limits and retry logic when receiving a 429 response. [web:2]
- Cache repeated scans to reduce unnecessary requests. [web:2]
- Export CSV when analyzing in spreadsheets, BI tools, or downstream pipelines.

## Troubleshooting

Common issues:
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