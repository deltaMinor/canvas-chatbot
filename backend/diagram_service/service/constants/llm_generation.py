from django.conf import settings

from shared_libs.types.node import (
    AWSClusterNodeIconDisplayKey,
    AWSNodeIconDisplayKey,
    GenericClusterNodeIconDisplayKey,
    GenericNodeIconDisplayKey,
)

DEFAULT_LLM_MODEL = settings.DEFAULT_LLM_MODEL
DIAGRAM_LLM_MODEL = getattr(settings, "DIAGRAM_LLM_MODEL", "") or DEFAULT_LLM_MODEL
DATAFLOW_LLM_MODEL = getattr(settings, "DATAFLOW_LLM_MODEL", "") or DEFAULT_LLM_MODEL


def get_diagram_llm_model() -> str:
    """Return DIAGRAM_LLM_MODEL, falling back to DEFAULT_LLM_MODEL if Bedrock is unavailable."""
    from shared_libs.lib.aws_connectivity_checker import AwsConnectivityChecker

    return AwsConnectivityChecker.resolve_with_fallback(DIAGRAM_LLM_MODEL, DEFAULT_LLM_MODEL)


def get_dataflow_llm_model() -> str:
    """Return DATAFLOW_LLM_MODEL, falling back to DEFAULT_LLM_MODEL if Bedrock is unavailable."""
    from shared_libs.lib.aws_connectivity_checker import AwsConnectivityChecker

    return AwsConnectivityChecker.resolve_with_fallback(DATAFLOW_LLM_MODEL, DEFAULT_LLM_MODEL)

ICON_LIST = [
    # Generic
    GenericNodeIconDisplayKey.camera.name,
    GenericNodeIconDisplayKey.client.name,
    GenericNodeIconDisplayKey.disk.name,
    GenericNodeIconDisplayKey.firewall.name,
    GenericNodeIconDisplayKey.gear.name,
    GenericNodeIconDisplayKey.genericApplication.name,
    GenericNodeIconDisplayKey.genericDatabase.name,
    GenericNodeIconDisplayKey.genericManagementConsole.name,
    GenericNodeIconDisplayKey.genericServer.name,
    GenericNodeIconDisplayKey.genericServers.name,
    GenericNodeIconDisplayKey.genericShield.name,
    GenericNodeIconDisplayKey.internet.name,
    GenericNodeIconDisplayKey.multimedia.name,
    GenericNodeIconDisplayKey.officeBuilding.name,
    GenericNodeIconDisplayKey.router.name,
    GenericNodeIconDisplayKey.tapeStorage.name,
    GenericNodeIconDisplayKey.toolkit.name,
    # AWS
    AWSNodeIconDisplayKey.apiGateway.name,
    AWSNodeIconDisplayKey.appMesh.name,
    AWSNodeIconDisplayKey.athena.name,
    AWSNodeIconDisplayKey.backup.name,
    AWSNodeIconDisplayKey.certificateManager.name,
    AWSNodeIconDisplayKey.cloudFormation.name,
    AWSNodeIconDisplayKey.cloudFront.name,
    AWSNodeIconDisplayKey.cloudTrail.name,
    AWSNodeIconDisplayKey.cloudWatch.name,
    AWSNodeIconDisplayKey.codeBuild.name,
    AWSNodeIconDisplayKey.codeCommit.name,
    AWSNodeIconDisplayKey.codeDeploy.name,
    AWSNodeIconDisplayKey.cognito.name,
    AWSNodeIconDisplayKey.config.name,
    AWSNodeIconDisplayKey.dynamoDB.name,
    AWSNodeIconDisplayKey.ec2.name,
    AWSNodeIconDisplayKey.efs.name,
    AWSNodeIconDisplayKey.elastiCache.name,
    AWSNodeIconDisplayKey.elasticBeanstalk.name,
    AWSNodeIconDisplayKey.elasticContainerService.name,
    AWSNodeIconDisplayKey.elbApplicationLoadBalancer.name,
    AWSNodeIconDisplayKey.elbNetworkLoadBalancer.name,
    AWSNodeIconDisplayKey.eventBridge.name,
    AWSNodeIconDisplayKey.glue.name,
    AWSNodeIconDisplayKey.guardDuty.name,
    AWSNodeIconDisplayKey.identityAndAccessManagement.name,
    AWSNodeIconDisplayKey.inspector.name,
    AWSNodeIconDisplayKey.kinesis.name,
    AWSNodeIconDisplayKey.Lambda.value,  # Different from others due to python keyword
    AWSNodeIconDisplayKey.networkFirewall.name,
    AWSNodeIconDisplayKey.organizations.name,
    AWSNodeIconDisplayKey.rds.name,
    AWSNodeIconDisplayKey.rdsInstance.name,
    AWSNodeIconDisplayKey.redshift.name,
    AWSNodeIconDisplayKey.route53.name,
    AWSNodeIconDisplayKey.s3.name,
    AWSNodeIconDisplayKey.secretsManager.name,
    AWSNodeIconDisplayKey.securityHub.name,
    AWSNodeIconDisplayKey.simpleEmailService.name,
    AWSNodeIconDisplayKey.simpleNotificationService.name,
    AWSNodeIconDisplayKey.simpleQueueService.name,
    AWSNodeIconDisplayKey.stepFunctions.name,
    AWSNodeIconDisplayKey.systemsManager.name,
    AWSNodeIconDisplayKey.vpcInternetGateway.name,
    AWSNodeIconDisplayKey.vpcNATGateway.name,
    AWSNodeIconDisplayKey.waf.name,
]
ICON_LIST_STRING = ", ".join(ICON_LIST)


