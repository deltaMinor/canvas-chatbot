import React from "react";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import HeightIcon from "@mui/icons-material/Height";
import { Fab } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useDiagramBiDirectionalArrow, useDiagramCapabilitiesState } from "#root/hooks/diagram";
import { setDiagramBiDirectionalArrow } from "#root/stores/projectDiagram/canvas";

const BiDirectionalArrowFabComponent = () => {
    const instanceId = useDiagramInstanceId();
    const biDirectionalArrow = useDiagramBiDirectionalArrow();
    const capabilities = useDiagramCapabilitiesState();

    const isButtonDisabled = !capabilities.toolbar.biDirectionalArrow.enabled;

    const handleClick = React.useCallback(() => {
        setDiagramBiDirectionalArrow((prev) => !prev, instanceId);
    }, [instanceId]);

    return (
        <MuiTooltip title={biDirectionalArrow ? "Bidirectional Edge" : "Unidirectional Edge"}>
            <Fab
                id="edge-direction-button"
                size="small"
                variant="extended"
                hidden={!!isButtonDisabled}
                onClick={handleClick}
                color={biDirectionalArrow ? "primary" : "secondary"}
                className="h-[36px] w-[36px] min-w-0 p-1"
            >
                {biDirectionalArrow ? <HeightIcon /> : <ArrowUpwardIcon />}
            </Fab>
        </MuiTooltip>
    );
};

export default React.memo(BiDirectionalArrowFabComponent);
