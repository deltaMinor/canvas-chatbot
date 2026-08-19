import { Metadata } from ".";

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

export enum PermissionType {
    role = "role",
    policy = "policy",
    custom = "custom",
}

export interface UserEntitlement {
    permission_type: string;
    permissions: string[];
    policies: string[];
    roles: string[];
    tag_id: string;
    tag_name?: string;
}

export interface LoginMetadata {
    timestamp: string;
    session_id?: string;
    referrer?: string;
    authority?: string;
    user_agent?: string;
}

export interface TermsAndConditionsAcceptance {
    tnc_type: string;
    accepted: boolean;
    accepted_at?: string;
    version?: string;
}

export interface TncRequirement {
    tnc_type: string;
    required_version: string;
}

export interface TncInfo {
    required: TncRequirement[];
    missing: TncRequirement[];
}

export interface OnboardingStep {
    step_name: string;
    step_type?: string | null; // e.g., "tnc"
}

export interface OnboardingInfo {
    required_steps: OnboardingStep[];
    completed_steps: string[];
    is_complete?: boolean;
}

export interface UserNonSensitiveCoreFields {
    email: string;
    is_email_verified: boolean;
    is_temp_password: boolean;
    login_metadata?: LoginMetadata[];
    metadata: Metadata;
    onboarding?: OnboardingInfo;
    roles: string[];
    terms_and_conditions?: TermsAndConditionsAcceptance[];
    tnc_acceptance_records?: TermsAndConditionsAcceptance[];
    tnc?: TncInfo;
    user_id: string;
    user_status: string;
    username: string;
}

export interface UserCoreFields extends UserNonSensitiveCoreFields {
    password: string;
    is_admin: boolean;
    is_superuser: boolean;
    entitlements: UserEntitlement[];
}

export interface UserFormFields extends UserCoreFields {
    currentPassword: string;
    confirmPassword: string;
    role: string;
}

export interface UserAdminFields extends UserCoreFields {
    is_logged_in?: boolean;
}

export interface JWT_fields extends Pick<
    UserNonSensitiveCoreFields, //
    "username" | "user_id" | "is_temp_password"
> {
    iat: number;
    exp: number;
    iss: string;
    jti: string;
}

/**
 * Shape of the data block returned by POST /user/login.
 *
 * Tokens (access_token, refresh_token) are delivered exclusively as HttpOnly
 * cookies and are NEVER present in the response body — they are unreachable
 * by JavaScript by design.
 */
export interface LoginTokenData {
    expires_in: number;
    user_id: string;
    username: string;
}

/**
 * Shape of the data block returned by POST /user/refresh.
 *
 * New tokens are set as HttpOnly cookies by the server, not returned in the body.
 */
export interface RefreshTokenData {
    expires_in: number;
    user_id: string;
    username: string;
}

export interface UserNotification {
    created: string;
    message: string;
    type: string;
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
