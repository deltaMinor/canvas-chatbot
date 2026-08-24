from enum import Enum


class MitreDocType(Enum):
    mitre_docs = "mitre_docs"


class MitreDomain(Enum):
    ics = "ics"
    mobile = "mobile"
    enterprise = "enterprise"
    atlas = "atlas"
    embed = "embed"
    fight = "fight"


class MitreType(Enum):
    analytic = "analytic"
    association = "association"
    campaign = "campaign"
    dataComponent = "dataComponent"
    dataSource = "dataSource"
    detectionStrategy = "detectionStrategy"
    group = "group"
    mitigation = "mitigation"
    mitigationUse = "mitigationUse"
    property = "property"
    software = "software"
    tactic = "tactic"
    technique = "technique"


class MitreTypeLabel(Enum):
    analytic = "Analytic"
    association = "Association"
    campaign = "Campaign"
    dataComponent = "Data Component"
    dataSource = "Data Source"
    detectionStrategy = "Detection Strategy"
    group = "Group"
    mitigation = "Mitigation"
    mitigationUse = "Mitigation Use"
    property = "Property"
    software = "Software"
    tactic = "Tactic"
    technique = "Technique"


class CanvasType(Enum):
    architecture = "architecture"


class CanvasNodeType(Enum):
    architecture = "architecture"


class CanvasEdgeType(Enum):
    architecture = "architecture"


class CanvasNodeVariantType(Enum):
    clusterNode = "clusterNode"
    infoNode = "infoNode"


class CardFieldId(Enum):
    card_data = "field_Zz8qcXRmTdRthKaSaSsYGp"
    card_devices = "field_Beug2fybTozsC4q9GzrisZ"
    card_feature = "field_kjoQLrFNiwtPd6PSFiF4ui"
    card_intent = "field_SQgayC4tL9q294ao54XnYD"
    card_interface = "field_nd6pU88Fpe5mtLkyHMTnPW"
    card_outcome = "field_TNPsydHStdtNvySMqfV8qF"
    card_title = "field_RcTZUir6t69LEoJv9ipQsQ"
    card_users = "field_KxsU6BvQmFPtXRcH44ZhKj"


class KnowledgebaseSource(Enum):
    attack = "MITRE ATT&CK"
    masterRiskRegister = "Master Risk Register"
    threatScenario = "Threat Scenario"
    llm = "LLM"
    others = "Others"


class AttackFlowEngineVersion(Enum):
    v1 = "Engine V1"
    v2 = "Engine V2"


class MitigationMappingKbSource(Enum):
    kbIM8 = "IM8"
    kbCsaCCoP = "CSA Codes Of Practice"
    kbNistCSF = "NIST CSF"
    kbISOIEC27001 = "ISO/IEC 27001"


class CompliancePolicyEnum(Enum):
    im8 = "im8"
    ccop = "ccop"
    csf = "csf"
    iso = "iso"


