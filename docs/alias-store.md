---
outline: deep
---

# store

It provides a store feature with sqlite3.


## Installation

``` sh
/bin/bash -c "ALIAS_NAME=store; $(curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/install.sh)"
```

## Usage

### help

``` sh
# list types
aws store type
```

### list
``` sh
# list key and titles
aws store [type]
```

### show item
``` sh
# show item
aws store [key]
```

### add item
``` sh
# add item interactively
aws store add
```

### edit item
``` sh
# edit item by key
aws store edit [key]
```

### delete item
``` sh
# delete item by key
aws store delete [key]
```


