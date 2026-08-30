import type React from "react";

import type { Breakpoint } from "@mui/material";

import { MuiButtonProps } from "#root/components/MuiButton";
import type { OptionLabel } from "#root/interfaces";
import type {
    UserAuthorization,
    UserPolicyDoc,
    UserRoleDocWithPermissions,
} from "#root/interfaces/authorization";
import type { ProjectRegisterFields } from "#root/interfaces/register";
import type { UserEntitlement } from "#root/interfaces/user";

export enum DialogFieldTypeEnum {
    accordion = "accordion",
    checkboxGroup = "checkboxGroup",
    entitlementTableFields = "entitlementTableFields",
    password = "password",
    reactSelect = "reactSelect",
    reactSelectMulti = "reactSelectMulti",
    select = "select",
    selectObject = "selectObject",
    selectObjectMulti = "selectObjectMulti",
    selectGroup = "selectGroup",
    selectGroupMulti = "selectGroupMulti",
    text = "text",
    textarea = "textarea",
    upload = "uploadFile",
    url = "url",
    //
    displayText = "displayText",
    displayGroupRisks = "displayGroupRisks",
    displayLoginHistory = "displayLoginHistory",
    //
    jiraFields = "jiraFields",
    datePicker = "datePicker",
    toggle = "toggle",
}

export interface DialogFieldButtonProps<T = DialogFieldValues | DialogFieldValues[]> extends Omit<
    MuiButtonProps,
    "onClick"
> {
    buttonTitle: string;
    handleClick: (
        ev: React.MouseEvent<HTMLButtonElement, MouseEvent>, //
        d: DialogFieldProp<T>,
        v?: { [key: string]: unknown }
    ) => Promise<void>;
}

export interface DialogFieldProp<T = DialogFieldValues | DialogFieldValues[]> {
    stateKey: string;
    message?: string;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    fields: DialogFieldPropFields<T>[];
    onValidate?: (files: FileList | null) => Promise<void>;
    data?: string[];
    disableCloseDialogOnClick?: boolean;
    disableClickOut?: boolean;
    promptSaveOnDirtyClose?: boolean;
    disabled?: boolean;
    maxWidth?: Breakpoint;
    infoMessage?: string;
    warningMessage?: string;
    buttonProps?: {
        bottomLeft?: DialogFieldButtonProps<T>[];
        bottomCenter?: DialogFieldButtonProps<T>[];
        bottomRight?: DialogFieldButtonProps<T>[];
    };
}

export type DialogFieldValues<T = unknown> =
    | string
    | number
    | boolean
    | OptionLabel
    | FileList
    | { [key: string]: T };

export interface DialogFieldSubmitValues {
    [key: string]: DialogFieldValues | DialogFieldValues[] | DialogFieldSubmitValues;
}

export interface GetModifiedOptionsProps {
    options: OptionLabel[];
    values: DialogFieldSubmitValues;
    refValues: { [key: string]: unknown };
    field: DialogFieldPropFields;
}
export interface CheckIfDisabledProps {
    values: DialogFieldSubmitValues;
    refValues: React.RefObject<DialogFieldSubmitValues>;
    field: DialogFieldPropFields;
}

export interface DialogFieldPropFields<
    T = DialogFieldValues | DialogFieldValues[], //
> {
    id: string;
    type: string;
    //
    defaultValue?: T;
    value?: T;
    values?: T[];
    //
    allowSpaceChar?: boolean;
    autoComplete?: string;
    check_equal?: boolean;
    disableAddRow?: boolean;
    disabled?: boolean;
    disabledMessage?: string;
    fieldRef?: {
        admin_permissions?: string[];
        admin_policies?: string[];
        authorization?: UserAuthorization;
        permissionOptions?: OptionLabel[];
        permissionTypeOptions?: OptionLabel[];
        policyOptions?: OptionLabel[];
        roleOptions?: OptionLabel[];
        user_policy_docs?: UserPolicyDoc[];
        user_role_list_with_permissions?: UserRoleDocWithPermissions[];
        tagOptions?: OptionLabel[];
        isReadAuthorized?: boolean;
        [key: string]: unknown;
    };
    helperText?: string;
    label?: string;
    largeField?: boolean;
    maxChar?: number;
    option?: string;
    options?: T[];
    preserveUnknownOptions?: boolean;
    removeEmptyRow?: boolean;
    required?: boolean;
    requiredIfChanged?: boolean;
    row_key_value?: string;
    row_key?: string;
    subFields?: DialogFieldPropFields[];
    submitDefaultValue?: boolean;
    tooltipText?: React.ReactNode;
    upload_accept?: string;
    validateTextInput?: boolean;
    validatorString?: RegExp;
    // Url field
    domain?: string;
    // getModifiedOptionsFunc?: (props: GetModifiedOptionsProps) => OptionLabel[];
    checkIfDisabledFunc?: (props: unknown) => boolean;
    handleChange?: (v?: unknown) => Promise<void>;
    shouldHideField?: (v: DialogFieldSubmitValues) => boolean;
    updateHiddenStates?: () => void;
}

export interface DialogFieldComponentProps {
    field: DialogFieldPropFields;
    refValues: React.RefObject<DialogFieldSubmitValues>;
    disabled?: boolean;
}

export interface EntitlementTableFieldRow extends UserEntitlement {
    row_id: string;
}

export interface GroupRisk {
    riskScenarioId: string;
    keyRisk: string;
    ref: {
        riskScenario: ProjectRegisterFields[];
    };
}
