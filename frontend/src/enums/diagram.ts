export enum CanvasType {
    architecture = "architecture",
    data_flow = "data_flow",
    threat_scenario = "threat_scenario",
    summary = "summary",
}
export enum CanvasColumn {
    left = "left",
    right = "right",
    top = "top",
    bottom = "bottom",
}
export enum CanvasDataflowNodeType {
    users = "users",
    interface = "interface",
    devices = "devices",
}
export enum CanvasAxis {
    horizontal = "x",
    vertical = "y",
}
export enum CanvasEdgeType {
    architecture = "architecture",
    data_flow = "data_flow",
    threat_scenario = "threat_scenario",
}
export enum CanvasNodeType {
    architecture = "architecture",
    data_flow = "data_flow",
}
export enum CanvasNodeVariantType {
    infoNode = "infoNode",
    clusterNode = "clusterNode",
}
export enum CanvasTabGroup {
    architecture = "architecture",
    data_flow = "data_flow",
    summary = "summary",
}

export enum DiagramComponentType {
    architecture = "architecture",
    data_flow = "data_flow",
    custom = "custom",
}
export enum DiagramExportFormat {
    json = "json",
    png = "png",
}
export enum DiagramElementAttrBaseFieldKey {
    data = "data",
    style = "style",
    markerStart = "markerStart",
    markerEnd = "markerEnd",
    main = "main",
}
export enum DiagramIconPosition {
    "top-left" = "top-left",
    "top-center" = "top-center",
    "top-right" = "top-right",
    "center-left" = "center-left",
    "center" = "center",
    "center-right" = "center-right",
    "bottom-left" = "bottom-left",
    "bottom-center" = "bottom-center",
    "bottom-right" = "bottom-right",
}
export enum DiagramFileOption {
    cacti = "cacti",
    json = "json",
    template = "template",
    xml = "xml",
    iac = "iac",
    image = "image",
}

export enum UserStoryCardRefEnum {
    card_id = "card_id",
    card_data = "card_data",
    card_devices = "card_devices",
    card_feature = "card_feature",
    card_intent = "card_intent",
    card_interface = "card_interface",
    card_outcome = "card_outcome",
    card_title = "card_title",
    card_users = "card_users",
}

export enum UserStoryCardRefKeyLabel {
    card_interface = "Interface",
    card_devices = "Devices",
    card_data = "Data",
    card_users = "Users",
}

export enum UserStoryStringEnum {
    user = "user",
    data = "data",
    feature = "feature",
    device = "device",
    interface = "interface",
    intent = "intent",
    outcome = "outcome",
}

export enum ArchitectureEdgeHandleType {
    source_top = "source_top",
    target_top = "target_top",
    source_bottom = "source_bottom",
    target_bottom = "target_bottom",
    source_left = "source_left",
    target_left = "target_left",
    source_right = "source_right",
    target_right = "target_right",
}

export enum AttackEdgeHandleType {
    attack_source_top = "attack_source_top",
    attack_target_top = "attack_target_top",
    attack_source_bottom = "attack_source_bottom",
    attack_target_bottom = "attack_target_bottom",
    attack_source_left = "attack_source_left",
    attack_target_left = "attack_target_left",
    attack_source_right = "attack_source_right",
    attack_target_right = "attack_target_right",
}

export enum AWSService {
    analytics = "analytics",
    applicationIntegration = "applicationIntegration",
    businessApplications = "businessApplications",
    cloudFinancialManagement = "cloudFinancialManagement",
    compute = "compute",
    containers = "containers",
    customerEnablement = "customerEnablement",
    database = "database",
    developerTools = "developerTools",
    endUserComputing = "endUserComputing",
    frontEndWebMobile = "frontEndWebMobile",
    games = "games",
    internetOfThings = "internetOfThings",
    machineLearning = "machineLearning",
    managementGovernance = "managementGovernance",
    mediaServices = "mediaServices",
    migrationTransfer = "migrationTransfer",
    networkingContentDelivery = "networkingContentDelivery",
    securityIdentityCompliance = "securityIdentityCompliance",
    storage = "storage",
    others = "others",
}

export enum DragHandleType {
    vertical = "vertical",
    horizontal = "horizontal",
}

export enum DrawerStateEnum {
    diagram_resource = "diagram_resource",
    diagram_user_story = "diagram_user_story",
    edge_info = "edge_info",
    layout = "layout",
    node = "node",
    node_info = "node_info",
    diagram_threat_scenario = "digram_threat_scenario",
    diagram_threat_scenario_nodes = "diagram_threat_scenario_nodes",
    diagram_threat_scenario_edges = "diagram_threat_scenario_edges",
}

export enum EdgeValidationStatus {
    pass = "PASS",
    warn = "WARN",
    fail = "FAIl",
    error = "ERROR",
}

export enum ResourceDrawerKey {
    aws = "aws",
    data = "data",
    general = "general",
    sgts = "sgts",
    solutionProvider = "solutionProvider",
    //
    cluster_aws = "cluster_aws",
    cluster_general = "cluster_general",
}

export enum SortDirection {
    ascending = "ascending",
    descending = "descending",
}

export enum WarningFilterKey {
    show_all = "show_all",
    show_hidden = "show_hidden",
    show_default = "show_default",
}

export enum WarningSortCriteriaKey {
    priority = "priority",
}

export enum WarningType {
    dataFlow = "dataFlow",
    security = "security",
    logical = "logical",
}
