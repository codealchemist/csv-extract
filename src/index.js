#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import pkgBanner from 'pkg-banner'
import argsObj from './args.js'
import loadJson from './util/load-json.js'
import isEmptyObject from './util/is-empty-object.js'
import saveFile from './util/save-file.js'

// Print ASCII art and package info.
pkgBanner(import.meta.url, '../')

// Read first command line argument.
const { args, flags } = argsObj
const {
  csv,
  filters: filtersFile,
  divider,
  maxLines,
  maxResults,
  output,
  format
} = flags

// Validate input.
if (!csv || !filtersFile) {
  args.showHelp()
  process.exit()
}

// Load filters.
const filters = loadJson(filtersFile)

// Validate filters.
if (isEmptyObject(filters)) {
  console.log('Error loading filters. Check filters file.')
  args.showHelp()
  process.exit()
}

console.log('⬅️ ', flags, '\n')
console.log('⬅️ ', filters, '\n')
const results = []
const outputFile = output ? path.join(process.cwd(), output) : null
let headers = []
let readLines = 0

/**
 * Write results to file or print to console.
 *
 * @returns {Promise}
 */
async function writeResults () {
  if (output) {
    // Save results to file.
    console.log(`\n➡️  ${results.length} RESULTS on ${readLines} lines / FILE`)
    await saveFile({ file: outputFile, data: results, format, headers })
  } else {
    // Print results.
    if (format === 'csv') {
      console.log(`\n➡️  ${results.length} RESULTS on ${readLines} lines / CSV`)
      console.log(headers.join(','))
      results.forEach(result => {
        console.log(Object.values(result).join(','))
      })
    }

    if (format === 'json') {
      console.log(
        `\n➡️  ${results.length} RESULTS on ${readLines} lines / JSON`,
        results
      )
    }
  }
}

/**
 * Add headers to `headers` array.
 * Create line object.
 * Filter line.
 * Add line to results.
 * Check max results.
 * Check max lines.
 *
 * @param {string} line
 * @param {object} rl ReadLine interface.
 * @returns
 */
function processLine (line, rl) {
  readLines += 1
  if (!headers.length) {
    headers = line.split(divider)
    // console.log('➡️  HEADERS', headers)
    return
  }

  // Create line object.
  const lineData = line.split(divider)
  const lineObject = {}
  headers.forEach((header, index) => {
    lineObject[header?.trim()] = lineData[index]?.trim()
  })

  // Filter line.
  let isMatch = true
  Object.keys(filters).some(key => {
    if (typeof filters[key] === 'object' && filters[key].regex) {
      // Regex match.
      const regex = new RegExp(filters[key].regex)
      isMatch = regex.test(lineObject[key])
    } else {
      // Direct match.
      isMatch = filters[key] === lineObject[key]
    }
    return !isMatch
  })

  // Add line to results.
  if (isMatch) {
    // console.log('➡️  MATCH', lineObject)
    results.push(lineObject)
  }

  // Check max results.
  if (maxResults && results.length >= maxResults) {
    console.log(`ℹ️  Max results reached (${maxResults}).`)
    rl.close()
    rl.removeAllListeners()
    return
  }

  // Check max lines.
  if (maxLines && readLines >= maxLines) {
    console.log(`ℹ️  Max lines reached (${maxLines}).`)
    rl.close()
    rl.removeAllListeners()
    return
  }
}

/**
 * Read CSV file line by line.
 * Process every line using `processLine`.
 * Write results to file or print to console using `writeResults`.
 *
 * @param {string} file
 * @returns
 */
async function readFile (file) {
  return new Promise((resolve, reject) => {
    const readableStream = fs.createReadStream(file, { encoding: 'utf8' })

    // Create readline interface.
    const rl = readline.createInterface({ input: readableStream })

    // Read lines.
    rl.on('line', line => processLine(line, rl))

    // No more lines or limit reached.
    rl.on('close', writeResults)

    // Handle error.
    readableStream.on('error', error => {
      console.log('error', error)
    })
  })
}

readFile(csv)
