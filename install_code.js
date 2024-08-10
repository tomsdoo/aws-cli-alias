const { writeFile, unlink } = require("fs/promises");
const path = require("path");
const {
  awsCliAliasFilePath,
  downloadCustomJs,
  readExistingAliasContent,
  makeNextAliasContent,
} = require("./util");

const ALIAS_NAME = "code";

const JS_URL = `https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/${ALIAS_NAME}.js`;

(async () => {
  await downloadCustomJs(JS_URL, ALIAS_NAME);
  await writeFile(
    awsCliAliasFilePath,
    makeNextAliasContent(ALIAS_NAME, await readExistingAliasContent()),
    { encoding: "utf8" }
  );
  await unlink(path.join(path.dirname(process.argv[1]), "util.js"));
  await unlink(process.argv[1]);
})();
