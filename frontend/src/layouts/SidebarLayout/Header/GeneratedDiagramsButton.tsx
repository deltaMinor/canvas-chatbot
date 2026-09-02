import React from "react";

import ArticleIcon from "@mui/icons-material/Article";

import { DiagramToolbarButton } from "#root/components/DiagramToolbarPrimitives";
import { DialogStateEnum } from "#root/interfaces/dialog";
import { handleOpenDialog } from "#root/stores/dialogStore";

const GeneratedDiagramsButtonComponent = () => {
    const handleClickGeneratedDiagrams = React.useCallback(() => {
        handleOpenDialog(DialogStateEnum.diagramGeneratedJsonImport);
    }, []);

    return (
        <>
            <DiagramToolbarButton
                className=""
                onClick={handleClickGeneratedDiagrams} //
                size="small"
                startIcon={<ArticleIcon />}
            >
                Generated Diagrams
            </DiagramToolbarButton>
        </>
    );
};

export default React.memo(GeneratedDiagramsButtonComponent);
