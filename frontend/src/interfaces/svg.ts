import { CanvasNodeVariantType } from "./diagram";

export interface SvgResourceNodes {
    // labels: string[];
    icons: string[];
    name: string;
    type: CanvasNodeVariantType;
}

export interface IconAttr {
    label: string;
    source: string;
    terraform: string[];
    toscaTypes: string[] | string;
}

export interface IconMapping {
    [key: string]: IconAttr;
}

// ==================================================
// AWS Node Icons
// ==================================================

export enum AWSAnalyticsNodeIconKey {
    // Architecture
    athena = "athena",
    cleanRooms = "cleanRooms",
    cloudSearch = "cloudSearch",
    dataExchange = "dataExchange",
    dataPipeline = "dataPipeline",
    dataZone = "dataZone",
    emr = "emr",
    finSpace = "finSpace",
    glue = "glue",
    glueDataBrew = "glueDataBrew",
    glueElasticViews = "glueElasticViews",
    kinesis = "kinesis",
    kinesisDataAnalytics = "kinesisDataAnalytics",
    kinesisDataStreams = "kinesisDataStreams",
    kinesisFirehose = "kinesisFirehose",
    kinesisVideoStreams = "kinesisVideoStreams",
    lakeFormation = "lakeFormation",
    managedStreamingForApacheKafka = "managedStreamingForApacheKafka",
    openSearchService = "openSearchService",
    quickSight = "quickSight",
    redshift = "redshift",
}

export const AWSAnalyticsNodeIconName = {
    [AWSAnalyticsNodeIconKey.athena]: "Athena",
    [AWSAnalyticsNodeIconKey.cleanRooms]: "CleanRooms",
    [AWSAnalyticsNodeIconKey.cloudSearch]: "CloudSearch",
    [AWSAnalyticsNodeIconKey.dataExchange]: "Data Exchange",
    [AWSAnalyticsNodeIconKey.dataPipeline]: "Data Pipeline",
    [AWSAnalyticsNodeIconKey.dataZone]: "DataZone",
    [AWSAnalyticsNodeIconKey.emr]: "EMR",
    [AWSAnalyticsNodeIconKey.finSpace]: "FinSpace",
    [AWSAnalyticsNodeIconKey.glue]: "Glue",
    [AWSAnalyticsNodeIconKey.glueDataBrew]: "Glue DataBrew",
    [AWSAnalyticsNodeIconKey.glueElasticViews]: "Glue ElasticViews",
    [AWSAnalyticsNodeIconKey.kinesis]: "Kinesis",
    [AWSAnalyticsNodeIconKey.kinesisDataAnalytics]: "Kinesis Data Analytics",
    [AWSAnalyticsNodeIconKey.kinesisDataStreams]: "Kinesis Data Streams",
    [AWSAnalyticsNodeIconKey.kinesisFirehose]: "Kinesis Firehose",
    [AWSAnalyticsNodeIconKey.kinesisVideoStreams]: "Kinesis Video Streams",
    [AWSAnalyticsNodeIconKey.lakeFormation]: "Lake Formation",
    [AWSAnalyticsNodeIconKey.managedStreamingForApacheKafka]: "Managed Streaming for Apache Kafka",
    [AWSAnalyticsNodeIconKey.openSearchService]: "OpenSearch Service",
    [AWSAnalyticsNodeIconKey.quickSight]: "QuickSight",
    [AWSAnalyticsNodeIconKey.redshift]: "Redshift",
};

export enum AWSAppIntegrationNodeIconKey {
    // Architecture
    apiGateway = "apiGateway",
    appFlow = "appFlow",
    appSync = "appSync",
    consoleMobileApplication = "consoleMobileApplication",
    eventBridge = "eventBridge",
    expressWorkflows = "expressWorkflows",
    managedWorkflowsForApacheAirflow = "managedWorkflowsForApacheAirflow",
    mq = "mq",
    simpleNotificationService = "simpleNotificationService",
    simpleQueueService = "simpleQueueService",
    stepFunctions = "stepFunctions",
}

export const AWSAppIntegrationNodeIconName = {
    [AWSAppIntegrationNodeIconKey.apiGateway]: "API Gateway",
    [AWSAppIntegrationNodeIconKey.appFlow]: "AppFlow",
    [AWSAppIntegrationNodeIconKey.appSync]: "AppSync",
    [AWSAppIntegrationNodeIconKey.consoleMobileApplication]: "Console Mobile Application",
    [AWSAppIntegrationNodeIconKey.eventBridge]: "EventBridge",
    [AWSAppIntegrationNodeIconKey.expressWorkflows]: "Express Workflows",
    [AWSAppIntegrationNodeIconKey.managedWorkflowsForApacheAirflow]:
        "Managed Workflows for Apache Airflow",
    [AWSAppIntegrationNodeIconKey.mq]: "MQ",
    [AWSAppIntegrationNodeIconKey.simpleNotificationService]: "Simple Notification Service",
    [AWSAppIntegrationNodeIconKey.simpleQueueService]: "Simple Queue Service",
    [AWSAppIntegrationNodeIconKey.stepFunctions]: "Step Functions",
};

export enum AWSBusinessApplicationsNodeIconKey {
    // Architecture
    alexaForBusiness = "alexaForBusiness",
    chime = "chime",
    chimeSDK = "chimeSDK",
    chimeVoiceConnector = "chimeVoiceConnector",
    connect = "connect",
    honeycode = "honeycode",
    pinpoint = "pinpoint",
    pinpointAPIs = "pinpointAPIs",
    simpleEmailService = "simpleEmailService",
    supplyChain = "supplyChain",
    wickr = "wickr",
    workDocs = "workDocs",
    workDocsSDK = "workDocsSDK",
    workMail = "workMail",
}

export const AWSBusinessApplicationsNodeIconName = {
    [AWSBusinessApplicationsNodeIconKey.alexaForBusiness]: "Alexa For Business",
    [AWSBusinessApplicationsNodeIconKey.chime]: "Chime",
    [AWSBusinessApplicationsNodeIconKey.chimeSDK]: "Chime SDK",
    [AWSBusinessApplicationsNodeIconKey.chimeVoiceConnector]: "Chime Voice Connector",
    [AWSBusinessApplicationsNodeIconKey.connect]: "Connect",
    [AWSBusinessApplicationsNodeIconKey.honeycode]: "Honeycode",
    [AWSBusinessApplicationsNodeIconKey.pinpoint]: "Pinpoint",
    [AWSBusinessApplicationsNodeIconKey.pinpointAPIs]: "Pinpoint APIs",
    [AWSBusinessApplicationsNodeIconKey.simpleEmailService]: "Simple Email Service",
    [AWSBusinessApplicationsNodeIconKey.supplyChain]: "Supply Chain",
    [AWSBusinessApplicationsNodeIconKey.wickr]: "Wickr",
    [AWSBusinessApplicationsNodeIconKey.workDocs]: "WorkDocs",
    [AWSBusinessApplicationsNodeIconKey.workDocsSDK]: "WorkDocs SDK",
    [AWSBusinessApplicationsNodeIconKey.workMail]: "WorkMail",
};

export enum AWSCloudFinancialManagementNodeIconKey {
    // Architecture
    applicationCostProfiler = "applicationCostProfiler",
    billingConductor = "billingConductor",
    budgets = "budgets",
    costAndUsageReport = "costAndUsageReport",
    costExplorer = "costExplorer",
    reservedInstanceReporting = "reservedInstanceReporting",
    savingsPlans = "savingsPlans",
}

export const AWSCloudFinancialManagementNodeIconName = {
    [AWSCloudFinancialManagementNodeIconKey.applicationCostProfiler]: "Application Cost Profiler",
    [AWSCloudFinancialManagementNodeIconKey.billingConductor]: "Billing Conductor",
    [AWSCloudFinancialManagementNodeIconKey.budgets]: "Budgets",
    [AWSCloudFinancialManagementNodeIconKey.costAndUsageReport]: "Cost and Usage Report",
    [AWSCloudFinancialManagementNodeIconKey.costExplorer]: "Cost Explorer",
    [AWSCloudFinancialManagementNodeIconKey.reservedInstanceReporting]:
        "Reserved Instance Reporting",
    [AWSCloudFinancialManagementNodeIconKey.savingsPlans]: "Savings Plans",
};

