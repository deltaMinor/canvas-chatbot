export enum ProjectEnum {
    integrations = "integrations",
    jira_project_key = "jira_project_key",
    jira_site_name = "jira_site_name",
    //
    project_file = "project_file",
    project_id = "project_id",
    project_name = "project_name",
    project_progress = "project_progress",
    project_status = "project_status",
    resource_tags = "resource_tags",
    //
    progress = "progress",
    project_group = "project_group",
    project_group_id = "project_group_id",
    project_group_name = "project_group_name",
    project_id_list = "project_id_list",
    resource_tag_names = "resource_tag_names",
    user_count = "user_count",
}

export enum ProjectResourceTag {
    team = "team",
    agency = "agency",
    division = "division",
    ministry = "ministry",
}

export enum ProjectSettings {
    generation = "generation",
    displayFrameworks = "displayFrameworks",
}

export enum ProjectSettingsSection {
    reset = "reset",
    generation = "generation",
    displayFrameworks = "displayFrameworks",
    integration = "integration",
}

export enum ProjectStatusEnum {
    ACTIVE = "active",
    DISABLED = "disabled",
}

export enum ProjectTableFieldsEnum {
    project_id = "project_id",
    project_name = "project_name",
    project_progress = "project_progress",
    project_status = "project_status",
    resource_tags = "resource_tags",
    tier_level = "tier_level",
    //
    modified_on = "modified_on",
    created_on = "created_on",
    actions = "actions",
    actionMenu = "actionMenu",
}

export enum GenerationSettingsEnum {
    allowMasterRegisterGeneration = "allowMasterRegisterGeneration",
}

export enum ProjectCactiFileField {
    data = "data",
    file_id = "file_id",
    filename = "filename",
    timestamp = "timestamp",
    project_id = "project_id",
    metadata = "metadata",
    select = "select",
    delete = "delete",
}

export enum ProjectXMLFileField {
    data = "data",
    file_id = "file_id",
    filename = "filename",
    timestamp = "timestamp",
    project_id = "project_id",
    metadata = "metadata",
    select = "select",
    delete = "delete",
}

export enum ProjectDiagramFileField {
    data = "data",
    file_id = "file_id",
    filename = "filename",
    timestamp = "timestamp",
    project_id = "project_id",
    metadata = "metadata",
    select = "select",
    delete = "delete",
}

export enum ProjectDiagramModuleFileField {
    file_id = "file_id",
    filename = "filename",
    created_on = "created_on",
    modified_on = "modified_on",
    select = "select",
    delete = "delete",
}

export enum ProjectDiagramTerraformFileField {
    file_id = "file_id",
    filename = "filename",
    created_on = "created_on",
    modified_on = "modified_on",
    select = "select",
    delete = "delete",
}

export enum UpdateTypeEnum {
    features = "Features",
    bug_fixes = "Bug Fixes",
}
