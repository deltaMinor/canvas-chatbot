import { TypedUseSelectorHook, useSelector } from "react-redux";

import { RootState } from "#root/redux/store";

export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector;
