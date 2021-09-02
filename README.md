[![GitHub license](https://img.shields.io/github/license/jbroutier/csv-validator)](https://github.com/jbroutier/csv-validator/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/release/jbroutier/csv-validator?include_prereleases)](https://github.com/jbroutier/csv-validator/releases/)

## CSV validator

A CLI tool to validate a CSV file against a set of rules defined with JSON Schema. It's heavily inspired from [csval](https://www.npmjs.com/package/csval), with some additions to match my needs.

## Usage

```bash
Usage: csv-validator [options] <csvFile> <rulesFile>

Validate a CSV file against a set of rules defined with JSON Schema.

Options:
  -V, --version              output the version number
  -a, --abort-early          move to the next line as soon as an error is encountered (default: false)
  -d, --dynamic-typing       convert data into the appropriate type according to their format (default: false)
  -e, --encoding <encoding>  specify the encoding of the files (default: "utf8")
  -q, --quiet                hide the list of errors encountered (default: false)
  -s, --skip-empty-lines     ignore empty lines in the CSV file (default: false)
  -h, --help                 display help for command
```

## Rules files

The rules files must follow the [JSON Schema](https://json-schema.org/understanding-json-schema/reference/index.html) specification.

## Basic example

Consider the following rules file.

```json
{
  "type": "object",
  "properties": {
    "brand": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "color": {
      "type": "string"
    },
    "mileage": {
      "type": "integer",
      "minimum": 0,
    },
    "sold": {
      "type": "boolean"
    }
  }
}
```

### Valid file

The following CSV file will pass validation.

```csv
brand,model,color,mileage,sold
Toyota,Prius,blue,45108,true
Opel,Zafira,red,2784,false
Nissan,Micra,green,98410,false
```

```bash
File "cars.csv" passes validation checks.
```

### Inconsistent number of fields

The following CSV file will fail validation because the number of fields is inconsistent across rows.

```csv
brand,model,color,mileage,sold
Toyota,Prius,blue,45108,true
Opel,red,2784,false
Nissan,Micra,green,98410,false
```

```bash
Error at row 2: Too few fields: expected 4 fields but parsed 3.
File "cars.csv" fails validation checks.
```

### Schema violation

The following CSV file will fail validation because some data violates the rules.

```csv
brand,model,color,mileage,sold
Toyota,Prius,blue,-14,true
Opel,Zafira,red,2784,false
Nissan,Micra,green,98410,false
```

```bash
Error at row 1: Field "mileage" must be greater than or equal to 0.
File "cars.csv" fails validation checks.
```

## Advanced examples

### Nullable types

Consider the following rules file.

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "race": {
      "type": "string"
    },
    "chip_number": {
      "oneOf": [
        { "type": "null" },
        { "type": "integer" }
      ]
    }
  }
}
```

The following CSV file should pass validation, because data seems to match the rules.

```csv
name,race,chip_number
Bounty,Golden Retriever,
Ritsuka,Akita,1784647826
```

But in practice it will fail.

```bash
Error at row 1: Field "chip_number" does not match any of the allowed types.
File "dogs.csv" fails validation checks.
```

This is because the CSV format does not have a standard method to represent null fields. Therefore empty fields are converted to empty string, not null values. To allow the use of the "null" type in the rule files, it is possible to use the `-d` or `--dynamic-typing` option, which will convert the data into the type that seems best suited to their representation.

The file then passes validation.

```bash
File "dogs.csv" passes validation checks.
```

### Multiple errors

When validating large datasets, the number of error messages may quickly become unmanageable. It is then possible to use several options to limit the number of errors displayed.

Consider the following rules file and CSV file.

```json
{
  "type": "object",
  "properties": {
    "first_name": {
      "type": "string"
    },
    "last_name": {
      "type": "string"
    },
    "age": {
      "type": "integer",
      "minimum": 0
    }
  }
}
```

```
first_name,last_name,age
Stefania,Josh,23
Damiano,,unknown
Paulie,Niese,78
,Vasyutkin,
Marlena,,68
Caressa,Hanington,
Glenine,,72
Ilyssa,Kelling,48
Syd,,unk
Babara,Killcross,59
```

Without any options, the validation will fail with the following errors.

```bash
Error at row 2: Field "last_name" is not allowed to be empty.
Error at row 2: Field "age" must be a number.
Error at row 4: Field "first_name" is not allowed to be empty.
Error at row 4: Field "age" must be a number.
Error at row 5: Field "last_name" is not allowed to be empty.
Error at row 6: Field "age" must be a number.
Error at row 7: Field "last_name" is not allowed to be empty.
Error at row 9: Field "last_name" is not allowed to be empty.
Error at row 9: Field "age" must be a number.
File "people.csv" fails validation checks.
```

As you can see, some lines contain several errors. Let’s assume now that you just want to know which lines contain errors. You can use the `-a` or `--abort-early` option, and the output will then look like this.

```bash
Error at row 2: Field "last_name" is not allowed to be empty.
Error at row 4: Field "first_name" is not allowed to be empty.
Error at row 5: Field "last_name" is not allowed to be empty.
Error at row 6: Field "age" must be a number.
Error at row 7: Field "last_name" is not allowed to be empty.
Error at row 9: Field "last_name" is not allowed to be empty.
File "people.csv" fails validation checks.
```

And if you just want to know whether a file is valid or not, you can use the `-q` or `--quiet` option. The output will then look like this.

```bash
File "people.csv" fails validation checks.
```

### Empty lines

Now imagine that your CSV file is perfectly valid, but contains an additional empty line at the end. By default, validation will fail with a message like this.

```bash
Error at row 11: Too few fields: expected 3 fields but parsed 1.
File "people.csv" fails validation checks.
```

The `-s` or `--skip-empty-lines` option allows you to ignore empty lines within the file. The file is then again considered valid.

```bash
File "people.csv" fails validation checks.
```
