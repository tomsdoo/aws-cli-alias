const { makeNextAliasContent } = require("./util");
const { readFile } = require("fs/promises");
const path = require("path");
const assert = require("node:assert");

const testFiles = [
  "empty",
  "only_toplevel",
  "only_toplevel_with_existing_code",
  "toplevel_and_command",
  "toplevel_and_command_with_existing_code",
]
  .map(fileName => ({
    title: fileName,
    sourceFile: path.join(__dirname, `./test-resources/code/alias/${fileName}`),
    expectedFile: path.join(__dirname, `./test-resources/code/alias/${fileName}.expected`),
  }));

(async () => {
  for(const { title, sourceFile, expectedFile } of testFiles) {
    const sourceText = await readFile(sourceFile, { encoding: "utf8" });
    const expectedText = await readFile(expectedFile, { encoding: "utf8" });
    const nextText = makeNextAliasContent("code", sourceText);
    assert(nextText === expectedText, title);
  }
})();

