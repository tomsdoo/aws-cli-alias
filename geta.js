const { readFile } = require("fs/promises");
const { homedir } = require("os");
const path = require("path");
const { exec } = require("child_process");
const repl = require("node:repl");
const config = {
  awsProfile: "default",
};
const configProxy = new Proxy(config, {
  get(obj, prop) {
    return obj[prop];
  },
  set(obj, prop, value) {
    if (prop === "awsProfile") {
      process.env.AWS_PROFILE = value;
    }
    obj[prop] = value;
  },
});
configProxy.awsProfile = "default";

async function execute(commandLine) {
  return new Promise((resolve, reject) => {
    exec(commandLine, (err, stdout) => {
      (err ? reject : resolve)(err ?? stdout);
    });
  });
}
globalThis.execute = execute;

function getValueText(obj) {
  const delimiter = " ";
  if(Array.isArray(obj)) {
    return obj.map(getValueText).join(delimiter);
  }
  if(typeof obj === "object") {
    return Array.from(Object.values(obj)).map(getValueText).join(delimiter);
  }
  return `${obj}`;
}

const cloudFront = {
  async listDistributions(keyword) {
    const regExps = (keyword ?? "").split(" ").map(kw => new RegExp(kw, "i"));
    return await execute("aws cloudfront list-distributions").then(
      (r) => JSON.parse(r).DistributionList.Items
    )
      .then(distributions => 
        distributions.filter(distribution => {
          const text = getValueText(distribution);
          return regExps.every(regExp => regExp.test(text));
        })
      );
  },
};

const cognitoIdp = {
  async listUserPools() {
    return await execute(
      "aws cognito-idp list-user-pools --max-result 60"
    ).then((r) => JSON.parse(r).UserPools);
  },
  async describeUserPool(poolId) {
    return await execute(
      `aws cognito-idp describe-user-pool --user-pool-id ${poolId}`
    ).then((r) => JSON.parse(r).UserPool);
  },
  async listUsers(poolId) {
    let nextToken = undefined;
    const darr = [];
    const interval = 100;
    while (true) {
      const { Users, NextToken } = await execute(
        `aws cognito-idp list-users --user-pool-id ${poolId} --max-items ${interval} ${
          nextToken ? "--starting-token " + nextToken : ""
        }`
      ).then((r) => JSON.parse(r));
      darr.push(Users);
      if (Users.length === 0) {
        break;
      }
      nextToken = NextToken;
    }
    return darr.flatMap((v) => v);
  },
};

const dynamodb = {
  async listTables() {
    return await execute(`aws dynamodb list-tables`).then(
      (r) => JSON.parse(r).TableNames
    );
  },
  async describeTable(tableName) {
    return await execute(
      `aws dynamodb describe-table --table-name ${tableName}`
    ).then((r) => JSON.parse(r).Table);
  },
};

const ec2 = {
  async describeInstances() {
    return await execute(`aws ec2 describe-instances`).then((r) => JSON.parse(r).Reservations);
  },
  async getPureInstances() {
    return (await this.describeInstances()).map(({Instances}) => Instances).flat();
  },
  async getInstances(keyword,easy) {
    const regExps = (keyword ?? "").split(" ").map(kw => new RegExp(kw, "i"));
    return await this.getPureInstances()
      .then(instances => instances
        .map(instance => ({
          ...instance,
          tagObj: Object.fromEntries(instance.Tags.map(({ Key, Value }) => [Key, Value])),
        }))
        .filter(instance => {
          const text = getValueText(instance);
          return regExps.every(regExp => regExp.test(text));
        })
        .map(instance => easy ? ({
          InstanceId: instance.InstanceId,
          tagObj: instance.tagObj,
        }) : ({
          ...instance,
        }))
      )
  },
};

const rds = {
  async getInstances() {
    return await execute(`aws rds describe-db-instances`).then((r) => JSON.parse(r).DBInstances);
  },
  async getClusters() {
    return await execute(`aws rds describe-db-clusters`).then((r) => JSON.parse(r).DBClusters);
  }
};

const secretsManager = {
  async listSecrets(keyword,onlyNames) {
    const regExps = (keyword ?? "").split(" ").map(kw => new RegExp(kw, "i"));
    return await execute(`aws secretsmanager list-secrets`)
      .then((r) => 
        JSON.parse(r).SecretList
          .filter(secret => {
            const text = getValueText(secret);
            return regExps.every(regExp => regExp.test(text));
          })
          .map(secret => onlyNames ? secret.Name : secret)
      );
  },
  async getSecret(secretName) {
    function maybeJson(value) {
      try {
        return JSON.parse(value);
      } catch(e) {
        return value;
      }
    }
    return await execute(`aws secretsmanager get-secret-value --secret-id ${secretName}`)
      .then((r) => {
        const secret = JSON.parse(r);
        return {
          ...secret,
          value: maybeJson(secret.SecretString),
        };
      });
  }
};

const profile = {
  get currentProfile() {
    return configProxy.awsProfile;
  },
  async setCurrentProfile(v) {
    const profiles = await this.listProfiles();
    if (!profiles.includes(v)) {
      throw new Error(`${v} is not found in ${profiles}`);
    }
    configProxy.awsProfile = v;
  },
  async listProfiles() {
    const textContent = await readFile(
      path.join(homedir(), ".aws/credentials"),
      { encoding: "utf8" }
    );
    const lines = textContent.split(/\n/);
    const profiles = lines
      .filter((line) => line.match(/^\[.+\]$/))
      .map((line) => line.replace(/^\[/, "").replace(/\]$/, ""));
    return profiles;
  },
};

globalThis.aws = {
  cloudFront,
  cognitoIdp,
  dynamodb,
  ec2,
  profile,
  rds,
  secretsManager,
};

repl.start();
