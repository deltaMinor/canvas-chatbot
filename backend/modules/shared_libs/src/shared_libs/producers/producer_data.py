producer_data_kb_attack_graph_rule = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_kb_attack_graph_rule_task",
        },
        "task_key_dict": {
            "find_single": "kb_attack_graph_rule",
        },
    },
}

producer_data_register_pipeline = {
    "task_queue": "register_pipeline_queue",
    "task_mappings": {
        "task_name_dict": {
            "run_pipeline": "register_pipeline.generate",
        },
        "task_key_dict": {},
    },
}

producer_data_diagram_pipeline_architecture = {
    "task_queue": "diagram_pipeline_queue",
    "task_mappings": {
        "task_name_dict": {
            "run_pipeline": "diagram_pipeline.generate_architecture",
        },
        "task_key_dict": {},
    },
}

producer_data_diagram_pipeline_topology = {
    "task_queue": "diagram_pipeline_queue",
    "task_mappings": {
        "task_name_dict": {
            "run_pipeline": "diagram_pipeline.generate_topology",
        },
        "task_key_dict": {},
    },
}

producer_data_engine_main = {
    "task_queue": "engine_main_queue",
    "task_mappings": {
        "task_name_dict": {
            "run_engine": "engine_main.generate",
        },
        "task_key_dict": {},
    },
}

producer_data_engine_llm = {
    "task_queue": "engine_llm_queue",
    "task_mappings": {
        "task_name_dict": {
            "run_llm": "engine_llm.generate",
            "run_executive_summary": "engine_llm.generate_executive_summary",
        },
        "task_key_dict": {},
    },
}

producer_data_engine_ext = {
    "task_queue": "engine_ext_queue",
    "task_mappings": {
        "task_name_dict": {
            "run_pentest": "engine_ext.generate",
        },
        "task_key_dict": {},
    },
}

producer_data_engine_graph_reasoning = {
    "task_queue": "engine_graph_reasoning_queue",
    "task_mappings": {
        "task_name_dict": {
            "run_graph_reasoning": "engine_graph_reasoning.generate",
        },
        "task_key_dict": {},
    },
}

producer_data_diagram_llm_architecture = {
    "task_queue": "diagram_llm_queue",
    "task_mappings": {
        "task_name_dict": {
            "run_llm": "diagram_llm_architecture.generate",
        },
        "task_key_dict": {},
    },
}

producer_data_diagram_llm_topology = {
    "task_queue": "diagram_llm_queue",
    "task_mappings": {
        "task_name_dict": {
            "run_llm": "diagram_llm_topology.generate",
        },
        "task_key_dict": {},
    },
}

producer_data_diagram_llm_dataflow = {
    "task_queue": "diagram_llm_queue",
    "task_mappings": {
        "task_name_dict": {
            "run_llm": "diagram_llm_dataflow.generate",
        },
        "task_key_dict": {},
    },
}

producer_data_kb_attack_flow = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_kb_attack_flow_task",
            "find_multiple": "register.create_get_kb_attack_flows_task",
            "update_single": "register.create_insert_kb_attack_flow_task",
            "delete_multiple": "register.create_delete_kb_attack_flows_task",
        },
        "task_key_dict": {
            "find_single": "kb_attack_flow",
            "find_multiple": "kb_attack_flows",
        },
    },
}

producer_data_tool_history = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_multiple": "application.create_get_tool_history_list_task",
            "update_single": "application.create_update_tool_history_task",
        },
        "task_key_dict": {
            "find_multiple": "tool_history",
        },
    },
}

producer_data_generation_rule = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_generation_rule_task",
        },
        "task_key_dict": {
            "find_single": "generation_rule",
        },
    },
}

producer_data_generation_rules_library = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_generation_rules_library_task",
        },
        "task_key_dict": {
            "find_single": "generation_rules_library",
        },
    },
}

producer_data_kb_owasp_register = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_kb_owasp_register_task",
        },
        "task_key_dict": {
            "find_single": "kb_owasp_register",
        },
    },
}

producer_data_kb_gt_llm_register = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_kb_gt_llm_register_task",
        },
        "task_key_dict": {
            "find_single": "kb_gt_llm_register",
        },
    },
}

producer_data_kb_llm_prompt = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_kb_llm_prompt_task",
        },
        "task_key_dict": {
            "find_single": "kb_llm_prompt",
        },
    },
}

