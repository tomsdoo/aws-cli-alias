const { exec } = require("child_process");

async function execute(commandline) {
  return new Promise((resolve, reject) => {
    exec(commandline, (err, stdout, stderr) => {
      (err ? reject : resolve)(err ? stderr : stdout);
    });
  });
}

const commandLinesForTestingRegExp = [
  "alias_empty",
  "alias_only_toplevel",
  "alias_only_toplevel_exists",
  "alias_toplevel_and_command_existing",
  "alias_toplevel_and_command_not_existing",
]
  .map(fileName => `node install.js test-reg-exp ./test-resources/${fileName}`);

(async () => {
  for(const commandline of [
    ...commandLinesForTestingRegExp,
  ]) {
    await execute(commandline);
  }
})();

