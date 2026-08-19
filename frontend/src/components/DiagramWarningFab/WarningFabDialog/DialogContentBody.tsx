import { Stack } from "@mui/material";

import { WarningMessage } from "#root/interfaces/diagram";

import WarningFabDialogToolbar from "./WarningFabDialogToolbar";
import WarningList from "./WarningList";

interface DialogContentBodyProps {
    warningList: WarningMessage[];
}

const DialogContentBodyComponent = ({ warningList }: DialogContentBodyProps) => {
    return (
        <Stack spacing={1}>
            <WarningFabDialogToolbar />
            <WarningList warningList={warningList} />
        </Stack>
    );
};

export default DialogContentBodyComponent;