class Collection(Enum):
    ##################################################
    ## Risk Register
    ##################################################
    kb_attack_flow = "kb_attack_flow"
    kb_attack_graph_rule = "kb_attack_graph_rule"
    kb_generation_rule = "kb_generation_rule"
    kb_generation_rules_library = "kb_generation_rules_library"
    kb_gt_llm_register = "kb_gt_llm_register"
    kb_csa_ccop = "kb_csa_ccop"
    kb_im8 = "kb_im8"
    kb_nist_csf = "kb_nist_csf"
    kb_isoiec_27001 = "kb_isoiec_27001"
    kb_llm_prompt = "kb_llm_prompt"
    kb_mitre = "kb_mitre"
    kb_mitre_parsed = "kb_mitre_parsed"
    kb_owasp_register = "kb_owasp_register"
    kb_priority_rules = "kb_priority_rules"
    kb_question_to_model = "kb_question_to_model"
    kb_assessment_config = "kb_assessment_config"
    kb_register_mapping = "kb_register_mapping"
    master_mitigation = "master_mitigation"
    master_register = "master_register"
    assessment_cq = "assessment_cq"
    assessment_diagram = "assessment_diagram"
    assessment_history = "assessment_history"
    assessment_mitigation = "assessment_mitigation"
    project_assessment = "project_assessment"
    project_assessment_config = "project_assessment_config"
    project_assessment_config_files = "project_assessment_config_files"
    project_register = "project_register"
    project_register_history = "project_register_history"
    #
    kb_attack_flow_log = "kb_attack_flow_log"
    kb_generation_rule_log = "kb_generation_rule_log"
    kb_generation_rules_library_log = "kb_generation_rules_library_log"
    kb_gt_llm_register_log = "kb_gt_llm_register_log"
    kb_im8_log = "kb_im8_log"
    kb_csa_ccop_log = "kb_csa_ccop_log"
    kb_nist_csf_log = "kb_nist_csf_log"
    kb_isoiec_27001_log = "kb_isoiec_27001_log"
    kb_llm_log = "kb_llm_log"
    kb_mitre_log = "kb_mitre_log"
    kb_mitre_parsed_log = "kb_mitre_parsed_log"
    kb_owasp_register_log = "kb_owasp_register_log"
    kb_priority_rules_log = "kb_priority_rules_log"
    kb_question_to_model_log = "kb_question_to_model_log"
    kb_assessment_config_log = "kb_assessment_config_log"
    kb_register_mapping_log = "kb_register_mapping_log"
    master_mitigation_log = "master_mitigation_log"
    master_register_log = "master_register_log"
    project_assessment_log = "project_assessment_log"
    project_register_history_log = "project_register_history_log"
    project_register_log = "project_register_log"
    ##################################################
    ## Application
    ##################################################
    app_tnc = "app_tnc"
    app_version = "app_version"
    feedback_form = "feedback_form"
    master_cq = "master_cq"
    master_cq_template = "master_cq_template"
    project_cq = "project_cq"
    project_cq_template = "project_cq_template"
    projects = "projects"
    resource_tag = "resource_tag"
    tool_history = "tool_history"
    user_credits = "user_credits"
    ai_invocation_log = "ai_invocation_log"
    credit_transaction_log = "credit_transaction_log"
    user_plan_config = "user_plan_config"
    #
    app_tnc_log = "app_tnc_log"
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
    project_ad_file_module = "project_ad_file_module"
    project_ad_file_terraform = "project_ad_file_terraform"
    project_diagram_file = "project_diagram_file"
    #
    kb_tosca_log = "kb_tosca_log"
    master_ad_template_log = "master_ad_template_log"
    project_ad_file_log = "project_ad_file_log"
    project_ad_file_module_log = "project_ad_file_module_log"
    project_ad_file_terraform_log = "project_ad_file_terraform_log"
    project_ad_log = "project_ad_log"
    project_ad_chat_history_log = "project_ad_chat_history_log"
    project_diagram_file_log = "project_diagram_file_log"
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


class CQFieldId(Enum):
    user_story_card = "field_aYTgbRTobNfeTx8qfgNaYX"


class DefaultGroup(Enum):
    Placeholder = "Placeholder"
    Unassigned = "Unassigned"


class GenerationRules(Enum):
    rules = "rules"


class Group(Enum):
    metadata = "metadata"
    group_id = "group_id"
    group_name = "group_name"
    created = "created"
    group_project_count = "group_project_count"


class JWT(Enum):
    access_token = "access_token"
    scope = "scope"
    token_type = "token_type"
    expires_in = "expires_in"
    expires_at = "expires_at"
    authorization = "HTTP_AUTHORIZATION"
    iss = "iss"
    iat = "iat"
    exp = "exp"
    jti = "jti"


class MasterCQ(Enum):
    schema_ = "schema_"
    dependentFields = "dependentFields"
    idList = "idList"
    initialValues = "initialValues"
    metadata = "metadata"
    sections = "sections"


class MasterRegister(Enum):
    schema_ = "schema_"
    category_options = "category_options"
    risk_info = "risk_info"
    risk_scenarios = "risk_scenarios"
    subcategory_options = "subcategory_options"


class MasterTemplate(Enum):
    schema_ = "schema_"
    conception_questionnaire_templates = "conception_questionnaire_templates"


class Metadata(Enum):
    created_on = "created_on"
    modified_on = "modified_on"
    submitted_on = "submitted_on"


class MetadataField(Enum):
    timestamp = "timestamp"
    user_id = "user_id"
    username = "username"
    data = "data"


class Parameter(Enum):
    keyName = "keyName"
    keyMeaning = "keyMeaning"
    parameters = "parameters"


class Position(Enum):
    left = "left"
    top = "top"
    right = "right"
    bottom = "bottom"


class Project(Enum):
    architecture_diagram = "architecture_diagram"
    conception_questionnaire = "conception_questionnaire"
    conception_template = "conception_template"
    integrations = "integrations"
    metadata = "metadata"
    project_group = "project_group"
    project_group_id = "project_group_id"
    project_id = "project_id"
    project_name = "project_name"
    project_register = "project_register"
    resource_tags = "resource_tags"
    tier_level = "tier_level"
    user_count = "user_count"


