export enum AuditLogActionKey {
    create = "create",
    delete = "delete",
    init = "init",
    update = "update",
    patch = "patch",
}

export enum DetailsSectionType {
    DASHBOARD = "dashboard",
    MITIGATION = "mitigation",
    REGISTER = "register",
    VISUALIZER = "threat_scenario",
    CONCEPTION = "conception_questionnaire",
    DIAGRAM = "architecture",
    SETTINGS = "settings",
}

export enum IntegrationJiraFieldKey {
    jiraApiToken = "jiraApiToken",
    jiraUsername = "jiraUsername",
}

export enum FeedbackFormFieldsEnum {
    feedback_id = "feedback_id",
    feedback_content = "feedback_content",
    feedback_type = "feedback_type",
    user_id = "user_id",
    username = "username",
    email = "email",
    metadata = "metadata",
    //
    created_on = "created_on",
    modified_on = "modified_on",
}

export enum FeedbackFormTypeKey {
    suggestion = "suggestion",
    bug = "bug",
}

export enum RiskInfoKeyEnum {
    keyRisk = "Key Risk",
    category = "Category",
    subcategory = "Subcategory",
    riskScenario = "Risk Scenario",
    defaultImpact = "Default Impact",
    defaultLikelihood = "Default Likelihood",
    defaultRiskLevel = "Default Risk Level",
    priority = "Priority",
    knowledgebaseSource = "Knowledgebase Source",
    riskScenarioId = "Risk Scenario Id",
    sourceRiskScenarioId = "Source Risk Scenario Id",
}

export enum ResourceTag {
    parent_tag_id = "parent_tag_id",
    parent_tag_name = "parent_tag_name",
    root_tag_name = "root_tag_name",
    tier_level = "tier_level",
    tag_id = "tag_id",
    tag_id_list = "tag_id_list",
    tag_name = "tag_name",
}

export enum ResourceTagTableField {
    tag_id = "tag_id",
    tag_name = "tag_name",
    parent_tag_id = "parent_tag_id",
    parent_tag_name = "parent_tag_name",
    root_tag_name = "root_tag_name",
    tier_level = "tier_level",
    //
    created_on = "created_on",
    modified_on = "modified_on",
    actionMenu = "actionMenu",
}
