import React from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import { ACTIVE_NAV_KEY_BY_ROUTE, ActiveNavKey } from "#root/constants/navigation";
import { LayoutState } from "#root/redux/layoutSlice";
import { AppDispatch, RootState, app_actions } from "#root/redux/store";
import { createStateHook } from "#root/utils/stateHookUtil";

type LayoutStateKey = keyof LayoutState;

const selectLayoutState = (state: RootState) => state.layout;
export const useLayoutState = createStateHook<RootState, { layout: LayoutState }, "layout">(
    (state) => state,
    "layout"
);

const createLayoutStateHook = <K extends LayoutStateKey>(key: K) =>
    createStateHook<RootState, LayoutState, K>(selectLayoutState, key);

export const useActiveSection = createLayoutStateHook("activeSection");
export const useActiveNavKey = createLayoutStateHook("activeNavKey");
export const useHoveringHeaderNavKey = createLayoutStateHook("hoveringHeaderNavKey");
export const useSidebarToggle = createLayoutStateHook("sidebarToggle");
export const useExpandSidebar = createLayoutStateHook("expandSidebar");

export const useActiveNavKeyEffect = () => {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();

    React.useEffect(() => {
        const activeNavKey = ACTIVE_NAV_KEY_BY_ROUTE[location.pathname] || ActiveNavKey.home;
        dispatch(app_actions.layout.setActiveNavKey(activeNavKey));
    }, [dispatch, location.pathname]);
};