class ProjectAD(Enum):
    canvas = "canvas"
    card_nodes = "card_nodes"
    project_id = "project_id"


class ProjectCQ(Enum):
    dependentFields = "dependentFields"
    initialValues = "initialValues"
    metadata = "metadata"
    project_id = "project_id"
    saved = "saved"
    submitted = "submitted"


class ProjectRegister(Enum):
    project_id = "project_id"
    risk_scenarios = "risk_scenarios"
    review = "review"
    assessment = "assessment"
    integration = "integration"
    mitigation = "mitigation"
    schema_ = "schema_"
    ref = "ref"


class ProjectRegisterHistory(Enum):
    project_id = "project_id"
    design_stats = "design_stats"
    history = "history"
    # im8_stats = "im8_stats"
    last_timestamp = "last_timestamp"
    total_stats = "total_stats"
    compliance_stats = "compliance_stats"


class ProjectTemplate(Enum):
    conception_questionnaire_templates = "conception_questionnaire_templates"
    project_id = "project_id"
    schema_ = "schema_"


class QuestionnaireData(Enum):
    schema_ = "schema_"
    metadata = "metadata"
    values = "values"


class RegisterGenerationRequest(Enum):
    project = "project"
    risk_scenarios = "risk_scenarios"
    generation_rules = "generation_rules"


class RegisterType(Enum):
    master_register = "master_register"
    project_register = "project_register"


class RiskRating(Enum):
    One = ("Low",)
    Two = ("Medium",)
    Three = ("Medium High",)
    Four = ("High",)
    Five = ("Very High",)
    Unspecified = ""


class ScenarioTags(Enum):
    prioritized = "Prioritized"
    questionnaireUpdate = "Questionnaire Update"
    masterScenarioUpdate = "Master Risk Scenario Update"
    deprecated = "Deprecated"


class MetapathConditionType(Enum):
    path = "path_pattern"
    mitigationCheck = "mitigation_check_pattern"


class MetapathObjectType(Enum):
    node = "node"
    pathCondition = "path_condition"


class TokenKey(Enum):
    user_id = "user_id"
    username = "username"
    hashed_token = "hashed_token"
    token_type = "token_type"
    metadata = "metadata"


class TokenType(Enum):
    login = "login"
    refresh = "refresh"
    resetPassword = "resetPassword"


class User(Enum):
    email = "email"
    entitlements = "entitlements"
    group_id_list = "group_id_list"
    groups = "groups"
    is_logged_in = "is_logged_in"
    is_superuser = "is_superuser"
    is_temp_password = "is_temp_password"
    metadata = "metadata"
    notifications = "notifications"
    password = "password"
    project_id_list = "project_id_list"
    roles = "roles"
    user_id = "user_id"
    user_id_list = "user_id_list"
    user_status = "user_status"
    username = "username"


class OnboardingStep(Enum):
    welcome = "welcome"
    free_trial_tnc = "free_trial_tnc"
    general_tnc = "general_tnc"


class TncType(Enum):
    free_trial_tnc = "free_trial_tnc"
    general_tnc = "general_tnc"


class UserStatus(Enum):
    active = "active"
    pending = "pending"
    disabled = "disabled"


class UserStatusRank(Enum):
    active = 1
    pending = 2
    disabled = 0


class StixObjectType(Enum):
    attack_action = "attack-action"
    attack_asset = "attack-asset"
    attack_condition = "attack-condition"
    attack_flow = "attack-flow"
    attack_operator = "attack-operator"
    attack_pattern = "attack-pattern"
    extension_definition = "extension-definition"
    attack_flow_mapping = "attack-flow-mapping"
    identity = "identity"


class StixExtensionType(Enum):
    new_sdo = "new-sdo"
    new_sco = "new-sco"
    property_extension = "property-extension"


class StixScopeType(Enum):
    incident = "incident"
    campaign = "campaign"
    threat_actor = "threat-actor"
    malware = "malware"
    other = "other"


class StixOperatorType(Enum):
    AND = "AND"
    OR = "OR"


class ImportDataType(Enum):
    PROJECT = "project"
    PROJECT_CQ = "project_cq"
    PROJECT_CQ_TEMPLATE = "project_cq_template"
    PROJECT_DIAGRAM = "project_diagram"
    PROJECT_REGISTER = "project_register"
    PROJECT_ASSESSMENT_HISTORY = "project_assessment_history"
    ASSESSMENT_MITIGATION = "assessment_mitigation"


