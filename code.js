const { exec } = require("child_process");
const { readFile, writeFile, readdir, stat, copyFile } = require("fs/promises");
const { homedir } = require("os");
const path = require("path");
const [nodeJsPath, scriptPath, ...params] = process.argv;
const codeConfigJsonPath = `${scriptPath}.config.json`;

async function loadConfig() {
  try {
    return JSON.parse(
      await readFile(codeConfigJsonPath, { encoding: "utf8" })
    );
  } catch(e) {
    return {
      specifiedProjects: [],
      projectDirectories: [],
    };
  }
}
async function saveConfig(data) {
  await writeFile(
    codeConfigJsonPath,
    JSON.stringify(data, null, 2), { encoding: "utf8" }
  );
}

const keywords = params;

// COMMAND DEFINITIONS
const projects = [];
// COMMAND DEFINITIONS

async function updateScriptFile() {
  const scriptFileContent = await readFile(scriptPath, { encoding: "utf8" });
  const config = await loadConfig();
  const regExp = new RegExp(`((?:\n|.)*//\\s+COMMAND\\s+DEFINITIONS\n)((?:\n|.)+)(\n//\\s+COMMAND\\s+DEFINITIONS(?:\n|.)*)`);
  const projectDirectories = await Promise.all(
    config.projectDirectories.map(async scanPath => {
      const basePath = /^~/.test(scanPath)
        ? scanPath.replace(/^~/, homedir())
        : scanPath;
      const entries = await readdir(basePath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => path.relative(
          basePath,
          path.join(entry.parentPath ?? entry.path,entry.name)
        ))
        .map(relativeEntry => path.join(scanPath, relativeEntry));
    })
  ).then(v => v.flat());
  const nextText = scriptFileContent.replace(regExp, ($0,$1,$2,$3) => {
    return `${$1}const projects = ${JSON.stringify([...config.specifiedProjects, ...projectDirectories], null, 2)};${$3}`;
  });
  await copyFile(scriptPath, `${scriptPath}.backup.js`);
  await writeFile(scriptPath, nextText, { encoding: "utf8" });
}

(async () => {
  if(keywords.length === 0) {
    console.table(projects);
    process.exit();
  }

  if(keywords[0] === "--help") {
    console.table([
      {
        command: "--help",
        example: "aws code --help",
      },
      {
        command: "--config",
        example: "aws code --config",
      },
      {
        command: "--add-specified-projects",
        example: `aws code --add-specified-projects "~/dev" "~/some/dir"`,
      },
      {
        command: "--remove-specified-projects",
        example: `aws code --remove-specified-projects "~/dev" "~/some/dir"`,
      },
      {
        command: "--add-project-directories",
        example: `aws code --add-project-directories "~/dev" "~/some/dir"`,
      },
      {
        command: "--remove-project-directories",
        example: `aws code --remove-project-directories "~/dev" "~/some/dir"`,
      },
      {
        command: "",
        example: "aws code some pj",
      },
    ]);
    process.exit();
  }

  if(keywords[0] === "--config") {
    console.log(await loadConfig());
    process.exit();
  }

  if(keywords[0] === "--add-specified-projects") {
    const [_, ...specifiedProjectsToBeAdded] = keywords;
    const config = await loadConfig();
    const nextConfig = {
      ...config,
      specifiedProjects: Array.from(new Set([
        ...config.specifiedProjects,
        ...specifiedProjectsToBeAdded,
      ])),
    };
    await saveConfig(nextConfig);
    await updateScriptFile();
    process.exit();
  }

  if(keywords[0] === "--remove-specified-projects") {
    const [_, ...specifiedProjectsToBeRemoved] = keywords;
    const config = await loadConfig();
    const nextConfig = {
      ...config,
      specifiedProjects: config.specifiedProjects
        .filter(project => !specifiedProjectsToBeRemoved.includes(project))
    };
    await saveConfig(nextConfig);
    await updateScriptFile();
    process.exit();
  }

  if(keywords[0] === "--add-project-directories") {
    const [_, ...projectDirectoriesToBeAdded] = keywords;
    const config = await loadConfig();
    const nextConfig = {
      ...config,
      projectDirectories: Array.from(new Set([
        ...config.projectDirectories,
        ...projectDirectoriesToBeAdded,
      ])),
    };
    await saveConfig(nextConfig);
    await updateScriptFile();
    process.exit();
  }

  if(keywords[0] === "--remove-project-directories") {
    const [_, ...projectDirectoriesToBeRemoved] = keywords;
    const config = await loadConfig();
    const nextConfig = {
      ...config,
      projectDirectories: config.projectDirectories
        .filter(project => !projectDirectoriesToBeRemoved.includes(project)),
    };
    await saveConfig(nextConfig);
    await updateScriptFile();
    process.exit();
  }

  if(keywords[0] === "--update") {
    await updateScriptFile();
    process.exit();
  }

  const regExps = keywords.map(kw => new RegExp(kw, "i"));
  const candidates = projects
    .filter(repoPath => regExps.every(regExp => regExp.test(repoPath)));
  if(candidates.length === 1) {
    const [projectPath] = candidates;
    const resolvedPath = projectPath.match(/^~/)
      ? projectPath.replace(/^~/, homedir())
      : projectPath;
    stat(resolvedPath)
      .then(() => new Promise((resolve, reject) => {
        exec(`code ${resolvedPath}`, (err,stdout,stderr) => {
          (err ? reject : resolve)(err ? stderr : stdout);
        });
      }))
      .catch(e => {
        console.log(e);
      })
      .finally(() => {
        process.exit();
      });
  } else {
    console.table(candidates.length > 0 ? candidates : projects);
  }
  
})().catch(() => {
  // nop
});