export enum AWSComputeNodeIconKey {
    // Architecture
    applicationAutoScaling = "applicationAutoScaling",
    appRunner = "appRunner",
    batch = "batch",
    bottlerocket = "bottlerocket",
    computeOptimizer = "computeOptimizer",
    ec2 = "ec2",
    ec2AutoScaling = "ec2AutoScaling",
    ec2ImageBuilder = "ec2ImageBuilder",
    elasticBeanstalk = "elasticBeanstalk",
    elasticFabricAdapter = "elasticFabricAdapter",
    fargate = "fargate",
    lambda = "lambda",
    lightsail = "lightsail",
    localZones = "localZones",
    niceDCV = "niceDCV",
    niceEnginFrame = "niceEnginFrame",
    nitroEnclaves = "nitroEnclaves",
    outpostsFamily = "outpostsFamily",
    outpostsRack = "outpostsRack",
    outpostsServers = "outpostsServers",
    parallelCluster = "parallelCluster",
    serverlessApplicationRepository = "serverlessApplicationRepository",
    simSpaceWeaver = "simSpaceWeaver",
    thinkboxDeadline = "thinkboxDeadline",
    thinkboxFrost = "thinkboxFrost",
    thinkboxKrakatoa = "thinkboxKrakatoa",
    thinkboxSequoia = "thinkboxSequoia",
    thinkboxStoke = "thinkboxStoke",
    thinkboxXMesh = "thinkboxXMesh",
    vmwareCloudOnAWS = "vmwareCloudOnAWS",
    wavelength = "wavelength",
}

export const AWSComputeNodeIconName = {
    [AWSComputeNodeIconKey.appRunner]: "App Runner",
    [AWSComputeNodeIconKey.applicationAutoScaling]: "Application Auto Scaling",
    [AWSComputeNodeIconKey.batch]: "Batch",
    [AWSComputeNodeIconKey.bottlerocket]: "Bottlerocket",
    [AWSComputeNodeIconKey.computeOptimizer]: "Compute Optimizer",
    [AWSComputeNodeIconKey.ec2]: "EC2",
    [AWSComputeNodeIconKey.ec2AutoScaling]: "EC2 Auto Scaling",
    [AWSComputeNodeIconKey.ec2ImageBuilder]: "EC2 Image Builder",
    [AWSComputeNodeIconKey.elasticBeanstalk]: "Elastic Beanstalk",
    [AWSComputeNodeIconKey.elasticFabricAdapter]: "Elastic Fabric Adapter",
    [AWSComputeNodeIconKey.fargate]: "Fargate",
    [AWSComputeNodeIconKey.lambda]: "Lambda",
    [AWSComputeNodeIconKey.lightsail]: "Lightsail",
    [AWSComputeNodeIconKey.localZones]: "Local Zones",
    [AWSComputeNodeIconKey.niceDCV]: "Nice DCV",
    [AWSComputeNodeIconKey.niceEnginFrame]: "Nice EnginFrame",
    [AWSComputeNodeIconKey.nitroEnclaves]: "Nitro Enclaves",
    [AWSComputeNodeIconKey.outpostsFamily]: "Outposts Family",
    [AWSComputeNodeIconKey.outpostsRack]: "Outposts Rack",
    [AWSComputeNodeIconKey.outpostsServers]: "Outposts Servers",
    [AWSComputeNodeIconKey.parallelCluster]: "Parallel Cluster",
    [AWSComputeNodeIconKey.serverlessApplicationRepository]: "Serverless Application Repository",
    [AWSComputeNodeIconKey.simSpaceWeaver]: "Sim Space Weaver",
    [AWSComputeNodeIconKey.thinkboxDeadline]: "Thinkbox Deadline",
    [AWSComputeNodeIconKey.thinkboxFrost]: "Thinkbox Frost",
    [AWSComputeNodeIconKey.thinkboxKrakatoa]: "Thinkbox Krakatoa",
    [AWSComputeNodeIconKey.thinkboxSequoia]: "Thinkbox Sequoia",
    [AWSComputeNodeIconKey.thinkboxStoke]: "Thinkbox Stoke",
    [AWSComputeNodeIconKey.thinkboxXMesh]: "Thinkbox XMesh",
    [AWSComputeNodeIconKey.vmwareCloudOnAWS]: "VMware Cloud on AWS",
    [AWSComputeNodeIconKey.wavelength]: "Wavelength",
};

export enum AWSContainersNodeIconKey {
    // Architecture
    ecsAnywhere = "ecsAnywhere",
    eksAnywhere = "eksAnywhere",
    eksDistro = "eksDistro",
    elasticContainerRegistry = "elasticContainerRegistry",
    elasticContainerService = "elasticContainerService",
    kubernetesPod = "kubernetesPod",
    redHatOpenShiftService = "redHatOpenShiftService",
}

export const AWSContainersNodeIconName = {
    [AWSContainersNodeIconKey.ecsAnywhere]: "ECS Anywhere",
    [AWSContainersNodeIconKey.eksAnywhere]: "EKS Anywhere",
    [AWSContainersNodeIconKey.eksDistro]: "EKS Distro",
    [AWSContainersNodeIconKey.elasticContainerRegistry]: "Elastic Container Registry",
    [AWSContainersNodeIconKey.elasticContainerService]: "Elastic Container Service",
    [AWSContainersNodeIconKey.kubernetesPod]: "Kubernetes Pod",
    [AWSContainersNodeIconKey.redHatOpenShiftService]: "Red Hat OpenShift Service",
};

export enum AWSCustomerEnablementNodeIconKey {
    // Architecture
    activate = "activate",
    iq = "iq",
    professionalServices = "professionalServices",
    rePost = "rePost",
    rePostPrivate = "rePostPrivate",
    support = "support",
    trainingCertification = "trainingCertification",
}

export const AWSCustomerEnablementNodeIconName = {
    [AWSCustomerEnablementNodeIconKey.activate]: "Activate",
    [AWSCustomerEnablementNodeIconKey.iq]: "IQ",
    [AWSCustomerEnablementNodeIconKey.professionalServices]: "Professional Services",
    [AWSCustomerEnablementNodeIconKey.rePost]: "RePost",
    [AWSCustomerEnablementNodeIconKey.rePostPrivate]: "RePost Private",
    [AWSCustomerEnablementNodeIconKey.support]: "Support",
    [AWSCustomerEnablementNodeIconKey.trainingCertification]: "Training Certification",
};

export enum AWSDatabaseNodeIconKey {
    // Architecture
    aurora = "aurora",
    databaseMigrationService = "databaseMigrationService",
    documentDB = "documentDB",
    dynamoDB = "dynamoDB",
    elastiCache = "elastiCache",
    keyspaces = "keyspaces",
    memoryDBForRedis = "memoryDBForRedis",
    neptune = "neptune",
    rds = "rds",
    rdsInstance = "rdsInstance",
    rdsOnVMware = "rdsOnVMware",
    timestream = "timestream",
}

export const AWSDatabaseNodeIconName = {
    [AWSDatabaseNodeIconKey.aurora]: "Aurora",
    [AWSDatabaseNodeIconKey.databaseMigrationService]: "Database Migration Service",
    [AWSDatabaseNodeIconKey.documentDB]: "DocumentDB",
    [AWSDatabaseNodeIconKey.dynamoDB]: "DynamoDB",
    [AWSDatabaseNodeIconKey.elastiCache]: "ElastiCache",
    [AWSDatabaseNodeIconKey.keyspaces]: "Keyspaces",
    [AWSDatabaseNodeIconKey.memoryDBForRedis]: "MemoryDB for Redis",
    [AWSDatabaseNodeIconKey.neptune]: "Neptune",
    [AWSDatabaseNodeIconKey.rds]: "RDS",
    [AWSDatabaseNodeIconKey.rdsInstance]: "RDS Instance",
    [AWSDatabaseNodeIconKey.rdsOnVMware]: "RDS on VMware",
    [AWSDatabaseNodeIconKey.timestream]: "Timestream",
};

export enum AWSDeveloperToolsNodeIconKey {
    // Architecture
    applicationComposer = "applicationComposer",
    cloud9 = "cloud9",
    cloudControlAPI = "cloudControlAPI",
    cloudDevelopmentKit = "cloudDevelopmentKit",
    cloudShell = "cloudShell",
    codeArtifact = "codeArtifact",
    codeBuild = "codeBuild",
    codeCatalyst = "codeCatalyst",
    codeCommit = "codeCommit",
    codeDeploy = "codeDeploy",
    codePipeline = "codePipeline",
    commandLineInterface = "commandLineInterface",
    corretto = "corretto",
    toolsAndSDKs = "toolsAndSDKs",
    xRay = "xRay",
}

