import React from "react";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import {
    DiagramToolbarButton,
    DiagramToolbarDivider,
} from "#root/components/DiagramToolbarPrimitives";
import { DialogStateEnum } from "#root/interfaces/dialog";
import { handleOpenDialog } from "#root/stores/dialogStore";

const ExportButtonComponent = () => {
    const handleClickExport = React.useCallback(async () => {
        handleOpenDialog(DialogStateEnum.diagramExport);
    }, []);

    return (
        <>
            <DiagramToolbarButton
                className=""
                onClick={handleClickExport} //
                size="small"
                startIcon={<FileDownloadOutlinedIcon />}
            >
                Export
            </DiagramToolbarButton>
            <DiagramToolbarDivider //
                orientation="vertical"
                variant="middle"
                flexItem
            />
        </>
    );
};

export default React.memo(ExportButtonComponent);
