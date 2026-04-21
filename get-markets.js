const { parseArgs, request, showHelpAndExit, writeCsv } = require('./coinalyze-client');

const TYPE_TO_PATH = {
  exchange: '/exchanges',
  future: '/future-markets',
  spot: '/spot-markets',
};

const HELP = `
Usage:
  node scripts/get-markets.js --type future
  node scripts/get-markets.js --type future --csv output/futures.csv

Options:
  --type   exchange | future | spot
  --csv    Optional CSV output path
  --help   Show this help message
`;

(async () => {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) showHelpAndExit(HELP);

    const type = args.type || 'future';
    const path = TYPE_TO_PATH[type];

    if (!path) {
      throw new Error('Invalid --type. Use exchange, future, or spot');
    }

    const data = await request(path);
    if (args.csv) writeCsv(args.csv, Array.isArray(data) ? data : [data]);
    console.log(JSON.stringify({ type, count: Array.isArray(data) ? data.length : 0, csv: args.csv || null, data }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
