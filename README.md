# csv-extract

Extract data from CSV files.

`csv-extract` is optimized to work with large CSV files.

Uses a readable stream to process the input file line by line.

```
  ____ ______     __  _____      _                  _
 / ___/ ___\ \   / / | ____|_  _| |_ _ __ __ _  ___| |_
| |   \___ \\ \ / /  |  _| \ \/ / __| '__/ _` |/ __| __|
| |___ ___) |\ V /   | |___ >  <| |_| | | (_| | (__| |_
 \____|____/  \_/    |_____/_/\_\\__|_|  \__,_|\___|\__|
```

## Install

This is a CLI tool so you can install it globally with:

`npm i -g csv-extract`

Or you can just run it without installion:

`npx csv-extract [options]`

## Usage

```
  Usage: csv-extract [options]

  Commands:
    help     Display help
    version  Display version

  Options:
    -c, --csv              CSV file to read (required)
    -d, --divider [value]  Data divider (defaults to ",")
    -f, --filters          JSON file with filters to apply (required)
    -F, --format [value]   Output format (json or csv) (defaults to "json")
    -h, --help             Output usage information
    -l, --maxLines <n>     Maximum number of lines to read, unlimited when unset (defaults to null)
    -r, --maxResults <n>   Maximum number of results to return, unlimited when unset (defaults to null)
    -o, --output           Output file where results will be stored
    -v, --version          Output the version number
```

## Example

`csv-extract -c large-data-sample.csv -f filters-2023.json`

## Filters

We use filters to find specific data inside large CSV files.

Filters are provided in JSON format, where every key belong to a CSV header and
every value matches CSV data.

For example, given this CSV data:

```
id,name,email
1337,Awesome Dude,adude@mail.com
86,Someone Else,selse@mail.com
```

We can retrieve the first data item using this filter:

```
{
  "id": "1337"
}
```

By default all CSV data items are converted to strings, so keep that in mind when writing filters.

### Regex

We can also use regex filters.

For example, to get the same data as before:

```
{
  "email": {
    "regex": "selse.*"
  }
}
```

### Multiple filters

Just add more properties to the filters document.

Let's try with another data sample.

```
id,name,instrument,birthday
1,Bruce,vocals,1958-08
2,Steve,bass,1956-03
3,Adrian,guitar,1957-02
4,Dave,guitar,1956-12
5,Nicko,drums,1952-06
6,Janick,guitar,1957-01
```

Create a filter to find everyone who was born in `1956` and plays the `bass`:

```
{
  "instrument": "bass",
  "birthday": {
    "regex": "1956.*"
  }
}
```

By default you'll get a JSON document:

```
[
  {
    "id": "2",
    "name": "Steve",
    "instrument": "bass",
    "birthday": "1956-03"
  }
]
```

If you use CSV output with `-F csv` you'll get:

```
id,name,instrument,birthday
2,Steve,bass,1956-03
```