export const AWSDeveloperToolsNodeIconName = {
    [AWSDeveloperToolsNodeIconKey.applicationComposer]: "Application Composer",
    [AWSDeveloperToolsNodeIconKey.cloud9]: "Cloud9",
    [AWSDeveloperToolsNodeIconKey.cloudControlAPI]: "Cloud Control API",
    [AWSDeveloperToolsNodeIconKey.cloudDevelopmentKit]: "Cloud Development Kit",
    [AWSDeveloperToolsNodeIconKey.cloudShell]: "CloudShell",
    [AWSDeveloperToolsNodeIconKey.codeArtifact]: "CodeArtifact",
    [AWSDeveloperToolsNodeIconKey.codeBuild]: "CodeBuild",
    [AWSDeveloperToolsNodeIconKey.codeCatalyst]: "CodeCatalyst",
    [AWSDeveloperToolsNodeIconKey.codeCommit]: "CodeCommit",
    [AWSDeveloperToolsNodeIconKey.codeDeploy]: "CodeDeploy",
    [AWSDeveloperToolsNodeIconKey.codePipeline]: "CodePipeline",
    [AWSDeveloperToolsNodeIconKey.commandLineInterface]: "Command Line Interface",
    [AWSDeveloperToolsNodeIconKey.corretto]: "Corretto",
    [AWSDeveloperToolsNodeIconKey.toolsAndSDKs]: "Tools and SDKs",
    [AWSDeveloperToolsNodeIconKey.xRay]: "X-Ray",
};

export enum AWSEndUserComputingNodeIconKey {
    // Architecture
    appStream = "appStream",
    workSpacesFamily = "workSpacesFamily",
}

export const AWSEndUserComputingNodeIconName = {
    [AWSEndUserComputingNodeIconKey.appStream]: "AppStream",
    [AWSEndUserComputingNodeIconKey.workSpacesFamily]: "WorkSpaces Family",
};

export enum AWSFrontEndWebMobileNodeIconKey {
    // Architecture
    amplify = "amplify",
    deviceFarm = "deviceFarm",
    locationService = "locationService",
}

export const AWSFrontEndWebMobileNodeIconName = {
    [AWSFrontEndWebMobileNodeIconKey.amplify]: "Amplify",
    [AWSFrontEndWebMobileNodeIconKey.deviceFarm]: "Device Farm",
    [AWSFrontEndWebMobileNodeIconKey.locationService]: "Location Service",
};

export enum AWSGamesNodeIconKey {
    // Architecture
    gameKit = "gameKit",
    gameLift = "gameLift",
    gameSparks = "gameSparks",
    lumberyard = "lumberyard",
    open3DEngine = "open3DEngine",
}

export const AWSGamesNodeIconName = {
    [AWSGamesNodeIconKey.gameKit]: "GameKit",
    [AWSGamesNodeIconKey.gameLift]: "GameLift",
    [AWSGamesNodeIconKey.gameSparks]: "GameSparks",
    [AWSGamesNodeIconKey.lumberyard]: "Lumberyard",
    [AWSGamesNodeIconKey.open3DEngine]: "Open 3D Engine",
};

export enum AWSInternetOfThingsNodeIconKey {
    // Architecture
    freeRTOS = "freeRTOS",
    iot1Click = "iot1Click",
    iotAnalytics = "iotAnalytics",
    iotButton = "iotButton",
    iotCore = "iotCore",
    iotDeviceDefender = "iotDeviceDefender",
    iotDeviceManagement = "iotDeviceManagement",
    iotEduKit = "iotEduKit",
    iotEvents = "iotEvents",
    iotExpressLink = "iotExpressLink",
    iotFleetWise = "iotFleetWise",
    iotGreengrass = "iotGreengrass",
    iotRoboRunner = "iotRoboRunner",
    iotSiteWise = "iotSiteWise",
    iotThingsGraph = "iotThingsGraph",
    iotTwinMaker = "iotTwinMaker",
}

export const AWSInternetOfThingsNodeIconName = {
    [AWSInternetOfThingsNodeIconKey.freeRTOS]: "FreeRTOS",
    [AWSInternetOfThingsNodeIconKey.iot1Click]: "IoT 1-Click",
    [AWSInternetOfThingsNodeIconKey.iotAnalytics]: "IoT Analytics",
    [AWSInternetOfThingsNodeIconKey.iotButton]: "IoT Button",
    [AWSInternetOfThingsNodeIconKey.iotCore]: "IoT Core",
    [AWSInternetOfThingsNodeIconKey.iotDeviceDefender]: "IoT Device Defender",
    [AWSInternetOfThingsNodeIconKey.iotDeviceManagement]: "IoT Device Management",
    [AWSInternetOfThingsNodeIconKey.iotEduKit]: "IoT EduKit",
    [AWSInternetOfThingsNodeIconKey.iotEvents]: "IoT Events",
    [AWSInternetOfThingsNodeIconKey.iotExpressLink]: "IoT Express Link",
    [AWSInternetOfThingsNodeIconKey.iotFleetWise]: "IoT FleetWise",
    [AWSInternetOfThingsNodeIconKey.iotGreengrass]: "IoT Greengrass",
    [AWSInternetOfThingsNodeIconKey.iotRoboRunner]: "IoT RoboRunner",
    [AWSInternetOfThingsNodeIconKey.iotSiteWise]: "IoT SiteWise",
    [AWSInternetOfThingsNodeIconKey.iotThingsGraph]: "IoT Things Graph",
    [AWSInternetOfThingsNodeIconKey.iotTwinMaker]: "IoT TwinMaker",
};

export enum AWSMachineLearningNodeIconKey {
    // Architecture
    apacheMXNetOnAWS = "apacheMXNetOnAWS",
    augmentedAIA2I = "augmentedAIA2I",
    codeGuru = "codeGuru",
    codeWhisperer = "codeWhisperer",
    comprehend = "comprehend",
    comprehendMedical = "comprehendMedical",
    deepComposer = "deepComposer",
    deepLearningAMIs = "deepLearningAMIs",
    deepLearningContainers = "deepLearningContainers",
    deepRacer = "deepRacer",
    devOpsGuru = "devOpsGuru",
    elasticInference = "elasticInference",
    forecast = "forecast",
    fraudDetector = "fraudDetector",
    healthLake = "healthLake",
    kendra = "kendra",
    lex = "lex",
    lookoutForEquipment = "lookoutForEquipment",
    lookoutForMetrics = "lookoutForMetrics",
    lookoutForVision = "lookoutForVision",
    monitron = "monitron",
    neuron = "neuron",
    omics = "omics",
    panorama = "panorama",
    personalize = "personalize",
    polly = "polly",
    rekognition = "rekognition",
    sageMaker = "sageMaker",
    sageMakerGroundTruth = "sageMakerGroundTruth",
    sageMakerStudioLab = "sageMakerStudioLab",
    tensorFlowOnAWS = "tensorFlowOnAWS",
    textract = "textract",
    torchServe = "torchServe",
    transcribeAWS = "transcribeAWS",
    translate = "translate",
}

