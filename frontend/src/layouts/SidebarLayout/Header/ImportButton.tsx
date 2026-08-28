import React from "react";

import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";

import {
    DiagramToolbarButton,
    DiagramToolbarDivider,
} from "#root/components/DiagramToolbarPrimitives";
import { DialogStateEnum } from "#root/interfaces/dialog";
import { handleOpenDialog } from "#root/stores/dialogStore";

const ImportButtonComponent = () => {
    const handleClickImport = React.useCallback(() => {
        handleOpenDialog(DialogStateEnum.diagramImport);
    }, []);

    return (
        <>
            <DiagramToolbarButton
                className=""
                onClick={handleClickImport} //
                size="small"
                startIcon={<FileUploadOutlinedIcon />}
            >
                Import
            </DiagramToolbarButton>
            <DiagramToolbarDivider //
                orientation="vertical" //
                variant="middle"
                flexItem
            />
        </>
    );
};

export default React.memo(ImportButtonComponent);
