import React from "react";

import { ThreatFrameworks } from "#root/interfaces/register";
import { ThreatDrawerFrameworkGroup } from "#root/interfaces/threatDrawer";
import { displayFrameworksTypedValue } from "#root/utils/frameworks";

import { useDiagramDraftCanvasRef } from "./projectDiagramFeatureHooks";

export const useVisibleFrameworkGroups = () => {
    const draftCanvasRef = useDiagramDraftCanvasRef();
    const frameworks = draftCanvasRef?.threat_scenario_ref?.frameworks;

    return React.useMemo(() => {
        const frameworkMap = displayFrameworksTypedValue((frameworks ?? {}) as ThreatFrameworks);
        return Object.entries(frameworkMap).filter(([, entries]) => !!entries.length) as [
            string,
            ThreatDrawerFrameworkGroup,
        ][];
    }, [frameworks]);
};