class UserDocKey(Enum):
    permission = "permission"
    policy = "policy"
    role = "role"


class UserPermissionType(Enum):
    role = "role"
    policy = "policy"
    custom = "custom"


class LLM(Enum):
    llama_3_2 = "llama_3_2"
    gemini_3_flash = "gemini_3_flash"
    openai_gpt_5_2_api = "openai_gpt_5_2_api"
    openai_gpt_4_1_api = "openai_gpt_4_1_api"
    openai_gpt_5_api = "openai_gpt_5_api"
    openai_gpt_5_4_api = "openai_gpt_5_4_api"
    openai_gpt_5_5_api = "openai_gpt_5_5_api"
    qwen_3_8b_batch = "qwen_3_8b_batch"
    qwen_3_32b_bedrock = "qwen_3_32b_bedrock"
    ministral_3_8b_batch = "ministral_3_8b_batch"


class LLMGenerationOption(Enum):
    architecture = "single_prompt_architecture"
    chain = "chain_prompt"
    dataflow = "single_prompt_dataflow"
    diagram = "single_prompt_diagram"
    mitigation = "mitigation"
    single = "single_prompt"
    threat_impact = "threat_impact"
    threat_attributes = "threat_attributes"


class PromptType(Enum):
    architecture = "single_prompt_architecture"
    chain = "chain_prompt"
    dataflow = "single_prompt_dataflow"
    diagram = "single_prompt_diagram"
    mitigation = "mitigation"
    single = "single_prompt"
    threat_impact = "threat_impact"
    threat_attributes = "threat_attributes"


class PromptRole(Enum):
    securityConsultant = "Security Consultant"
    cybersecurityExpert = "Cybersecurity Expert"
    seniorAnalyst = "Senior Cybersecurity Analyst"
    tmExpert = "Threat Modeling Expert"
    projectManager = "Project Manager"


class PipelineEngineJobType(Enum):
    run_main_engine = "run_main_engine"
    run_llm_engine = "run_llm_engine"
    run_pentest_engine = "run_pentest_engine"
    run_graph_reasoning_engine = "run_graph_reasoning_engine"


class AssessmentLifecycle(Enum):
    """Full pipeline lifecycle determined by user choices at assessment configuration time."""

    no_ai_no_pentest = "no_ai_no_pentest"
    with_ai = "with_ai"
    with_pentest = "with_pentest"
    with_ai_and_pentest = "with_ai_and_pentest"
    with_graph_reasoning = "with_graph_reasoning"
    with_ai_and_graph_reasoning = "with_ai_and_graph_reasoning"


class ProgressStage(Enum):
    init = "init"
    setup = "setup"
    main = "main"
    general = "general"
    path = "path"
    llm = "llm"
    wrapup = "wrapup"
    complete = "complete"


class Handle(Enum):
    SOURCE_BOTTOM = "source_bottom"
    SOURCE_LEFT = "source_left"
    SOURCE_RIGHT = "source_right"
    SOURCE_TOP = "source_top"
    TARGET_BOTTOM = "target_bottom"
    TARGET_LEFT = "target_left"
    TARGET_RIGHT = "target_right"
    TARGET_TOP = "target_top"


class NodeTypes(Enum):
    AVAILABILITY_ZONE = "AVAILABILITY_ZONE"
    DEFAULT = "DEFAULT"
    IGW = "IGW"
    INTERNET = "INTERNET"
    SUBNET = "SUBNET"
    SUBNET_PRIVATE = "SUBNET_PRIVATE"
    SUBNET_PUBLIC = "SUBNET_PUBLIC"
    VPC = "VPC"
    WAF = "WAF"


class DrawPriority(Enum):
    AVAILABILITY_ZONE = 1
    DEFAULT = 2
    IGW = 3
    INTERNET = 2
    SUBNET = 2
    SUBNET_PRIVATE = 3
    SUBNET_PUBLIC = 4
    VPC = 1
    WAF = 2


class Alignment(Enum):
    HORIZONTAL = "horizontal"
    VERTICAL = "vertical"


# order to set position based on node type
DrawOrder = [
    NodeTypes.WAF,
    NodeTypes.INTERNET,
    NodeTypes.VPC,
    NodeTypes.IGW,
    NodeTypes.DEFAULT,
    NodeTypes.AVAILABILITY_ZONE,
    NodeTypes.SUBNET,
]
