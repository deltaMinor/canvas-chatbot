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

export interface AdminPolicyDerivedState {
    admin_policies: string[];
    admin_permissions: string[];
}
