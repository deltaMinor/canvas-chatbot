from enum import Enum


class AuditLogTargetKey(Enum):
    ##################################################
    ## Risk Register
    ##################################################
    kb_mitre = "kb_mitre"
    kb_mitre_parsed = "kb_mitre_parsed"
    kb_attack_flow = "kb_attack_flow"
    kb_generation_rule = "kb_generation_rule"
    kb_generation_rules_library = "kb_generation_rules_library"
    kb_im8 = "kb_im8"
    kb_llm_prompt = "kb_llm_prompt"
    kb_priority_rules = "kb_priority_rules"
    kb_question_to_model = "kb_question_to_model"
    kb_register_config = "kb_register_config"
    kb_register_mapping = "kb_register_mapping"
    master_mitigation = "master_mitigation"
    master_register = "master_register"
    project_assessment = "project_assessment"
    project_register = "project_register"
    project_register_history = "project_register_history"
    #
    kb_attack_flow_log = "kb_attack_flow_log"
    #
    kb_mitre_log = "kb_mitre_log"
    kb_mitre_parsed_log = "kb_mitre_parsed_log"
    #
    kb_generation_rule_log = "kb_generation_rule_log"
    kb_generation_rules_library_log = "kb_generation_rules_library_log"
    kb_im8_log = "kb_im8_log"
    kb_llm_prompt_log = "kb_llm_prompt_log"
    kb_priority_rules_log = "kb_priority_rules_log"
    kb_question_to_model_log = "kb_question_to_model_log"
    kb_register_config_log = "kb_register_config_log"
    kb_register_mapping_log = "kb_register_mapping_log"
    master_mitigation_log = "master_mitigation_log"
    master_register_log = "master_register_log"
    project_assessment_log = "project_assessment_log"
    project_register_history_log = "project_register_history_log"
    project_register_log = "project_register_log"
    ##################################################
    ## Application
    ##################################################
    app_version = "app_version"
    feedback_form = "feedback_form"
    master_cq = "master_cq"
    master_cq_template = "master_cq_template"
    project_cq = "project_cq"
    project_cq_template = "project_cq_template"
    projects = "projects"
    resource_tag = "resource_tag"
    #
    app_version_log = "app_version_log"
    feedback_form_log = "feedback_form_log"
    master_cq_log = "master_cq_log"
    master_cq_template_log = "master_cq_template_log"
    project_cq_log = "project_cq_log"
    project_cq_template_log = "project_cq_template_log"
    project_log = "project_log"
    resource_tag_log = "resource_tag_log"
    ##################################################
    ## Architecture Diagram
    ##################################################
    kb_tosca = "kb_tosca"
    master_ad_template = "master_ad_template"
    project_ad = "project_ad"
    project_ad_file = "project_ad_file"
    project_ad_canvas = "project_ad_canvas"
    project_ad_edge = "project_ad_edge"
    project_ad_file_module = "project_ad_file_module"
    project_ad_file_terraform = "project_ad_file_terraform"
    project_ad_node = "project_ad_node"
    project_diagram_file = "project_diagram_file"
    #
    kb_tosca_log = "kb_tosca_log"
    master_ad_template_log = "master_ad_template_log"
    project_ad_file_log = "project_ad_file_log"
    project_ad_file_module_log = "project_ad_file_module_log"
    project_ad_file_terraform_log = "project_ad_file_terraform_log"
    project_ad_log = "project_ad_log"
    project_diagram_file_log = "project_diagram_file_log"
    project_ad_chat_history = "project_ad_chat_history"
    project_ad_chat_history_log = "project_ad_chat_history_log"
    ##################################################
    ## Authentication
    ##################################################
    integrations = "integrations"
    tokens = "tokens"
    user_permission_doc = "user_permission_doc"
    user_policy_doc = "user_policy_doc"
    user_role_doc = "user_role_doc"
    users = "users"
    #
    integrations_log = "integrations_log"
    token_log = "token_log"
    user_log = "user_log"
    user_permission_doc_log = "user_permission_doc_log"
    user_policy_doc_log = "user_policy_doc_log"
    user_role_doc_log = "user_role_doc_log"
    ##################################################
    ## Risk Register (fields)
    ##################################################
    actualMitigationMeasures = "actualMitigationMeasures"
    mitigation_measures = "mitigation_measures"
    recommendedMitigationMeasures = "recommendedMitigationMeasures"
    recommendedMitigationMeasuresHidden = "recommendedMitigationMeasuresHidden"
    risk_scenarios = "risk_scenarios"
    ##################################################
    ## Architecture Diagram (fields)
    ##################################################
    ##################################################


class AuditLogAction(Enum):
    create = "create"
    delete = "delete"
    init = "init"
    patch = "patch"
    unset = "unset"
    update = "update"
