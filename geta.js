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

const getaParams = process.argv.slice(2);
if(getaParams.length === 1 && getaParams[0] === "--update") {
  execute(`/bin/bash -c "ALIAS_NAME=geta; $(curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/install.sh)"`);
  process.exit();
} else if (getaParams.length === 1 && getaParams[0] === "--help") {
  console.log([
    "aws geta",
    "",
    "options",
    ...[
      { option: "--update", description: "update geta script" },
      { option: "--help", description: "show geta help" },
    ]
      .map(({ option, description }) => [`  ${option}`, `    ${description}`])
      .flat(),
    "",
  ].join("\n"));
  process.exit();
}

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
        distributions
          .filter(distribution => {
            const text = getValueText(distribution);
            return regExps.every(regExp => regExp.test(text));
          })
          .map(distribution => {
            const consoleUrl = `https://console.aws.amazon.com/cloudfront/home#distributions/${distribution.Id}`;
            const s3Origins = distribution.Origins.Items
              .filter(
                ({ DomainName }) =>
                  /\.s3-website-.*amazonaws\.com$/.test(DomainName)
              )
              .map(({ DomainName }) => DomainName);
            const s3Buckets = s3Origins
              .map(
                s3Origin => s3Origin.replace(
                  /(.+)\.s3-website-.*?\.amazonaws\.com$/,
                  ($0, $1) => $1,
                )
              );
            const hasS3Origins = s3Origins.length > 0;
            return {
              ...distribution,
              consoleUrl,
              hasS3Origins,
              s3Origins,
              s3Buckets,
            };
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

const s3api = {
  async listBuckets() {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
      });
      const cmd = `aws s3api list-buckets ${cliParams.toString()}`;
      const { Buckets: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    });
  },
};

const route53 = {
  async listHostedZones() {
    return await new NextTokenLooper().doLoop(1000, async({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
      });
      const cmd = `aws route53 list-hosted-zones ${cliParams.toString()}`;
      const { HostedZones: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    })
      .then(hostedZones => hostedZones.map(hostedZone => ({
        ...hostedZone,
        consoleUrl: `https://console.aws.amazon.com/route53/v2/hostedzones#ListRecordSets/${hostedZone.Id.replace(/^\/hostedzone\//,"")}`,
        listResourceRecordSets: async () => await route53.listResourceRecordSets(hostedZone.Id),
      })));
  },
  async listResourceRecordSets(hostedZoneId) {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        hostedZoneId,
        maxItems,
        startingToken,
      });
      const cmd = `aws route53 list-resource-record-sets ${cliParams.toString()}`;
      const { ResourceRecordSets: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    });
  },
};

const logs = {
  async describeLogGroups() {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
      });
      const cmd = `aws logs describe-log-groups ${cliParams.toString()}`;
      const { logGroups: resultItems, NextToken } = await execute(cmd).then((r) => JSON.parse(r));
      return { resultItems, NextToken };
    })
      .then(logGroups => logGroups.map(logGroup => ({
        ...logGroup,
        consoleUrl: `https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups/log-group/${encodeURIComponent(encodeURIComponent(logGroup.logGroupName))}`,
        async describeSubscriptionFilters() {
          return await aws.logs.describeSubscriptionFilters(logGroup.logGroupName);
        },
      })));
  },
  async describeSubscriptionFilters(logGroupName) {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
        logGroupName,
      });
      const cmd = `aws logs describe-subscription-filters ${cliParams.toString()}`;
      const { subscriptionFilters: resultItems, NextToken } = await execute(cmd).then((r) => JSON.parse(r));
      return { resultItems, NextToken };
    });
  }
};

