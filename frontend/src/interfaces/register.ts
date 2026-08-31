import { ColorMapping, DatabaseProps, OptionLabel } from ".";
import { AlertColor, SliderProps } from "@mui/material";

import { AppLinearCategoryMapping } from "#root/components/AppLinearCategoryBar";

import { ProjectDiagramFile, ProjectProps } from "./common";
import { DialogConfirmStateEnum, DialogStateEnum, LogDialogStateEnum } from "./dialog";
import { DisplayFrameworksSettings } from "./project";

//////////////////////////////////////////////////
// Mitigation Measure
//////////////////////////////////////////////////
export enum MitigationMeasureKey {
    assignees = "assignees",
    category = "category",
    description = "description",
    header = "header",
    isArchived = "isArchived",
    isCompleted = "isCompleted",
    location = "location",
    mapping = "mapping",
    measure = "measure",
    measureFormat = "measureFormat",
    mitigationId = "mitigationId",
    ranking = "ranking",
    ref = "ref",
    frameworks = "frameworks",
    riskScenarioList = "riskScenarioList",
    source = "source",
}

export interface MitigationMeasure {
    [MitigationMeasureKey.mapping]?: string[];
    [MitigationMeasureKey.riskScenarioList]?: string[];
    [MitigationMeasureKey.ref]?: {
        recommendedMeasureId?: string; //
        risk_scenario?: ProjectRegisterFields;
    };
    [MitigationMeasureKey.measureFormat]?: string;
    [MitigationMeasureKey.location]?: ContextDict[];
    //
    [MitigationMeasureKey.frameworks]: ThreatFrameworks;
    //
    [MitigationMeasureKey.assignees]: string[];
    [MitigationMeasureKey.category]: string[];
    [MitigationMeasureKey.description]: string;
    [MitigationMeasureKey.header]: string;
    [MitigationMeasureKey.isArchived]: boolean;
    [MitigationMeasureKey.isCompleted]: boolean;
    [MitigationMeasureKey.measure]: string;
    [MitigationMeasureKey.mitigationId]: string;
    [MitigationMeasureKey.source]: string;
    [MitigationMeasureKey.ranking]: number;
}

export interface MitigationMeasureRow extends MitigationMeasure {
    id: string;
}

export type ContextMode = 1 | 2 | 3 | 4;

export type MasterMitigationMeasureRow = MitigationMeasure;

export interface ProjectMitigationRegisterFields extends Partial<
    Pick<
        ProjectRegisterFields, //
        | "keyRisk" //
        | "riskScenario"
        | "riskScenarioId"
    >
> {
    isHidden?: boolean;
    //
    isAccepted?: boolean;
    isObsolete?: boolean;
}

export enum ProjectActMitigationMeasureFieldKey {
    exportCsvType = "exportCsvType",
    exportFormat = "exportFormat",
}

export interface GroupResolvedProgress {
    stateMapping: AppLinearCategoryMapping;
    maxCount: number;
}

export interface ProjectMitigationMeasureRow
    extends
        MitigationMeasure, //
        ProjectMitigationRegisterFields {
    //
    isAccepted?: boolean;
    isObsolete?: boolean;
    isHidden?: boolean;
    isResolved?: boolean;
    //
    groupRisks?: ProjectMitigationRegisterFields[];
    groupkeyRisk?: string[];
    groupRapids?: string[];
    groupRiskScenario?: string[];
    groupRiskScenarioId?: string[];
    groupRiskCount?: number;
    groupAcceptedCount?: number;
    groupHiddenCount?: number;
    groupResolvedProgress?: GroupResolvedProgress;
}

export interface RuleExplanationObject {
    evidence: string[];
    explanation: string[];
    result: string;
}

export interface RuleExplanation {
    applicability?: RuleExplanationObject;
    priority?: RuleExplanationObject;
}

