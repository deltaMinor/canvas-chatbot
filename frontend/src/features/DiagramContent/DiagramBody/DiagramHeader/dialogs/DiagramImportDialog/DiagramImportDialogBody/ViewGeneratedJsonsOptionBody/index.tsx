import React from "react";

import InPageFeatureGate from "#root/components/InPageFeatureGate";
import MuiSkeleton from "#root/components/MuiSkeleton";
import { options_dict } from "#root/constants/diagramImportDialog";
import {
    useProjectDiagramFileGeneratedJsonLoadError,
    useProjectDiagramFileGeneratedJsonLoaded,
} from "#root/hooks/backendHooks";
import { ProjectDiagramFileGeneratedJsonInitializer } from "#root/initializers/ProjectDiagramFileGeneratedJsonInitializer";

import ViewGeneratedJsonsOptionBodyContent from "./ViewGeneratedJsonsOptionBodyContent";

interface ViewGeneratedJsonsOptionBodyProps {
    handleCloseDialog: () => Promise<void>;
    pendingSelectedOption: string;
    selectedOption: string;
}

const ViewGeneratedJsonsOptionBodyComponent = ({
    handleCloseDialog: _handleCloseDialog,
    pendingSelectedOption,
    selectedOption,
}: ViewGeneratedJsonsOptionBodyProps) => {
    const projectDiagramFileGeneratedJsonLoadError = useProjectDiagramFileGeneratedJsonLoadError();
    const projectDiagramFileGeneratedJsonLoaded = useProjectDiagramFileGeneratedJsonLoaded();
    const isPendingOption = pendingSelectedOption === options_dict.generatedJson.key;
    const isSelectedOption = selectedOption === options_dict.generatedJson.key;

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
        <ProjectDiagramFileGeneratedJsonInitializer enabled>
            <InPageFeatureGate
                loaded={projectDiagramFileGeneratedJsonLoaded}
                loadError={projectDiagramFileGeneratedJsonLoadError}
                message="Failed to load generated JSON files."
                showLoadingFallback={false}
            >
                <div className="mb-2 pl-3">
                    <ViewGeneratedJsonsOptionBodyContent />
                </div>
            </InPageFeatureGate>
        </ProjectDiagramFileGeneratedJsonInitializer>
    );
};

export default React.memo(ViewGeneratedJsonsOptionBodyComponent);
