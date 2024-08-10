const { makeNextAliasContent } = require("./util");
const { readFile } = require("fs/promises");
const path = require("path");
const assert = require("node:assert");

const testFiles = [
  "alias_empty",
  "alias_only_toplevel",
  "alias_only_toplevel_exists",
  "alias_toplevel_and_command_existing",
  "alias_toplevel_and_command_not_existing",
]
  .map(fileName => ({
    title: fileName,
    sourceFile: path.join(__dirname, `./test-resources/${fileName}`),
    expectedFile: path.join(__dirname, `./test-resources/${fileName}.expected`),
  }));

(async () => {
  for(const { title, sourceFile, expectedFile } of testFiles) {
    const sourceText = await readFile(sourceFile, { encoding: "utf8" });
    const expectedText = await readFile(expectedFile, { encoding: "utf8" });
    const nextText = makeNextAliasContent("code", sourceText);
    assert(nextText === expectedText, title);
  }
})();

