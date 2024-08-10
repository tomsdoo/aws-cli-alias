const { mkdir, readFile, writeFile, unlink } = require("fs/promises");
const { homedir } = require("os");
const path = require("path");

const awsCliAliasFilePath = path.join(homedir(), "./.aws/cli/alias");
const CODE_JS_URL = "http://localhost:8080/code.js";
const AWS_CLI_CUSTOM_JS = ".aws/cli/custom-js";
const CODE_JS = "code.js";

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
  const codeJsText = await fetch(CODE_JS_URL)
    .then(r => r.text());
  const codeJsPath =
    path.join(customJsDirectory, CODE_JS);
  await writeFile(
    codeJsPath,
    codeJsText,
    { encoding: "utf8" }
  );
}

const codeAliasText = `code =
  !f() {
    node ~/${AWS_CLI_CUSTOM_JS}/${CODE_JS} \${1} \${2} \${3} \${4} \${5} \${6}
  }; f
`;

function makeNextAliasContent(content) {
  if(content === "") {
    return [
      `[toplevel]`,
      codeAliasText,
    ].join("\n");
  }
  const regExpTopLevelAndCommand = /((?:\n|.)*\[toplevel\])((?:\n|.)*)(\n\[command\s+(?:\n|.)*)/;
  if(regExpTopLevelAndCommand.test(content)) {
    const regExpTopLevelAndCommandExistingAlias = /((?:\n|.)*\[toplevel\](?:\n|.)*)(code\s+=\s*\n\s+!f\(\)\s*\{\s*\n\s+node\s.+\n\s+\};\s+f\n)((?:\n|.)*\n\[command\s+(?:\n|.)*)/;
    if(regExpTopLevelAndCommandExistingAlias.test(content)) {
      console.log("existing");
      return content.replace(regExpTopLevelAndCommandExistingAlias, ($0,$1,$2,$3,$4) => {
        return `${$1}${codeAliasText}${$3}`;
      });
    } else {
      return content.replace(regExpTopLevelAndCommand, ($0,$1,$2,$3,$4) => {
        return `${$1}${$2}${codeAliasText}${$3}`;
      });
    }
  }

  const regExpOnlyTolLevel = /((?:\n|.)*\[toplevel\])((?:\n|.)*)/;
  if(regExpOnlyTolLevel.test(content)) {
    const regExpOnlyTopLevelExistingAlias = /((?:\n|.)*\[toplevel\](?:\n|.)*)(code\s+=\s*\n\s+!f\(\)\s*\{\s*\n\s+node\s.+\n\s+\};\s+f\n)((?:\n|.)*)/;
    if(regExpOnlyTopLevelExistingAlias.test(content)) {
      console.log("existing");
      return content.replace(regExpOnlyTopLevelExistingAlias, ($0,$1,$2,$3) => {
        return `${$1}${codeAliasText}${$3}`;
      });
    } else {
      return content.replace(regExpOnlyTolLevel, ($0,$1,$2) => {
        return `${$1}${$2}\n${codeAliasText}`;
      });
    }
  }
}

(async () => {
  const [ subCommand, testFileName ] = process.argv.slice(2);
  if(subCommand === "test-reg-exp" && testFileName) {
    const testContent = await readFile(testFileName, { encoding: "utf8" });
    const nextContent = makeNextAliasContent(testContent);
    const expectedContent = await readFile(`${testFileName}.expected`, { encoding: "utf8" });
    console.log(nextContent)
    require("assert")(nextContent === expectedContent, process.argv.slice(2));
    return;
  }

  if(subCommand != null) {
    console.log("unknown parameters");
    return;
  }

  await prepareCodeJs();
  await writeFile(
    awsCliAliasFilePath,
    makeNextAliasContent(await readExistingAliasContent()),
    { encoding: "utf8" }
  );
  await unlink(process.argv[1]);
})();