export const AWSMachineLearningNodeIconName = {
    [AWSMachineLearningNodeIconKey.apacheMXNetOnAWS]: "Apache MXNet on AWS",
    [AWSMachineLearningNodeIconKey.augmentedAIA2I]: "Augmented AIA2I",
    [AWSMachineLearningNodeIconKey.codeGuru]: "CodeGuru",
    [AWSMachineLearningNodeIconKey.codeWhisperer]: "Code Whisperer",
    [AWSMachineLearningNodeIconKey.comprehend]: "Comprehend",
    [AWSMachineLearningNodeIconKey.comprehendMedical]: "Comprehend Medical",
    [AWSMachineLearningNodeIconKey.deepComposer]: "DeepComposer",
    [AWSMachineLearningNodeIconKey.deepLearningAMIs]: "Deep Learning AMIs",
    [AWSMachineLearningNodeIconKey.deepLearningContainers]: "Deep Learning Containers",
    [AWSMachineLearningNodeIconKey.deepRacer]: "DeepRacer",
    [AWSMachineLearningNodeIconKey.devOpsGuru]: "DevOps Guru",
    [AWSMachineLearningNodeIconKey.elasticInference]: "Elastic Inference",
    [AWSMachineLearningNodeIconKey.forecast]: "Forecast",
    [AWSMachineLearningNodeIconKey.fraudDetector]: "Fraud Detector",
    [AWSMachineLearningNodeIconKey.healthLake]: "HealthLake",
    [AWSMachineLearningNodeIconKey.kendra]: "Kendra",
    [AWSMachineLearningNodeIconKey.lex]: "Lex",
    [AWSMachineLearningNodeIconKey.lookoutForEquipment]: "Lookout for Equipment",
    [AWSMachineLearningNodeIconKey.lookoutForMetrics]: "Lookout for Metrics",
    [AWSMachineLearningNodeIconKey.lookoutForVision]: "Lookout for Vision",
    [AWSMachineLearningNodeIconKey.monitron]: "Monitron",
    [AWSMachineLearningNodeIconKey.neuron]: "Neuron",
    [AWSMachineLearningNodeIconKey.omics]: "Omics",
    [AWSMachineLearningNodeIconKey.panorama]: "Panorama",
    [AWSMachineLearningNodeIconKey.personalize]: "Personalize",
    [AWSMachineLearningNodeIconKey.polly]: "Polly",
    [AWSMachineLearningNodeIconKey.rekognition]: "Rekognition",
    [AWSMachineLearningNodeIconKey.sageMaker]: "SageMaker",
    [AWSMachineLearningNodeIconKey.sageMakerGroundTruth]: "SageMaker Ground Truth",
    [AWSMachineLearningNodeIconKey.sageMakerStudioLab]: "SageMaker Studio Lab",
    [AWSMachineLearningNodeIconKey.tensorFlowOnAWS]: "TensorFlow on AWS",
    [AWSMachineLearningNodeIconKey.textract]: "Textract",
    [AWSMachineLearningNodeIconKey.torchServe]: "TorchServe",
    [AWSMachineLearningNodeIconKey.transcribeAWS]: "Transcribe AWS",
    [AWSMachineLearningNodeIconKey.translate]: "Translate",
};

export enum AWSManagementGovernanceNodeIconKey {
    // Architecture
    appConfig = "appConfig",
    autoScaling = "autoScaling",
    backintAgent = "backintAgent",
    chatbot = "chatbot",
    cloudFormation = "cloudFormation",
    cloudTrail = "cloudTrail",
    cloudWatch = "cloudWatch",
    config = "config",
    controlTower = "controlTower",
    distroForOpenTelemetry = "distroForOpenTelemetry",
    faultInjectionSimulator = "faultInjectionSimulator",
    launchWizard = "launchWizard",
    licenseManager = "licenseManager",
    managedGrafana = "managedGrafana",
    managedServiceForPrometheus = "managedServiceForPrometheus",
    managementConsole = "managementConsole",
    opsWorks = "opsWorks",
    organizations = "organizations",
    personalHealthDashboard = "personalHealthDashboard",
    proton = "proton",
    resilienceHub = "resilienceHub",
    resourceExplorer = "resourceExplorer",
    serviceCatalog = "serviceCatalog",
    serviceManagementConnector = "serviceManagementConnector",
    systemsManager = "systemsManager",
    trustedAdvisor = "trustedAdvisor",
    wellArchitectedTool = "wellArchitectedTool",
}

export const AWSManagementGovernanceNodeIconName = {
    [AWSManagementGovernanceNodeIconKey.appConfig]: "AppConfig",
    [AWSManagementGovernanceNodeIconKey.autoScaling]: "Auto Scaling",
    [AWSManagementGovernanceNodeIconKey.backintAgent]: "Backint Agent",
    [AWSManagementGovernanceNodeIconKey.chatbot]: "Chatbot",
    [AWSManagementGovernanceNodeIconKey.cloudFormation]: "CloudFormation",
    [AWSManagementGovernanceNodeIconKey.cloudTrail]: "CloudTrail",
    [AWSManagementGovernanceNodeIconKey.cloudWatch]: "CloudWatch",
    [AWSManagementGovernanceNodeIconKey.config]: "Config",
    [AWSManagementGovernanceNodeIconKey.controlTower]: "Control Tower",
    [AWSManagementGovernanceNodeIconKey.distroForOpenTelemetry]: "Distro for OpenTelemetry",
    [AWSManagementGovernanceNodeIconKey.faultInjectionSimulator]: "Fault Injection Simulator",
    [AWSManagementGovernanceNodeIconKey.launchWizard]: "Launch Wizard",
    [AWSManagementGovernanceNodeIconKey.licenseManager]: "License Manager",
    [AWSManagementGovernanceNodeIconKey.managedGrafana]: "Managed Grafana",
    [AWSManagementGovernanceNodeIconKey.managedServiceForPrometheus]:
        "Managed Service for Prometheus",
    [AWSManagementGovernanceNodeIconKey.managementConsole]: "Management Console",
    [AWSManagementGovernanceNodeIconKey.opsWorks]: "OpsWorks",
    [AWSManagementGovernanceNodeIconKey.organizations]: "Organizations",
    [AWSManagementGovernanceNodeIconKey.personalHealthDashboard]: "Personal Health Dashboard",
    [AWSManagementGovernanceNodeIconKey.proton]: "Proton",
    [AWSManagementGovernanceNodeIconKey.resilienceHub]: "Resilience Hub",
    [AWSManagementGovernanceNodeIconKey.resourceExplorer]: "Resource Explorer",
    [AWSManagementGovernanceNodeIconKey.serviceCatalog]: "Service Catalog",
    [AWSManagementGovernanceNodeIconKey.serviceManagementConnector]: "Service Management Connector",
    [AWSManagementGovernanceNodeIconKey.systemsManager]: "Systems Manager",
    [AWSManagementGovernanceNodeIconKey.trustedAdvisor]: "Trusted Advisor",
    [AWSManagementGovernanceNodeIconKey.wellArchitectedTool]: "Well-Architected Tool",
};

export enum AWSMediaServicesNodeIconKey {
    // Architecture
    elasticTranscoder = "elasticTranscoder",
    elementalAppliancesAndSoftware = "elementalAppliancesAndSoftware",
    elementalConductor = "elementalConductor",
    elementalDelta = "elementalDelta",
    elementalLink = "elementalLink",
    elementalLive = "elementalLive",
    elementalMediaConnect = "elementalMediaConnect",
    elementalMediaConvert = "elementalMediaConvert",
    elementalMediaLive = "elementalMediaLive",
    elementalMediaPackage = "elementalMediaPackage",
    elementalMediaStore = "elementalMediaStore",
    elementalMediaTailor = "elementalMediaTailor",
    elementalServer = "elementalServer",
    interactiveVideoService = "interactiveVideoService",
    nimbleStudio = "nimbleStudio",
}

export const AWSMediaServicesNodeIconName = {
    [AWSMediaServicesNodeIconKey.elasticTranscoder]: "Elastic Transcoder",
    [AWSMediaServicesNodeIconKey.elementalAppliancesAndSoftware]:
        "Elemental Appliances and Software",
    [AWSMediaServicesNodeIconKey.elementalConductor]: "Elemental Conductor",
    [AWSMediaServicesNodeIconKey.elementalDelta]: "Elemental Delta",
    [AWSMediaServicesNodeIconKey.elementalLink]: "Elemental Link",
    [AWSMediaServicesNodeIconKey.elementalLive]: "Elemental Live",
    [AWSMediaServicesNodeIconKey.elementalMediaConnect]: "Elemental MediaConnect",
    [AWSMediaServicesNodeIconKey.elementalMediaConvert]: "Elemental MediaConvert",
    [AWSMediaServicesNodeIconKey.elementalMediaLive]: "Elemental MediaLive",
    [AWSMediaServicesNodeIconKey.elementalMediaPackage]: "Elemental MediaPackage",
    [AWSMediaServicesNodeIconKey.elementalMediaStore]: "Elemental MediaStore",
    [AWSMediaServicesNodeIconKey.elementalMediaTailor]: "Elemental MediaTailor",
    [AWSMediaServicesNodeIconKey.elementalServer]: "Elemental Server",
    [AWSMediaServicesNodeIconKey.interactiveVideoService]: "Interactive Video Service",
    [AWSMediaServicesNodeIconKey.nimbleStudio]: "Nimble Studio",
};

