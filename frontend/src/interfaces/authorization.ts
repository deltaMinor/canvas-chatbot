import { Metadata } from ".";

import { UserEntitlement } from "./user";

export interface ResourceTagTreeSingle {
    metadata: Metadata;
    tag_id: string;
    tag_name: string;
    parent_tag_id: string;
    parent_nodes: string[];
    child_nodes: string[];
}

export interface UserAuthorization {
    user_id: string;
    entitled_project_id_list: string[];
    entitled_tag_id_list: string[];
    entitlements: UserEntitlement[];
    is_admin: boolean;
    is_superuser: boolean;
    permissions: string[];
    project_permissions_mapping: { [key: string]: string[] };
    tag_permissions_mapping: { [key: string]: string[] };
    user_permissions_mapping: { [key: string]: string[] };
    resource_tag_tree: ResourceTagTreeSingle[];
    user_role_name_mapping: { [key: string]: string };
    user_permission_doc: UserPermissionDoc;
}

export interface UserAuthenticationTokenState {
    user_id: string;
    username: string;
    is_temp_password?: boolean;
}

export interface UserAuthentication extends UserAuthenticationTokenState {
    encoded_token: string;
}

export interface IsAuthorizedCore<T = boolean | null> {
    create: T;
    read: T;
    update: T;
    delete: T;
}

export interface IsAuthorized<T = boolean | null> extends IsAuthorizedCore<T> {
    fields?: { [key: string]: IsAuthorized<T> };
}

export interface UserPermissionDoc {
    token: IsAuthorized<string>;
    app_tnc: IsAuthorized<string>;
    app_version: IsAuthorized<string>;
    feedback_form: IsAuthorized<string>;
    integration: IsAuthorized<string>;
    jira_issue: IsAuthorized<string>;
    jira_options: IsAuthorized<string>;
    kb_attack_flow: IsAuthorized<string>;
    kb_csa_ccop: IsAuthorized<string>;
    kb_nist_csf: IsAuthorized<string>;
    kb_isoiec_27001: IsAuthorized<string>;
    kb_gt_llm_register: IsAuthorized<string>;
    kb_im8: IsAuthorized<string>;
    kb_mitre: IsAuthorized<string>;
    kb_mitre_parsed: IsAuthorized<string>;
    kb_owasp_register: IsAuthorized<string>;
    kb_tosca: IsAuthorized<string>;
    master_cq: IsAuthorized<string>;
    master_cq_template: IsAuthorized<string>;
    master_diagram_template: IsAuthorized<string>;
    master_mitigation: IsAuthorized<string>;
    master_mitigation_log: IsAuthorized<string>;
    master_register: IsAuthorized<string>;
    master_register_log: IsAuthorized<string>;
    project: IsAuthorized<string>;
    projects: IsAuthorized<string>;
    project_duplicate: IsAuthorized<string>;
    project_export: IsAuthorized<string>;
    project_import: IsAuthorized<string>;
    project_cq: IsAuthorized<string>;
    project_cq_clear: IsAuthorized<string>;
    project_cq_log: IsAuthorized<string>;
    project_cq_resume: IsAuthorized<string>;
    project_cq_start_from_blank: IsAuthorized<string>;
    project_cq_start_from_template: IsAuthorized<string>;
    project_cq_submit: IsAuthorized<string>;
    project_cq_template: IsAuthorized<string>;
    project_diagram: IsAuthorized<string>;
    project_diagram_architecture_generate: IsAuthorized<string>;
    project_diagram_data_flow_generate: IsAuthorized<string>;
    project_diagram_file_cacti: IsAuthorized<string>;
    project_diagram_file_json: IsAuthorized<string>;
    project_diagram_file_image: IsAuthorized<string>;
    project_diagram_file_module: IsAuthorized<string>;
    project_diagram_file_terraform: IsAuthorized<string>;
    project_diagram_file_xml: IsAuthorized<string>;
    project_diagram_log: IsAuthorized<string>;
    project_diagram_tosca_validate: IsAuthorized<string>;
    project_log: IsAuthorized<string>;
    project_statistics: IsAuthorized<string>;
    project_register: IsAuthorized<string>;
    project_register_history: IsAuthorized<string>;
    project_assessment: IsAuthorized<string>;
    project_assessment_cq: IsAuthorized<string>;
    project_assessment_config: IsAuthorized<string>;
    project_assessment_diagram: IsAuthorized<string>;
    project_assessment_heartbeat: IsAuthorized<string>;
    project_assessment_heartbeat_running: IsAuthorized<string>;
    project_assessment_abort: IsAuthorized<string>;
    project_assessment_llm: IsAuthorized<string>;
    project_assessment_reset: IsAuthorized<string>;
    project_assessment_restore: IsAuthorized<string>;
    project_register_llm_scenarios: IsAuthorized<string>;
    project_register_reset: IsAuthorized<string>;
    project_register_log: IsAuthorized<string>;
    resource_tag: IsAuthorized<string>;
    resource_tags: IsAuthorized<string>;
    resource_tag_log: IsAuthorized<string>;
    user: IsAuthorized<string>;
    users: IsAuthorized<string>;
    user_credits: IsAuthorized<string>;
    user_credits_refresh: IsAuthorized<string>;
    user_log: IsAuthorized<string>;
    user_permission_doc: IsAuthorized<string>;
    user_policy_doc: IsAuthorized<string>;
    user_role_doc: IsAuthorized<string>;
    user_policy_option: IsAuthorized<string>;
    user_role_option: IsAuthorized<string>;
}

export interface UserPolicy {
    policy_key: string;
    policy_name: string;
    extends: string[];
    permissions: string[];
}

export interface UserPolicyDoc {
    policy_key: string;
    policy_name: string;
    extends: string[];
    permissions: string[];
    is_admin: boolean;
}

export interface UserRoleDoc {
    role_key: string;
    role_name: string;
    policy_association: string[];
    is_admin: boolean;
}

export interface UserRoleDocWithPermissions extends UserRoleDoc {
    permissions: string[];
}
export interface PermissionDictSingle {
    [key: string]: string | PermissionDictSingle;
}
