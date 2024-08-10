const { mkdir, readFile, writeFile, unlink } = require("fs/promises");
const { homedir } = require("os");
const path = require("path");
const { makeNextAliasContent } = require("./util");

const ALIAS_NAME = "code";

const awsCliAliasFilePath = path.join(homedir(), "./.aws/cli/alias");
const JS_URL = "http://localhost:8080/code.js";
const AWS_CLI_CUSTOM_JS = ".aws/cli/custom-js";

async function readExistingAliasContent() {
  try{
    return await readFile(awsCliAliasFilePath, { encoding: "utf8" });
  }catch(e) {
    return "";
  }
}

async function prepareCodeJs() {
  const customJsDirectory =
    path.join(homedir(), `./${AWS_CLI_CUSTOM_JS}`);
  await mkdir(
    customJsDirectory,
    { recursive: true }
  );
  const jsText = await fetch(JS_URL)
    .then(r => r.text());
  const jsPath =
    path.join(customJsDirectory, `${ALIAS_NAME}.js`);
  await writeFile(jsPath, jsText, { encoding: "utf8" });
}

(async () => {
  await prepareCodeJs();
  await writeFile(
    awsCliAliasFilePath,
    makeNextAliasContent("code", await readExistingAliasContent()),
    { encoding: "utf8" }
  );
  await unlink(path.join(path.dirname(process.argv[1]), "util.js"));
  await unlink(process.argv[1]);
})();
