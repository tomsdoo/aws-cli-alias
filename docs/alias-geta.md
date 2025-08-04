---
outline: deep
---

# geta

It runs Node.js that the environment has global variable named `aws`.

## Setup

### Local Installation

``` sh
/bin/bash -c "ALIAS_NAME=geta; $(curl -fsSL https://raw.githubusercontent.com/tomsdoo/aws-cli-alias/HEAD/install.sh)"
```

### Docker Run

``` sh
# aws geta will start on the container
docker run -it --rm -v ~/.aws:/root/.aws tomsd/aws-cli-alias-geta:0.1.2
```

## Usage

### interactive mode

``` sh
aws geta
```

then, you will get the prompt.

```
> aws.profile.currentProfile
'default'
```

### script execution mode

``` js
// work.js
console.log(aws.profile.currentProfile);
```

``` sh
aws geta ./work.js
```

### http server mode

``` js
aws geta http
```

``` js
fetch(
  "http://localhost:3000/exec",
  {
    method: "POST",
    body: JSON.stringify({
      script: "resolve(aws.profile.currentProfile);",
    }),
  },
)
  .then(r => r.json())
  .then(({ result }) => {
    console.log(result);
  }); // "default"
```

#### options

|option|description|default value|
|:--|:--|:--|
|--port|port number|3000|
|--pathname|pathname|/exec|


## global variable named `aws`

`aws` has the properties below.

<div class="aws-properties">

