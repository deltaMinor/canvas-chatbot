from enum import Enum

from shared_libs.types.enum import NodeTypes


class TerraformTypes(Enum):
    ALB = "aws_alb"
    EC2 = "aws_instance"
    ELASTI_CACHE = "aws_elasticache_cluster"
    ELASTIC_CONTAINER_SERVICE = "aws_ecs_service"
    IGW = "aws_internet_gateway"
    LAMBDA = "aws_lambda_function"
    NGW = "aws_nat_gateway"
    RDS = "aws_db_instance"
    ROUTE_TABLE = "aws_route_table"
    SECURITY_GROUP = "aws_security_group"
    SUBNET = "aws_subnet"
    SUBNET_GROUP = "aws_db_subnet_group"
    SUBNET_PRIVATE = "aws_subnet_private"
    SUBNET_PUBLIC = "aws_subnet_public"
    VPC = "aws_vpc"
    VPC_NETWORK_ACCESS_CONTROL_LIST = "aws_network_acl"
    WAF = "aws_wafv2_web_acl"
    WAF_RULE_GROUP = "aws_wafv2_rule_group"


class NodeAttributes(Enum):
    GATEWAY_ID = "gateway_id"
    ROUTE = "route"
    SUBNET_IDS = "subnet_ids"


class SpecialTypes(Enum):
    INTERNET = "internet"


class RelationshipType(Enum):
    ATTACHED_TO = "ATTACHED_TO"
    CAN_CONNECT = "CAN_CONNECT"
    CAN_INVOKE = "CAN_INVOKE"
    CONTAINED_IN = "CONTAINED_IN"
    FORWARDS_TO = "FORWARDS_TO"


HIDDEN_NODES = {
    "aws_alb_target_group",
    "aws_default_network_acl",
    "aws_elasticache_replication_group",
    "aws_lambda_event_source_mapping",
    "aws_lambda_function_url",
    "aws_lambda_permission",
    "aws_lb_listener",
    "aws_lb_target_group",
    "aws_network_interface",
    "aws_route53_resolver_rule_association",
    "aws_vpc_peering_connection",
    TerraformTypes.ROUTE_TABLE.value,
    TerraformTypes.SECURITY_GROUP.value,
    TerraformTypes.SUBNET_GROUP.value,
    TerraformTypes.VPC_NETWORK_ACCESS_CONTROL_LIST.value,
    TerraformTypes.WAF_RULE_GROUP.value,
}


COLOURED_NODES = {
    TerraformTypes.SUBNET_PRIVATE.value,
    TerraformTypes.SUBNET_PUBLIC.value,
}

NODE_TYPES = {
    "availability_zone": NodeTypes.AVAILABILITY_ZONE,
    SpecialTypes.INTERNET.value: NodeTypes.INTERNET,
    TerraformTypes.IGW.value: NodeTypes.IGW,
    TerraformTypes.SUBNET_PRIVATE.value: NodeTypes.SUBNET_PRIVATE,
    TerraformTypes.SUBNET_PUBLIC.value: NodeTypes.SUBNET_PUBLIC,
    TerraformTypes.SUBNET.value: NodeTypes.SUBNET,
    TerraformTypes.VPC.value: NodeTypes.VPC,
    TerraformTypes.WAF.value: NodeTypes.WAF,
}

NODE_BORDERS = {
    "availability_zone": {"borderStyle": "dashed", "borderColor": "#00a4a6"},
    TerraformTypes.SUBNET_PRIVATE.value: {
        "borderStyle": "dashed",
        "borderColor": "#839ca3",
    },
    TerraformTypes.SUBNET_PUBLIC.value: {
        "borderStyle": "dashed",
        "borderColor": "#87ab94",
    },
    TerraformTypes.VPC.value: {
        "borderStyle": "solid",
        "borderColor": "#200eeb",
    },
}

NODES_INSIDE_AZ = {TerraformTypes.SUBNET.value}

NODE_COLOURS = {
    TerraformTypes.SUBNET_PRIVATE.value: {
        "red": "206",
        "green": "238",
        "blue": "245",
    },
    TerraformTypes.SUBNET_PUBLIC.value: {
        "red": "240",
        "green": "244",
        "blue": "228",
    },
}

CLUSTER_NODES = {
    "aws_appmesh_mesh",
    "aws_autoscaling_group",
    "aws_default_security_group",
    "aws_ecs_cluster",
    "aws_eks_cluster",
    "aws_lb_target_group",
    "aws_network_acl",
    "aws_route53_zone",
    "aws_xray_group",
    TerraformTypes.SECURITY_GROUP.value,
    TerraformTypes.SUBNET_GROUP.value,
    TerraformTypes.SUBNET_PRIVATE.value,
    TerraformTypes.SUBNET_PUBLIC.value,
    TerraformTypes.SUBNET.value,
    TerraformTypes.VPC.value,
    TerraformTypes.WAF_RULE_GROUP.value,
}

ICON_MAPPING = {
    "aws_nlb": "elbNetworkLoadBalancer",
    "aws_rds_cluster_instance": "rdsInstance",
    SpecialTypes.INTERNET.value: "internet",
    TerraformTypes.ALB.value: "elbApplicationLoadBalancer",
    TerraformTypes.EC2.value: "ec2",
    TerraformTypes.ELASTI_CACHE.value: "elastiCache",
    TerraformTypes.ELASTIC_CONTAINER_SERVICE.value: "elasticContainerService",
    TerraformTypes.IGW.value: "vpcInternetGateway",
    TerraformTypes.LAMBDA.value: "lambda",
    TerraformTypes.NGW.value: "vpcNATGateway",
    TerraformTypes.RDS.value: "rdsInstance",
    TerraformTypes.ROUTE_TABLE.value: "route53RouteTable",
    TerraformTypes.SUBNET_PRIVATE.value: "privateSubnet",
    TerraformTypes.SUBNET_PUBLIC.value: "publicSubnet",
    TerraformTypes.SUBNET.value: "privateSubnet",
    TerraformTypes.VPC.value: "vpcCluster",
    TerraformTypes.WAF.value: "waf",
}

NODES_MOVED_TO_VPC = [
    "aws_lb",
    TerraformTypes.ELASTIC_CONTAINER_SERVICE.value,
    TerraformTypes.LAMBDA.value,
    TerraformTypes.RDS.value,
]

SUBNET_TYPES = {
    TerraformTypes.SUBNET.value,
    TerraformTypes.SUBNET_PUBLIC.value,
    TerraformTypes.SUBNET_PRIVATE.value,
}