export interface BaseRegisterFields {
    category: string;
    defaultImpact: number;
    defaultLikelihood: number;
    defaultRiskLevel: number;
    frameworks: ThreatFrameworks;
    ruleExplanation: RuleExplanation;
    keyRisk: string;
    knowledgebaseSource: string;
    mappingToATK: unknown[];
    recommendedMitigationMeasures: string[];
    recommendedMitigationMeasuresHidden: string[];
    recommendedMitigationMeasuresParsed: MitigationMeasure[];
    riskScenario: string;
    riskScenarioId: string;
    subcategory: string;
    //
    status?: string;
    tags?: string[];
    threatImpact?: string;
}

export type MasterRegisterFields = BaseRegisterFields;

//////////////////////////////////////////////////
// LLM Executive Summary
//////////////////////////////////////////////////

/**
 * A single section of an executive summary entry (e.g. Attack Summary).
 * Each key is a group title mapped to its list of bullet strings.
 */
export type ExecutiveSummarySection = Record<string, string[]>;

/** The three top-level sections the LLM produces per risk scenario. */
export interface ExecutiveSummaryOutput {
    attack_summary?: ExecutiveSummarySection | null;
    business_impact?: ExecutiveSummarySection | null;
    recommended_mitigations?: ExecutiveSummarySection | null;
}

/** One executive summary entry, generated per risk scenario. */
export interface ExecutiveSummaryItem {
    riskScenarioId: string;
    output: ExecutiveSummaryOutput;
}

/**
 * Shape accepted for the LLM summary payload: the backend may return the
 * array of entries directly, or nest it under `executive_summary`.
 */
export type LlmExecutiveSummary =
    | ExecutiveSummaryItem[]
    | { executive_summary: ExecutiveSummaryItem[] }
    | null;

export interface RegisterRefBaseModel {}
export interface RegisterRef extends RegisterRefBaseModel {}

export interface ProjectRegisterLegacy {
    category_options: string[];
    risk_info: RiskCategory[];
    subcategory_options: { [key: string]: string[] };
}

export interface RegisterCore<V extends BaseRegisterFields> {
    schema_: string;
    ref: RegisterRef;
    risk_scenarios: V[];
    legacy?: ProjectRegisterLegacy;
}

export interface MasterRegister<V extends BaseRegisterFields = MasterRegisterFields>
    extends DatabaseProps, RegisterCore<V> {}

export interface AttackNarrativeSteps {
    descriptions: string[];
    remarks: string[];
    techniques: string[];
}

export interface ContextDict {
    id: string;
    label: string;
}
export interface ThreatFrameworks {
    owasp?: string[];
    owaspAi?: string[];
    rapids?: string[];
    scanHp?: string[];
    stride?: string[];
    tm?: string[];
}

export interface CVEListObject {
    cveId: string;
    cveDescription: string;
}
export interface ProjectRegisterFields extends BaseRegisterFields {
    actualMitigationMeasures: MitigationMeasure[];
    dataAction: string;
    attackNarrative: AttackNarrativeSteps;
    applicability: number;
    attackPaths: AttackPath[];
    keyInsight: string;
    cveList: CVEListObject[];
    location: RegisterFieldLocation[];
    sourceRiskScenarioId: string;
    prompts: string[];
    frameworks: ThreatFrameworks;
    ranking: number;
    rankingCriteria: [number, number, number];
    remarks: string;
    residualImpact: number;
    residualLikelihood: number;
    residualRiskLevel: number;
    responseAndRecoverPlan: string;
    tactics: string[];
    threatImpactGoal: Record<string, string>;
    //
    ref?: Record<string, unknown>;
    contextDict?: Record<string, ContextDict[]>;
    isBundle?: boolean;
    threats?: string[];

    // Comments
    treatmentComments: string; // 1
    reviewComments: string; // 2

    // Workflow metadata
    submittedForReviewBy: string;
    submittedForReviewOn: string;
    reviewedBy: string;
    reviewedOn: string;
}

export interface AttackStep {
    step: number;
    icon: string;
    node: string;
    nodeId: string;
    objectRef: string;
    technique: string;
    techniqueId: string;
    tactics: string[];
    techniqueGenerated?: string;
    techniqueValidated?: boolean;
    tactic: string;
    cveId: string;
    cveDescription: string;
    stepNarrative: string;
}