export enum AWSMigrationTransferNodeIconKey {
    applicationDiscoveryService = "applicationDiscoveryService",
    applicationMigrationService = "applicationMigrationService",
    dataSync = "dataSync",
    mainframeModernization = "mainframeModernization",
    migrationEvaluator = "migrationEvaluator",
    migrationHub = "migrationHub",
    serverMigrationService = "serverMigrationService",
    transferFamily = "transferFamily",
}

export const AWSMigrationTransferNodeIconName = {
    [AWSMigrationTransferNodeIconKey.applicationDiscoveryService]: "Application Discovery Service",
    [AWSMigrationTransferNodeIconKey.applicationMigrationService]: "Application Migration Service",
    [AWSMigrationTransferNodeIconKey.dataSync]: "DataSync",
    [AWSMigrationTransferNodeIconKey.mainframeModernization]: "Mainframe Modernization",
    [AWSMigrationTransferNodeIconKey.migrationEvaluator]: "Migration Evaluator",
    [AWSMigrationTransferNodeIconKey.migrationHub]: "Migration Hub",
    [AWSMigrationTransferNodeIconKey.serverMigrationService]: "Server Migration Service",
    [AWSMigrationTransferNodeIconKey.transferFamily]: "Transfer Family",
};

export enum AWSNetworkingContentDeliveryNodeIconKey {
    // Architecture
    appMesh = "appMesh",
    clientVPN = "clientVPN",
    cloudDirectory = "cloudDirectory",
    cloudFront = "cloudFront",
    cloudMap = "cloudMap",
    cloudWAN = "cloudWAN",
    directConnect = "directConnect",
    elasticLoadBalancing = "elasticLoadBalancing",
    globalAccelerator = "globalAccelerator",
    private5G = "private5G",
    privateLink = "privateLink",
    route53 = "route53",
    siteToSite = "siteToSite",
    transitGateway = "transitGateway",
    verifiedAccess = "verifiedAccess",
    vpc = "vpc",
    vpcLattice = "vpcLattice",
    // Resource
    elbApplicationLoadBalancer = "elbApplicationLoadBalancer",
    elbClassicLoadBalancer = "elbClassicLoadBalancer",
    elbGatewayLoadBalancer = "elbGatewayLoadBalancer",
    elbNetworkLoadBalancer = "elbNetworkLoadBalancer",
    route53RouteTable = "route53RouteTable",
    vpcAlt = "vpcAlt",
    vpcCarrierGateway = "vpcCarrierGateway",
    vpcCustomerGateway = "vpcCustomerGateway",
    vpcElasticNetworkAdapter = "vpcElasticNetworkAdapter",
    vpcElasticNetworkInterface = "vpcElasticNetworkInterface",
    vpcEndpoints = "vpcEndpoints",
    vpcFlowLogs = "vpcFlowLogs",
    vpcInternetGateway = "vpcInternetGateway",
    vpcNATGateway = "vpcNATGateway",
    vpcNetworkAccessAnalyzer = "vpcNetworkAccessAnalyzer",
    vpcNetworkAccessControlList = "vpcNetworkAccessControlList",
    vpcPeeringConnection = "vpcPeeringConnection",
    vpcReachabilityAnalyzer = "vpcReachabilityAnalyzer",
    vpcRouter = "vpcRouter",
    vpcTrafficMirroring = "vpcTrafficMirroring",
    vpcVPNGateway = "vpcVPNGateway",
}

export const AWSNetworkingContentDeliveryNodeIconName = {
    [AWSNetworkingContentDeliveryNodeIconKey.appMesh]: "AppMesh",
    [AWSNetworkingContentDeliveryNodeIconKey.clientVPN]: "Client VPN",
    [AWSNetworkingContentDeliveryNodeIconKey.cloudDirectory]: "Cloud Directory",
    [AWSNetworkingContentDeliveryNodeIconKey.cloudFront]: "CloudFront",
    [AWSNetworkingContentDeliveryNodeIconKey.cloudMap]: "CloudMap",
    [AWSNetworkingContentDeliveryNodeIconKey.cloudWAN]: "CloudWAN",
    [AWSNetworkingContentDeliveryNodeIconKey.directConnect]: "Direct Connect",
    [AWSNetworkingContentDeliveryNodeIconKey.elasticLoadBalancing]: "Elastic Load Balancing",
    [AWSNetworkingContentDeliveryNodeIconKey.globalAccelerator]: "Global Accelerator",
    [AWSNetworkingContentDeliveryNodeIconKey.private5G]: "Private 5G",
    [AWSNetworkingContentDeliveryNodeIconKey.privateLink]: "Private Link",
    [AWSNetworkingContentDeliveryNodeIconKey.route53]: "Route 53",
    [AWSNetworkingContentDeliveryNodeIconKey.siteToSite]: "Site-to-Site",
    [AWSNetworkingContentDeliveryNodeIconKey.transitGateway]: "Transit Gateway",
    [AWSNetworkingContentDeliveryNodeIconKey.verifiedAccess]: "Verified Access",
    [AWSNetworkingContentDeliveryNodeIconKey.vpc]: "VPC",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcLattice]: "VPC Lattice",
    [AWSNetworkingContentDeliveryNodeIconKey.elbApplicationLoadBalancer]:
        "ELB Application Load Balancer",
    [AWSNetworkingContentDeliveryNodeIconKey.elbClassicLoadBalancer]: "ELB Classic Load Balancer",
    [AWSNetworkingContentDeliveryNodeIconKey.elbGatewayLoadBalancer]: "ELB Gateway Load Balancer",
    [AWSNetworkingContentDeliveryNodeIconKey.elbNetworkLoadBalancer]: "ELB Network Load Balancer",
    [AWSNetworkingContentDeliveryNodeIconKey.route53RouteTable]: "Route 53 Route Table",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcAlt]: "VPC Alt",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcCarrierGateway]: "VPC Carrier Gateway",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcCustomerGateway]: "VPC Customer Gateway",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcElasticNetworkAdapter]:
        "VPC Elastic Network Adapter",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcElasticNetworkInterface]:
        "VPC Elastic Network Interface",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcEndpoints]: "VPC Endpoints",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcFlowLogs]: "VPC Flow Logs",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcInternetGateway]: "VPC Internet Gateway",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcNATGateway]: "VPC NAT Gateway",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcNetworkAccessAnalyzer]:
        "VPC Network Access Analyzer",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcNetworkAccessControlList]:
        "VPC Network Access Control List",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcPeeringConnection]: "VPC Peering Connection",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcReachabilityAnalyzer]: "VPC Reachability Analyzer",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcRouter]: "VPC Router",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcTrafficMirroring]: "VPC Traffic Mirroring",
    [AWSNetworkingContentDeliveryNodeIconKey.vpcVPNGateway]: "VPC VPN Gateway",
};

export enum AWSSecurityIdentityComplianceNodeIconKey {
    // Architecture
    auditManager = "auditManager",
    certificateManager = "certificateManager",
    cloudHSM = "cloudHSM",
    cognito = "cognito",
    detective = "detective",
    directoryService = "directoryService",
    firewallManager = "firewallManager",
    guardDuty = "guardDuty",
    iamIdentityCenter = "iamIdentityCenter",
    identityAndAccessManagement = "identityAndAccessManagement",
    inspector = "inspector",
    keyManagementService = "keyManagementService",
    macie = "macie",
    networkFirewall = "networkFirewall",
    privateCertificateAuthority = "privateCertificateAuthority",
    resourceAccessManager = "resourceAccessManager",
    secretsManager = "secretsManager",
    securityHub = "securityHub",
    securityLake = "securityLake",
    shield = "shield",
    signer = "signer",
    verifiedPermissions = "verifiedPermissions",
    waf = "waf",
}