producer_data_kb_tosca = {
    "task_collection_name": "kb_tosca",
    "task_queue": "diagram_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "diagram.create_get_kb_tosca_task",
        },
        "task_key_dict": {"find_single": "kb_tosca"},
    },
}

producer_data_kb_assessment_config = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_kb_assessment_config_task",
        },
        "task_key_dict": {
            "find_single": "kb_assessment_config",
        },
    },
}


producer_data_master_ad_template = {
    "task_collection_name": "master_ad_template",
    "task_queue": "diagram_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "diagram.create_get_master_ad_template_task",
            "find_multiple": "diagram.create_get_master_ad_templates_task",
        },
        "task_key_dict": {
            "find_single": "master_ad_template",
            "find_multiple": "master_ad_templates",
        },
    },
}

producer_data_master_cq_template = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "application.create_get_master_cq_template_task",
            "update_single": "application.create_update_master_cq_template_task",
        },
        "task_key_dict": {
            "find_single": "master_cq_template",
        },
    },
}

producer_data_master_cq = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "application.create_get_master_cq_task",
            "update_single": "application.create_update_master_cq_task",
        },
        "task_key_dict": {
            "find_single": "master_cq",
        },
    },
}

producer_data_master_register_logs = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_multiple": "register.create_get_master_register_log_list_task",
        },
        "task_key_dict": {
            "find_multiple": "master_register_log_list",
        },
    },
}

producer_data_master_register = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_master_register_task",
            "update_single": "register.create_update_master_register_task",
        },
        "task_key_dict": {
            "find_single": "master_register",
        },
    },
}

producer_data_master_mitigation = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_master_mitigation_task",
            "update_single": "register.create_update_master_mitigation_task",
        },
        "task_key_dict": {
            "find_single": "master_mitigation",
        },
    },
}


producer_data_priority_rules = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_priority_rules_task",
        },
        "task_key_dict": {
            "find_single": "priority_rules",
        },
    },
}

producer_data_project_diagram_file = {
    "task_collection_name": "project_diagram_file",
    "task_queue": "diagram_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "diagram.create_get_project_diagram_file_task",
            "update_single": "diagram.create_update_project_diagram_file_task",
            "delete_multiple": "diagram.create_delete_project_diagram_file_task",
        },
        "task_key_dict": {
            "find_single": "project_diagram_file",
        },
    },
}

producer_data_project_ad_file = {
    "task_collection_name": "project_ad_file",
    "task_queue": "diagram_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_multiple_files": "diagram.create_get_project_ad_files_task",
            "insert_single_file": "diagram.create_insert_project_ad_file_task",
            "rename_single_file": "diagram.create_rename_project_ad_file_task",
            "delete_multiple_files": "diagram.create_delete_project_ad_files_task",
        },
        "task_key_dict": {
            "find_multiple_files": "project_ad_files",
        },
    },
}

producer_data_project_ad_file_module = {
    "task_collection_name": "project_ad_file",
    "task_queue": "diagram_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_multiple_files": "diagram.create_get_module_files_task",
            "insert_single_file": "diagram.create_insert_module_file_task",
            "delete_multiple_files": "diagram.create_delete_module_files_task",
        },
        "task_key_dict": {
            "find_multiple_files": "module_files",
        },
    },
}

producer_data_project_ad_file_terraform = {
    "task_collection_name": "project_ad_file",
    "task_queue": "diagram_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_multiple_files": "diagram.create_get_terraform_files_task",
            "insert_single_file": "diagram.create_insert_terraform_file_task",
            "delete_multiple_files": "diagram.create_delete_terraform_files_task",
        },
        "task_key_dict": {
            "find_multiple_files": "terraform_files",
        },
    },
}

producer_data_project_ad = {
    "task_collection_name": "project_ad",
    "task_queue": "diagram_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "diagram.create_get_project_ad_task",
            "find_multiple": "diagram.create_get_project_ads_task",
            "update_single": "diagram.create_update_project_ad_task",
            "delete_multiple": "diagram.create_delete_project_ads_task",
        },
        "task_key_dict": {
            "find_single": "project_ad",
            "find_multiple": "project_ads",
        },
    },
}


producer_data_project_cq_template = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "application.create_get_project_cq_template_task",
            "update_single": "application.create_update_project_cq_template_task",
            "delete_multiple": "application.create_delete_project_cq_template_task",
        },
        "task_key_dict": {
            "find_single": "project_cq_template",
        },
    },
}