export interface AttackPath {
    id: string;
    keyRisk: string;
    riskScenario: string;
    steps: AttackStep[];
    nodes?: string[];
    edges?: string[];
}

export interface ProjectRegisterThreatScenario {
    id: string;
    riskScenario: string;
    keyRisk: string;
    applicability: number;
    frameworks: ThreatFrameworks;
    attackPaths: AttackPath[];
}

export interface AttackEdge {
    edge_id: string;
}

export interface AttackNodeMapping {
    path_id: string;
    isin_condition_nodes: boolean;
    isin_possible_path: boolean;
}

export interface AttackNode {
    node_id: string;
    mapping_list: AttackNodeMapping[];
}

export interface AttackMapping {
    attack_nodes: AttackNode[];
    attack_edges: AttackEdge[];
}

export interface CacheField<U = unknown> {
    field: keyof U;
    currentValue: U[keyof U];
    newValue: U[keyof U];
}

export interface ProjectScenarioConflict<U = unknown> {
    riskScenarioId: string;
    sourceRiskScenarioId: string;
    knowledgebaseSource: string;
    cachedFields: CacheField<U>[];
}

export interface ProjectRegisterAssessment {
    version: string;
    benchmark: Record<string, any>;
    configuration: Record<string, any>;
    cq_version_id?: string;
    ad_version_id?: string;
}
export interface ProjectRegisterMitigation {
    ranking: Record<string, number>;
}

export interface ProjectRegisterReview {
    llmScenarios: ProjectRegisterFields[];
    conflicts: ProjectScenarioConflict<ProjectRegisterFields>[];
}

export interface ProjectRegister<V extends BaseRegisterFields = ProjectRegisterFields>
    extends ProjectProps, DatabaseProps, RegisterCore<V> {
    assessment_id?: string;
    assessment: ProjectRegisterAssessment;
    mitigation: ProjectRegisterMitigation;
    review: ProjectRegisterReview;
    headCells?: unknown;
}

export interface ProjectLLMRef extends ProjectDiagramFile {
    image_id?: string;
    is_generated: boolean;
    is_uploaded: boolean;
    label?: string;
}

export interface RegisterFieldLocation {
    boundary: string;
    id: string;
    name: string;
    parentNode: RegisterFieldLocationParentNode;
    tosca_type: string;
    type: unknown[]; // TODO
}

export interface RegisterFieldLocationParentNode {
    id: string;
    source: string;
}

interface updateDescription {
    updatedFields: ProjectRegister;
    removedFields: unknown[];
    truncatedArrays: unknown[];
}

export interface RegisterLog {
    operationType: string;
    updateDescription?: updateDescription;
    wallTime: Date;
}

export interface RiskCategory {
    category: string;
    abbreviation: string;
    subcategories: RiskSubCategory[];
}

export interface RiskRegister {
    [key: string]: unknown;
}

export interface RiskSubCategory {
    subcategory: string;
    abbreviation: string;
}

export type ColumnVisibilityModel<
    T extends string | number | symbol = string, //
> = {
    [key in T]: boolean;
};

export interface TagOptionLabel {
    label: string;
    value: string;
    isFixed?: boolean;
}

export interface ScenarioTabGroup<V extends BaseRegisterFields> {
    tabKey: string;
    fields: ScenarioField<V>[];
    statusThreshold?: number;
}

export type DisabledVariant =
    | "riskChip"
    | "impactChip"
    | "likelihoodChip"
    | "priorityChip"
    | "applicabilityChip";

