---
outline: deep
---

# kv

It provides the key-value store.

## Installation

``` sh
/bin/bash -c "ALIAS_NAME=kv; $(curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/install.sh)"
```

## Usage

### help

``` sh
# show help
aws kv --help
```

### search
``` sh
# search
# a or b or c or one any character will be as a search subcommand
aws kv a keyword1,keyword2
```

### set data
``` sh
# upsert a key-value
aws kv some thing
```

### remove
``` sh
# remove a key
aws kv --remove some
```
