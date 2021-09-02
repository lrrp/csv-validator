const Enjoi = require('enjoi')

class ValidationError extends Error {
  constructor (violations, ...params) {
    super(...params)
    this._violations = violations
  }

  getViolations () {
    return this._violations
  }
}

function validate (data, rules, options) {
  return new Promise((resolve, reject) => {
    const violations = []
    const validator = Enjoi.schema(rules)
    data.forEach((row, rownum) => {
      const result = validator.validate(row, {
        abortEarly: options.abortEarly
      })

      if (result.error) {
        result.error.details.forEach(error => {
          error.message = `Error at row ${rownum + 1}: Field ${error.message}.`
          violations.push(error)
        })
      }
    })

    if (violations.length) {
      reject(new ValidationError(violations))
      return
    }

    resolve()
  })
}

module.exports = { ValidationError, validate }