export type SegmentedProgressBarMapping = Record<number, ColorMapping>;
export interface ScenarioField<V extends BaseRegisterFields> {
    id: string;
    type: string;
    fieldAuthorizationKey?: string;
    //
    alertStack?: ScenarioFieldAlert;
    buttonStack?: ScenarioDecisionButtonStack;
    disabled?: boolean;
    displayFrameworks?: DisplayFrameworksSettings;
    disabledVariant?: DisabledVariant;
    fieldRef?: {
        backgroundColorMapping?: Record<string, string>;
        colorMapping?: Record<string, string>;
        disableAddActualMeasure?: boolean;
        disableCompleteActualMeasure?: boolean;
        disableEditActualMeasure?: boolean;
        fixedValues?: string[];
        progressBarMapping?: SegmentedProgressBarMapping;
        disableAddRecommendedMeasure?: boolean;
        disableEditRecommendedMeasure?: boolean;
        disableDuplicateRecommendedMeasure?: boolean;
        [key: string]: unknown;
    };
    fields?: ScenarioField<V>[];
    fieldVariant?: string;
    gridWidth?: number;
    helperText?: string;
    hideHelperText?: boolean;
    label?: string;
    options?: OptionLabel[];
    sliderMarks?: Mark[];
    style?: React.CSSProperties;
    value?: V[keyof V];
    renderValue?: (values: Record<string, unknown>) => unknown;
}
export type ScenarioFieldValue = string | string[] | number;

export interface ScenarioDecisionButtonStack {
    field: string;
    fieldAuthorizationKey: string;
    forwardButton: ScenarioDecisionButton;
    backwardButton: ScenarioDecisionButton;
}

export interface ScenarioDecisionButton {
    value: string;
    label: string;
    description: string;
    disabled?: boolean;
}

export interface ScenarioFieldAlert {
    id: string;
    fieldValueMapping?: Record<string, number>;
    aboveThreshold?: { message: string; severity?: AlertColor };
    belowThreshold?: { message: string; severity?: AlertColor };
}

export interface CheckboxFilterState {
    [key: string]: boolean;
}

//////////////////////////////////////////////////
// Register Table
//////////////////////////////////////////////////
export enum TableFieldKey {
    actions = "actions",
    header = "header",
}

export enum RegisterCacheActionKey {
    accept = "accept",
    ignore = "ignore",
    acceptAll = "acceptAll",
    ignoreAll = "ignoreAll",
}

export enum ScenarioActionLabel {
    delete = "Delete",
    edit = "Edit",
    // more = "See More",
}

export enum ScenarioFieldType {
    actions = "actions",
    actualMitigationTable = "actualMitigationTable",
    applicabilityProgressBar = "applicabilityProgressBar",
    attackPaths = "attackPaths",
    attackNarrative = "attackNarrative",
    calculated = "calculated",
    checkbox = "checkbox",
    date = "date",
    decisionCard = "decisionCard",
    displayATKMapping = "displayATKMapping",
    displayChips = "displayChips",
    displayChipsGrouped = "displayChipsGrouped",
    displayCVEList = "displayCVEList",
    displayExplanation = "displayExplanation",
    displayFrameworks = "displayFrameworks",
    displayRiskChip = "displayRiskChip",
    displayText = "displayText",
    displayThreatImpactGoal = "displayThreatImpactGoal",
    displayStatus = "displayStatus",
    displayThreats = "displayThreats",
    empty = "empty",
    impactProgressBar = "impactProgressBar",
    knowledgebaseSource = "knowledgeBaseSource",
    likelihoodProgressBar = "likelihoodProgressBar",
    location = "location",
    number = "number",
    numberProgressBar = "numberProgressBar",
    displayPrompts = "displayPrompts",
    displayQuality = "displayQuality",
    displayMitigationQuality = "displayMitigationQuality",
    priorityProgressBar = "priorityProgressBar",
    questionCheck = "questionCheck",
    reactSelect = "reactSelect",
    reactSelectMulti = "reactSelectMulti",
    reactSelectCreatable = "reactSelectCreatable",
    reactSelectProgressBar = "reactSelectProgressBar",
    recommendedMitigationEditTable = "recommendedMitigationEditTable",
    recommendedMitigationTransferTable = "recommendedMitigationTransferTable",
    riskProgressBar = "riskProgressBar",
    select = "select",
    status = "status",
    tags = "tags",
    text = "text",
    textarea = "textarea",
}

