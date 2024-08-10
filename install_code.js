const { mkdir, writeFile, unlink } = require("fs/promises");
const path = require("path");
const {
  awsCliAliasFilePath,
  awsCliCustomJsDirectory,
  readExistingAliasContent,
  makeNextAliasContent,
} = require("./util");

const ALIAS_NAME = "code";

const JS_URL = "http://localhost:8080/code.js";

async function prepareCodeJs() {
  await mkdir(
    awsCliCustomJsDirectory,
    { recursive: true }
  );
  const jsText = await fetch(JS_URL)
    .then(r => r.text());
  const jsPath =
    path.join(awsCliCustomJsDirectory, `${ALIAS_NAME}.js`);
  await writeFile(jsPath, jsText, { encoding: "utf8" });
}

(async () => {
  await prepareCodeJs();
  await writeFile(
    awsCliAliasFilePath,
    makeNextAliasContent(ALIAS_NAME, await readExistingAliasContent()),
    { encoding: "utf8" }
  );
  await unlink(path.join(path.dirname(process.argv[1]), "util.js"));
  await unlink(process.argv[1]);
})();
