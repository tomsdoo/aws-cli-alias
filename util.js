const AWS_CLI_CUSTOM_JS = ".aws/cli/custom-js";
const makeAliasText = (aliasName) => `ALIASNAME =
  !f() {
    node ~/${AWS_CLI_CUSTOM_JS}/ALIASNAME.js \${1} \${2} \${3} \${4} \${5} \${6}
  }; f
`.replace(/ALIASNAME/g, aliasName);

function makeNextAliasContent(aliasName, content) {
  const codeAliasText = makeAliasText(aliasName);
  if(content === "") {
    return [
      `[toplevel]`,
      codeAliasText,
    ].join("\n");
  }
  const regExpTopLevelAndCommand = /((?:\n|.)*\[toplevel\])((?:\n|.)*)(\n\[command\s+(?:\n|.)*)/;
  if(regExpTopLevelAndCommand.test(content)) {
    const regExpTopLevelAndCommandExistingAlias = new RegExp(`((?:\\n|.)*\\[toplevel\\](?:\\n|.)*)(${aliasName}\\s+=\\s*\\n\\s+!f\\(\\)\\s*\\{\\s*\\n\\s+node\\s.+\\n\\s+\\};\\s+f\\n)((?:\\n|.)*\\n\\[command\\s+(?:\\n|.)*)`);
    if(regExpTopLevelAndCommandExistingAlias.test(content)) {
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
    const regExpOnlyTopLevelExistingAlias = new RegExp(`((?:\\n|.)*\[toplevel\](?:\\n|.)*)(${aliasName}\\s+=\\s*\\n\\s+!f\\(\\)\\s*\\{\\s*\\n\\s+node\\s.+\\n\\s+\\};\\s+f\\n)((?:\\n|.)*)`);
    if(regExpOnlyTopLevelExistingAlias.test(content)) {
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

module.exports = {
  makeNextAliasContent,
};
