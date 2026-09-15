import React from "react";

import { useActiveNavKeyEffect } from "#root/hooks/layoutHooks";

import HeaderBody from "./HeaderBody";
import AdminUsersDialog from "./dialogs/AdminUsersDialog";
import UserSettingsDialog from "./dialogs/UserSettingsDialog";

const HeaderComponent = () => {
    useActiveNavKeyEffect();

    return (
        <>
            <AdminUsersDialog />
            <UserSettingsDialog />
            <HeaderBody />
        </>
    );
};

export default React.memo(HeaderComponent);
