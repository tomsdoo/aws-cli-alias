const helpText = `
aws store type
\tlist types

aws store [type]
\tlist items of the type

aws store [key]
\tshow item by key

aws store add
\tadd item interactively

aws store edit [key]
\tedit item interactively

aws store delete [key]
\tdelete item by key
`;

void (async () => {
  const fs = await import("fs/promises");
  const path = await import("path");
  const { fileURLToPath } = await import("url");
  const { exec } = await import("child_process");
  const readline = await import("readline/promises");
  function executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
        } else if (stderr) {
          reject(`Stderr: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  const params = process.argv.slice(2);
  const [command, subCommand] = params;
  if (command === "--update") {
    await executeCommand(`/bin/bash -c "ALIAS_NAME=store; $(curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/install.sh)"`);
    process.exit();
  }

  async function promptUser(question) {
    const { stdin: input, stdout: output } = process;
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(`${question} `);
    rl.close();
    return answer;
  }

  const filename  = fileURLToPath(new URL("./store.sqlite3", import.meta.url));
  async function executeSql(sql) {
    const command = `sqlite3 -json ${filename} "${sql}"`;
    const result = await executeCommand(command);
    try {
      return JSON.parse(result);
    } catch(_) {
      return [];
    }
  }
  async function ensureMyStoreTable() {
    const records = await executeSql("select count(*) as count from sqlite_master where type = 'table' and name = 'my_store';");
    const exists = records.length === 1 && records[0].count === 1;
    if (exists) {
      return;
    }
    const sql = `
      CREATE TABLE my_store (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        key TEXT NOT NULL,
        title TEXT NOT NULL,
        data TEXT NOT NULL,
        ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (type, key)
      );
    `;
    await executeSql(sql);
  }
  async function getTypes() {
    const records = await executeSql("select distinct type from my_store;");
    return records.map(record => record.type);
  }
  async function getItems(type) {
    const whereClause = type == null ? "" : `where type = '${type}'`;
    const sql = `select * from my_store ${whereClause};`;
    return await executeSql(sql);
  }
  async function getItemByKey(key) {
    const sql = `select * from my_store where key = '${key}';`;
    const [result] = await executeSql(sql);
    return result;
  }
  function showHelp() {
    console.log(helpText);
  }
  async function addItem() {
    const type = await promptUser("type:");
    const title = await promptUser("title:");
    const data = await promptUser("data:");
    const key = crypto.randomUUID();
    const sql = `
      insert into my_store (type, key, title, data)
      values ('${type}', '${key}', '${title}', '${data}');
    `;
    await executeSql(sql);
  }
  async function editItem(key) {
    const title = await promptUser("title:");
    const data = await promptUser("data:");
    const sql = `
      update my_store
      set title = '${title}', data = '${data}'
      where key = '${key}';
    `;
    await executeSql(sql);
  }
  async function deleteItem(key) {
    const sql = `delete from my_store where key = '${key}';`;
    await executeSql(sql);
  }
  await ensureMyStoreTable();
  switch (command) {
    case "add": {
      await addItem();
      return;
    }
    case "edit": {
      await editItem(subCommand);
      return;
    }
    case "delete": {
      await deleteItem(subCommand);
      return;
    }
    default: {
      break;
    }
  }
  const types = await getTypes();
  const isType = types.find(type => type === command);
  if (isType) {
    const items = await getItems(command);
    console.table(items.map(({ key, title }) => ({
      key,
      title,
    })));
    return;
  }
  switch(command) {
    case "types":
    case "type": {
      console.log(types);
      return;
    }
    default: {
      break;
    }
  }
  if (command != null) {
    const item = await getItemByKey(command);
    console.log(item);
    return;
  }
  showHelp();
})().finally(() => {
  process.exit();
});

