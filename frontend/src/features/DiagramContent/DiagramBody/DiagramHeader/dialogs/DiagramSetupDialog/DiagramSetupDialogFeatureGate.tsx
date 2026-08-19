import React from "react";

import FeatureGate from "#root/components/FeatureGate";
import { useProjectDiagramLoadError, useProjectDiagramLoaded } from "#root/hooks/backendHooks";

const DiagramSetupDialogFeatureGate = ({ children }: { children?: React.ReactNode }) => {
    const loaded = useProjectDiagramLoaded();
    const loadError = useProjectDiagramLoadError();

    return (
        <FeatureGate
            loaded={loaded}
            loadError={loadError}
            title="Failed to load diagram setup"
            message="The current project diagram could not be loaded."
        >
            {children}
        </FeatureGate>
    );
};

export default React.memo(DiagramSetupDialogFeatureGate);
