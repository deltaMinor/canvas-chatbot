import { SnackbarOrigin } from "notistack";

import SnackbarProcessing from "#root/components/SnackbarProcessing";

export const defaultSnackbarProviderProps = {
    // preventDuplicate
    autoHideDuration: 2000,
    anchorOrigin: {
        horizontal: "right", //
        vertical: "bottom",
    } as SnackbarOrigin,
    maxSnack: 5,
    Components: {
        processing: SnackbarProcessing,
    },
};
