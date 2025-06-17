void (async () => {
  const ALIAS_NAME = "store";
  const { writeFile, unlink } = await import("fs/promises");
  const path = await import("path");
  const {
    awsCliAliasFilePath,
    downloadCustomJs,
    readExistingAliasContent,
    makeNextAliasContent,
  } = await import("./util.js");

  await downloadCustomJs(ALIAS_NAME);
  await writeFile(
    awsCliAliasFilePath,
    makeNextAliasContent(ALIAS_NAME, await readExistingAliasContent()),
    { encoding: "utf8" }
  );
  await unlink(path.join(path.dirname(process.argv[1]), "util.js"));
  await unlink(process.argv[1]);
})();
