import {
    DynamicFieldConditionObject,
    SystemProcessPhrase,
    SystemProcessStep,
} from "#root/interfaces/questionnaire";
import { StoryStringMapping } from "#root/interfaces/questionnaire_card";

export const FORM_AUTOSAVE_INTERVAL = 1000;

export const compliance_policy_qid = "field_f85d39d51deb4107b931bd";
export const compliance_nist_csf_optionId = "option_3a85cb1c8f624b64899536";
export const compliance_csa_ccop_optionId = "option_f44d1980fc036fa397ef63";
export const compliance_im8_optionId = "option_4d7f89d6c45094020655dd";
export const compliance_isoiec_27001_optionId = "option_29klsi299djlknaks2oo2z";

export const rbac_optionId = "option_iUZnFm7zxSFiyay8ZZd8RP";
export const abac_optionId = "option_6JqnxvioHnQeHd5pmrwMcV";

export const project_desc_id = "field_8JUtfqaN35YRJFrc7hVs6d";
export const project_go_live = "field_PTp6mVCuM4fkeNFF5pd2tc";
export const card_qid = "field_aYTgbRTobNfeTx8qfgNaYX";
export const ac_qid = "field_KLsNwu94WQc79MvWFcmUS8";

export const rbac_qid = "field_ekrMZPnEcnqcE49CzTCDYh";
export const rbac_user_qid = "field_JF9ikrRcYmxup43Da2thJp";

export const abac_qid = "field_nS7pc64exrzbpPqsXZn22d";
export const abac_data_qid = "field_QQ5q6feYPHVYvHcbTRroVZ";

export const user_story_title_qid = "field_RcTZUir6t69LEoJv9ipQsQ";
export const user_story_feature_qid = "field_kjoQLrFNiwtPd6PSFiF4ui";
export const user_story_device_qid = "field_Beug2fybTozsC4q9GzrisZ";
export const user_story_interface_qid = "field_nd6pU88Fpe5mtLkyHMTnPW";
export const user_story_user_qid = "field_KxsU6BvQmFPtXRcH44ZhKj";
export const user_story_data_qid = "field_Zz8qcXRmTdRthKaSaSsYGp";
export const user_story_intent_qid = "field_SQgayC4tL9q294ao54XnYD";
export const user_story_outcome_qid = "field_TNPsydHStdtNvySMqfV8qF";

export const system_process_title_qid = "field_9e4b7e849301ce5382c1a2";
export const system_process_from_subsystem_qid = "field_ce4fd1aa42f0e512a87468";
export const system_process_to_subsystem_qid = "field_a1c3e9f42b7d8e5c0a9f12";
export const system_process_method_qid = "field_7b487d8373ecd0f741bb54";
export const system_process_trigger_qid = "field_a1499284199e3ec99c1cd4";
export const system_process_data_ingested_qid = "field_8842d4926179ca6fb42b64";
export const system_process_data_forwarded_qid = "field_eae8a17ababd4ead8bf888";
export const system_process_feature_qid = "field_5347f38366db363622187f";
export const system_process_outcome_qid = "field_e847d0bc8a03fd88bd42b1";

export const subsystem_qid = "field_c64656b40d033b70c66100";
export const subsystem_name_qid = "field_dd457684294d80f776d47e";
export const subsystem_description_qid = "field_af4bc8bf1f880c5298c642";

export const data_qid = "field_8oFeDRaz64trjBFFi78RjF";
export const data_data_qid = "field_AmxXHB4eteXpJSoKJngaFD";
export const data_description_qid = "field_TxJodtoRMcvRcMVEpbDzKb";
export const data_classification_qid = "field_RvABR6sYy7hWryEpB23roq";
export const data_sensitivity_qid = "field_mbrpFsUx83mxpMPN3wBvuM";

export const user_qid = "field_Ga2pm9RdwNaguCTdBsaEoh";
export const user_user_qid = "field_d5uqS5xHmqQPtpGHbuLFH9";
export const user_description_qid = "field_5SNuQFNDRiL5yzVgpnsHLk";
export const user_organization_qid = "field_4gXo5qbtNijgTSUnLpfvwP";
export const user_privilege_qid = "field_h2yYYmMokTKNpNgMaoXat4";