//////////////////////////////////////////////////
// Base Register
//////////////////////////////////////////////////
export enum BaseRegisterFieldKey {
    category = "category",
    defaultImpact = "defaultImpact",
    defaultLikelihood = "defaultLikelihood",
    defaultRiskLevel = "defaultRiskLevel",
    ruleExplanation = "ruleExplanation",
    exportCsvType = "exportCsvType",
    exportCsvRows = "exportCsvRows",
    exportCsvColumns = "exportCsvColumns",
    exportCsvCustomColumns = "exportCsvCustomColumns",
    exportFormat = "exportFormat",
    exportPdfType = "exportPdfType",
    keyRisk = "keyRisk",
    knowledgebaseSource = "knowledgebaseSource",
    mappingToATK = "mappingToATK",
    recommendedMitigationMeasures = "recommendedMitigationMeasures",
    recommendedMitigationMeasuresParsed = "recommendedMitigationMeasuresParsed",
    riskScenario = "riskScenario",
    riskScenarioId = "riskScenarioId",
    subcategory = "subcategory",
    tags = "tags",
}

export enum RegisterType {
    master_register = "master_register",
    project_register = "project_register",
}

//////////////////////////////////////////////////
// Master Register
//////////////////////////////////////////////////
export const MasterRegisterFieldKey = { ...BaseRegisterFieldKey };

export const MasterRegisterTableFieldKey = {
    ...BaseRegisterFieldKey, //
    ...TableFieldKey,
};

//////////////////////////////////////////////////
// Project Register
//////////////////////////////////////////////////
export const ProjectRegisterFieldKey = {
    ...BaseRegisterFieldKey, //
    actualMitigationMeasures: "actualMitigationMeasures",
    dataAction: "dataAction",
    applicability: "applicability",
    attackNarrative: "attackNarrative",
    attackPaths: "attackPaths",
    keyInsight: "keyInsight",
    cveList: "cveList",
    location: "location",
    pathSpecificRiskScenarios: "pathSpecificRiskScenarios",
    prompts: "prompts",
    ranking: "ranking",
    rankingCriteria: "rankingCriteria",
    remarks: "remarks",
    residualImpact: "residualImpact",
    residualLikelihood: "residualLikelihood",
    residualRiskLevel: "residualRiskLevel",
    responseAndRecoverPlan: "responseAndRecoverPlan",
    status: "status",
    threatImpactGoal: "threatImpactGoal",
    //
    frameworks: "frameworks",
    rapids: "rapids",
    stride: "stride",
    tm: "tm",
    owasp: "owasp",
    owaspAi: "owaspAi",
    scanHp: "scanHp",
    //
    treatmentComments: "treatmentComments",
    reviewComments: "reviewComments",
    //
    submittedForReviewBy: "submittedForReviewBy",
    submittedForReviewOn: "submittedForReviewOn",
    reviewedBy: "reviewedBy",
    reviewedOn: "reviewedOn",
    //
    tactics: "tactics",
    //
    isBundle: "isBundle",
    threats: "threats",
    ref: "ref",
};

export const ProjectRegisterTableFieldKey = {
    ...ProjectRegisterFieldKey,
    ...TableFieldKey,
};

//////////////////////////////////////////////////
// Combined Register
//////////////////////////////////////////////////
export const RegisterFieldKey = {
    ...MasterRegisterFieldKey,
    ...ProjectRegisterFieldKey, //
};

export const RegisterTableFieldKey = {
    ...MasterRegisterTableFieldKey,
    ...ProjectRegisterTableFieldKey, //
};

//////////////////////////////////////////////////
// Register Key Lists
//////////////////////////////////////////////////
export const MasterRegisterFieldKeys = Object.keys(MasterRegisterFieldKey);
export const MasterRegisterTableFieldKeys = Object.keys(MasterRegisterTableFieldKey);
export const ProjectRegisterFieldKeys = Object.keys(ProjectRegisterFieldKey);
export const ProjectRegisterTableFieldKeys = Object.keys(ProjectRegisterTableFieldKey);

//////////////////////////////////////////////////
// Scenario Tag
//////////////////////////////////////////////////
export enum ScenarioAssignedTagKey {
    masterScenarioUpdate = "masterScenarioUpdate",
    deprecated = "deprecated",
}

export enum ScenarioCustomTagKey {
    // focused = "focused",
    // pendingSupport = "pendingSupport",
    // readyToSubmit = "readyToSubmit",
    // supported = "supported",
    // unresolved = "unresolved",
    prioritized = "prioritized",
}