- [apiGateway](#aws-apigateway)
- [athena](#aws-athena)
- [cloudFront](#aws-cloudfront)
- [cognitoIdp](#aws-cognitoidp)
- [dynamodb](#aws-dynamodb)
- [ec2](#aws-ec2)
- [ecr](#aws-ecr)
- [ecs](#aws-ecs)
- [elb](#aws-elb)
- [firehose](#aws-firehose)
- [iam](#aws-iam)
- [logs](#aws-logs)
- [profile](#aws-profile)
- [rds](#aws-rds)
- [redshift](#aws-redshift)
- [route53](#aws-route53)
- [secretsManager](#aws-secretsmanager)
- [s3api](#aws-s3api)


<style>
.aws-properties > ul {
  display: grid;
  gap: 0.5rem 1rem;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  list-style: none;
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0;
  justify-content: center;
  align-items: start;
  > li {
    width: 100%;
    height: 100%;
    margin: 0;
    > a {
      display: block;
      width: 100%;
      height: 100%;
      padding: 1em;
      box-shadow: 0 0 1px;
      border-radius: 0.5em;
    }
  }
}
</style>

</div>

### aws.apiGateway

`aws.apiGateway` provides the methods below.

<details><summary>getRestApis()</summary>

``` ts
getRestApis(): Promise<RestApi[]>
```

</details>

<details><summary>getRestApi(restApiId: string)</summary>

``` ts
getRestApi(restApiId: string): Promise<RestApi>
```

</details>

<details><summary>getStages(restApiId: string)</summary>

``` ts
getStages(restApiId: string): Promise<Stage[]>
```

</details>

<details><summary>getResources(restApiId: string)</summary>

``` ts
getResources(restApiId: string): Promise<Resource[]>
```

</details>

<details><summary>getBasePathMappings(domainName: string)</summary>

``` ts
getBasePathMappings(domainName: string): Promise<{
  basePath: string;
  restApiId: string;
  stage: string;
}[]>
```

</details>

<details><summary>interface RestApi</summary>

``` ts
interface RestApi {
  id: string;
  name: string;
  createdDate: string;
  version: string;
  apiKeySource: string;
  endpointConfiguration: {};
  tags: {};
  disableExecuteApiEndpoint: boolean;
  rootResourceId: string;
  consoleUrl: string;
  getStages: () => Promise<Stage[]>;
  getResources() => Promise<Resource[]>;
}
```

</details>

<details><summary>interface Stage</summary>

``` ts
interface Stage {
  deploymentId: string;
  stageName: string;
  cacheClusterEnabled: boolean;
  cacheClusterStatus: string;
  createdDate: string;
  lastUpdatedDate: string;
}
```

</details>

<details><summary>interface Resource</summary>

``` ts
interface Resource {
  id: string;
  parentId: string;
  pathPart: string;
  path: string;
  resourceMethods?: Record<string, object>;
}
```

</details>

<details><summary>interface Domain</summary>

``` ts
interface Domain {
  domainName: string;
  domainNameArn: string;
  certificateUploadDate: string;
  regionalDomainName: string;
  regionalHostedZoneId: string;
  regionalCertificateArn: string;
  endpointConfiguration: {
    types: string[];
  };
  domainNameStatus: string;
  securityPolicy: string;
  tags: {};
  routingMode: string;
  consoleUrl: string;
  getBasePathMapping: () => Promise<{
    basePath: string;
    restApiId: string;
    stage: string;
  }[]>;
}
```

</details>

### aws.athena

`aws.athena` provides the methods below.

<details><summary>listDataCatalogs()</summary>

``` ts
listDataCatalogs(): Promise<{
  CatalogName: string;
  Type: stringl
  Status: string;
  listDatabases: () => Promise<{
    Name: string;
    listTableMetadata() => Promise<TableMetadata[]>
  }[]>
}[]>
```

</details>

<details><summary>listDatabases(catalogName: string)</summary>

``` ts
listDatabases(catalogName: string): Promise<{
  Name: string;
  listTableMetadata() => Promise<TableMetadata[]>;
}[]>
```

</details>

<details><summary>listTableMetadata(catalogName: string, databaseName: string)</summary>

``` ts
listTableMetadata(
  catalogName: string,
  databaseName: string
): Promise<TableMetadata[]>
```

</details>

<details><summary>executeQuery(sql: string)</summary>

``` ts
executeQuery(sql: string): Promise<Record<string, unknwon>[]>
```

</details>


<details><summary>interface TableMetadata</summary>

``` ts
interface TableMetadata {
  Name: string;
  CreateTime: string;
  TableType: string;
  Columns: {
    Name: string;
    Type: sting;
    Comment: string;
  }[];
  PartitionKeys: {
    Name: string;
    Type: string;
    Comment: string;
  }[];
  Parameters: {
    EXTERNAL: string;
    inputformat: string;
    location: string;
    outputformat: string;
  };
}
```

</details>

### aws.cloudFront

`aws.cloudFront` provides the methods below.

<details><summary>listDistributions(keyword?: string)</summary>

``` ts
listDistributions(keyword?: string): Promise<Distribution[]>
```

</details>

<details><summary>interface Distribution</summary>

``` ts
interface Distribution {
  Id: string;
  ARN: string;
  ETag: string;
  Status: string;
  LastModifiedTime: string;
  DomainName: string;
  Aliases: {
    Quantity: number;
    Items: 
  };
  Origins: {
    Quantity: number;
    Items: 
  };
  OriginGroups: {
    Quantity: number;
  };
  DefaultCacheBahavior: {
    TargetOriginId: string;
    TrustedSigners: {};
    TrustedKeyGroups: {};
    ViewerProtocolPolicy: string;
    AllowedMethods: {};
    SmoothStreaming: boolean;
    Compress: boolean;
    LambdaFunctionAssociations: {};
    FunctionAssociations: {};
    FieldLevelEncryptionId: string;
    GrpcConfig: {
      Enabled: boolean;
    };
    FormattedValues: {};
    MinTTL: number;
    DefaultTTL: number;
    MaxTTL: number;
  };
  CacheBehaviors: {};
  CustomErrorResponses: {};
  Comment: string;
  PriceClass: string;
  Enabled: boolean;
  ViewerCertificate: {
    CloudFrontDefaultCertificate: boolean;
    SSLSupportMethod: string;
    MinumunProtocolversion: string;
    CertificateSource: string;
  };
  Restrictions: {};
  WebACLId: string;
  HttpVersion: string;
  IsIPV6Enabled: boolean;
  Staging: boolean;
  ConnectionMode: string;
  consoleUrl: string;
  hasS3Origins: boolean;
  s3Origins: string[];
  s3Buckets: string[];
}
```

</details>

### aws.cognitoIdp

`aws.cognitoIdp` provides the methods below.

<details><summary>listUserPools()</summary>

``` ts
listUserPools(
  options?: { type: "array" | "map" | "object"; key: string | null }
): Promise<
  UserPoolSummary[] |
  Map<string, UserPoolSummary> |
  Record<string, UserPoolSummary>
>
```

</details>

<details><summary>listUsers(poolId: string)</summary>

``` ts
listUsers(
  poolId: string,
  options?: {
    email?: string;
    mergeAttributes?: boolean;
  },
): Promise<Uesr[]>
```

</details>

<details><summary>describeUserPool(poolId: string)</summary>

``` ts
describeUserPool(poolId: string): Promise<UserPool>
```

</details>

<details><summary>interface UserPoolSummary</summary>

``` ts
interface UserPoolSummary {
  Id: string;
  Name: string;
  LambdaConfig: Record<string, string>;
  LastModifiedDate: string;
  CreationDate: string;
  listUsers: (options?: {
    email?: string;
    mergeAttributes?: boolean;
  }) => Promise<User[]>;
}
```

</details>

<details><summary>interface UserPool</summary>

``` ts
interface UserPool {
  Id: string;
  Name: string;
  Policies: {
    PasswordPolicy?: {
      MinimumLength: number;
      RequireUpperCase: boolean;
      RequireLowercase: boolean;
      RequireNumbers: boolean;
      RequireSymbols: boolean;
      TemporaryPasswordValidityDays: number;
    };
    [key: string]: object:
  };
  DeletionProtection: string;
  LambdaConfig: Record<string, string>;
  LastModifiedDate: string;
  CreationDate: string;
  SchemaAttributes: {
    Name: string;
    AttributeDataType: string;
    DeveloperOnlyAttribute: boolean;
    Mutable: boolean;
    Required: boolean;
    StringAttributeConstrains: Record<string, string>;
    NumberAttributeConstraints: Record<string, string>;
  }[];
  AutoVerifiedAttributes: string[];
  UsernameAttributes: string[];
  SmsVerificationMessage: string;
  EmailVerificationMessage: string;
  EmailVerificationSubject: string;
  VerificationMessageTemplate: {
    SmsMessage: string;
    EmailMessage: string;
    EmailSubjet: string;
    DefaultEmailOption: string;
  };
  SmsAuthenticationMessage: string;
  UserAttributeUpdateSettings: {};
  MfaConfiguration: string;
  EstimatedNumberOfUsers: number;
  EmailConfiguration: {
    SourceArn: string;
    EmailSendingAccount: string;
    From: string;
  };
  Domain: string;
  AdminCreateUserConfig: {
    AllowAdminCreateUserOnly: boolean;
    UnusedAccountValidityDays: number;
    InviteMessageTemplate: {
      SMSMessage: string;
      EmailMessage: string;
      EmailSubject: string;
    };
  };
  UsernameConfiguration: {
    CaseSensitive: boolean;
  };
  Arn: string;
  AccountRecoverySetting: {
    RecoveryMechanisms: {
      Priority: number;
      Name: string;
    }[];
  };
  UserPoolTier: string;
}
```

</details>

<details><summary>interface User</summary>

``` ts
interface User {
  UserName: string;
  Atributes: {
    Name: string;
    Value: string;
  }[];
  UserCreateDate: string;
  UserLastModifiedDate: string;
  Enabled: boolean;
  UserStatus: string;
  mergedAttributes?: Record<string, string>;
}
```

</details>


### aws.dynamodb

`aws.dynamodb` provides the methods below.

<details><summary>listTables()</summary>

``` ts
listTagles(): Promise<string[]>
```

</details>

<details><summary>describeTable(tableName: string)</summary>

``` ts
describeTable(tableName: string): Promise<Table[]>
```

</details>


<details><summary>interface Table</summary>

``` ts
interface Table {
  AttributeDefinitions: {
    AttributeName: string;
    AttributeType: string;
  }[];
  TableName: string;
  KeySchema: {
    AttributeName: string;
    KeyType: string;
  }[];
  TableStatus: string;
  CreationDateTime: string;
  ProvisionedThroughout: {
    NumberOfDecreasesToday: number;
    ReadCapacityUnits: number;
    WriteCapacityUnits: number;
  };
  TableSizeBytes: number;
  ItemCount: number;
  TableArn: string;
  TableId: string;
  BillingModeSummary: {
    BillingMode: string;
    LastUpdateToPayPerRequestDateTime: string;
  };
  GlobalSecondaryIndexes: {
    IndexName: string;
    KeySchema: {
      AttributeName: string;
      KeyType: string;
    }[];
    Projection: {
      ProjectionType: string;
    };
    IndexStatus: string;
    ProvisionedThroughout: {
      NumberOfDecreasesToday: number;
      ReadCapacityUnits: number;
      WriteCapacityUnits: number;
    };
    IndexSizeBytes: number;
    ItemCount: number;
    IndexArn: string;
    WarmThroughout: {
      ReadUnitsPerSecond: number;
      WriteUnitsPerSecond: number;
      Status: string;
    };
  }[];
  StreamSpecification: {
    StreamEnabled: boolean;
    StreamViewType: string;
  };
  LatestStreamLabel: string;
  LatestStreamArn: string;
  DeletionProtectionEnabled: boolean;
  WarmThroughout: {
    ReadUnitsPerSecond: number;
    WriteUnitsPerSecond: number;
    Status: string;
  };
}
```

</details>

### aws.ec2

`aws.ec2` provides the methods below.

<details><summary>describeInstances()</summary>

``` ts
describeInstances(): Promise<{
  ReservationId: string;
  OwnerId: string;
  Groups: {}[];
  Instances: Instance[];
}[]>
```

</details>

<details><summary>describeVpcs()</summary>

``` ts
describeVpcs(): Promise<Vpc[]>
```


</details>

<details><summary>describeSecurityGroups()</summary>

``` ts
describeSecurityGroups(): Promise<SecurityGroup[]>
```

</details>

<details><summary>describeSecurityGroupRules()</summary>

``` ts
describeSecurityGroupRules(
  filter?: { Name: string; Values: string[]; }[]
): Promise<SecurityGroupRule[]>
```

</details>

<details><summary>describeSubnets()</summary>

``` ts
describeSubnets(): Promise<Subnet[]>
```

</details>

<details><summary>getPureInstances()</summary>

``` ts
getPureInstances(): Promise<Instance[]>
```

</details>

<details><summary>getInstances(keyword: string)</summary>

``` ts
getInstances(keyword: string): Promise<(Instance & {
  start: () => Promise<{
    CurrentState: InstanceState;
    InstanceId: string;
    PreviousState: InstanceState;
  }>;
  stop: () => Promise<{
    CurrentState: InstanceState;
    InstanceId: string;
    PreviousState: InstanceState;
  }>:
  tagObj: Record<string, string>;
})[]>
```

</details>

<details><summary>startInstance(instanceId: string)</summary>

``` ts
startInstance(instanceId: string): Promise<{
  CurrentState: InstanceState;
  InstanceId: string;
  PreviousState: InstanceState;
}>
```

</details>

<details><summary>stopInstance(instanceId: string)</summary>

``` ts
stopInstance(instanceId: string): Promise<{
  CurrentState: InstanceState;
  InstanceId: string;
  PreviousState: InstanceState;
}>
```

</details>

<details><summary>interface Instance</summary>

``` ts
interface Instance {
  Architecture: string;
  BlockDeviceMappings: {}[];
  ClientToken: string;
  EbsOptimized: boolean;
  EnaSupport: boolean;
  Hypervisor: string;
  IamInstanceProfile: {};
  NetworkInterfaces: {}[];
  RootDeviceName: string;
  RootDeviceType: string;
  SecurityGroups: {}[];
  SourceDestCheck: boolean;
  Tags: {}[];
  VertualizationType: string;
  CpuOptions: {};
  CapacityReservationSpecification: {};
  HibernationOptions: {};
  MetadataOptions: {};
  EnclaveOptions: {};
  PlatformDetails: string;
  UsageOperation: string;
  UsageOperationUpdateTime: string;
  PrivateDnsNameOptions: {};
  MaintenanceOptions: {};
  CurrentInstanceBookMode: string;
  NetworkPerformanceOptions: {};
  Operator: {};
  InstanceId: string;
  ImageId: string;
  State: {};
  PrivateDnsName: string;
  PublicDnsName: string;
  StateTransitionReason: string;
  KeyName: string;
  AmiLaunchIndex: number;
  ProductCodes: {}[];
  InstanceType: string;
  LaunchTime: string;
  Placement: {};
  Monitoring: {};
  SubnetId: string;
  VpcId: string;
  PrivateIpAddress: string;
  PublicIpAddress: string;
}
```

</details>

<details><summary>interface InstanceState</summary>

``` ts
interface InstanceState {
  Code: number;
  Name: string;
}
```

</details>

<details><summary>interface Vpc</summary>

``` ts
interface Vpc {
  OwnerId: string;
  InstanceTenancy: string;
  CidrBlockAssociationSet: {
    AssociationId: string;
    CidrBlock: string;
    CidrBlockState: {
      State: string;
    };
  }[];
  IsDefault: boolean;
  Tags: {
    Key: string;
    Value: string;
  }[];
  BlockPublicAccessStates: {
    InternetGatewayBlockMode: string;
  };
  VpcId: string;
  State: string;
  CidrBlock: string;
  DhcpOptionsId: string;
}
```

</details>

<details><summary>interface Subnet</summary>

``` ts
interface Subnet {
  AvailabilityZoneId: string;
  MapCustomerOwnedIpOnLaunch: boolean;
  OwnerId: string;
  AssignIpv6AddressOnCreation: boolean;
  Ipv6CidrBlockAssociationSet: {}[];
  Tags: {
    Key: string;
    Value: string;
  }[];
  SubnetArn: string;
  EnableDns64: boolean;
  Ipv6Native: boolean;
  PrivateDnsNameOptionsOnLaunch: {
    HostnameType: string;
    EnableResoureNameDnsARecord: boolean;
    EnableResourceNameDnsAAAARecord: boolean;
  };
  BlockPublicAccessStates: {
    InternetGatewayBlockMode: string;
  };
  SubnetId: string;
  State: string;
  VpcId: string;
  CidrBlock: string;
  AvailableIpAddressCount: number;
  AvailabilityZone: string;
  DefaultForAz: boolean;
  MapPublicIpOnLaunch: boolean;
}
```

</details>

<details><summary>interface SecurityGroup</summary>

``` ts
interface SecurityGroup {
  GroupId: string;
  IpPermissionsEgress: {
    IpProtocol: string;
    FromPort: number;
    ToPort: number;
    UserIdGroupPairs: {
      Description: string;
      UserId: string;
      GroupId: string;
    }[];
  }[];
  Tags?: {
    Key: string;
    Value: string;
  }[];
  VpcId: string;
  SecurityGroupArn: string;
  OwnerId: string;
  GroupName: string;
  Description: string;
  IpPermissions: {
    IpProtocol: string;
    FromPort: number;
    ToPort: number;
    UserIdGroupPairs: {
      Description: string;
      UserId: string;
      GroupId: string;
    }[];
    IpRanges: {}[];
    Ipv6Ranges: {}[];
    PrefixListIds: {}[];
  }[];
  describeSecurityGroupRunes(): Promise<SecurityGroupRule[]>
}
```

</details>

<details><summary>interface SecurityGroupRule</summary>

``` ts
interface SecurityGroupRule {
  SecurityGroupRuleId: string;
  GroupId: string;
  GroupOwnerId: string;
  IsEgress: boolean;
  IpProtocol: string;
  FromPort: number;
  ToPort: number;
  CidrIpv4: string;
  Description: string;
  Tags?: {
    Key: string;
    Value: string;
  }[];
  SecurityGroupRuleArn: string;
}
```

</details>

### aws.ecr

`aws.ecr` provides the methods below.

<details><summary>describeRepositories()</summary>

``` ts
describeRepositories(): Promise<{
  repositoryArn: string;
  registryId: string;
  repositoryName: string;
  repositoryUri: string;
  createdAt: string;
  imageTagMutability: string;
  imageScanningConfiguration: {
    scanOnPush: boolean;
  };
  encryptionConfiguration: {
    encryptionType: string;
  };
  describeImages: () => Promise<{
    registryId: string;
    repositoryName: string;
    imageDigest: string;
    imageTags?: string[];
    imageSizeInBytes: number;
    imagePushedAt: string;
    imageManifestMediaType: string;
    artifactMediaType: string;
    lastRecordedPullTime: string;
  }[]>
}[]>
```

</details>

<details><summary>describeImages(repositoryName: string)</summary>

``` ts
describeImages(repositoryName: string): Promise<{
  registryId: string;
  repositoryName: string;
  imageDigest: string;
  imageTags?: string[];
  imageSizeInBytes: number;
  imagePushedAt: string;
  imageManifestMediaType: string;
  artifactMediaType: string;
  lastRecordedPullTime: string;
}[]>
```

</details>

### aws.ecs

`aws.ecs` provides the methods below.

<details><summary>listClusters()</summary>

``` ts
listClusters(): Promise<{
  clusterArn: string;
  describeClusters: () => Promise<{
    clusterArn: string;
    clusterName: string;
    status: string;
    registeredContainerInstancesCount: number;
    runningTasksCount: number;
    pendingTasksCount: number;
    activeServicesCount: number;
    statistics: {}[];
    tags: {}[];
    settings: {}[];
    capacityProviders: string[];
    defaultCapacityProviderStrategy: {
      capacityProvider: string;
      weight: number;
      base: number;
    }[];
    listServices: () => Promise<{}[]>;
  }[]>;
}[]>;
```

</details>

<details><summary>describeClusters()</summary>

``` ts
descibeClusters(clusterArn: string): Promise<{
  clusterArn: string;
  clusterName: string;
  status: string;
  registeredContainerInstancesCount: number;
  runningTasksCount: number;
  pendingTasksCount: number;
  activeServicesCount: number;
  statistics: {}[];
  tags: {}[];
  settings: {}[];
  capacityProviders: string[];
  defaultCapacityProviderStrategy: {
    capacityProvider: string;
    weight: number;
    base: number;
  }[];
  listServices: () => Promise<{}[]>;
}[]>
```

</details>

<details><summary>listServices(clusterArn: string)</summary>

``` ts
listServices(clusterArn: string): Promise<{
  clusterArn: string;
  serviceArn: string;
  describeServices: (): Promise<{
    serviceArn: string;
    serviceName: string;
    clusterArn: string;
    loadBalancers: {}[];
    serviceRegistries: {}[];
    status: string;
    desiredCount: number;
    runningCount: number;
    pendingCount: number;
    platformVersion: string;
    platformFamily: string;
    taskDefinition: string;
    deploymentConfiguration: {};
    deployments: {}[];
    roleArn: string;
    events: {}[];
    createdAt: string;
    placementConstraints: {}[];
    placementStrategy: {}[];
    networkConfiguration: {};
    healthCheckGracePeriodSeconds: number;
    schedulingStrategy: string;
    deploymentController: {
      type: string;
    };
    createdBy: string;
    enableECSManagedTags: boolean;
    propagateTags: string;
    enableExecuteCommand: boolean;
    availabilityZoneRebalancing: string;
  }[]>;
}[]>
```

</details>

<details><summary>describeServices(clusterArn: string, serviceArn: string)</summary>

``` ts
describeServices(clusterArn: string, serviceArn: string): Promise<{
  serviceArn: string;
  serviceName: string;
  clusterArn: string;
  loadBalancers: {}[];
  serviceRegistries: {}[];
  status: string;
  desiredCount: number;
  runningCount: number;
  pendingCount: number;
  platformVersion: string;
  platformFamily: string;
  taskDefinition: string;
  deploymentConfiguration: {};
  deployments: {}[];
  roleArn: string;
  events: {}[];
  createdAt: string;
  placementConstraints: {}[];
  placementStrategy: {}[];
  networkConfiguration: {};
  healthCheckGracePeriodSeconds: number;
  schedulingStrategy: string;
  deploymentController: {
    type: string;
  };
  createdBy: string;
  enableECSManagedTags: boolean;
  propagateTags: string;
  enableExecuteCommand: boolean;
  availabilityZoneRebalancing: string;
}[]>
```

</details>


<details><summary>listTasks(clusterArn: string)</summary>

``` ts
listTasks(clusterArn: string): Promise<{
  clusterArn: string;
  taskArn: string;
  describeTasks: () => Promise<{
    attachments: {
      idd: string;
      type: string;
      status: string;
      details: {}[];
    }[];
    attributes: {
      name: string;
      value: string;
    }[];
    availabilityZone: string;
    capacityProviderName: string;
    clusterArn: string;
    connectivity: string;
    connectivityAt: string;
    containers: {
      containerArn: string;
      taskArn: string;
      name: string;
      image: string;
      imageDigest: string;
      runtimeId: string;
      lastStatus: string;
      networkBindings: {}[];
      networkInterfaces: {}[];
      healthStatus: string;
      managedAgents: {}[];
      cpu: string;
    }[];
    cpu: string;
    createdAt: string;
    desiredStatus: string;
    enableExecuteCommand: boolean;
    group: string;
    healthStatus: string;
    lastStatus: string;
    launchType: string;
    memory: string;
    overrides: {
      containerOverrides: {}[];
      inferenceAcceleratorOverrides: {}[];
    };
    platformVersion: string;
    platformFamily: string;
    pullStartedAt: string;
    pullStoppedAt: string;
    startedAt: string;
    startedBy: string;
    tags: {}[];
    taskArn: string;
    taskDescription: string;
    version: number;
    ephemeralStorage: {
      sizeInGiB: number;
    };
    getExecuteCommand: () => string;
  }[]>;
}[]>
```


</details>

<details><summary>describeTasks(clusterArn: string, taskArn: string)</summary>

``` ts
describeTasks(clusterArn: string, taskArn: string): Promise<{
  attachments: {
    idd: string;
    type: string;
    status: string;
    details: {}[];
  }[];
  attributes: {
    name: string;
    value: string;
  }[];
  availabilityZone: string;
  capacityProviderName: string;
  clusterArn: string;
  connectivity: string;
  connectivityAt: string;
  containers: {
    containerArn: string;
    taskArn: string;
    name: string;
    image: string;
    imageDigest: string;
    runtimeId: string;
    lastStatus: string;
    networkBindings: {}[];
    networkInterfaces: {}[];
    healthStatus: string;
    managedAgents: {}[];
    cpu: string;
  }[];
  cpu: string;
  createdAt: string;
  desiredStatus: string;
  enableExecuteCommand: boolean;
  group: string;
  healthStatus: string;
  lastStatus: string;
  launchType: string;
  memory: string;
  overrides: {
    containerOverrides: {}[];
    inferenceAcceleratorOverrides: {}[];
  };
  platformVersion: string;
  platformFamily: string;
  pullStartedAt: string;
  pullStoppedAt: string;
  startedAt: string;
  startedBy: string;
  tags: {}[];
  taskArn: string;
  taskDescription: string;
  version: number;
  ephemeralStorage: {
    sizeInGiB: number;
  };
  getExecuteCommand: () => string;
}[]>
```

</details>

### aws.elb

`aws.elb` provides the methods below.

<details><summary>describeLoadBalancers()</summary>

``` ts
describeLoadBalancers(): Promise<{
  LoadBalancerArn: string;
  DNSName: string;
  CanonicalHostedZoneId: string;
  CreatedTime: string;
  LoadBalancerName: string;
  Scheme: string;
  VpcId: string;
  State: {
    Code: string;
  };
  Type: string;
  AvailabilityZones: {
    ZoneName: string;
    SubnetId: string;
    LoadBalancerAdresses: string[];
  }[];
  SecurityGroups: string[];
  IpAddressType: string;
  EnablePrefixForIpv6SourceNat: string;
}[]>
```

</details>

### aws.firehose

`aws.firehose` provides the methods below.

<details><summary>listDeliveryStreams()</summary>

``` ts
listDeliveryStreams(): Promise<string[]>
```

</details>

<details><summary>describeDeliveryStream(deliveryStreamName: string)</summary>

``` ts
describeDeliveryStream(deliveryStreamName: string): Promise<{
  DeliveryStreamName: string;
  DeliveryStreamArn: string;
  DeliveryStreamStatus: string;
  DeliveryStreamEncryptionConfiguration: {
    KeyType: string;
    Status: string;
  };
  DeliveryStreamType: string;
  VersionId: string;
  CreateTimestamp: string;
  Destinations: {
    DestinationId: string;
    S3DestinationDescription: {};
    ExtendedS3DestinationDescription: {};
  }[];
  HasMoreDestinations: boolean;
  consoleUrl: string;
}>
```

</details>


### aws.iam

`aws.iam` provides the methods below.

<details><summary>listGroups()</summary>

``` ts
listGroups(): Promise<{
  Path: string;
  GroupName: string;
  GroupId: string;
  Arn: string;
  CreateDate: string;
  consoleUrl: string;
}[]>
```

</details>

<details><summary>listUsers()</summary>

``` ts
listUsers(): Promise<{
  Path: string;
  UserName: string;
  UserId: string;
  Arn: string;
  CreateDate: string;
  consoleUrl: string;
  listGroupsForUser: Promise<{
    Path: string;
    GroupName: string;
    GroupId: string;
    Arn: string;
    CreateDate: string;
  }[]>
}[]>
```

</details>

<details><summary>listGroupsForUser(userName: string)</summary>

``` ts
listGroupsForUser(userName: string): Promise<{
  Path: string;
  GroupName: string;
  GroupId: string;
  Arn: string;
  CreateDate: string;
}[]>
```

</details>

<details><summary>listRoles()</summary>

``` ts
listRoles(): Promise<{
  Path: string;
  RoleName: string;
  RoleId: string;
  Arn: string;
  CreateDate: string;
  AssumeRolePolicyDocument: {
    Version: string;
    Statement: {
      Effect: string;
      Principal: {
        Service: string;
      };
      Action: string;
    }[];
  };
  Description: string;
  MaxSessionDuration: number;
  consoleUrl: string;
  listRolePolicies: Promise<string[]>;
}[]>
```

</details>

<details><summary>listRolePolicies(roleName: string)</summary>

``` ts
listRolePolicies(roleName: string): Promise<string[]>
```

</details>

<details><summary>listPolicies()</summary>

``` ts
listPolicies(): Promise<{
  PolicyName: string;
  PolicyId: string;
  Arn: string;
  Path: string;
  DefaultVersionId: string;
  AttachmentCount: number;
  PermissionBoundaryUsageCount: number;
  IsAttachable: boolean;
  CreateDate: string;
  UpdateDate: string;
  consoleUrl: string;
}[]>
```

</details>

### aws.logs

`aws.logs` provides the methods below.

<details><summary>describeLogGroups()</summary>

``` ts
describeLogGroups(): Promise<{
  logGroupName: string;
  creationTime: number;
  retentionInDays: number;
  metricFilterCount: number;
  arn: string;
  storeBytes: number;
  logGroupClass: string;
  logGroupArn: string;
  consoleUrl: string;
  describeSubscriptionFilters: Promise<{
    filterName: string;
    logGroupName: string;
    filterPattern: string;
    destinationArn: string;
    distribution: string;
    applyOnTransformedLogs: boolean;
    creationTime: number;
  }[]>;
}[]>
```

</details>

<details><summary>describeSubscriptionFilters(logGroupName: string)</summary>

``` ts
describeSubscriptionFilters(logGroupName: string): Promise<{
  filterName: string;
  logGroupName: string;
  filterPattern: string;
  destinationArn: string;
  distribution: string;
  applyOnTransformedLogs: boolean;
  creationTime: number;
}[]>
```

</details>

### aws.profile

`aws.profile` provides the methods below.

<details><summary>currentProfile</summary>

``` ts
get currentProfile(): string
```

</details>

<details><summary>setCurrentProfile(profileName: string)</summary>

``` ts
setCurrentProfile(profileName: string): Promise<void>
```

</details>


<details><summary>listProfiles()</summary>

``` ts
listProfiles(): Promise<string[]>
```

</details>

### aws.rds

`aws.rds` provides the methods below.

<details><summary>getClusters()</summary>

``` ts
getClusters(): Promise<{
  AllocatedStorage: number;
  AvailabilityZones: string[];
  BackupRetensionPeriod: number;
  DatabaseName: string;
  DBClusterIdentifier: string;
  DBClusterParameterGroup: string;
  DBSubnetGroup: string;
  Status: string;
  EarliestRestorableTime: string;
  Endpoint: string;
  ReaderEndpoint: string;
  MultiAZ: boolean;
  Engine: string;
  EngineVersion: string;
  LatestRestorableTime: string;
  Port: number;
  MasterUsername: string;
  PreferredBackupWindow: string;
  PreferredMaintenanceWindow: string:
  DBClusterMembers: {
    DBInstanceIdentifier: string;
    IsClusterWriter: boolean;
    DBClusterParameterGroupStatus: string;
    PromotionTier: number;
  }[];
  VpcSecurityGroups: {
    VpcSecurityGroupId: string;
    Status: string;
  }[];
  HostedZoneId: string;
  StorageEncrypted: boolean;
  KmsKeyId: string;
  DbClusterResourceId: string;
  DBClusterArn: string;
  IAMDatabaseAuthenticationEnabled: boolean;
  ClusterCreateTime: string;
  EnabledCloudwatchLogsExports: string[];
  EngineMode: string;
  DeletionProtection: boolean;
  HttpEndpointEnabled: boolean;
  ActivityStreamStatus: string;
  CopyTagsToSnapshot: boolean;
  CrossAccountClone: boolean;
  TagList: {
    Key: string;
    Value: string;
  }[];
  AutoMinorVersionUpgrade: boolean;
  DatabaseInsightsMode: string;
  NetworkType: string;
  LocalWriteForwardingStatus: string;
  EngineLifecycleSupport: string;
}[]>
```

</details>

<details><summary>getInstances()</summary>

``` ts
getInstances(): Promise<{
  DBInstanceIdentifier: string;
  DBInstanceClass: string;
  Engine: string;
  DBInstanceStatus: string;
  MasterUsername: string;
  Endpoint: {
    Address: string;
    Port: number;
    HostedZoneId: string;
  };
  AllocatedStorage: number;
  InstanceCreateTime: string;
  PreferredBackupWindow: string;
  BackupRetentionPeriod: number;
  VpcSecurityGroups: {
    VpcSecurityGroupId: string;
    Status: string;
  }[];
  DBParameterGroups: {
    DBParameterGroupName: string;
    ParameterApplyStatus: string;
  }[];
  AvailabilityZone: string;
  DBSubnetGroup: {};
  PreferredMaintenanceWindow: string;
  EngineVersion: string;
  AutoMinorVersionUpgrade: boolean;
  LicenseModel: string;
  PubliclyAccessible: boolean;
  StorageType: string;
  KmsKeyId: string;
  CACertificateIdentifier: string;
  DBInstanceArn: string;
  TagList: {
    Key: string;
    Value: string;
  }[];
  NetworkType: string;
  MasterUserSecret: {
    SecretArn: string;
    SecretStatus: string;
    KmsKeyId: string;
  };
  CertificateDetails: {
    CAIdentifier: string;
    ValidTill: string;
  };
}[]>
```

</details>

### aws.redshift

`aws.redshift` provides the methods below.

<details><summary>listNamespaces()</summary>

``` ts
listNamespaces(): Promise<{
  adminPasswordSecretArg: string;
  adminUsername: string;
  creationDate: string;
  dbName: string;
  defaultIamRoleArn: string;
  iamRoles: string[];
  kmsKeyId: string;
  logExports: string[];
  namespaceArn: string;
  namespaceId: string;
  namespaceName: string;
  status: string;
}[]>
```

</details>

- listWorkgroups()


### aws.route53

`aws.route53` provides the methods below.

<details><summary>listHostedZones()</summary>

``` ts
listHostedZones(): Promise<{
  Id: string;
  Name: string;
  CallerReference: string;
  Config: {
    Comment: string;
    PrivateZone: boolean;
  };
  ResourceRecordSetCount: number;
  consoleUrl: string;
  listResourceRecordSets: () => Promise<{
    Name: string;
    Type: string;
    TTL: number;
    ResourceRecords: {
      Value: string;
    }[];
  }[]>;
}[]>
```

</details>

<details><summary>listResourceRecordSets(hostedZoneId: string)</summary>

``` ts
listResourceRecordSets(hostedZoneId: string): Promise<{
  Name: string;
  Type: string;
  TTL: number;
  ResourceRecords: {
    Value: string;
  }[];
}[]>
```

</details>

### aws.secretsManager

`aws.secretsManager` provides the methods below.

<details><summary>listSecrets()</summary>

``` ts
listSecrets(keyword?: string, onlyNames?: boolean): Promise<{
  ARN: string;
  Name: string;
  Description: string;
  LastChangedDate: string;
  LastAccessedDate: string;
  Tags: {
    Key: string;
    Value: string;
  }[];
  SecretVersionsToStages: Record<string, string[]>;
  CreatedDate: string;
}[]>
```

</details>

<details><summary>getSecret()</summary>

``` ts
getSecret(secretName: string): Promise<{
  ARN: string;
  Name: string;
  VersionId: string;
  SecretString: string;
  VersionStages: string[];
  CreatedDate: string;
  value: Record<string, string | number>;
}>
```

</details>

### aws.s3api

`aws.s3api` provides the methods below.

<details><summary>listBuckets()</summary>

``` ts
listBuckets(): Promise<{ Name: string; CreationDate: string; }>
```

</details>


## global variable named `session`

`session` has the properties below.

- [commandHistory](#session-commandhistory)


### session.commandHistory

`session.commandHistory` is an array of the command executed.

<details><summary>commandHistory</summary>

``` ts
commandHistory: {
  time: Date;
  commandLine: string;
}[];
```

</details>


