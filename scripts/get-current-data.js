const { parseArgs, request, showHelpAndExit, ensureMaxSymbols, writeCsv } = require('./coinalyze-client');

const TYPE_TO_PATH = {
  oi: '/open-interest',
  funding: '/funding-rate',
  predicted_funding: '/predicted-funding-rate',
};

const HELP = `
Usage:
  node scripts/get-current-data.js --type oi --symbols BTCUSDT_PERP.A,ETHUSDT_PERP.A
  node scripts/get-current-data.js --type funding --symbols BTCUSDT_PERP.A --csv output/funding.csv

Options:
  --type             oi | funding | predicted_funding
  --symbols          Comma-separated symbols, max 20 per request
  --convert_to_usd   true | false
  --csv              Optional CSV output path
  --help             Show this help message
`;

(async () => {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) showHelpAndExit(HELP);
    if (!args.symbols) {
      throw new Error('Missing --symbols');
    }

    const symbols = ensureMaxSymbols(args.symbols);
    const type = args.type || 'oi';
    const path = TYPE_TO_PATH[type];
    if (!path) {
      throw new Error('Invalid --type. Use oi, funding, or predicted_funding');
    }

    const data = await request(path, {
      symbols: symbols.join(','),
      convert_to_usd: args.convert_to_usd || 'false',
    });

    if (args.csv) writeCsv(args.csv, Array.isArray(data) ? data : [data]);
    console.log(JSON.stringify({ type, symbols, csv: args.csv || null, data }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
