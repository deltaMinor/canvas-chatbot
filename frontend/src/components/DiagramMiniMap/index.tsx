import React from "react";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Collapse, IconButton } from "@mui/material";
import { MiniMap } from "@xyflow/react";

import MuiTooltip from "#root/components/MuiTooltip";
import { nodeColor, nodeStrokeColor } from "#root/constants/diagramCanvasColors";
import { useDiagramMiniMapExpanded, useSetDiagramMiniMapExpanded } from "#root/hooks/diagram";

const DiagramMiniMapComponent: React.FC = () => {
    const expanded = useDiagramMiniMapExpanded();
    const setExpanded = useSetDiagramMiniMapExpanded();

    const toggleExpanded = () => setExpanded(!expanded);
    return (
        <Box className="diagram-minimap">
            <MuiTooltip
                title={`${!!expanded ? "Hide" : "Show"} MiniMap`}
                arrow
                placement="top"
            >
                <Box
                    className="diagram-minimap__toggle-shell"
                    id="diagram-minimap-toggle"
                >
                    <IconButton
                        size="small"
                        className="diagram-minimap__toggle-button"
                        onClick={() => toggleExpanded()}
                    >
                        {!!expanded ? (
                            <RemoveIcon fontSize="small" />
                        ) : (
                            <AddIcon fontSize="small" />
                        )}
                    </IconButton>
                </Box>
            </MuiTooltip>
            <Collapse
                in={expanded}
                unmountOnExit
                className="diagram-minimap__collapse"
            >
                <MiniMap
                    className="diagram-minimap__map"
                    nodeColor={nodeColor}
                    nodeStrokeColor={nodeStrokeColor}
                    position="bottom-left"
                    pannable
                    zoomable
                />
            </Collapse>
        </Box>
    );
};

export default React.memo(DiagramMiniMapComponent);