//////////////////////////////////////////////////
// Priority
//////////////////////////////////////////////////
export enum PriorityLevel {
    critical = "critical",
    very_high = "very_high",
    high = "high",
    medium = "medium",
    low = "low",
    unspecified = "unspecified",
}

//////////////////////////////////////////////////
// Applicability
//////////////////////////////////////////////////
export enum ApplicabilityLevel {
    highly_applicable = "highly_applicable",
    generally_applicable = "generally_applicable",
    moderately_applicable = "moderately_applicable",
    slightly_applicable = "slightly_applicable",
    minimally_applicable = "minimally_applicable",
    unspecified = "unspecified",
}

//////////////////////////////////////////////////
// Impact
//////////////////////////////////////////////////
export enum ImpactLevel {
    very_high = "very_high",
    high = "high",
    medium_high = "medium_high",
    medium = "medium",
    low = "low",
    unspecified = "unspecified",
}

//////////////////////////////////////////////////
// Likelihood
//////////////////////////////////////////////////
export enum LikelihoodLevel {
    very_high = "very_high",
    high = "high",
    medium_high = "medium_high",
    medium = "medium",
    low = "low",
    unspecified = "unspecified",
}

//////////////////////////////////////////////////
// Risk
//////////////////////////////////////////////////
export enum RiskLevel {
    very_high = "very_high",
    high = "high",
    medium_high = "medium_high",
    medium = "medium",
    low = "low",
    unspecified = "unspecified",
}

export const RiskLevelKeys = Object.keys(RiskLevel);

export type RiskLevelType = keyof typeof RiskLevel;

//////////////////////////////////////////////////
// RAPIDS
//////////////////////////////////////////////////
export enum RapidsEnum {
    ransomware = "ransomware",
    applicationSystemVulnerability = "applicationSystemVulnerability",
    phishing = "phishing",
    insiderThreat = "insiderThreat",
    ddos = "ddos",
    supplyChainCompromise = "supplyChainCompromise",
}

export const RapidsKeys = Object.keys(RapidsEnum);

export type RapidsType = keyof typeof RapidsEnum;

//////////////////////////////////////////////////
// TM FRAMEWORK
//////////////////////////////////////////////////
export enum TmFrameworkEnum {
    tm01 = "tm01",
    tm02 = "tm02",
    tm03 = "tm03",
    tm04 = "tm04",
    tm05 = "tm05",
    tm06 = "tm06",
    tm07 = "tm07",
    tm08 = "tm08",
    tm09 = "tm09",
    // tm10 = "tm10",
    // tm11 = "tm11",
}

export const TmFrameworkKeys = Object.keys(TmFrameworkEnum);

export type TmFrameworkType = keyof typeof TmFrameworkEnum;

//////////////////////////////////////////////////
// STRIDE
//////////////////////////////////////////////////
export enum StrideEnum {
    spoofing = "spoofing",
    tamperingWithData = "tamperingWithData",
    repudiation = "repudiation",
    informationDisclosure = "informationDisclosure",
    denialOfService = "denialOfService",
    elevationOfPrivilege = "elevationOfPrivilege",
    lateralMovement = "lateralMovement",
}

export const StrideKeys = Object.keys(StrideEnum);

export type StrideType = keyof typeof StrideEnum;

//////////////////////////////////////////////////
// SCAN-HP
//////////////////////////////////////////////////
export enum ScanHpEnum {
    sensor = "sensor",
    controller = "controller",
    actuator = "actuator",
    network = "network",
    hmiProcess = "hmiProcess",
}

export const ScanHpKeys = Object.keys(ScanHpEnum);

export type ScanHpType = keyof typeof ScanHpEnum;

//////////////////////////////////////////////////
// OWASP 2025
//////////////////////////////////////////////////
export enum OwaspEnum {
    a01 = "a01",
    a02 = "a02",
    a03 = "a03",
    a04 = "a04",
    a05 = "a05",
    a06 = "a06",
    a07 = "a07",
    a08 = "a08",
    a09 = "a09",
    a10 = "a10",
    a11 = "a11",
}
export const OwaspKeys = Object.keys(OwaspEnum);

