import React from "react";

import SidebarLayout from "./layouts/SidebarLayout";

interface AppLayoutProps {}

const AppLayoutComponent = (_props: AppLayoutProps) => {
    return <SidebarLayout />;
};

export default React.memo(AppLayoutComponent);