producer_data_project_cq = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "application.create_get_project_cq_task",
            "find_multiple": "application.create_get_project_cqs_task",
            "update_single": "application.create_update_project_cq_task",
            "delete_multiple": "application.create_delete_project_cqs_task",
        },
        "task_key_dict": {
            "find_single": "project_cq",
            "find_multiple": "project_cq_list",
        },
    },
}


producer_data_project_assessment_cq = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_assessment_cq_task",
            "find_multiple": "register.create_get_assessment_cq_list_task",
            "update_single": "register.create_update_assessment_cq_task",
            "delete_multiple": "register.create_delete_assessment_cq_list_task",
        },
        "task_key_dict": {
            "find_single": "assessment_cq",
            "find_multiple": "assessment_cq_list",
        },
    },
}


producer_data_project_assessment_diagram = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_assessment_diagram_task",
            "find_multiple": "register.create_get_assessment_diagram_list_task",
            "update_single": "register.create_update_assessment_diagram_task",
            "delete_multiple": "register.create_delete_assessment_diagram_list_task",
        },
        "task_key_dict": {
            "find_single": "assessment_diagram",
            "find_multiple": "assessment_diagram_list",
        },
    },
}

producer_data_project_assessment_mitigation = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_assessment_mitigation_task",
            "find_multiple": "register.create_get_assessment_mitigation_list_task",
            "update_single": "register.create_update_assessment_mitigation_task",
            "delete_multiple": "register.create_delete_assessment_mitigation_list_task",
        },
        "task_key_dict": {
            "find_single": "assessment_mitigation",
            "find_multiple": "assessment_mitigation_list",
        },
    },
}


producer_data_project_assessment = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_project_assessment_task",
            "find_multiple": "register.create_get_project_assessment_list_task",
            "update_single": "register.create_update_project_assessment_task",
            "delete_multiple": "register.create_delete_project_assessment_list_task",
        },
        "task_key_dict": {
            "find_single": "project_assessment",
            "find_multiple": "project_assessment_list",
        },
    },
}


producer_data_project_register_history = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_project_register_history_task",
            "find_multiple": "register.create_get_project_register_history_list_task",
            "update_single": "register.create_update_project_register_history_task",
            "delete_multiple": "register.create_delete_project_register_history_list_task",
        },
        "task_key_dict": {
            "find_single": "project_register_history",
            "find_multiple": "project_register_history_list",
        },
    },
}

producer_data_project_register_logs = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_multiple": "register.create_get_project_register_log_list_task",
        },
        "task_key_dict": {
            "find_multiple": "project_register_log_list",
        },
    },
}

producer_data_project_register = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_project_register_task",
            "find_multiple": "register.create_get_project_registers_task",
            "update_single": "register.create_update_project_register_task",
            "delete_multiple": "register.create_delete_project_registers_task",
        },
        "task_key_dict": {
            "find_single": "project_register",
            "find_multiple": "project_registers",
        },
    },
}

producer_data_project_assessment_config = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_project_assessment_config_task",
            "update_single": "register.create_update_project_assessment_config_task",
            "delete_multiple": "register.create_delete_project_assessment_config_task",
        },
        "task_key_dict": {
            "find_single": "project_assessment_config",
        },
    },
}

producer_data_project_assessment_config_file = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_project_assessment_config_file_task",
            "find_multiple": "register.create_get_project_assessment_config_files_task",
            "update_single": "register.create_update_project_assessment_config_file_task",
            "delete_multiple": "register.create_delete_project_assessment_config_files_task",
        },
        "task_key_dict": {
            "find_single": "project_assessment_config_file",
            "find_multiple": "project_assessment_config_files",
        },
    },
}

producer_data_project = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "application.create_get_project_task",
            "find_multiple": "application.create_get_projects_task",
            "update_single": "application.create_update_project_task",
            "delete_multiple": "application.create_delete_projects_task",
        },
        "task_key_dict": {
            "find_single": "project",
            "find_multiple": "projects",
        },
    },
}

producer_data_question_to_model = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_question_to_model_task",
        },
        "task_key_dict": {
            "find_single": "question_to_model",
        },
    },
}

