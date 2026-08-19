import { DatabaseProps } from ".";

import { FrameworkCategoryLabel } from "#root/constants/frameworks";

import { MitigationMeasure } from "./register";

//////////////////////////////////////////////////
// Master Mitigation

//////////////////////////////////////////////////

export interface MasterMitigationMeasure extends MitigationMeasure {}

export interface ProjectMitigationMeasure extends MitigationMeasure {}

export interface MasterMitigation extends DatabaseProps {
    mitigation_measures: MasterMitigationMeasure[];
}

export enum JiraFieldsEnum {
    assignee = "assignee",
    description = "description",
    duedate = "duedate",
    issue_id = "issue_id",
    issuetype = "issuetype",
    status = "status",
    summary = "summary",
}

export const JiraFieldsLabel = {
    [JiraFieldsEnum.assignee]: "Assignee",
    [JiraFieldsEnum.description]: "Description",
    [JiraFieldsEnum.duedate]: "Due Date",
    [JiraFieldsEnum.issue_id]: "Issue ID",
    [JiraFieldsEnum.issuetype]: "Issue Type",
    [JiraFieldsEnum.status]: "Status",
    [JiraFieldsEnum.summary]: "Summary",
};

export enum MitigationTableFieldsEnum {
    actions = "actions",
    //
    assignees = "assignees",
    category = "category",
    description = "description",
    header = "header",
    isArchived = "isArchived",
    isCompleted = "isCompleted",
    kbAssociations = "kbAssociations",
    keyRisk = "keyRisk",
    measure = "measure",
    mitigationId = "mitigationId",
    ref = "ref",
    source = "source",
    ranking = "ranking",
    location = "location",
    //
    riskScenario = "riskScenario",
    riskScenarioId = "riskScenarioId",
    //
    owasp = "owasp",
    owaspAi = "owaspAi",
    rapids = "rapids",
    tm = "tm",
    scanHp = "scanHp",
    stride = "stride",
    //
    mappingIM8 = "mappingIM8",
    mappingCCoP = "mappingCCoP",
    mappingNistCSF = "mappingNistCSF",
    mappingISOIEC27001 = "mappingISOIEC27001",
    riskScenarioList = "riskScenarioList",
    //
    isAccepted = "isAccepted",
    isHidden = "isHidden",
    isObsolete = "isObsolete",
    isResolved = "isResolved",
    //
    groupRisks = "groupRisks",
    groupkeyRisk = "groupkeyRisk",
    //
    groupOwasp = "groupOwasp",
    groupOwaspAi = "groupOwaspAi",
    groupRapids = "groupRapids",
    groupScanHp = "groupScanHp",
    groupStride = "groupStride",
    groupTm = "groupTm",
    //
    groupRiskCount = "groupRiskCount",
    groupRiskScenario = "groupRiskScenario",
    groupRiskScenarioId = "groupRiskScenarioId",
    groupAcceptedCount = "groupAcceptedCount",
    groupHiddenCount = "groupHiddenCount",
    groupResolvedProgress = "groupResolvedProgress",
    groupCompletedCount = "groupCompletedCount",
    groupCompletedProgress = "groupCompletedProgress",
    groupLocation = "groupLocation",
    //
    jiraIssueId = "jiraIssueId",
}

