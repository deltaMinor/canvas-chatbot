export interface ProjectStepAlert {
    alert?: boolean;
    alert_message?: string;
}

export interface ProjectStepData {
    alerts?: ProjectStepAlert[];
    button_label?: string;
    description: string;
    disable_action?: boolean;
    disable_status?: boolean;
    handleButtonClick?: () => Promise<void>;
    helper_text?: string;
    hide_status?: boolean;
    label: string;
    status_value: number;
    url?: string;
    value: string;
}

export enum ProjectStep {
    architecture_diagram = "architecture_diagram",
    conception_questionnaire = "conception_questionnaire",
    review_questionnaire = "review_questionnaire",
    run_assessment = "run_assessment",
    resolve_conflicts = "resolve_conflicts",
    view_threat_scenarios = "view_threat_scenarios",
    resolve_issues = "resolve_issues",
}
