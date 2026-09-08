import React from "react";

import { useActiveNavKeyEffect } from "#root/hooks/layoutHooks";

import HeaderBody from "./HeaderBody";
import UserSettingsDialog from "./dialogs/UserSettingsDialog";

const HeaderComponent = () => {
    useActiveNavKeyEffect();

    return (
        <>
            <UserSettingsDialog />
            <HeaderBody />
        </>
    );
};

export default React.memo(HeaderComponent);
