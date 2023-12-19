import fs from 'fs'

/**
 * Save data to file using a writeable stream.
 *
 * @param {Object} options
 * @param {string} options.file - Path to file.
 * @param {Object|Array} options.data - Data to save.
 * @param {string} options.format - Output format (json or csv).
 * @returns {Promise}
 */
export default function saveFile ({
  file,
  data,
  format = 'json',
  headers = []
}) {
  return new Promise((resolve, reject) => {
    const writableStream = fs.createWriteStream(file, { encoding: 'utf8' })

    writableStream.on('finish', () => {
      console.log(`✅  Saved results to ${file}.\n`)
      resolve()
    })

    writableStream.on('error', error => {
      console.log('❌  Error saving file:', error)
      reject(error)
    })

    // Write data.
    if (Array.isArray(data)) {
      const total = data.length
      data.forEach((item, index) => {
        // CSV.
        if (format === 'csv') {
          // Add headers.
          if (headers?.length && index === 0) {
            const line = headers.join(',')
            writableStream.write(`${line}\n`)
          }

          // Add line.
          const line = Object.values(item).join(',')
          writableStream.write(`${line}\n`)
        }

        // JSON.
        if (format === 'json') {
          // Open array bracket.
          if (index === 0) {
            writableStream.write('[\n')
          }

          // Add item.
          if (index !== total - 1) {
            writableStream.write(`${JSON.stringify(item, null, 2)},\n`)
            return
          }

          // Last item.
          // Close array brackets.
          writableStream.write(`${JSON.stringify(item, null, 2)}\n]`)
        }
      })
    } else {
      writableStream.write(`${JSON.stringify(data)}\n`)
    }

    // Close stream.
    writableStream.end()
  })
}