export const userStoryStringMapping: StoryStringMapping = {
    user: {
        defaultValue: "user",
        // qid: "field_KxsU6BvQmFPtXRcH44ZhKj",
        rawValue: undefined,
    },
    data: {
        defaultValue: "data",
        // qid: "field_Zz8qcXRmTdRthKaSaSsYGp",
        rawValue: undefined,
    },
    feature: {
        defaultValue: "feature",
        // qid: "field_kjoQLrFNiwtPd6PSFiF4ui",
        rawValue: undefined,
    },
    device: {
        defaultValue: "device",
        // qid: "field_Beug2fybTozsC4q9GzrisZ",
        rawValue: undefined,
    },
    interface: {
        defaultValue: "interface",
        // qid: "field_nd6pU88Fpe5mtLkyHMTnPW",
        rawValue: undefined,
    },
    intent: {
        defaultValue: "do something to achieve goal or objective",
        // qid: "field_SQgayC4tL9q294ao54XnYD",
        rawValue: undefined,
    },
    outcome: {
        defaultValue: "get the desired outcome or result",
        // qid: "field_TNPsydHStdtNvySMqfV8qF",
        rawValue: undefined,
    },
};

export const systemProcessStringMapping: StoryStringMapping = {
    [SystemProcessPhrase.title]: {
        defaultValue: "Untitled",
        rawValue: undefined,
    },
    [SystemProcessPhrase.triggerType]: {
        defaultValue: "trigger type",
        rawValue: undefined,
    },
    [SystemProcessPhrase.fromSubsystem]: {
        defaultValue: "subsystem (from)",
        rawValue: undefined,
    },
    [SystemProcessPhrase.toSubsystem]: {
        defaultValue: "subsystem (to)",
        rawValue: undefined,
    },
    [SystemProcessPhrase.dataIngested]: {
        defaultValue: "data",
        rawValue: undefined,
    },
    [SystemProcessPhrase.dataForwarded]: {
        defaultValue: "data",
        rawValue: undefined,
    },
    [SystemProcessPhrase.feature]: {
        defaultValue: "feature",
        rawValue: undefined,
    },
    [SystemProcessPhrase.method]: {
        defaultValue: "method",
        rawValue: undefined,
    },
    [SystemProcessPhrase.outcome]: {
        defaultValue: "the outcome",
        rawValue: undefined,
    },
};

export const systemProcessStepQuestions: Record<string, string[]> = {
    title: [system_process_title_qid],
    start: [
        system_process_trigger_qid, //
        system_process_data_ingested_qid,
        system_process_data_forwarded_qid,
    ],
    process: [
        system_process_from_subsystem_qid,
        system_process_data_ingested_qid,
        system_process_data_forwarded_qid,
        system_process_to_subsystem_qid,
        system_process_method_qid,
    ],
    outcome: [system_process_feature_qid, system_process_outcome_qid],
};

export enum ProjectDescTemplateKey {
    purpose = "purpose",
    method = "method",
    goal = "goal",
}

export const PROJECT_DESC_TEMPLATE =
    "A system to do {{purpose}} by means of {{method}} in order to contribute to {{goal}}.";

export const PROJECT_DESC_TEMPLATE_PARTS = [
    {
        line: "A system to do",
        key: ProjectDescTemplateKey.purpose,
    },
    {
        line: "by means of",
        key: ProjectDescTemplateKey.method,
    },
    {
        line: "in order to contribute to",
        key: ProjectDescTemplateKey.goal,
    },
];

export const PROCESS_CARD_DYNAMIC_FIELDS: DynamicFieldConditionObject[] = [
    {
        step: SystemProcessStep.start,
        preConditionFieldId: system_process_trigger_qid,
        targetFieldId: system_process_data_ingested_qid,
        selectedOption: {
            label: "Internal changes",
            value: "option_854dfaa0b60298ceb1242a",
        },
    },
];
