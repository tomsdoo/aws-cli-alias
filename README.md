# aws-cli-alias

![depends on aws cli](https://img.shields.io/badge/depends%20on-aws%20cli-informational)
![depends on node.js](https://img.shields.io/badge/depends%20on-node.js-informational)
![depends on vscode](https://img.shields.io/badge/depends%20on-vs%20code-informational)
![Maintenance](https://img.shields.io/maintenance/yes/2024)

### code

It lists specified projects that you registered, and it opens a project directory with VS Code.

<details open><summary>installation</summary>

``` sh
/bin/bash -c "ALIAS_NAME=code; $(curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/install.sh)"
```
</details>

<details><summary>usage</summary>

``` sh
# list projects
aws code
```
``` sh
# show help
aws code --help
```
``` sh
# show config
aws code --config
```
``` sh
# add specified projects
aws code --add-specified-projects "~/some/dir" "~/another/dir"
```
``` sh
# add project directories
# sub directories in dev directory will be added
aws code --add-project-directories "~/dev"
```
``` sh
# open a project
aws code some pj
```
``` sh
# update project directories
aws code --update
```

</details>


### geta

It runs Node.js that the environment has global variable named `aws`.

<details open><summary>installation</summary>

``` sh
/bin/bash -c "ALIAS_NAME=geta; $(curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/install.sh)"
```
</details>

<details><summary>usage</summary>

``` sh
# node.js will start
aws geta
```

</details>

### kv

It provides an key value store.

<details open><summary>installation</summary>

``` sh
/bin/bash -c "ALIAS_NAME=kv; $(curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/install.sh)"
```
</details>
<details><summary>usage</summary>

``` sh
# show help
aws kv --help
```
``` sh
# search
# a or b or c or one any character will be as a search subcommand
aws kv a keyword1,keyword2
```
``` sh
# upsert a key-value
aws kv some thing
```
``` sh
# remove a key
aws kv --remove some
```

</details>

### note

It provides a note feature.

<details open><summary>installation</summary>

``` sh
/bin/bash -c "ALIAS_NAME=note; $(curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/install.sh)"
```
</details>

<details><summary>usage</summary>

``` sh
# show help
aws note help
```
``` sh
# list note ids and titles
aws note
```
``` sh
# list note filtered by keywords
aws note keyword1,keyword2
```
``` sh
# show note content
aws note [id]
```
``` sh
# opens note.json with VS Code
aws note edit
```

</details>