export const AWSSecurityIdentityComplianceNodeIconName = {
    [AWSSecurityIdentityComplianceNodeIconKey.auditManager]: "Audit Manager",
    [AWSSecurityIdentityComplianceNodeIconKey.certificateManager]: "Certificate Manager",
    [AWSSecurityIdentityComplianceNodeIconKey.cloudHSM]: "CloudHSM",
    [AWSSecurityIdentityComplianceNodeIconKey.cognito]: "Cognito",
    [AWSSecurityIdentityComplianceNodeIconKey.detective]: "Detective",
    [AWSSecurityIdentityComplianceNodeIconKey.directoryService]: "Directory Service",
    [AWSSecurityIdentityComplianceNodeIconKey.firewallManager]: "Firewall Manager",
    [AWSSecurityIdentityComplianceNodeIconKey.guardDuty]: "GuardDuty",
    [AWSSecurityIdentityComplianceNodeIconKey.iamIdentityCenter]: "IAM Identity Center",
    [AWSSecurityIdentityComplianceNodeIconKey.identityAndAccessManagement]:
        "Identity and Access Management",
    [AWSSecurityIdentityComplianceNodeIconKey.inspector]: "Inspector",
    [AWSSecurityIdentityComplianceNodeIconKey.keyManagementService]: "Key Management Service",
    [AWSSecurityIdentityComplianceNodeIconKey.macie]: "Macie",
    [AWSSecurityIdentityComplianceNodeIconKey.networkFirewall]: "Network Firewall",
    [AWSSecurityIdentityComplianceNodeIconKey.privateCertificateAuthority]:
        "Private Certificate Authority",
    [AWSSecurityIdentityComplianceNodeIconKey.resourceAccessManager]: "Resource Access Manager",
    [AWSSecurityIdentityComplianceNodeIconKey.secretsManager]: "Secrets Manager",
    [AWSSecurityIdentityComplianceNodeIconKey.securityHub]: "Security Hub",
    [AWSSecurityIdentityComplianceNodeIconKey.securityLake]: "Security Lake",
    [AWSSecurityIdentityComplianceNodeIconKey.shield]: "Shield",
    [AWSSecurityIdentityComplianceNodeIconKey.signer]: "Signer",
    [AWSSecurityIdentityComplianceNodeIconKey.verifiedPermissions]: "Verified Permissions",
    [AWSSecurityIdentityComplianceNodeIconKey.waf]: "WAF",
};

export enum AWSStorageNodeIconKey {
    // Architecture
    backup = "backup",
    ebs = "ebs",
    efs = "efs",
    elasticDisasterRecovery = "elasticDisasterRecovery",
    fileCache = "fileCache",
    fsx = "fsx",
    fsxForLustre = "fsxForLustre",
    fsxForNetAppONTAP = "fsxForNetAppONTAP",
    fsxForOpenZFS = "fsxForOpenZFS",
    fsxForWFS = "fsxForWFS",
    s3 = "s3",
    s3Glacier = "s3Glacier",
    snowball = "snowball",
    snowballEdge = "snowballEdge",
    snowcone = "snowcone",
    snowmobile = "snowmobile",
    storageGateway = "storageGateway",
}

export const AWSStorageNodeIconName = {
    [AWSStorageNodeIconKey.backup]: "Backup",
    [AWSStorageNodeIconKey.ebs]: "EBS",
    [AWSStorageNodeIconKey.efs]: "EFS",
    [AWSStorageNodeIconKey.elasticDisasterRecovery]: "Elastic Disaster Recovery",
    [AWSStorageNodeIconKey.fileCache]: "File Cache",
    [AWSStorageNodeIconKey.fsx]: "FSx",
    [AWSStorageNodeIconKey.fsxForLustre]: "FSx for Lustre",
    [AWSStorageNodeIconKey.fsxForNetAppONTAP]: "FSx for NetApp ONTAP",
    [AWSStorageNodeIconKey.fsxForOpenZFS]: "FSx for OpenZFS",
    [AWSStorageNodeIconKey.fsxForWFS]: "FSx for WFS",
    [AWSStorageNodeIconKey.s3]: "S3",
    [AWSStorageNodeIconKey.s3Glacier]: "S3 Glacier",
    [AWSStorageNodeIconKey.snowball]: "Snowball",
    [AWSStorageNodeIconKey.snowballEdge]: "Snowball Edge",
    [AWSStorageNodeIconKey.snowcone]: "Snowcone",
    [AWSStorageNodeIconKey.snowmobile]: "Snowmobile",
    [AWSStorageNodeIconKey.storageGateway]: "Storage Gateway",
};

export enum AWSOthersNodeIconKey {
    braket = "braket",
    groundStation = "groundStation",
    managedBlockchain = "managedBlockchain",
    marketplace = "marketplace",
    quantumLedgerDatabase = "quantumLedgerDatabase",
    roboMaker = "roboMaker",
    singleSignOn = "singleSignOn",
}

export const AWSOthersNodeIconName = {
    [AWSOthersNodeIconKey.braket]: "Braket",
    [AWSOthersNodeIconKey.groundStation]: "Ground Station",
    [AWSOthersNodeIconKey.managedBlockchain]: "Managed Blockchain",
    [AWSOthersNodeIconKey.marketplace]: "Marketplace",
    [AWSOthersNodeIconKey.quantumLedgerDatabase]: "Quantum Ledger Database",
    [AWSOthersNodeIconKey.roboMaker]: "RoboMaker",
    [AWSOthersNodeIconKey.singleSignOn]: "Single Sign-On",
};

export const AWSNodeIconKey = {
    ...AWSAnalyticsNodeIconKey,
    ...AWSAppIntegrationNodeIconKey,
    ...AWSBusinessApplicationsNodeIconKey,
    ...AWSCloudFinancialManagementNodeIconKey,
    ...AWSComputeNodeIconKey,
    ...AWSContainersNodeIconKey,
    ...AWSCustomerEnablementNodeIconKey,
    ...AWSDatabaseNodeIconKey,
    ...AWSDeveloperToolsNodeIconKey,
    ...AWSEndUserComputingNodeIconKey,
    ...AWSFrontEndWebMobileNodeIconKey,
    ...AWSGamesNodeIconKey,
    ...AWSInternetOfThingsNodeIconKey,
    ...AWSMachineLearningNodeIconKey,
    ...AWSManagementGovernanceNodeIconKey,
    ...AWSMediaServicesNodeIconKey,
    ...AWSMigrationTransferNodeIconKey,
    ...AWSNetworkingContentDeliveryNodeIconKey,
    ...AWSSecurityIdentityComplianceNodeIconKey,
    ...AWSStorageNodeIconKey,
    ...AWSOthersNodeIconKey,
};

export const AWSNodeIconName = {
    ...AWSAnalyticsNodeIconName,
    ...AWSAppIntegrationNodeIconName,
    ...AWSBusinessApplicationsNodeIconName,
    ...AWSCloudFinancialManagementNodeIconName,
    ...AWSComputeNodeIconName,
    ...AWSContainersNodeIconName,
    ...AWSCustomerEnablementNodeIconName,
    ...AWSDatabaseNodeIconName,
    ...AWSDeveloperToolsNodeIconName,
    ...AWSEndUserComputingNodeIconName,
    ...AWSFrontEndWebMobileNodeIconName,
    ...AWSGamesNodeIconName,
    ...AWSInternetOfThingsNodeIconName,
    ...AWSMachineLearningNodeIconName,
    ...AWSManagementGovernanceNodeIconName,
    ...AWSMediaServicesNodeIconName,
    ...AWSMigrationTransferNodeIconName,
    ...AWSNetworkingContentDeliveryNodeIconName,
    ...AWSSecurityIdentityComplianceNodeIconName,
    ...AWSStorageNodeIconName,
    ...AWSOthersNodeIconName,
};

// ==================================================
// Generic Node Icons
// ==================================================

export enum GenericCyberPhysicalNodeIconKey {
    genericActuator = "genericActuator",
    genericPLC = "genericPLC",
    genericSensor = "genericSensor",
    historianDatabase = "historianDatabase",
    iotGateway = "iotGateway",
}

export const GenericCyberPhysicalNodeIconName = {
    [GenericCyberPhysicalNodeIconKey.genericActuator]: "Generic Actuator",
    [GenericCyberPhysicalNodeIconKey.genericPLC]: "Generic PLC",
    [GenericCyberPhysicalNodeIconKey.genericSensor]: "Generic Sensor",
    [GenericCyberPhysicalNodeIconKey.historianDatabase]: "Historian Database",
    [GenericCyberPhysicalNodeIconKey.iotGateway]: "IoT Gateway",
};

export enum GenericSystemNodeIconKey {
    firewall = "firewall",
    forums = "forums",
    genericApplication = "genericApplication",
    genericDatabase = "genericDatabase",
    genericManagementConsole = "genericManagementConsole",
    genericServer = "genericServer",
    genericServers = "genericServers",
    genericShield = "genericShield",
    internet = "internet",
    router = "router",
    switch = "switch",
}