const firehose = {
  async listDeliveryStreams() {
    const darr = [];
    let exclusiveStartDeliveryStreamName = undefined;
    while(true) {
      const cliParams = new CliParams({
        exclusiveStartDeliveryStreamName,
      });
      const cmd = `aws firehose list-delivery-streams ${cliParams.toString()}`;
      const {
        DeliveryStreamNames,
        HasMoreDeliveryStreams,
      } = await execute(cmd).then(r => JSON.parse(r));
      darr.push(DeliveryStreamNames);
      if(!HasMoreDeliveryStreams) {
        break;
      }
      exclusiveStartDeliveryStreamName = DeliveryStreamNames.slice(-1) ?? "";
    }
    return darr.flat();
  },
  async descibeDeliveryStream(deliveryStreamName) {
    const darr = [];
    const limit = 1000;
    let exclusiveStartDestinationId = undefined;
    while(true) {
      const cliParams = new CliParams({
        deliveryStreamName,
        limit,
        exclusiveStartDestinationId,
      });
      const cmd = `aws firehose describe-delivery-stream ${cliParams.toString()}`;
      const {
        DeliveryStreamDescription,
      } = await execute(cmd).then(r => JSON.parse(r));
      darr.push(DeliveryStreamDescription.Destinations);
      if(!DeliveryStreamDescription.HasMoreDestinations) {
        return {
          ...DeliveryStreamDescription,
          consoleUrl: `https://console.aws.amazon.com/firehose/home#/details/${deliveryStreamName}`,
          Destinations: darr.flat(),
        };
      }
      exclusiveStartDestinationId = DeliveryStreamDescription.Destinations.slice(-1)?.[0]?.DestinationId;
    }
  }
};

const apiGateway = {
  async getRestApis() {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
      });
      const cmd = `aws apigateway get-rest-apis ${cliParams.toString()}`;
      const { items: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    })
      .then(apis => apis.map(api => ({
        ...api,
        getStages: async () => await aws.apiGateway.getStages(api.id),
        getResources: async () => await aws.apiGateway.getResources(api.id),
        consoleUrl: `https://console.aws.amazon.com/apigateway/main/apis/${api.id}/resources?api=${api.id}`,
      })));
  },
  async getRestApi(restApiId) {
    const cliParams = new CliParams({
      restApiId,
    });
    const cmd = `aws apigateway get-rest-api ${cliParams.toString()}`;
    return await execute(cmd)
      .then(r => JSON.parse(r))
      .then(api => ({
        ...api,
        getStages: async () => await aws.apiGateway.getStages(api.id),
        getResources: async () => await aws.apiGateway.getResources(api.id),
        consoleUrl: `https://console.aws.amazon.com/apigateway/main/apis/${api.id}/resources?api=${api.id}`,
      }));
  },
  async getStages(restApiId) {
    const cliParams = new CliParams({
      restApiId,
    });
    const cmd = `aws apigateway get-stages ${cliParams.toString()}`;
    return await execute(cmd)
      .then(r => JSON.parse(r));
  },
  async getResources(restApiId) {
    const cliParams = new CliParams({
      restApiId,
    });
    const cmd = `aws apigateway get-resources ${cliParams.toString()}`;
    return await execute(cmd)
      .then(r => JSON.parse(r));
  },
  async getDomainNames() {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
      });
      const cmd = `aws apigateway get-domain-names ${cliParams.toString()}`;
      const { items: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    })
      .then(domains => domains.map(domain => ({
        ...domain,
        getBasePathMappings: async () => await aws.apiGateway.getBasePathMappings(domain.domainName),
        consoleUrl: `https://console.aws.amazon.com/apigateway/main/publish/domain-names/api-mappings?api=unselected&domain=${domain.domainName}`,
      })));
  },
  async getBasePathMappings(domainName) {
    return await new NextTokenLooper().doLoop(1, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        domainName,
        maxItems,
        startingToken,
      });
      const cmd = `aws apigateway get-base-path-mappings ${cliParams.toString()}`;
      const { items: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    });
  },
};

