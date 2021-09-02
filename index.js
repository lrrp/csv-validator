#!/usr/bin/env node

const colors = require('colors/safe')
const program = require('commander')

const package = require('./package.json')
const Parser = require('./src/parser')
const Validator = require('./src/validator')

program
  .version(package.version)
  .description('Validate a CSV file against a set of rules defined with JSON Schema.')
  .arguments('<csvFile> <rulesFile>')
  .option('-a, --abort-early', 'move to the next line as soon as an error is encountered', false)
  .option('-d, --dynamic-typing', 'convert data into the appropriate type according to their format', false)
  .option('-e, --encoding <encoding>', 'specify the encoding of the files', 'utf8')
  .option('-q, --quiet', 'hide the list of errors encountered', false)
  .option('-s, --skip-empty-lines', 'ignore empty lines in the CSV file', false)
  .action((csvFile, rulesFile, options) => {
    Promise.all([
      Parser.parseCsv(csvFile, options),
      Parser.parseRules(rulesFile, options)
    ]).then(values => {
      return Validator.validate(values[0], values[1], options)
    }).then(() => {
      return console.log(colors.green(`File "${csvFile}" passes validation checks.`))
    }).catch(error => {
      if (error instanceof Parser.ParseError) {
        if (!options.quiet) {
          error.getErrors().forEach(error => {
            console.error(colors.red(error.message))
          })
        }

        console.error(colors.red(`File "${csvFile}" fails validation checks.`))
        process.exitCode = 1
      }

      if (error instanceof Validator.ValidationError) {
        if (!options.quiet) {
          error.getViolations().forEach(violation => {
            console.error(colors.red(violation.message))
          })
        }

        console.error(colors.red(`File "${csvFile}" fails validation checks.`))
        process.exitCode = 1
      }

      console.error(colors.red(error.message))
      process.exitCode = 1
    })
  })
  .parse(process.argv)
