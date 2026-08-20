import React from "react";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Stack } from "@mui/material";

import DiagramToolbarButton from "#root/components/DiagramToolbarPrimitives/DiagramToolbarButton";
import {
    useDiagramCapabilitiesState,
    useDiagramClipboardCopyAction,
    useDiagramClipboardPasteAction,
    useHandleDeleteSelectedItems,
} from "#root/hooks/diagram";
import { DiagramEditToolbarState } from "#root/redux/projectDiagramFeatureSlice";

interface ToolbarEditButtonStackCrudProps {
    editState: DiagramEditToolbarState;
}

const ToolbarEditButtonStackCrudComponent = ({ editState }: ToolbarEditButtonStackCrudProps) => {
    const capabilities = useDiagramCapabilitiesState();
    const handleCopy = useDiagramClipboardCopyAction();
    const handlePaste = useDiagramClipboardPasteAction();
    const { handleDeleteSelectedItems } = useHandleDeleteSelectedItems();

    const handleClickCopy = React.useCallback(() => {
        handleCopy();
    }, [handleCopy]);

    const handleClickPaste = React.useCallback(() => {
        handlePaste();
    }, [handlePaste]);

    const handleClickDelete = React.useCallback(() => {
        handleDeleteSelectedItems();
    }, [handleDeleteSelectedItems]);

    return (
        <Stack direction="row">
            <DiagramToolbarButton
                className=""
                disabled={!editState["general"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={handleClickCopy} //
                size="small"
                startIcon={<ContentCopyIcon />}
                tooltipProps={{ title: "Copy (Ctrl+C)" }}
            />
            <DiagramToolbarButton
                className=""
                disabled={!editState["general"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={handleClickPaste} //
                size="small"
                startIcon={<ContentPasteIcon />}
                tooltipProps={{ title: "Paste (Ctrl+V)" }}
            />
            <DiagramToolbarButton
                className=""
                disabled={!editState["delete"] || !capabilities.toolbar.editToolbar.enabled}
                onClick={handleClickDelete}
                size="small"
                startIcon={<DeleteOutlineIcon />}
                tooltipProps={{ title: "Delete (Del)" }}
            />
        </Stack>
    );
};

export default React.memo(ToolbarEditButtonStackCrudComponent);
