import { amber, blue, green, purple } from "@mui/material/colors";

import { UserStatus } from "#root/interfaces/admin";
import { PermissionType } from "#root/interfaces/user";

export const UserStatusBackgroundColorMapping = {
    [UserStatus.active]: green[500],
    [UserStatus.pending]: amber[500],
    // [UserStatus.disabled]: "#22335410",
};

export const UserStatusColorMapping = {
    [UserStatus.active]: "#fff",
    [UserStatus.pending]: "#fff",
    // [UserStatus.disabled]: "#223354",
};

export const UserSuperuserBackgroundColorMapping = {
    true: purple[500],
    // false: "#22335410",
};

export const UserSuperuserColorMapping = {
    true: "#fff",
    // false: "#223354",
};

export const UserSuperuserLabelMapping = {
    true: "Yes",
    false: "No",
};

export const UserAdminBackgroundColorMapping = {
    true: blue[500],
    // false: "#22335410",
};

export const UserAdminColorMapping = {
    true: "#fff",
    // false: "#223354",
};

export const UserAdminLabelMapping = {
    true: "Yes",
    false: "No",
};

export const passwordTypeOptions = [
    {
        label: "Temporary",
        value: "true",
    },
    {
        label: "Permanent",
        value: "false",
    },
];

export const PermissionTypeLabel = {
    [PermissionType.role]: "Role",
    [PermissionType.policy]: "Policy",
    [PermissionType.custom]: "Custom",
};

export const permissionTypeOptions =
    Object.keys(PermissionType)
        ?.filter((p) => p !== PermissionType.custom)
        ?.map((p) => {
            return {
                label: PermissionTypeLabel?.[p as keyof typeof PermissionTypeLabel], //
                value: p,
            };
        }) || [];

export const UserStatusLabel = {
    [UserStatus.active]: "Active",
    [UserStatus.disabled]: "Disabled",
    [UserStatus.pending]: "Pending",
};

export const userStatusOptions =
    Object.keys(UserStatus)?.map((s) => {
        return {
            label: UserStatusLabel?.[s as keyof typeof UserStatusLabel], //
            value: s,
        };
    }) || [];

export const MAX_CHAR_USERNAME = 50;
export const MAX_CHAR_EMAIL = 50;
export const MAX_CHAR_PASSWORD = 50;

export const default_user_fields = {
    entitlements: [],
    user_status: UserStatus.active, //
    is_temp_password: "true",
};

export const usernameValidatorString = /^[0-9a-z_]*$/;
