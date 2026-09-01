import React from "react";

import AppTabs from "#root/components/AppTabs";
import { manageFilesProjectGeneratedJsonTabLabelProperties } from "#root/constants/tab";

import ProjectGeneratedJsonFilesTab from "./ProjectGeneratedJsonFilesTab";

interface ViewGeneratedJsonsOptionBodyContentProps {}

const ViewGeneratedJsonsOptionBodyContentComponent = (
    _props: ViewGeneratedJsonsOptionBodyContentProps
) => {
    return (
        <AppTabs
            TabContents={[
                () => (
                    <ProjectGeneratedJsonFilesTab //
                    />
                ),
            ]}
            tabLabelProperties={manageFilesProjectGeneratedJsonTabLabelProperties}
            helperText={false}
        />
    );
};

export default React.memo(ViewGeneratedJsonsOptionBodyContentComponent);