const athena = {
  async listDataCatalogs() {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
      });
      const cmd = `aws athena list-data-catalogs ${cliParams.toString()}`;
      const { DataCatalogsSummary: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    })
      .then(catalogs => catalogs.map(catalog => ({
        ...catalog,
        listDatabases: async () => aws.athena.listDatabases(catalog.CatalogName),
      })));
  },
  async listNamedQueries() {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
      });
      const cmd = `aws athena list-named-queries ${cliParams.toString()}`;
      const { NamedQueryIds: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    })
      .then(async namedQueryIds => {
        const resultItems = [];
        for (const namedQueryId of namedQueryIds) {
          resultItems.push(
            await aws.athena.getNamedQuery(namedQueryId)
          );
        }
        return resultItems;
      });
  },
  async getNamedQuery(namedQueryId) {
    const cliParams = new CliParams({
      namedQueryId,
    });
    const cmd = `aws athena get-named-query ${cliParams.toString()}`;
    const { NamedQuery } = await execute(cmd).then(r => JSON.parse(r));
    return NamedQuery;
  },
  async listDatabases(catalogName) {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        catalogName,
        maxItems,
        startingToken,
      });
      const cmd = `aws athena list-databases ${cliParams.toString()}`;
      const { DatabaseList: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    });
  },
  async executeQuery(sql) {
    const { QueryExecutionId } = await execute(`aws athena start-query-execution --query-string "${sql}"`)
      .then(JSON.parse);
    while(true) {
      const { QueryExecution: { Status: { State: executionStatus }}} = await execute(`aws athena get-query-execution --query-execution-id ${QueryExecutionId}`)
        .then(JSON.parse);
      if (executionStatus === "SUCCEEDED") {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        queryExecutionId: QueryExecutionId,
        maxItems,
        startingToken,
      });
      const cmd = `aws athena get-query-results ${cliParams.toString()}`;
      const { ResultSet, NextToken } = await execute(cmd).then(JSON.parse);
      const fields = ResultSet.ResultSetMetadata.ColumnInfo;
      const resultItems = ResultSet.Rows.map(({Data}) => Object.fromEntries(fields.map(({ Name }, fieldIndex) => [Name, Data[fieldIndex].VarCharValue])));
      return { resultItems, NextToken };
    });
  },
};

const iam = {
  async listGroups() {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
      });
      const cmd = `aws iam list-groups ${cliParams.toString()}`;
      const { Groups: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    })
      .then(groups => groups.map(group => ({
        ...group,
        consoleUrl: `https://console.aws.amazon.com/iam/home#/groups/details/${group.GroupName}`,
      })));
  },
  async listUsers() {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
      });
      const cmd = `aws iam list-users ${cliParams.toString()}`;
      const { Users: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    })
      .then(users => users.map(user => ({
        ...user,
        listGroupsForUser: async () => await aws.iam.listGroupsForUser(user.UserName),
        consoleUrl: `https://console.aws.amazon.com/iam/home#/users/details/${user.UserName}`,
      })));
  },
  async listGroupsForUser(userName) {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        userName,
        maxItems,
        startingToken,
      });
      const cmd = `aws iam list-groups-for-user ${cliParams.toString()}`;
      const { Groups: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    });
  },
  async listRoles() {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
      });
      const cmd = `aws iam list-roles ${cliParams.toString()}`;
      const { Roles: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    })
      .then(roles => roles.map(role => ({
        ...role,
        listRolePolicies: async () => await aws.iam.listRolePolicies(role.RoleName),
        consoleUrl: `https://console.aws.amazon.com/iam/home#/roles/details/${role.RoleName}`,
      })));
  },
  async listRolePolicies(roleName) {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        roleName,
        maxItems,
        startingToken,
      });
      const cmd = `aws iam list-role-policies ${cliParams.toString()}`;
      const { PolicyNames: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    });
  },
  async listPolicies() {
    return await new NextTokenLooper().doLoop(1000, async ({ maxItems, startingToken }) => {
      const cliParams = new CliParams({
        maxItems,
        startingToken,
      });
      const cmd = `aws iam list-policies ${cliParams.toString()}`;
      const { Policies: resultItems, NextToken } = await execute(cmd).then(r => JSON.parse(r));
      return { resultItems, NextToken };
    })
      .then(policies => policies.map(policy => ({
        ...policy,
        consoleUrl: `https://console.aws.amazon.com/iam/home#/policies/details/${encodeURIComponent(policy.Arn)}?section=permissions`,
      })));
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
  apiGateway,
  athena,
  cloudFront,
  cognitoIdp,
  dynamodb,
  ec2,
  firehose,
  iam,
  logs,
  profile,
  rds,
  redshift,
  route53,
  secretsManager,
  s3api,
};

repl.start();
