import React from "react";

import { useSidebarNavigationEffect } from "#root/hooks/useSidebarNavigationEffect";

const AppEffects = () => {
    useSidebarNavigationEffect();

    return null;
};

export default React.memo(AppEffects);
