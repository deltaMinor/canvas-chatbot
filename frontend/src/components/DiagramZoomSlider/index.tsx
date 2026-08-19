import React from "react";

import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Collapse, Paper, Slider, Stack } from "@mui/material";
import { useReactFlow, useStore } from "@xyflow/react";

import { diagram_max_zoom, diagram_min_zoom } from "#root/constants/diagramConfig";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";

const slider_increment_step = (Math.log10(diagram_max_zoom) - Math.log10(diagram_min_zoom)) / 10;

const DiagramZoomSliderComponent = () => {
    const zoom = useStore((state) => state.transform[2]);
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();

    const slider_zoom_value = Math.log10(zoom);

    const handleChange = React.useCallback(
        (_event: Event, value: number | number[], _activeThumb: number) => {
            const { zoomTo } = reactFlow;

            if (!!Array.isArray(value)) return;
            zoomTo(Math.pow(10, value));
        },
        [reactFlow]
    );

    const handLe_zoom_in = React.useCallback(() => {
        const { zoomTo } = reactFlow;

        const new_zoom = Math.pow(10, slider_zoom_value + slider_increment_step);
        zoomTo(Math.min(diagram_max_zoom, new_zoom));
    }, [reactFlow, slider_zoom_value]);

    const handLe_zoom_out = React.useCallback(() => {
        const { zoomTo } = reactFlow;

        const new_zoom = Math.pow(10, slider_zoom_value - slider_increment_step);
        zoomTo(Math.max(diagram_min_zoom, new_zoom));
    }, [reactFlow, slider_zoom_value]);

    return (
        <Collapse in={true}>
            <Paper className="px-1">
                <Stack
                    spacing={2}
                    direction="row"
                    alignItems="center"
                >
                    <ZoomOutIcon onClick={handLe_zoom_out} />
                    <Slider
                        min={Math.log10(diagram_min_zoom)}
                        max={Math.log10(diagram_max_zoom)}
                        step={slider_increment_step}
                        style={{ width: "200px" }}
                        onChange={handleChange}
                        value={slider_zoom_value}
                    />
                    <ZoomInIcon onClick={handLe_zoom_in} />
                </Stack>
            </Paper>
        </Collapse>
    );
};

export default React.memo(DiagramZoomSliderComponent);
