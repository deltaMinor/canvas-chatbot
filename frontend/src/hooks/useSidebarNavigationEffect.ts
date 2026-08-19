import React from "react";

import app_store, { app_actions } from "#root/redux/store";
import { getInitialActiveSection } from "#root/utils/layout.utils";

export const useSidebarNavigationEffect = () => {
    React.useEffect(() => {
        app_store.dispatch(app_actions.layout.setActiveSection(getInitialActiveSection()));
    }, []);
};
