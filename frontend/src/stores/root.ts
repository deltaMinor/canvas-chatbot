import app_store, { RootState } from "#root/redux/store";

export const getRootStateFromStore = (): RootState => app_store.getState();
