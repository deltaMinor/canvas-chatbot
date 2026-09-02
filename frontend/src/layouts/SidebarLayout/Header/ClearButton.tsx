import React from "react";

import DeleteIcon from "@mui/icons-material/Delete";

import { DiagramToolbarButton } from "#root/components/DiagramToolbarPrimitives";
import { DialogConfirmStateEnum } from "#root/interfaces/dialog";
import { handleOpenDialog } from "#root/stores/dialogStore";

const ClearButtonComponent = () => {
    const handleClickClear = React.useCallback(async () => {
        handleOpenDialog(DialogConfirmStateEnum.confirmClearCanvas);
    }, []);

    return (
        <>
            <DiagramToolbarButton
                className=""
                onClick={handleClickClear} //
                size="small"
                startIcon={<DeleteIcon />}
            >
                Clear
            </DiagramToolbarButton>
        </>
    );
};

export default React.memo(ClearButtonComponent);