producer_data_register_mapping = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "register.create_get_register_mapping_task",
        },
        "task_key_dict": {
            "find_single": "register_mapping",
        },
    },
}

producer_data_database_log_ad = {
    "task_queue": "diagram_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_multiple": "diagram.create_get_database_logs_task",
            "update_single": "diagram.create_update_database_log_task",
            "delete_multiple": "diagram.create_delete_database_logs_task",
        },
        "task_key_dict": {
            "find_multiple": "database_logs",
        },
    },
}

producer_data_database_log_app = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_multiple": "application.create_get_database_logs_task",
            "update_single": "application.create_update_database_log_task",
            "delete_multiple": "application.create_delete_database_logs_task",
        },
        "task_key_dict": {
            "find_multiple": "database_logs",
        },
    },
}

producer_data_database_log_auth = {
    "task_queue": "authentication_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_multiple": "auth.create_get_database_logs_task",
            "update_single": "auth.create_update_database_log_task",
        },
        "task_key_dict": {
            "find_multiple": "database_logs",
        },
    },
}

producer_data_database_log_rr = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_multiple": "register.create_get_database_logs_task",
            "update_single": "register.create_update_database_log_task",
            "delete_multiple": "register.create_delete_database_logs_task",
        },
        "task_key_dict": {
            "find_multiple": "database_logs",
        },
    },
}

producer_data_user_credits = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "application.create_get_user_credits_task",
            "find_multiple": "application.create_get_user_creditss_task",
            "update_single": "application.create_update_user_credits_task",
        },
        "task_key_dict": {
            "find_single": "user_credits",
            "find_multiple": "user_creditss",
        },
    },
}

producer_data_user_plan_config = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "application.create_get_user_plan_config_task",
            "find_multiple": "application.create_get_user_plan_configs_task",
        },
        "task_key_dict": {
            "find_single": "user_plan_config",
            "find_multiple": "user_plan_configs",
        },
    },
}

producer_data_credit_transaction_log = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "application.create_get_credit_transaction_log_task",
            "find_multiple": "application.create_get_credit_transaction_logs_task",
            "update_single": "application.create_update_credit_transaction_log_task",
        },
        "task_key_dict": {
            "find_single": "credit_transaction_log",
            "find_multiple": "credit_transaction_logs",
        },
    },
}

producer_data_ai_invocation_log = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "find_single": "application.create_get_ai_invocation_log_task",
            "find_multiple": "application.create_get_ai_invocation_logs_task",
            "update_single": "application.create_update_ai_invocation_log_task",
        },
        "task_key_dict": {
            "find_single": "ai_invocation_log",
            "find_multiple": "ai_invocation_logs",
        },
    },
}


# Migration producer mappings are grouped at the bottom because they are
# one-off maintenance entry points, not normal runtime data-access producers.
# Keeping them separate makes the active producer surface easier to scan while
# preserving the existing producer_data_* names used by migration callers.

producer_data_project_register_history_migration = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "run": "application.create_migrate_project_register_history_task",
        },
        "task_key_dict": {},
    },
}


producer_data_project_assessment_migration = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "run": "application.create_migrate_project_assessment_task",
        },
        "task_key_dict": {},
    },
}


producer_data_assessment_id_migration = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "run": "register.create_migrate_assessment_id_task",
            "scan": "register.create_scan_assessment_id_migration_task",
        },
        "task_key_dict": {},
    },
}


producer_data_project_assessment_config_migration = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "run": "application.create_migrate_project_assessment_config_task",
        },
        "task_key_dict": {},
    },
}


producer_data_project_assessment_config_migration_scan = {
    "task_queue": "application_queue",
    "task_mappings": {
        "task_name_dict": {
            "scan": "application.create_scan_project_assessment_config_migration_task",
        },
        "task_key_dict": {},
    },
}


producer_data_project_assessment_config_migration_data = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "scan": "register.create_scan_project_assessment_config_migration_data_task",
            "find_multiple": "register.create_get_project_assessment_config_migration_data_task",
            "cleanup": "register.create_cleanup_project_assessment_config_migration_data_task",
        },
        "task_key_dict": {},
    },
}


producer_data_project_assessment_config_includemain_scan = {
    "task_queue": "register_queue",
    "task_mappings": {
        "task_name_dict": {
            "scan": "register.create_scan_project_assessment_config_includemain_task",
        },
        "task_key_dict": {},
    },
}
