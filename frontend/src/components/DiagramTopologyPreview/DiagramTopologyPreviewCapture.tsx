import React from "react";

import { ReactFlowProvider, Viewport, getViewportForBounds, useReactFlow } from "@xyflow/react";
import { toPng } from "html-to-image";

import ReadOnlyDiagramFlow from "#root/components/DiagramCanvas/ReadOnlyDiagramFlow";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";

const PREVIEW_WIDTH = 640;
const PREVIEW_HEIGHT = 400;
const PREVIEW_PADDING = 0.12;

interface DiagramTopologyPreviewCaptureProps {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    onCaptured: (dataUrl: string) => void;
    onError: (error: unknown) => void;
}

const DiagramTopologyPreviewCaptureInner = ({
    nodes,
    edges,
    onCaptured,
    onError,
}: DiagramTopologyPreviewCaptureProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const capturedRef = React.useRef(false);
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();

    const handleInit = React.useCallback(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(async () => {
                if (capturedRef.current) return;
                capturedRef.current = true;

                try {
                    const element = containerRef.current?.querySelector(
                        ".react-flow__viewport"
                    ) as HTMLElement | null;
                    if (!element) {
                        throw new Error("The diagram preview failed to render.");
                    }

                    const { getNodesBounds } = reactFlow;
                    const nodesBounds = getNodesBounds(nodes);
                    const transform: Viewport = getViewportForBounds(
                        nodesBounds,
                        PREVIEW_WIDTH,
                        PREVIEW_HEIGHT,
                        0.2,
                        2,
                        PREVIEW_PADDING
                    );

                    await document.fonts.ready;

                    const dataUrl = await toPng(element, {
                        backgroundColor: "#fff",
                        width: PREVIEW_WIDTH,
                        height: PREVIEW_HEIGHT,
                        style: {
                            width: `${PREVIEW_WIDTH}`,
                            height: `${PREVIEW_HEIGHT}`,
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
                        },
                        cacheBust: true,
                        filter: (domNode) => !domNode.classList?.contains("react-flow__handle"),
                    });

                    onCaptured(dataUrl);
                } catch (error) {
                    onError(error);
                }
            });
        });
    }, [edges, nodes, onCaptured, onError, reactFlow]);

    return (
        <div
            ref={containerRef}
            aria-hidden
            style={{
                position: "fixed",
                top: 0,
                left: -100000,
                width: PREVIEW_WIDTH,
                height: PREVIEW_HEIGHT,
                pointerEvents: "none",
            }}
        >
            <ReadOnlyDiagramFlow
                nodes={nodes}
                edges={edges}
                fitView
                fitViewOptions={{ padding: PREVIEW_PADDING, maxZoom: 1 }}
                onInit={handleInit}
                hideBackground
            />
        </div>
    );
};

const DiagramTopologyPreviewCapture = (props: DiagramTopologyPreviewCaptureProps) => (
    <ReactFlowProvider>
        <DiagramTopologyPreviewCaptureInner {...props} />
    </ReactFlowProvider>
);

export default DiagramTopologyPreviewCapture;
