process.mainModule = { filename: import.meta.url.replace('file:', '') } // Tweak to allow args to get package version.
import args from 'args'

args
  .option('csv', 'CSV file to read (required)')
  .option('filters', 'JSON file with filters to apply (required)')
  .option('divider', 'Data divider', ',')
  .option('output', 'Output file where results will be stored')
  .option('format', 'Output format (json or csv)', 'json')
  .option(
    ['l', 'maxLines'],
    'Maximum number of lines to read, unlimited when unset',
    0
  )
  .option(
    ['r', 'maxResults'],
    'Maximum number of results to return, unlimited when unset',
    0
  )

const flags = args.parse(process.argv, {
  name: 'csv-extract',
  usageFilter: usage => usage.replace(/\[command\]/, '')
})

export default { args, flags }
