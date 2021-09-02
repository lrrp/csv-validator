const fs = require('fs')
const Papa = require('papaparse')

class ParseError extends Error {
  constructor (errors, ...params) {
    super(...params)
    this._errors = errors
  }

  getErrors () {
    return this._errors
  }
}

function parseCsv (path, options) {
  return new Promise((resolve, reject) => {
    Papa.parse(fs.createReadStream(path), {
      dynamicTyping: options.dynamicTyping,
      encoding: options.encoding,
      header: true,
      skipEmptyLines: options.skipEmptyLines,
      complete: results => {
        const { data, errors } = results
        if (errors.length) {
          errors.forEach(error => {
            error.message = `Error at row ${error.row + 1}: ${error.message}.`
          })

          reject(new ParseError(errors))
          return
        }

        resolve(data)
      }
    })
  })
}

function parseRules (path, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, options.encoding, (error, data) => {
      if (error) {
        reject(new ParseError([error]))
        return
      }

      resolve(JSON.parse(data))
    })
  })
}

module.exports = { ParseError, parseCsv, parseRules }
