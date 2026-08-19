import React from "react";

import DiagramTopologyPreviewCapture from "#root/components/DiagramTopologyPreview/DiagramTopologyPreviewCapture";
import DiagramTopologyPreviewImage from "#root/components/DiagramTopologyPreview/DiagramTopologyPreviewImage";
import DialogConfirm from "#root/components/DialogConfirm";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { DialogConfirmStateEnum } from "#root/enums/dialog";
import { useHandleSetProcessedNodesAndEdges } from "#root/hooks/diagram";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import CallApiWithTransition from "#root/services/CallApiWithTransition";
import { readIntentRXFile } from "#root/services/domain/intentrx";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";
import { parseImportedDiagramCanvas } from "#root/utils/diagramChatbot/importDiagram";
import { importDiagramFromTopologyGeneratorAddress } from "#root/utils/diagramChatbot/topologyDiagramImport";
import {
    clearPendingTopologyDiagramAddress,
    getPendingTopologyDiagramAddress,
} from "#root/utils/diagramChatbot/topologyDiagramPendingStore";
import { getPrimaryCanvasPreviewNodesAndEdges } from "#root/utils/diagramChatbot/topologyDiagramPreview";

type PreviewStatus = "loading" | "ready" | "error";

const TopologyGeneratorDialogConfirmComponent = () => {
    const instanceId = useDiagramInstanceId();
    const dialogConfirmState = useDialogState();
    const handleSetProcessedNodesAndEdges = useHandleSetProcessedNodesAndEdges();

    const isOpen =
        !!dialogConfirmState?.[DialogConfirmStateEnum.confirmGenerateDiagramFromTopologyGenerator];

    const [previewStatus, setPreviewStatus] = React.useState<PreviewStatus>("loading");
    const [previewImageUrl, setPreviewImageUrl] = React.useState<string | undefined>(undefined);
    const [captureData, setCaptureData] = React.useState<
        { nodes: DiagramNode[]; edges: DiagramEdge[] } | undefined
    >(undefined);

    // Generate a fresh preview every time the dialog opens, so it always
    // reflects the current contents of the address on disk.
    React.useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;

        const generatePreview = async () => {
            setPreviewStatus("loading");
            setPreviewImageUrl(undefined);
            setCaptureData(undefined);

            const address = getPendingTopologyDiagramAddress();
            if (!address) {
                if (!cancelled) setPreviewStatus("error");
                return;
            }

            try {
                const fileRead = await readIntentRXFile(address);
                if (!fileRead.exists || fileRead.content === undefined) {
                    throw new Error("The generated topology file could not be found.");
                }

                const importedCanvas = parseImportedDiagramCanvas(fileRead.content);
                const preview = getPrimaryCanvasPreviewNodesAndEdges(importedCanvas);
                if (!preview) {
                    throw new Error("The generated topology file has no canvas to preview.");
                }

                if (!cancelled) setCaptureData(preview);
            } catch {
                if (!cancelled) setPreviewStatus("error");
            }
        };

        void generatePreview();

        return () => {
            cancelled = true;
        };
    }, [isOpen]);

    const handlePreviewCaptured = React.useCallback((dataUrl: string) => {
        setPreviewImageUrl(dataUrl);
        setPreviewStatus("ready");
        setCaptureData(undefined);
    }, []);

    const handlePreviewError = React.useCallback(() => {
        setPreviewStatus("error");
        setCaptureData(undefined);
    }, []);

    const handleCloseTopologyGeneratorDialogConfirm = async () => {
        await handleCloseDialogAsync(
            DialogConfirmStateEnum.confirmGenerateDiagramFromTopologyGenerator
        );
    };

    const handleClickGenerateDiagramFromTopologyGenerator = async () => {
        const address = getPendingTopologyDiagramAddress();
        await handleCloseTopologyGeneratorDialogConfirm();
        if (!address) return;

        await CallApiWithTransition({
            async_func: async () => {
                await importDiagramFromTopologyGeneratorAddress({
                    instanceId,
                    handleSetProcessedNodesAndEdges,
                    address,
                });
            },
            func_on_completion: async () => {
                clearPendingTopologyDiagramAddress();
            },
            eyebrowText: "Diagram Import",
            titleText: "Importing TopologyGenerator diagram",
            descriptionText:
                "Replacing the current canvas with nodes and edges from the generated diagram.",
        });
    };

    const dialogConfirmProps = [
        {
            stateKey: DialogConfirmStateEnum.confirmGenerateDiagramFromTopologyGenerator,
            message:
                "Are you sure you want to inherit all nodes and edges from " +
                "the diagram? This will erase all existing nodes and edges.",
            onClick: handleClickGenerateDiagramFromTopologyGenerator,
            title: "Generate Diagram from TopologyGenerator",
            data: [],
            topComponent: (
                <DiagramTopologyPreviewImage
                    status={previewStatus}
                    imageUrl={previewImageUrl}
                />
            ),
        },
    ];

    return (
        <>
            <DialogConfirm
                dialogConfirmProps={dialogConfirmProps}
                dialogConfirmState={dialogConfirmState}
                handleCloseDialogConfirm={handleCloseTopologyGeneratorDialogConfirm}
            />
            {isOpen && captureData && (
                <DiagramTopologyPreviewCapture
                    nodes={captureData.nodes}
                    edges={captureData.edges}
                    onCaptured={handlePreviewCaptured}
                    onError={handlePreviewError}
                />
            )}
        </>
    );
};

export default React.memo(TopologyGeneratorDialogConfirmComponent);
