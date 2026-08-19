import uuid

from shared_libs.types.enum import CanvasType, Handle, Position
from shared_libs.types.node import (
    AWSNodeIconDisplayKey,
)

DATA_FLOW_USER_NODE_TOSCA_TYPE = "arcs.nodes.User"
DATA_FLOW_DEVICE_NODE_TOSCA_TYPE = "arcs.nodes.Compute"
DATA_FLOW_INTERFACE_NODE_TOSCA_TYPE = "arcs.nodes.Interface"

DEFAULT_ICON_NODE_WIDTH = 80
DEFAULT_ICON_NODE_HEIGHT = 80

# Cluster Node Size
MIN_WIDTH_CLUSTER_NODE = 100
MIN_HEIGHT_CLUSTER_NODE = 100
MAX_WIDTH_CLUSTER_NODE = 2000
MAX_HEIGHT_CLUSTER_NODE = 2000
DEFAULT_CLUSTER_NODE_WIDTH = 200
DEFAULT_CLUSTER_NODE_HEIGHT = 200

DEFAULT_RED = 255
DEFAULT_GREEN = 255
DEFAULT_BLUE = 255
MAX_LABEL_LENGTH = 20
DEFAULT_ZINDEX_NODE = 1

BLANK_ARCHITECTURE_CANVAS = {
    "canvas_id": f"canvas_{uuid.uuid4()}",
    "canvas_name": CanvasType.architecture.value.capitalize(),  # Capitalize the canvas name
    "canvas_type": CanvasType.architecture.value,  # Set the canvas type to "architecture"
    "edges": [],
    "nodes": [],
    "ref": {},  # Initialize an empty reference dictionary
    "viewport": {"x": 0, "y": 0, "zoom": 1},
}

DEFAULT_NODE = {
    "ariaLabel": "",
    "className": "",
    "connectable": True,
    "data": {},
    "deletable": True,
    "dragHandle": "",
    "draggable": True,
    "expandParent": False,
    "hidden": False,
    "id": f"node_{uuid.uuid4()}",
    "parentId": "",
    "position": {"x": 0, "y": 0},
    "positionAbsolute": {"x": 0, "y": 0},
    "resizing": True,
    "selectable": True,
    "sourcePosition": Position.bottom.value,
    "style": {},
    "targetPosition": Position.top.value,
    "type": "default",
    "zIndex": DEFAULT_ZINDEX_NODE,
}

DEFAULT_EDGE = {
    "id": f"edge{uuid.uuid4()}",
    "type": "floating",
    "sourceHandle": Handle.SOURCE_BOTTOM.value,
    "targetHandle": Handle.TARGET_TOP.value,
    "data": {
        "bidirectional": False,
    },
    "style": {"stroke": "#000", "strokeWidth": 2},
    "markerEnd": {"type": "arrowclosed", "color": "black"},
}

CONSOLIDATED_CLASS_LABEL_TO_INFONODE_MAPPING = {
    "aws_backup": AWSNodeIconDisplayKey.backup.name,
    "aws_cloudtrail": AWSNodeIconDisplayKey.cloudTrail.name,
    "aws_cloudwatch_eventbridge": AWSNodeIconDisplayKey.eventBridge.name,  # change
    "aws_cloudwatch_log": AWSNodeIconDisplayKey.CloudWatchLogs.name,  # change
    "aws_ebs": AWSNodeIconDisplayKey.ebs.name,
    "aws_ec2": AWSNodeIconDisplayKey.ec2.name,
    "aws_ecr": AWSNodeIconDisplayKey.elasticContainerRegistry.name,
    "aws_iam": AWSNodeIconDisplayKey.identityAndAccessManagement.name,
    "aws_kms": AWSNodeIconDisplayKey.keyManagementService.name,
    "aws_lambda": AWSNodeIconDisplayKey.Lambda.value,  # Different from others due to python keyword
    "aws_networkfirewall": AWSNodeIconDisplayKey.networkFirewall.name,
    "aws_rds_db": AWSNodeIconDisplayKey.rds.name,
    "aws_route53_resolver": AWSNodeIconDisplayKey.route53.name,
    "aws_s3_bucket": AWSNodeIconDisplayKey.SimpleStorageServiceS3Standard.name,
    "aws_secretsmanager": AWSNodeIconDisplayKey.secretsManager.name,
    "aws_sns": AWSNodeIconDisplayKey.simpleNotificationService.name,
    "aws_vpc_endpoint": AWSNodeIconDisplayKey.vpcEndpoints.name,
    "aws_vpc_flow_log": AWSNodeIconDisplayKey.vpcFlowLogs.name,
    "aws_vpc_internet_gateway": AWSNodeIconDisplayKey.vpcInternetGateway.name,
    "aws_vpc_nat_gateway": AWSNodeIconDisplayKey.vpcNATGateway.name,
    "aws_vpc_route": AWSNodeIconDisplayKey.route53RouteTable.name,
    "aws_wafv2": AWSNodeIconDisplayKey.waf.name,
    # "aws_elastic_beanstalk": "",  # cluster
    # "aws_vpc_network_acl": "",  # cluster
    # "aws_vpc_security_group": "",  # cluster
    # "aws_vpc_subnet": "",  # cluster
    # "aws_vpc": "",  # cluster
}
