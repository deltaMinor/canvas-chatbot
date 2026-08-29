import React from "react";

import AppTabs from "#root/components/AppTabs";
import { manageFilesProjectPdfTabLabelProperties } from "#root/constants/tab";

import ProjectPdfFilesTab from "./ProjectPdfFilesTab";

interface ImportPdfOptionBodyContentProps {}

const ImportPdfOptionBodyContentComponent = (_props: ImportPdfOptionBodyContentProps) => {
    return (
        <AppTabs
            TabContents={[
                () => (
                    <ProjectPdfFilesTab //
                    />
                ),
            ]}
            tabLabelProperties={manageFilesProjectPdfTabLabelProperties}
            helperText={false}
        />
    );
};

export default React.memo(ImportPdfOptionBodyContentComponent);
