const fs = require("fs");
const { exec } = require("child_process");
const params = process.argv.slice(2);

const [noteId] = params;

const helpText = `
example: aws note edit
\tit opens the note.json with vscode

example: aws note [id]
\tit shows content.

example: aws note
\tit lists note ids and titles

example: aws note [keyword1],[keyword2]
\tit lists note ids and titles
`;

const noteJson = require("path").join(__dirname, "note.json");
const store = (() => {
  try {
    fs.statSync(noteJson);
  } catch(e) {
    fs.writeFileSync(noteJson, JSON.stringify({
      read_me: {
        title: "README",
        content: [
          "please remove this content after you read.",
          "",
          helpText,
        ].join("\n")
      }
    }, null, 2), { encoding: "utf8" });
  }

  try {
    return JSON.parse(fs.readFileSync(noteJson, { encoding: "utf8" }));
  } catch(e) {
    return [];
  }
})();

function ls(keyword) {
  const regExps = (keyword ?? "").split(",").map(kw => new RegExp(kw, "i"));
  const filteredItems = Object.entries(store)
    .map(([key, value]) => ({
      id: key,
      ...value,
    }))
    .filter(({ title, content }) => {
      const text = `${title} ${content}`;
      return regExps.every(regExp => regExp.test(text));
    });
  for(const { id, title } of filteredItems) {
    console.log(`${id}\t${title}`);
  }
}

function saveStore(tore) {
  fs.writeFileSync(noteJson, JSON.stringify(store, null, 2), { encoding: "utf8" });
}

const isHelp = noteId === "help";
const isEdit = noteId === "edit";
const isTidy = noteId === "tidy";

if(isHelp) {
  console.log(helpText);
  process.exit();
}

if(isEdit) {
  exec(`code ${noteJson}`, () => {});
  process.exit();
}

if(isTidy) {
  for(const id in store) {
    const note = store[id];
    const nextId = require("crypto")
      .createHash("sha512")
      .update(JSON.stringify(note))
      .digest("hex")
      .slice(0, 7);
    store[nextId] = note;
    delete store[id];
  }
  saveStore(store);
  process.exit();
}

if(noteId in store) {
  console.log(store[noteId].content);
  process.exit();
}

ls(noteId);
