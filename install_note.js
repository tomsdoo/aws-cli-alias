const { writeFile, unlink } = require("fs/promises");
const path = require("path");
const {
  awsCliAliasFilePath,
  downloadCustomJs,
  readExistingAliasContent,
  makeNextAliasContent,
} = require("./util");

const ALIAS_NAME = "note";

(async () => {
  await downloadCustomJs(ALIAS_NAME);
  await writeFile(
    awsCliAliasFilePath,
    makeNextAliasContent(ALIAS_NAME, await readExistingAliasContent()),
    { encoding: "utf8" }
  );
  await unlink(path.join(path.dirname(process.argv[1]), "util.js"));
  await unlink(process.argv[1]);
})();