export type OwaspType = keyof typeof OwaspEnum;

//////////////////////////////////////////////////
// OWASP AI
//////////////////////////////////////////////////
export enum OwaspAiEnum {
    engineeringEnvironment = "engineeringEnvironment",
    modelUse = "modelUse",
    softwareChain = "softwareChain",
    breakIntoDeployedModel = "breakIntoDeployedModel",
}
export const OwaspAiKeys = Object.keys(OwaspAiEnum);

export type OwaspAiType = keyof typeof OwaspAiEnum;

//////////////////////////////////////////////////
// ALL FRAMEWORKS
//////////////////////////////////////////////////
export type FrameworksEnum =
    | typeof RapidsEnum
    | typeof TmFrameworkEnum
    | typeof StrideEnum
    | typeof OwaspEnum
    | typeof OwaspAiEnum;

export type FrameworkType =
    | keyof typeof RapidsEnum
    | keyof typeof TmFrameworkEnum
    | keyof typeof StrideEnum
    | keyof typeof OwaspEnum
    | keyof typeof OwaspAiEnum;

export enum FrameworkCategoryEnum {
    owasp = "owasp",
    owaspAi = "owaspAi",
    rapids = "rapids",
    scanHp = "scanHp",
    stride = "stride",
    tm = "tm",
}

export const FrameworkCategoryKeys = Object.keys(FrameworkCategoryEnum);

export type FrameworkCategoryType = keyof typeof FrameworkCategoryEnum;

//////////////////////////////////////////////////
export enum ScenarioSourceKey {
    attack = "attack",
    attack_flow = "attack_flow",
    master_register = "master_register",
    risk_control_library = "risk_control_library",
    user = "user",
}

//////////////////////////////////////////////////
// Scenario Tab
//////////////////////////////////////////////////
export enum ScenarioTabKey {
    identify = "identify",
    treat = "treat",
    review = "review",
    submit = "submit",
    approve = "approve",
    help = "help",
}

//////////////////////////////////////////////////
// Scenario Decision
//////////////////////////////////////////////////
export enum ScenarioDecisionKey {
    treat = "treat",
    review = "review",
}

//////////////////////////////////////////////////
// Scenario Status
//////////////////////////////////////////////////
export enum ScenarioStatusKey {
    unresolved = "unresolved",
    readyToSubmit = "readyToSubmit",
    pendingSupport = "pendingSupport",
    supported = "supported",
}

//////////////////////////////////////////////////
// Risk Type
//////////////////////////////////////////////////
export enum RiskTypeKey {
    design = "design",
    compliance = "compliance",
}

//////////////////////////////////////////////////
// KnowledgebaseSource
//////////////////////////////////////////////////
export enum KnowledgebaseSourceTypeKey {
    attack = "attack",
    attackFlow = "attackFlow",
    llm = "llm",
    masterRiskRegister = "masterRiskRegister",
    others = "others",
    user = "user",
}

export enum KnowledgebaseSource {
    attack = "Attack",
    attackFlow = "Attack Flow",
    masterRiskRegister = "Master Risk Register",
    threatScenario = "Threat Scenario",
    others = "Others",
    user = "User",
}

//////////////////////////////////////////////////
// Display Options
//////////////////////////////////////////////////
export enum DisplayOptionFilterKey {
    bundleThreats = "bundleThreats",
}

//////////////////////////////////////////////////
// Checkbox
//////////////////////////////////////////////////
export const CheckboxFilterKey = {
    // display options
    ...DisplayOptionFilterKey,

    // risk type
    ...RiskTypeKey,

    // knowledgebaseSource
    ...KnowledgebaseSourceTypeKey,

    // rapids
    ...RapidsEnum,

    // owasp
    ...OwaspEnum,

    // owasp AI
    ...OwaspAiEnum,

    // scan-hp
    ...ScanHpEnum,

    // stride
    ...StrideEnum,

    // tm
    ...TmFrameworkEnum,

    // scenario status
    ...ScenarioStatusKey,
};