export const GenericSystemNodeIconName = {
    [GenericSystemNodeIconKey.firewall]: "Firewall",
    [GenericSystemNodeIconKey.forums]: "Forums",
    [GenericSystemNodeIconKey.genericApplication]: "Generic Application",
    [GenericSystemNodeIconKey.genericDatabase]: "Generic Database",
    [GenericSystemNodeIconKey.genericManagementConsole]: "Generic Management Console",
    [GenericSystemNodeIconKey.genericServer]: "Generic Server",
    [GenericSystemNodeIconKey.genericServers]: "Generic Servers",
    [GenericSystemNodeIconKey.genericShield]: "Generic Shield",
    [GenericSystemNodeIconKey.internet]: "Internet",
    [GenericSystemNodeIconKey.router]: "Router",
    [GenericSystemNodeIconKey.switch]: "Switch",
};

export enum GenericDataNodeIconKey {
    credentials = "credentials",
    dataStream = "dataStream",
    dataTable = "dataTable",
    document = "document",
    documents = "documents",
    email = "email",
    folder = "folder",
    folders = "folders",
    gitRepository = "gitRepository",
    logs = "logs",
    sdk = "sdk",
    sourceCode = "sourceCode",
    sslPadlock = "sslPadlock",
}

export const GenericDataNodeIconName = {
    [GenericDataNodeIconKey.credentials]: "Credentials",
    [GenericDataNodeIconKey.dataStream]: "Data Stream",
    [GenericDataNodeIconKey.dataTable]: "Data Table",
    [GenericDataNodeIconKey.document]: "Document",
    [GenericDataNodeIconKey.documents]: "Documents",
    [GenericDataNodeIconKey.email]: "Email",
    [GenericDataNodeIconKey.folder]: "Folder",
    [GenericDataNodeIconKey.folders]: "Folders",
    [GenericDataNodeIconKey.gitRepository]: "Git Repository",
    [GenericDataNodeIconKey.logs]: "Logs",
    [GenericDataNodeIconKey.sdk]: "SDK",
    [GenericDataNodeIconKey.sourceCode]: "Source Code",
    [GenericDataNodeIconKey.sslPadlock]: "SSL Padlock",
};

export enum GenericUserNodeIconKey {
    user = "user",
    userAuthenticated = "userAuthenticated",
    users = "users",
}

export const GenericUserNodeIconName = {
    [GenericUserNodeIconKey.user]: "User",
    [GenericUserNodeIconKey.userAuthenticated]: "User Authenticated",
    [GenericUserNodeIconKey.users]: "Users",
};

export enum GenericPhysicalAssetsNodeIconKey {
    camera = "camera",
    client = "client",
    disk = "disk",
    gear = "gear",
    multimedia = "multimedia",
    officeBuilding = "officeBuilding",
    tapeStorage = "tapeStorage",
    toolkit = "toolkit",
    baseStation = "baseStation",
}

export const GenericPhysicalAssetsNodeIconName = {
    [GenericPhysicalAssetsNodeIconKey.camera]: "Camera",
    [GenericPhysicalAssetsNodeIconKey.client]: "Client",
    [GenericPhysicalAssetsNodeIconKey.disk]: "Disk",
    [GenericPhysicalAssetsNodeIconKey.gear]: "Gear",
    [GenericPhysicalAssetsNodeIconKey.multimedia]: "Multimedia",
    [GenericPhysicalAssetsNodeIconKey.officeBuilding]: "Office Building",
    [GenericPhysicalAssetsNodeIconKey.tapeStorage]: "Tape Storage",
    [GenericPhysicalAssetsNodeIconKey.toolkit]: "Toolkit",
    [GenericPhysicalAssetsNodeIconKey.baseStation]: "Base Station",
};

export const GenericNodeIconKey = {
    ...GenericSystemNodeIconKey,
    ...GenericDataNodeIconKey,
    ...GenericUserNodeIconKey,
    ...GenericPhysicalAssetsNodeIconKey,
    ...GenericCyberPhysicalNodeIconKey,
};

export const GenericNodeIconName = {
    ...GenericSystemNodeIconName,
    ...GenericDataNodeIconName,
    ...GenericUserNodeIconName,
    ...GenericPhysicalAssetsNodeIconName,
    ...GenericCyberPhysicalNodeIconName,
};

// ==================================================
// SGTS Node Icons
// ==================================================

export enum SGTSBaseNodeIconKey {
    cloudFlare = "cloudFlare",
    cloudScape = "cloudScape",
    codeScape = "codeScape",
    containerStack = "containerStack",
    developerPortal = "developerPortal",
    diab = "diab",
    mash = "mash",
    seed = "seed",
    shiphats = "shiphats",
    siac = "siac",
    stackOps = "stackOps",
    techbiz = "techbiz",
    techpass = "techpass",
}

export const SGTSBaseNodeIconName = {
    [SGTSBaseNodeIconKey.cloudFlare]: "CloudFlare",
    [SGTSBaseNodeIconKey.cloudScape]: "CloudScape",
    [SGTSBaseNodeIconKey.codeScape]: "CodeScape",
    [SGTSBaseNodeIconKey.containerStack]: "Container Stack",
    [SGTSBaseNodeIconKey.developerPortal]: "Developer Portal",
    [SGTSBaseNodeIconKey.diab]: "DIAB",
    [SGTSBaseNodeIconKey.mash]: "MASH",
    [SGTSBaseNodeIconKey.seed]: "SEED",
    [SGTSBaseNodeIconKey.shiphats]: "SHIP-HATS",
    [SGTSBaseNodeIconKey.siac]: "SIAC",
    [SGTSBaseNodeIconKey.stackOps]: "StackOps",
    [SGTSBaseNodeIconKey.techbiz]: "Techbiz",
    [SGTSBaseNodeIconKey.techpass]: "Techpass",
};

export enum SGTSServiceNodeIconKey {
    adexSDX = "adexSDX",
    apexCloud = "apexCloud",
    apexMarketplace = "apexMarketplace",
    bookingSG = "bookingSG",
    cloudFileTransfer = "cloudFileTransfer",
    cloudVideoExchange = "cloudVideoExchange",
    corppass = "corppass",
    govText = "govText",
    govWallet = "govWallet",
    myInfo = "myInfo",
    notify = "notify",
    personalise = "personalise",
    sgds = "sgds",
    singpassAPI = "singpassAPI",
    singpassLogin = "singpassLogin",
    transcribe = "transcribe",
    videoAnalyticsSystem = "videoAnalyticsSystem",
    wogaa = "wogaa",
}

export const SGTSServiceNodeIconName = {
    [SGTSServiceNodeIconKey.adexSDX]: "Adex SDX",
    [SGTSServiceNodeIconKey.apexCloud]: "Apex Cloud",
    [SGTSServiceNodeIconKey.apexMarketplace]: "Apex Marketplace",
    [SGTSServiceNodeIconKey.bookingSG]: "Booking SG",
    [SGTSServiceNodeIconKey.cloudFileTransfer]: "Cloud File Transfer",
    [SGTSServiceNodeIconKey.cloudVideoExchange]: "Cloud Video Exchange",
    [SGTSServiceNodeIconKey.corppass]: "Corppass",
    [SGTSServiceNodeIconKey.govText]: "Gov Text",
    [SGTSServiceNodeIconKey.govWallet]: "Gov Wallet",
    [SGTSServiceNodeIconKey.myInfo]: "MyInfo",
    [SGTSServiceNodeIconKey.notify]: "Notify",
    [SGTSServiceNodeIconKey.personalise]: "Personalise",
    [SGTSServiceNodeIconKey.sgds]: "SGDS",
    [SGTSServiceNodeIconKey.singpassAPI]: "Singpass API",
    [SGTSServiceNodeIconKey.singpassLogin]: "Singpass Login",
    [SGTSServiceNodeIconKey.transcribe]: "Transcribe",
    [SGTSServiceNodeIconKey.videoAnalyticsSystem]: "Video Analytics System",
    [SGTSServiceNodeIconKey.wogaa]: "WOGAA",
};

export enum SGTSShipHatsToolsNodeIconKey {
    confluence = "confluence",
    fod = "fod",
    gitLab = "gitLab",
    jira = "jira",
    nexus = "nexus",
    nexusAuditor = "nexusAuditor",
    nexusFirewall = "nexusFirewall",
    nexusIQ = "nexusIQ",
    nexusLifecycle = "nexusLifecycle",
    nexusRepository = "nexusRepository",
    sonarQube = "sonarQube",
}

