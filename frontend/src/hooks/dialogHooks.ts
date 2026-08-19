import { RootState } from "#root/redux/store";
import { createStateHook } from "#root/utils/stateHookUtil";

const useDialogStoreState = createStateHook<
    RootState,
    { dialog: Record<string, boolean> },
    "dialog"
>((state) => state as unknown as { dialog: Record<string, boolean> }, "dialog");

export const useDialogState = () => useDialogStoreState();