export enum ScenarioExportFormatKey {
    json = "json",
    pdf = "pdf",
    csv = "csv",
}

export enum ScenarioExportPdfTypeKey {
    technical = "technical",
    executiveSummary = "executiveSummary",
}

export enum ScenarioExportRowCsvTypeKey {
    all = "all",
    currentView = "currentView",
}

export enum ScenarioExportColumnCsvTypeKey {
    all = "all",
    currentView = "currentView",
    custom = "custom",
}

export interface RegisterScenarioDialogKeys {
    addScenarioDialogKey?: DialogStateEnum;
    editScenarioDialogKey?: DialogStateEnum;
    viewScenarioDialogKey?: DialogStateEnum;
    //
    closeAddScenarioDialogConfirmKey?: DialogConfirmStateEnum;
    closeEditScenarioDialogConfirmKey?: DialogConfirmStateEnum;
    deleteScenarioDialogConfirmKey?: DialogConfirmStateEnum;
    deleteScenariosDialogConfirmKey?: DialogConfirmStateEnum;
    //
    registerScenarioLogDialogStateKey?: LogDialogStateEnum;
    //
}

export interface ProjectAssessmentProgress {
    project_id?: string;
    assessment_progress?: number | null;
    assessment_progress_info?: string[];
    assessment_id?: string;
    assessment_benchmark?: ProjectAssessmentBenchmark;
    is_running?: boolean;
    is_stale?: boolean;
}

export interface ProjectAssessmentBenchmark {
    ad_version_id?: string;
    cq_version_id?: string;
    assessment_id?: string;
    llm_token_usage?: ProjectAssessmentBenchmarkLLMTokenUsage;
    metadata?: Record<string, unknown>;
    status?: string;
    latest_checkpoint?: ProjectAssessmentBenchmarkCheckpoint | null;
    checkpoints?: ProjectAssessmentBenchmarkCheckpoint[];
}

export interface ProjectAssessmentBenchmarkLLMTokenUsage {
    total?: ProjectAssessmentBenchmarkLLMTokenCounts;
    by_model?: Record<string, ProjectAssessmentBenchmarkLLMModelTokenUsage>;
}

export interface ProjectAssessmentBenchmarkLLMTokenCounts {
    call_count?: number;
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
    [key: string]: unknown;
}

export interface ProjectAssessmentBenchmarkLLMModelTokenUsage extends ProjectAssessmentBenchmarkLLMTokenCounts {
    model?: string;
    model_tag?: string;
    last_execution?: string;
    last_request_id?: string;
    last_job_id?: string;
    last_checkpoint_name?: string;
    last_checkpoint_step_index?: number;
    last_call_at?: string;
    last_call_at_epoch?: number;
    executions?: Record<string, ProjectAssessmentBenchmarkLLMExecutionTokenUsage>;
}

export interface ProjectAssessmentBenchmarkLLMExecutionTokenUsage extends ProjectAssessmentBenchmarkLLMTokenCounts {
    execution?: string;
    last_call_at?: string;
    last_call_at_epoch?: number;
}

export interface ProjectAssessmentBenchmarkCheckpoint {
    step_index: number;
    name?: string;
    timestamp: string;
    timestamp_epoch?: number;
    message: string;
    metadata?: Record<string, unknown>;
}

export enum LLMImageFieldKey {
    label = "label",
    imageFile = "imageFile",
}

export enum InfoPanelCardFieldType {
    text = "text",
    attackNarrative = "attackNarrative",
    displayFrameworks = "displayFrameworks",
}

export interface InfoPanelCardFieldAttributes {
    label: string;
    value: string | AttackNarrativeSteps | ThreatFrameworks | React.ReactNode;
    type: string;
    displayFrameworks?: DisplayFrameworksSettings;
}

export interface ScenarioTableFilterCheckboxItem {
    title: string;
    key?: string;
    options: {
        label: string;
        name: string;
    }[];
}

export interface BundleTracker {
    ranking: number;
    scenarios: ProjectRegisterFields[];
}
type Mark = Exclude<SliderProps["marks"], boolean | undefined>[number];