export const MitigationTableFieldHeader = {
    // Column Headers
    [MitigationTableFieldsEnum.actions]: "Actions",
    [MitigationTableFieldsEnum.mappingIM8]: "IM8 Mapping",
    [MitigationTableFieldsEnum.mappingCCoP]: "Codes of Practice Mapping",
    [MitigationTableFieldsEnum.mappingNistCSF]: "NIST CSF Mapping",
    [MitigationTableFieldsEnum.mappingISOIEC27001]: "ISO/IEC 27001 Mapping",
    // Data
    [MitigationTableFieldsEnum.assignees]: "Assignees",
    [MitigationTableFieldsEnum.category]: "Domain",
    [MitigationTableFieldsEnum.description]: "Description",
    [MitigationTableFieldsEnum.header]: "Header",
    [MitigationTableFieldsEnum.isArchived]: "Archived?",
    [MitigationTableFieldsEnum.isCompleted]: "Completed?",
    [MitigationTableFieldsEnum.kbAssociations]: "KB Assoc.",
    [MitigationTableFieldsEnum.measure]: "Measure",
    [MitigationTableFieldsEnum.mitigationId]: "Measure ID",
    [MitigationTableFieldsEnum.ref]: "Ref",
    [MitigationTableFieldsEnum.source]: "Source",
    [MitigationTableFieldsEnum.ranking]: "Ranking",
    [MitigationTableFieldsEnum.location]: "Location",
    // Parent Data
    [MitigationTableFieldsEnum.keyRisk]: "Key Risk",
    //
    [MitigationTableFieldsEnum.owasp]: FrameworkCategoryLabel.owasp,
    [MitigationTableFieldsEnum.owaspAi]: FrameworkCategoryLabel.owaspAi,
    [MitigationTableFieldsEnum.rapids]: FrameworkCategoryLabel.rapids,
    [MitigationTableFieldsEnum.scanHp]: FrameworkCategoryLabel.scanHp,
    [MitigationTableFieldsEnum.stride]: FrameworkCategoryLabel.stride,
    [MitigationTableFieldsEnum.tm]: FrameworkCategoryLabel.tm,
    //
    [MitigationTableFieldsEnum.riskScenario]: "Risk Scenario",
    [MitigationTableFieldsEnum.riskScenarioId]: "Risk Scenario ID",
    [MitigationTableFieldsEnum.riskScenarioList]: "Key Risks",
    //
    [MitigationTableFieldsEnum.isAccepted]: "Accepted?",
    [MitigationTableFieldsEnum.isHidden]: "Hidden?",
    [MitigationTableFieldsEnum.isObsolete]: "Obsolete?",
    [MitigationTableFieldsEnum.isResolved]: "Resolved?",
    //
    [MitigationTableFieldsEnum.groupRisks]: "Risk Scenarios",
    [MitigationTableFieldsEnum.groupkeyRisk]: "Key Risks",
    //
    [MitigationTableFieldsEnum.groupOwasp]: FrameworkCategoryLabel.owasp,
    [MitigationTableFieldsEnum.groupOwaspAi]: FrameworkCategoryLabel.owaspAi,
    [MitigationTableFieldsEnum.groupRapids]: FrameworkCategoryLabel.rapids,
    [MitigationTableFieldsEnum.groupStride]: FrameworkCategoryLabel.stride,
    [MitigationTableFieldsEnum.groupScanHp]: FrameworkCategoryLabel.scanHp,
    [MitigationTableFieldsEnum.groupTm]: FrameworkCategoryLabel.tm,
    //
    [MitigationTableFieldsEnum.groupRiskCount]: "No. of Risk Scenarios",
    [MitigationTableFieldsEnum.groupRiskScenario]: "Risk Scenarios",
    [MitigationTableFieldsEnum.groupRiskScenarioId]: "Risk Scenario IDs",
    [MitigationTableFieldsEnum.groupAcceptedCount]: "No. of Accepted Scenarios",
    [MitigationTableFieldsEnum.groupHiddenCount]: "No. of Hidden Scenarios",
    [MitigationTableFieldsEnum.groupResolvedProgress]: "Progress",
    [MitigationTableFieldsEnum.groupCompletedCount]: "No. of Completed Measures",
    [MitigationTableFieldsEnum.groupCompletedProgress]: "Completion Progress",
    [MitigationTableFieldsEnum.groupLocation]: "Location",
    //
    [MitigationTableFieldsEnum.jiraIssueId]: "Jira",
};

export enum MitigationTableGroupType {
    single = "single",
    groupByMeasure = "groupByMeasure",
}

export enum ActMitigationExportFormatKey {
    pdf = "pdf",
    csv = "csv",
}

export enum ProgressStatus {
    todo = "To Do",
    done = "Done",
}
