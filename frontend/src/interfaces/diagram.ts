import { DatabaseProps, MetadataObject, SelectableValue } from ".";
import { Edge as ReactFlowEdge, Node as ReactFlowNode, Viewport, XYPosition } from "@xyflow/react";

import { ProjectDiagramFile, ProjectProps } from "./common";
import { AttackPath, ProjectRegisterFields } from "./register";

export enum CanvasType {
    architecture = "architecture",
}

export enum CanvasAxis {
    horizontal = "x",
    vertical = "y",
}

export enum CanvasEdgeType {
    architecture = "architecture",
    data_flow = "data_flow",
    threat_scenario = "threat_scenario",
    llm = "llm",
}

export enum CanvasNodeType {
    architecture = "architecture",
    data_flow = "data_flow",
}

export enum CanvasNodeVariantType {
    infoNode = "infoNode",
    clusterNode = "clusterNode",
}

export enum DiagramComponentType {
    architecture = "architecture",
    data_flow = "data_flow",
    custom = "custom",
}

export interface EdgeHandleMapping {
    source_top: string;
    target_top: string;
    source_bottom: string;
    target_bottom: string;
    source_left: string;
    target_left: string;
    source_right: string;
    target_right: string;
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

export const EdgeHandleType = {
    ...ArchitectureEdgeHandleType,
    ...AttackEdgeHandleType,
};

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

export type ResourceDrawerViewMode = "list" | "grid";

export const ResourceDrawerLabel = {
    [ResourceDrawerKey.aws]: "AWS",
    [ResourceDrawerKey.data]: "Data",
    [ResourceDrawerKey.general]: "General",
    [ResourceDrawerKey.sgts]: "SG Tech Stack",
    [ResourceDrawerKey.solutionProvider]: "Solution Providers",
    //
    [ResourceDrawerKey.cluster_aws]: "AWS",
    [ResourceDrawerKey.cluster_general]: "General",
};

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

export const AWSServiceLabelMapping = {
    [AWSService.analytics]: "Analytics",
    [AWSService.applicationIntegration]: "Application Integration",
    [AWSService.businessApplications]: "Business Applications",
    [AWSService.cloudFinancialManagement]: "Cloud Financial Management",
    [AWSService.compute]: "Compute",
    [AWSService.containers]: "Containers",
    [AWSService.customerEnablement]: "Customer Enablement",
    [AWSService.database]: "Database",
    [AWSService.developerTools]: "Developer Tools",
    [AWSService.endUserComputing]: "End User Computing",
    [AWSService.frontEndWebMobile]: "Front End Web Mobile",
    [AWSService.games]: "Games",
    [AWSService.internetOfThings]: "Internet of Things",
    [AWSService.machineLearning]: "Machine Learning",
    [AWSService.managementGovernance]: "Management Governance",
    [AWSService.mediaServices]: "Media Services",
    [AWSService.migrationTransfer]: "Migration Transfer",
    [AWSService.networkingContentDelivery]: "Networking Content Delivery",
    [AWSService.securityIdentityCompliance]: "Security Identity Compliance",
    [AWSService.storage]: "Storage",
    [AWSService.others]: "Others",
};

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

export enum DragHandleType {
    vertical = "vertical",
    horizontal = "horizontal",
}

export interface CardNode extends SelectableValue {
    node_id: string;
    ref_key: string;
    card_id_affliations: string[];
}

export interface CanvasHistory extends DiagramCanvas {}

export interface DiagramCanvas<
    W extends WarningInfo = WarningMessage, //
> extends DiagramDataCore {
    // map(arg0: (canvas: DiagramCanvas) => DiagramCanvas): unknown;
    canvas_id: string;
    canvas_name: string;
    canvas_type: CanvasType;
    llm_generation_status: number;
    ref: {
        card_ref?: UserStoryCardRef;
        threat_scenario_ref?: Partial<ProjectRegisterFields>;
    };
    view_only: boolean;
    warnings: W[];
}

export interface ProjectDiagram extends ProjectProps, DatabaseProps {
    canvas: DiagramCanvas[];
    card_nodes: CardNode[];
    isCompleted: boolean;
    lastCompletedBy?: MetadataObject;
    ad_version_id: string;
    ref: {
        selected_cacti_file_id: string;
        selected_diagram_file_id: string;
        selected_image_file_id: string;
        selected_module_file_id_list: string[];
        selected_template_id: string;
        selected_terraform_file_id_list: string[];
        selected_xml_file_id: string;
    };
}

export interface ProjectDiagramImageFiles extends ProjectProps {
    files: ProjectDiagramFile[];
    selected_file_id: string;
}

export interface ProjectDiagramImageFile extends ProjectDiagramFile {
    id: string;
    fileType: string;
}

export interface DiagramData extends DiagramDataCore {
    type: string;
}

// @blocksort asc inf

export interface DiagramDataCore {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    viewport: Viewport;
}

export interface DiagramDataExist {
    architecture: boolean;
    data_flow: boolean;
    example: boolean;
    template: boolean;
}

export type NodeAlignmentDirection = "left" | "center" | "right" | "top" | "middle" | "bottom";
export type NodeSpacingDirection = "horizontal" | "vertical";
export interface NodeInfo {
    nodeWidth: number;
    nodeHeight: number;
    nodeX_left: number;
    nodeX_right: number;
    nodeY_top: number;
    nodeY_bottom: number;
}

export interface ProjectFlowJsonObject extends DiagramDataCore, ProjectProps {}

export interface MasterDiagramTemplate {
    templateData: DiagramDataCore;
    templateId: string;
    templateImageName: string;
    templateName: string;
}

export interface UserStoryCardRef extends UserStoryCardRefCore {
    [UserStoryCardRefEnum.card_intent]?: string;
    [UserStoryCardRefEnum.card_id]?: string;
    [UserStoryCardRefEnum.card_outcome]?: string;
    [UserStoryCardRefEnum.card_title]?: string;
}

export interface UserStoryCardRefCore {
    [UserStoryCardRefEnum.card_data]?: CardNode[];
    [UserStoryCardRefEnum.card_devices]?: CardNode[];
    [UserStoryCardRefEnum.card_feature]?: SelectableValue;
    [UserStoryCardRefEnum.card_interface]?: CardNode[];
    [UserStoryCardRefEnum.card_users]?: CardNode[];
}

export type UserStoryCardRefKeys = keyof UserStoryCardRef;

export type StackDirection = "row" | "row-reverse" | "column" | "column-reverse";

export type StackJustifyContent =
    "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";

export type StackAlignItems = "flex-start" | "center" | "flex-end" | "stretch" | "baseline";

export type StackPosition =
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";

export interface StackParams {
    direction: StackDirection;
    alignItems: StackAlignItems;
    justifyContent: StackJustifyContent;
}

export interface NodeAttributes {
    node_data_type: string;
    node_icon: string;
    node_label: string;
    node_type: string;
    //
    node_card_field_id_assoc?: string;
    node_card_field_id?: string;
    node_card_id?: string;
    node_card_ref_key?: string;
}

export interface CanvasProps {
    canvas: Partial<DiagramCanvas>;
}

export interface DeviceToInterfaceMappingSingle extends Pick<SelectableValue, "label" | "value"> {
    node_id: string;
    interfaces: CardNode[];
}

export type NodeToDataMappingSingle = { id: string; data_stored: string[] };
export type NodeOptionSingle = { label: string; value: string };

export interface LineSegment {
    id: string;
    handleOffset: number;
    snappedHandleOffset: number;
    lineStart: XYPosition;
    lineEnd: XYPosition;
    lineLength: number;
    direction: DragHandleType;
}

export enum EdgeValidationStatus {
    pass = "PASS",
    warn = "WARN",
    fail = "FAIl",
    error = "ERROR",
}
export enum WarningType {
    dataFlow = "dataFlow",
    security = "security",
    logical = "logical",
}

export enum WarningSortCriteriaKey {
    priority = "priority",
}

export const WarningSortCriteriaKeys = Object.keys(WarningSortCriteriaKey);

export const WarningSortCriteriaLabel = {
    priority: "Priority",
};

export const warningSortCriteriaOptions = WarningSortCriteriaKeys.map((value) => {
    return {
        value, //
        label: WarningSortCriteriaLabel?.[value as keyof typeof WarningSortCriteriaLabel],
    };
});

export enum SortDirection {
    ascending = "ascending",
    descending = "descending",
}

interface WarningInfo {
    description: string;
    edgeId?: string;
    nodeId?: string;
    priority: number;
    timestamp: string;
    title: string;
    warningType: WarningType;
}

export interface WarningReport extends WarningInfo {
    result: EdgeValidationStatus;
}

export interface WarningMessage extends WarningInfo {
    isHidden?: boolean;
    warningId: string;
}

export interface WarningMessageMapping {
    [key: string]: WarningMessage[];
}

export enum WarningFilterKey {
    show_all = "show_all",
    show_hidden = "show_hidden",
    show_default = "show_default",
}

export const WarningFilterKeyLabel = {
    show_all: "Show All",
    show_hidden: "Show Hidden",
    show_default: "Show Default",
};

export const warningFilterKeys = Object.keys(WarningFilterKey);

export const warningFilterKeyOptions = warningFilterKeys.map((value) => {
    return {
        value, //
        label: `${
            WarningFilterKeyLabel?.[
                value as keyof typeof WarningFilterKeyLabel //
            ]
        }`,
    };
});

export enum CanvasTabGroup {
    architecture = "architecture",
    data_flow = "data_flow",
    summary = "summary",
}

export interface EdgeVisibilityFuncProps {
    selectedCanvas?: DiagramCanvas;
    selectedCanvasViewOnly: boolean | undefined;
    selectedPath?: AttackPath;
    viewAllPaths?: boolean;
    edge: DiagramEdge;
    canvas: DiagramCanvas[];
}

export interface NodeVisibilityFuncProps {
    selectedCanvas?: DiagramCanvas;
    selectedCanvasViewOnly: boolean | undefined;
    selectedPath?: AttackPath;
    viewAllPaths?: boolean;
    node: DiagramNode;
    canvas: DiagramCanvas[];
}

// ##################################################

export interface DiagramNodeData extends Record<string, unknown> {
    allowed_child_nodes?: string[];
    canvasColumn?: string;
    card_id_list?: string[];
    card_id?: string;
    cardFieldOptionId?: string;
    cardFieldOptionIdAssoc?: string;
    cardRefKey?: string;
    class?: string;
    hostedInGCC?: boolean;
    icon_position?: string;
    icon?: string;
    keyRisks?: string[];
    label?: string;
    node_card_id?: string;
    physicalLocation?: string;
    publiclyAccessible?: boolean;
    runs_vendor_software?: boolean;
    network_functions_5g?: string[];
    ip_address?: string;
    type?: string;
}

export interface DiagramNode extends ReactFlowNode<DiagramNodeData> {}

// ##################################################

export interface DiagramEdgeData extends Record<string, unknown> {
    label?: string;
    lineSegments?: LineSegment[];
    type?: string;
}

export interface DiagramEdge extends ReactFlowEdge<DiagramEdgeData> {}

// ##################################################

export enum DiagramExportFormat {
    json = "json",
    png = "png",
}

export const DiagramExportFormatLabel: Record<DiagramExportFormat, string> = {
    [DiagramExportFormat.json]: "JSON",
    [DiagramExportFormat.png]: "PNG",
};

export interface NodeHandleEdgeMapping {
    node_id: string;
    handles: {
        [key: string]: string[];
    };
}

export interface NodeHandleEdgeMappingDict {
    [node_id: string]: NodeHandleEdgeMapping;
}

export type NodeAttackStepCountMapping = { [key: string]: number };
