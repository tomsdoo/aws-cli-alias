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

class CliParams {
  obj;
  constructor(obj) {
    this.obj = obj;
  }
  toString() {
    return Object.entries(this.obj)
      .filter(([_,value]) => value)
      .map(([key, value]) => ({
        key,
        value,
        cliKey: "--" + key.replace(/([A-Z])/g, ($0,$1) => `-${$1.toLowerCase()}`),
        cliValue: value.toString().match(/\s/) ? `"${value}"` : value,
      }))
      .map(({cliKey, cliValue}) => [cliKey, cliValue].join(" "))
      .join(" ");
  }
}

class NextTokenLooper {
  async doLoop(maxItems, callback) {
    const darr = [];
    let startingToken = null;
    while(true) {
      const { resultItems, NextToken } = await callback({
        maxItems,
        startingToken,
      });
      darr.push(resultItems);
      if(!NextToken) {
        break;
      }
      startingToken = NextToken;
    }
    return darr.flat();
  }
}

class ResultRecord {
  columnMetadata;
  rawRecord;
  recordValueTypes = ["blobValue", "booleanValue", "doubleValue", "isNull", "longValue", "stringValue"];
  constructor(columnMetadata, rawRecord) {
    this.ColumnMetadata = columnMetadata;
    this.rawRecord = rawRecord;
  }
  get record() {
    return Object.fromEntries(
      this.ColumnMetadata.map(({name}, i) => {
        const [key,rawValue] = Object.entries(this.rawRecord[i])
          .filter(([key]) => this.recordValueTypes.includes(key))[0];
        const value = key === "isNull" && rawValue === true
          ? null
          : rawValue;
        return [name, value];
      })
    );
  }
}

const redshift = {
  async listNamespaces() {
    return await execute(`aws redshift-serverless list-namespaces`).then((r) => JSON.parse(r).namespaces);
  },
  async listWorkgroups() {
    return await execute(`aws redshift-serverless list-workgroups`).then((r) => JSON.parse(r).workgroups);
  },
  async listStatements() {
    return await new NextTokenLooper().doLoop(1000, async ({naxItems, startingToken}) => {
      const { Statements: resultItems, NextToken } = await execute(`aws redshift-data list-statements`).then((r) => JSON.parse(r));
      return { resultItems, NextToken };
    });
  },
  async describeStatement(id) {
    const cliParams = new CliParams({
      id,
    });
    const cmd = `aws redshift-data describe-statement ${cliParams.toString()}`;
    return await execute(cmd).then((r) => JSON.parse(r));
  },
  async getStatementResult(id) {
    return await new NextTokenLooper().doLoop(1000, async ({maxItems, startingToken}) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
        id,
      });
      const cmd = `aws redshift-data get-statement-result ${cliParams.toString()}`;
      const { ColumnMetadata, Records, NextToken } = await execute(cmd).then((r) => JSON.parse(r));
      const resultItems = Records.map(
        record => new ResultRecord(ColumnMetadata, record).record
      );
      return { resultItems, NextToken };
    });
  },
  Db: class Db extends NextTokenLooper {
    workgroupName;
    dbName;
    constructor(workgroupName, dbName) {
      super();
      this.workgroupName = workgroupName;
      this.dbName = dbName;
    }
    get baseParamsObj() {
      return {
        workgroupName: this.workgroupName,
        database: this.dbName,
      };
    }

    async listDatabases() {
      return await this.doLoop(60, async({maxItems, startingToken}) => {
        const cliParams = new CliParams({
          ...this.baseParamsObj,
          maxItems,
          startingToken,
        });
        const cmd = `aws redshift-data list-databases ${cliParams.toString()}`;
        const { Databases: resultItems, NextToken } = await execute(cmd).then((r) => JSON.parse(r));
        return {
          resultItems,
          NextToken,
        };
      });
    }

    async listSchemas() {
      return await this.doLoop(1000, async ({maxItems, startingToken}) => {
        const cliParams = new CliParams({
          ...this.baseParamsObj,
          maxItems,
          startingToken,
        });
        const cmd = `aws redshift-data list-schemas ${cliParams.toString()}`;
        const { Schemas: resultItems, NextToken } = await execute(cmd).then((r) => JSON.parse(r));
        return { resultItems, NextToken };
      });
    }

    async describeTable() {
      return await this.doLoop(1000, async ({maxItems, startingToken}) => {
        const cliParams = new CliParams({
          ...this.baseParamsObj,
          maxItems,
          startingToken,
        });
        const cmd = `aws redshift-data describe-table ${cliParams.toString()}`;
        const { ColumnList: resultItems, NextToken } = await execute(cmd).then((r) => JSON.parse(r));
        return {
          resultItems,
          NextToken,
        };
      });
    }

    async executeStatement(sql) {
      const cliParams = new CliParams({
        ...this.baseParamsObj,
        sql,
      });
      const cmd = `aws redshift-data execute-statement ${cliParams.toString()}`;
      return await execute(cmd).then((r) => JSON.parse(r));
    }
  },
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
  redshift,
  secretsManager,
};

repl.start();
