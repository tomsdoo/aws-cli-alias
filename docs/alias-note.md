---
outline: deep
---

# note

It provides a note feature.

## Installation

``` sh
/bin/bash -c "ALIAS_NAME=note; $(curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/install.sh)"
```

## Usage

### help

``` sh
# show help
aws note help
```

### list

``` sh
# list note ids and titles
aws note
```

``` sh
# list note filtered by keywords
aws note keyword1,keyword2
```

### show note content

``` sh
# show note content
aws note [id]
```

``` sh
# copy
aws note [id] | pbcopy
```

### edit

``` sh
# opens note.json with VS Code
aws note edit
```