export const SGTSShipHatsToolsNodeIconName = {
    [SGTSShipHatsToolsNodeIconKey.confluence]: "Confluence",
    [SGTSShipHatsToolsNodeIconKey.fod]: "FOD",
    [SGTSShipHatsToolsNodeIconKey.gitLab]: "GitLab",
    [SGTSShipHatsToolsNodeIconKey.jira]: "Jira",
    [SGTSShipHatsToolsNodeIconKey.nexus]: "Nexus",
    [SGTSShipHatsToolsNodeIconKey.nexusAuditor]: "Nexus Auditor",
    [SGTSShipHatsToolsNodeIconKey.nexusFirewall]: "Nexus Firewall",
    [SGTSShipHatsToolsNodeIconKey.nexusIQ]: "Nexus IQ",
    [SGTSShipHatsToolsNodeIconKey.nexusLifecycle]: "Nexus Lifecycle",
    [SGTSShipHatsToolsNodeIconKey.nexusRepository]: "Nexus Repository",
    [SGTSShipHatsToolsNodeIconKey.sonarQube]: "SonarQube",
};

export const SGTSNodeIconKey = {
    ...SGTSBaseNodeIconKey,
    ...SGTSServiceNodeIconKey,
    ...SGTSShipHatsToolsNodeIconKey,
};

export const SGTSNodeIconName = {
    ...SGTSBaseNodeIconName,
    ...SGTSServiceNodeIconName,
    ...SGTSShipHatsToolsNodeIconName,
};

// ==================================================
// Solution Provider Node Icons
// ==================================================

export enum FortinetBaseNodeIconKey {
    fortiAnalyzer = "fortiAnalyzer",
    fortiGate = "fortiGate",
    fortiManager = "fortiManager",
}

export const FortinetBaseNodeIconName = {
    [FortinetBaseNodeIconKey.fortiAnalyzer]: "FortiAnalyzer",
    [FortinetBaseNodeIconKey.fortiGate]: "FortiGate",
    [FortinetBaseNodeIconKey.fortiManager]: "FortiManager",
};

export enum VMwareBaseNodeIconKey {
    esxi = "esxi",
    vCenter = "vCenter",
    vmwareVM = "vmwareVM",
    vSphere = "vSphere",
}

export const VMwareBaseNodeIconName = {
    [VMwareBaseNodeIconKey.esxi]: "VMware ESXi",
    [VMwareBaseNodeIconKey.vCenter]: "VMware vCenter",
    [VMwareBaseNodeIconKey.vmwareVM]: "VMware VM",
    [VMwareBaseNodeIconKey.vSphere]: "VMware vSphere",
};

export const SolutionProviderNodeIconKey = {
    ...FortinetBaseNodeIconKey,
    ...VMwareBaseNodeIconKey,
};

export const SolutionProviderNodeIconName = {
    ...FortinetBaseNodeIconName,
    ...VMwareBaseNodeIconName,
};

// ==================================================
// Generic Cluster Node Icons
// ==================================================

export enum GenericClusterNodeIconKey {
    cicd = "cicd",
    genericCloud = "genericCloud",
    genericCodePipeline = "genericCodePipeline",
    genericDataPipeline = "genericDataPipeline",
    genericServerCluster = "genericServerCluster",
    genericSubnet = "genericSubnet",
    genericVPC = "genericVPC",
    genericWirelessSubnet = "genericWirelessSubnet",
    onPremisesCompute = "onPremisesCompute",
    onPremisesEnvironment = "onPremisesEnvironment",
}

export const GenericClusterNodeIconName = {
    [GenericClusterNodeIconKey.cicd]: "CI/CD",
    [GenericClusterNodeIconKey.genericCloud]: "Generic Cloud",
    [GenericClusterNodeIconKey.genericCodePipeline]: "Generic CodePipeline",
    [GenericClusterNodeIconKey.genericDataPipeline]: "Generic Data Pipeline",
    [GenericClusterNodeIconKey.genericServerCluster]: "Generic Server Cluster",
    [GenericClusterNodeIconKey.genericSubnet]: "Generic Subnet",
    [GenericClusterNodeIconKey.genericVPC]: "Generic VPC",
    [GenericClusterNodeIconKey.genericWirelessSubnet]: "Generic Wireless Subnet",
    [GenericClusterNodeIconKey.onPremisesCompute]: "On-Premises Compute",
    [GenericClusterNodeIconKey.onPremisesEnvironment]: "On-Premises Environment",
};

export enum AWSClusterNodeIconKey {
    autoScalingGroup = "autoScalingGroup",
    awsAccount = "awsAccount",
    awsCloud = "awsCloud",
    awsStepFunctionsWorkflow = "awsStepFunctionsWorkflow",
    awsSubnet = "awsSubnet",
    codePipelineCluster = "codePipelineCluster",
    dataPipelineCluster = "dataPipelineCluster",
    elasticBeanstalkContainer = "elasticBeanstalkContainer",
    privateSubnet = "privateSubnet",
    publicSubnet = "publicSubnet",
    region = "region",
    spotFleet = "spotFleet",
    kubernetesCluster = "kubernetesCluster",
    vpcCluster = "vpcCluster",
}

export const AWSClusterNodeIconName = {
    [AWSClusterNodeIconKey.autoScalingGroup]: "Auto Scaling Group",
    [AWSClusterNodeIconKey.awsAccount]: "AWS Account",
    [AWSClusterNodeIconKey.awsCloud]: "AWS Cloud",
    [AWSClusterNodeIconKey.awsStepFunctionsWorkflow]: "AWS Step Functions Workflow",
    [AWSClusterNodeIconKey.awsSubnet]: "AWS Subnet",
    [AWSClusterNodeIconKey.codePipelineCluster]: "CodePipeline Cluster",
    [AWSClusterNodeIconKey.dataPipelineCluster]: "Data Pipeline Cluster",
    [AWSClusterNodeIconKey.elasticBeanstalkContainer]: "Elastic Beanstalk Container",
    [AWSClusterNodeIconKey.privateSubnet]: "Private Subnet",
    [AWSClusterNodeIconKey.publicSubnet]: "Public Subnet",
    [AWSClusterNodeIconKey.region]: "Region",
    [AWSClusterNodeIconKey.spotFleet]: "Spot Fleet",
    [AWSClusterNodeIconKey.kubernetesCluster]: "Kubernetes Cluster",
    [AWSClusterNodeIconKey.vpcCluster]: "VPC Cluster",
};

export const ClusterNodeIconKey = {
    ...GenericClusterNodeIconKey,
    ...AWSClusterNodeIconKey,
};

export const ClusterNodeIconName = {
    ...GenericClusterNodeIconName,
    ...AWSClusterNodeIconName,
};

// ==================================================
// Data Flow Node Icons
// ==================================================

export enum DataFlowInterfaceNodeIconKey {
    api = "api",
    commandLine = "commandLine",
    desktopApplication = "desktopApplication",
    mobileApplication = "mobileApplication",
    ssh = "ssh",
    virtualInterfaces = "virtualInterfaces",
    webApplication = "webApplication",
}

export const DataFlowInterfaceNodeIconName = {
    [DataFlowInterfaceNodeIconKey.api]: "API",
    [DataFlowInterfaceNodeIconKey.commandLine]: "Command Line",
    [DataFlowInterfaceNodeIconKey.desktopApplication]: "Desktop Application",
    [DataFlowInterfaceNodeIconKey.mobileApplication]: "Mobile Application",
    [DataFlowInterfaceNodeIconKey.ssh]: "SSH",
    [DataFlowInterfaceNodeIconKey.virtualInterfaces]: "Virtual Interfaces",
    [DataFlowInterfaceNodeIconKey.webApplication]: "Web Application",
};

export const DataFlowNodeIconKey = {
    ...DataFlowInterfaceNodeIconKey, //
};

export const DataFlowNodeIconName = {
    ...DataFlowInterfaceNodeIconName, //
};
// ==================================================
// Consolidated Node Icons
// ==================================================

export const NodeIconKey = {
    ...AWSNodeIconKey,
    ...GenericNodeIconKey,
    ...SGTSNodeIconKey,
    ...SolutionProviderNodeIconKey,
    ...ClusterNodeIconKey,
    ...DataFlowNodeIconKey,
};

export const NodeIconName = {
    ...AWSNodeIconName,
    ...GenericNodeIconName,
    ...SGTSNodeIconName,
    ...SolutionProviderNodeIconName,
    ...ClusterNodeIconName,
    ...DataFlowNodeIconName,
};
