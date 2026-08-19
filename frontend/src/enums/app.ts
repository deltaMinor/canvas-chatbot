export enum UserPolicyKey {
    unrestricted_kb_read_only_permissions = "unrestricted_kb_read_only_permissions",
    restricted_kb_read_only_permissions = "restricted_kb_read_only_permissions",
    base_permissions = "base_permissions",
    project_read_only_permissions = "project_read_only_permissions",
    project_permissions = "project_permissions",
    project_register_read_only_permissions = "project_register_read_only_permissions",
    project_assessment_permissions = "project_assessment_permissions",
    project_assessment_delete_permissions = "project_assessment_delete_permissions",
    project_register_permissions = "project_register_permissions",
    master_register_read_only_permissions = "master_register_read_only_permissions",
    master_register_permissions = "master_register_permissions",
    admin_permissions = "admin_permissions",
    resource_tag_tier_level_permissions = "resource_tag_tier_level_permissions",
}

export enum UserRole {
    admin = "admin",
    superAdmin = "superAdmin",
    guest = "guest",
    observer = "observer",
    developer = "developer",
    manager = "manager",
    consultant = "consultant",
    director = "director",
    masterRegisterEditor = "masterRegisterEditor",
}

export enum GroupManagementTask {
    deleteGroup = "deleteGroup",
    resetName = "resetName",
}

export enum GroupManagementTaskName {
    deleteGroup = "Delete Group",
    resetName = "Change Name",
}

export enum ProjectManagementTask {
    deleteProject = "deleteProject",
    duplicateProject = "duplicateProject",
    exportProject = "exportProject",
    modifyProject = "modifyProject",
    resetGroup = "resetGroup",
    resetName = "resetName",
}

export enum ProjectManagementTaskName {
    deleteProject = "Delete Project",
    duplicateProject = "Duplicate Project",
    modifyProject = "Modify Project",
    exportProject = "Export Project",
    resetGroup = "Change Group",
    resetName = "Change Name",
}

export enum UserManagementTask {
    deleteUser = "deleteUser",
    modifyProjectAccess = "modifyProjectAccess",
    modifySuperuser = "modifySuperuser",
    modifyUser = "modifyUser",
    resetEmail = "resetEmail",
    resetPassword = "resetPassword",
    resetUsername = "resetUsername",
    revokeToken = "revokeToken",
}

export enum UserManagementTaskName {
    deleteUser = "Delete User",
    modifyProjectAccess = "Modify Project Access",
    modifySuperuser = "Modify Superuser",
    modifyUser = "Modify User",
    resetEmail = "Change Email",
    resetPassword = "Reset Password",
    resetUsername = "Reset Username",
    revokeToken = "Revoke Token",
}

export enum ResourceTagManagementTask {
    deleteResourceTag = "deleteResourceTag",
    modifyResourceTag = "modifyResourceTag",
    modifyResourceTagTierLevel = "modifyResourceTagTierLevel",
}

export enum ResourceTagManagementTaskName {
    deleteResourceTag = "Delete Resource Tag",
    modifyResourceTag = "Modify Resource Tag",
    modifyResourceTagTierLevel = "Modify Tier Level",
}

export enum UserStatus {
    active = "active",
    disabled = "disabled",
    pending = "pending",
}

export enum Group {
    created = "created",
    group_id = "group_id",
    group_id_list = "group_id_list",
    group_name = "group_name",
    group_project_count = "group_project_count",
}

export enum DefaultGroup {
    Placeholder = "Placeholder",
    Unassigned = "Unassigned",
}

export enum JWT {
    access_token = "access_token",
    authorization = "HTTP_AUTHORIZATION",
    expires_at = "expires_at",
    expires_in = "expires_in",
    scope = "scope",
    token_type = "token_type",
    iss = "iss",
    iat = "iat",
    exp = "exp",
    jti = "jti",
}

export enum PermissionType {
    role = "role",
    policy = "policy",
    custom = "custom",
}

export enum User {
    confirmPassword = "confirmPassword",
    currentPassword = "currentPassword",
    email = "email",
    email_verified = "email_verified",
    entitlements = "entitlements",
    group_id_list = "group_id_list",
    groups = "groups",
    is_admin = "is_admin",
    is_logged_in = "is_logged_in",
    is_superuser = "is_superuser",
    is_temp_password = "is_temp_password",
    login_metadata = "login_metadata",
    notifications = "notifications",
    password = "password",
    permission_type = "permission_type",
    permissions = "permissions",
    project_count = "project_count",
    resource_tag = "resource_tag",
    resource_tags = "resource_tags",
    role = "role",
    roles = "roles",
    user_id = "user_id",
    user_id_list = "user_id_list",
    user_status = "user_status",
    username = "username",
}

export enum UserFieldKey {
    currentPassword = "currentPassword",
    confirmPassword = "confirmPassword",
    email = "email",
    entitlements = "entitlements",
    is_admin = "is_admin",
    is_superuser = "is_superuser",
    is_temp_password = "is_temp_password",
    last_login = "last_login",
    password = "password",
    user_id = "user_id",
    user_status = "user_status",
    username = "username",
    //
    created_on = "created_on",
    modified_on = "modified_on",
    actions = "actions",
    actionMenu = "actionMenu",
}

export enum SessionStorageUserKey {
    shouldIgnoreResetTempPassword = "shouldIgnoreResetTempPassword",
}

export enum LocalStorageKey {
    appVersionInfoPrompt = "appVersionInfoPrompt",
}

export enum UuidIdentifierKey {
    assessment = "assessment",
    dataGridDebounce = "dataGridDebounce",
    diagramCanvas = "diagramCanvas",
    diagramEdge = "diagramEdge",
    diagramImage = "diagramImage",
    diagramLineSegment = "diagramLineSegment",
    diagramNode = "diagramNode",
    project = "project",
    resourceTag = "resourceTag",
    snackbar = "snackbar",
    user = "user",
}

export enum ShortUuidIdentifierKey {
    diagramWarning = "diagramWarning",
    formCard = "formCard",
    processItem = "processItem",
    formOption = "formOption",
    formTextSelectable = "formTextSelectable",
    mitigation = "mitigation",
    mitigationCustom = "mitigationCustom",
    tableRow = "tableRow",
}