CLUSTER_ICON_LIST = [
    # Generic
    GenericClusterNodeIconDisplayKey.cicd.name,
    GenericClusterNodeIconDisplayKey.genericCloud.name,
    GenericClusterNodeIconDisplayKey.genericCodePipeline.name,
    GenericClusterNodeIconDisplayKey.genericDataPipeline.name,
    GenericClusterNodeIconDisplayKey.genericServerCluster.name,
    GenericClusterNodeIconDisplayKey.genericSubnet.name,
    GenericClusterNodeIconDisplayKey.genericVPC.name,
    GenericClusterNodeIconDisplayKey.onPremisesCompute.name,
    GenericClusterNodeIconDisplayKey.onPremisesEnvironment.name,
    # AWS
    AWSClusterNodeIconDisplayKey.autoScalingGroup.name,
    AWSClusterNodeIconDisplayKey.awsAccount.name,
    AWSClusterNodeIconDisplayKey.awsCloud.name,
    AWSClusterNodeIconDisplayKey.awsStepFunctionsWorkflow.name,
    AWSClusterNodeIconDisplayKey.awsSubnet.name,
    AWSClusterNodeIconDisplayKey.codePipelineCluster.name,
    AWSClusterNodeIconDisplayKey.dataPipelineCluster.name,
    AWSClusterNodeIconDisplayKey.elasticBeanstalkContainer.name,
    AWSClusterNodeIconDisplayKey.privateSubnet.name,
    AWSClusterNodeIconDisplayKey.publicSubnet.name,
    AWSClusterNodeIconDisplayKey.region.name,
    AWSClusterNodeIconDisplayKey.spotFleet.name,
    AWSClusterNodeIconDisplayKey.vpcCluster.name,
]
CLUSTER_ICON_LIST_STRING = ", ".join(CLUSTER_ICON_LIST)

PDF_DATA_URL_PREFIX = "data:application/pdf;base64,"
PNG_DATA_URL_PREFIX = "data:image/png;base64,"
PROJECT_AD_FILE_TYPE_IMAGE = "image"
PROJECT_AD_FILE_TYPE_PDF = "pdf"
