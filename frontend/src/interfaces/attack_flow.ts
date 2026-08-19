export interface AttackFlowExpression {
    attribute?: string;
    expression?: string;
    parameter_type?: string;
    parameters?: unknown;
    set_context?: string;
    set_attribute?: unknown[];
    return_object_attribute?: string;
}

export interface AttackFlowMetapathItem {
    filter: unknown[];
    label: string;
    labelGroup: string;
    match: string;
    object: string;
    parameters?: AttackFlowExpression[];
    type: string;
}

export interface AttackFlowCondition {
    condition_type: string;
    recommended_mitigation_measures: string[];
    metapath: AttackFlowMetapathItem[];
    equation: AttackFlowExpression[];
    required: boolean;
    rapids_category: string[];
    merge_conditions: AttackFlowExpression[];
}

export interface AttackFlowGenerationCondition {
    type: string;
    condition: AttackFlowCondition[];
    object_ref: string;
}
