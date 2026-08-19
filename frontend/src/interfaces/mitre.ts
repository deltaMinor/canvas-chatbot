import { FrameworkCategoryLabel } from "#root/constants/frameworks";

import { ThreatFrameworks } from "./register";

export interface MitreExternalReference {
    description: string;
    externalId: string;
    sourceName: string;
    url: string;
}

export interface MitreEmbedThreatObject {
    title: string;
    url: string;
    description: string;
}

export interface MitreEmbedThreatEvidence {
    type: string;
    evidence: MitreEmbedThreatObject[];
}

export interface KillChainPhase {
    killChainName: string;
    phaseName: string;
}

export interface MitreMitigationRelationship {
    sourceRef: string;
    targetRef: string;
    id: string;
    relationshipType: string;
}

export enum MitreFieldsEnum {
    id = "id",
    mitreId = "mitreId",
    type = "type",
    name = "name",
    description = "description",
    aliases = "aliases",
    labels = "labels",
    externalReferences = "externalReferences",
    relationships = "relationships",
    killChainPhases = "killChainPhases",
    firstSeen = "firstSeen",
    lastSeen = "lastSeen",
    firstSeenCitation = "firstSeenCitation",
    lastSeenCitation = "lastSeenCitation",
    modifiedByRef = "modifiedByRef",
    revoked = "revoked",
    deprecated = "deprecated",
    version = "version",
    attackSpecVersion = "attackSpecVersion",
    domains = "domains",
    platforms = "platforms",
    tacticType = "tacticType",
    contributors = "contributors",
    status = "status",
    isSubtechnique = "isSubtechnique",
    remoteSupport = "remoteSupport",
    impactType = "impactType",
    embedThreatCategory = "embedThreatCategory",
    embedThreatMaturity = "embedThreatMaturity",
    embedThreatEvidence = "embedThreatEvidence",
    embedThreatCwes = "embedThreatCwes",
    embedThreatCves = "embedThreatCves",
    embedMitigationMaturity = "embedMitigationMaturity",
    embedMitigationReferences = "embedMitigationReferences",
    embedMitigationIec62443Mappings = "embedMitigationIec62443Mappings",
}

export enum MitreObjectTypeEnum {
    analytic = "analytic",
    campaign = "campaign",
    dataComponent = "dataComponent",
    detectionStrategy = "detectionStrategy",
    group = "group",
    mitigation = "mitigation",
    mitigationUse = "mitigationUse",
    property = "property",
    software = "software",
    tactic = "tactic",
    technique = "technique",
}

export interface MitreObject {
    id: string;
    mitreId: string;
    type: string;
    name: string;
    description: string;
    aliases: string[];
    labels: string[];
    externalReferences: MitreExternalReference[];
    relationships: MitreMitigationRelationship[];
    killChainPhases: KillChainPhase[];
    firstSeen: string;
    lastSeen: string;
    firstSeenCitation: string;
    lastSeenCitation: string;
    modifiedByRef: string;
    revoked: boolean | null;
    deprecated: boolean | null;
    version: string;
    attackSpecVersion: string;
    domains: string[];
    platforms: string[];
    tacticType: string[];
    contributors: string[];
    status: string;
    isSubtechnique: boolean | null;
    remoteSupport: boolean | null;
    impactType: string[];
    embedThreatCategory: string;
    embedThreatMaturity: string;
    embedThreatEvidence: MitreEmbedThreatEvidence[];
    embedThreatCwes: MitreEmbedThreatObject[];
    embedThreatCves: MitreEmbedThreatObject[];
    embedMitigationMaturity: string;
    embedMitigationReferences: string;
    embedMitigationIec62443Mappings: string;
}

export enum MitreKnowledgeBase {
    attack = "attack",
    atlas = "atlas",
    embed = "embed",
    fight = "fight",
}

export enum MitreDomainEnum {
    ics = "ics",
    mobile = "mobile",
    enterprise = "enterprise",
}

