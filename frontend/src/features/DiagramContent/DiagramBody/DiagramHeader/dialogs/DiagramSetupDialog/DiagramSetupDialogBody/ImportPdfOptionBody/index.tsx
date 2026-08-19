import React from "react";

import InPageFeatureGate from "#root/components/InPageFeatureGate";
import MuiSkeleton from "#root/components/MuiSkeleton";
import { options_dict } from "#root/constants/diagramSetupDialog";
import {
    useProjectDiagramFilePdfLoadError,
    useProjectDiagramFilePdfLoaded,
} from "#root/hooks/backendHooks";
import { ProjectDiagramFilePdfInitializer } from "#root/initializers/ProjectDiagramFilePdfInitializer";

import ImportPdfOptionBodyContent from "./ImportPdfOptionBodyContent";

interface ImportPdfOptionBodyProps {
    handleCloseDialog: () => Promise<void>;
    pendingSelectedOption: string;
    selectedOption: string;
}

const ImportPdfOptionBodyComponent = ({
    handleCloseDialog: _handleCloseDialog,
    pendingSelectedOption,
    selectedOption,
}: ImportPdfOptionBodyProps) => {
    const projectDiagramFilePdfLoadError = useProjectDiagramFilePdfLoadError();
    const projectDiagramFilePdfLoaded = useProjectDiagramFilePdfLoaded();
    const isPendingOption = pendingSelectedOption === options_dict.pdf.key;
    const isSelectedOption = selectedOption === options_dict.pdf.key;

    if (!isPendingOption) return null;

    if (isPendingOption && !isSelectedOption) {
        return (
            <MuiSkeleton
                variant="rectangular"
                minHeight={160}
            />
        );
    }

    return (
        <ProjectDiagramFilePdfInitializer enabled>
            <InPageFeatureGate
                loaded={projectDiagramFilePdfLoaded}
                loadError={projectDiagramFilePdfLoadError}
                message="Failed to load project PDF document files."
                showLoadingFallback={false}
            >
                <div className="mb-2 pl-3">
                    <ImportPdfOptionBodyContent />
                </div>
            </InPageFeatureGate>
        </ProjectDiagramFilePdfInitializer>
    );
};

export default React.memo(ImportPdfOptionBodyComponent);
