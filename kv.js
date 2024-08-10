const fs = require("fs");
const params = process.argv.slice(2);

const [provided_key, provided_value] = params;

const kvJson = require("path").join(__dirname, "kv.json");
const store = (() => {
  try {
    return JSON.parse(fs.readFileSync(kvJson, { encoding: "utf8" }));
  } catch(e) {
    return {};
  }
})();

function ls(keyword) {
  const regExps = (keyword ?? "").split(",").map(kw => new RegExp(kw, "i"));
  console.table(
    Object.entries(store)
      .map(([key, value]) => ({ key, value }))
      .filter(({ key, value }) => {
        const text = `${key} ${value}`;
        return regExps.every(regExp => regExp.test(text));
      })
      .sort((a,b) => a.key === b.key
        ? 0
        : a.key > b.key
          ? 1
          : -1
      )
  );
}

function saveStore(store) {
  fs.writeFileSync(kvJson, JSON.stringify(store, null, 2), { encoding: "utf8" });
}

const isShowingHelp = provided_key === "--help";

const isSearching = 
  Boolean(provided_key) &&
  Boolean(provided_value) &&
  (
    provided_key === "--filter" ||
    // any 1 character can be a filter command
    provided_key.length === 1
  );

const isRemoving =
  Boolean(provided_key) &&
  Boolean(provided_value) &&
  provided_key === "--remove";

if(isShowingHelp) {
  console.table([
    {
      example: "kv --help",
      description: "shows help",
    },
    {
      example: "kv --filter some",
      description: "searches for value",
    },
    {
      example: "kv a some",
      description: "searches for value if key is any one character",
    },
    {
      example: "kv --remove mykey",
      description: "removes a specified key",
    },
    {
      example: "kv",
      description: "lists key-value items",
    },
  ]);
  process.exit();
}

if(isSearching) {
  ls(provided_value);
  process.exit();
}

if(isRemoving) {
  delete store[provided_value];
  saveStore(store);
  process.exit();
}

if(Boolean(provided_value)) {
  store[provided_key] = provided_value;
  saveStore(store);
} else if(Boolean(provided_key)) {
  console.log(store[provided_key]);
} else {
  ls();
}