export interface MitreDatabaseInterface {
    analytic: MitreObject[];
    campaign: MitreObject[];
    dataComponent: MitreObject[];
    detectionStrategy: MitreObject[];
    group: MitreObject[];
    mitigation: MitreObject[];
    mitigationUse: MitreObject[];
    property: MitreObject[];
    software: MitreObject[];
    tactic: MitreObject[];
    technique: MitreObject[];
}

export interface NodeAttackPathStep {
    step: number; //
    techniqueId: string;
    technique: string;
}

export interface NodeAttackPathDetail {
    pathId: string;
    canvasId?: string;
    pathLabel?: string;
    steps: NodeAttackPathStep[];
}

export interface NodeAttackPathMappedValue {
    keyRisk: string;
    riskScenario: string;
    paths: string[];
    steps: NodeAttackPathStep[];
    pathDetails: NodeAttackPathDetail[];
}

export interface NodeAttackPathMapping {
    [key: string]: NodeAttackPathMappedValue[];
}

export interface EdgeAttackPathDetail {
    pathId: string;
    canvasId?: string;
    pathLabel?: string;
    steps: number[];
}

export interface EdgeAttackPathMappedValue {
    keyRisk: string;
    riskScenario: string;
    paths: string[];
    pathDetails: EdgeAttackPathDetail[];
}

export enum AttackFlowFieldEnum {
    risk_scenario_template = "risk_scenario_template",
    description_format = "description_format",
    label = "label",
    name = "name",
    //
    owasp = "owasp",
    rapids = "rapids",
    stride = "stride",
    tm = "tm",
    //
    key_risk_template = "key_risk_template",
    explanation_for_generation_rule = "explanation_for_generation_rule",
    applicability = "applicability",
    priority = "priority",
    recommended_mitigation_measures = "recommended_mitigation_measures",
    mapping = "mapping",
    created = "created",
    step_count = "step_count",
}

export const AttackFlowFieldHeader = {
    [AttackFlowFieldEnum.name]: "Name",
    [AttackFlowFieldEnum.key_risk_template]: "Key Risk",
    [AttackFlowFieldEnum.risk_scenario_template]: "Risk Scenario",
    [AttackFlowFieldEnum.description_format]: "Description",
    [AttackFlowFieldEnum.label]: "Label",
    [AttackFlowFieldEnum.step_count]: "Steps",

    //
    [AttackFlowFieldEnum.owasp]: FrameworkCategoryLabel.owasp,
    [AttackFlowFieldEnum.rapids]: FrameworkCategoryLabel.rapids,
    [AttackFlowFieldEnum.stride]: FrameworkCategoryLabel.stride,
    [AttackFlowFieldEnum.tm]: FrameworkCategoryLabel.tm,
};

export interface AttackActionsGrouping {
    id: string;
    type: string;
    spec_version: string;
    created: string;
    modified: string;
    name: string;
    technique_id: string;
    tactic_id: string;
    object_ref?: string;
    [key: string]: any;
}

export interface AttackFlowsGrouping {
    id: string;
    type: string;
    attack_flow_ref: string;
    attack_narrative: {
        descriptions: string[];
        remarks: string[];
        techniques?: string[];
    };
    attack_actions: AttackActionsGrouping[];
    risk_scenario_template: string;
    name: string;
    frameworks: ThreatFrameworks;
    key_risk_template: string;
    rule_explanation: {
        applicability: string;
    };
    recommended_mitigation_measures: {
        default: [
            {
                measure: string;
                context: [];
                text: string;
            },
        ];
    };
    [key: string]: any;
}

export interface AttackFlowBundle {
    objects: Array<AttackActionsGrouping | AttackFlowsGrouping | any>;
}

export interface AttackSequenceObject {
    id: string;
    attack_flow_ref: string;
    attack_narrative: {
        descriptions: string[];
        remarks: string[];
        techniques?: string[];
    };
    attack_actions: AttackActionsGrouping[];
}
