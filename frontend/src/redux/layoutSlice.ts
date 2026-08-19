import { createSlice } from "@reduxjs/toolkit";

import { ActiveNavKey } from "#root/constants/navigation";
import type { LayoutReducer, LayoutState } from "#root/interfaces/redux";
import { DEFAULT_ACTIVE_SECTION } from "#root/utils/layout.utils";

export type { LayoutReducer, LayoutSliceInterface, LayoutState } from "#root/interfaces/redux";

const initialState: LayoutState = {
    activeSection: DEFAULT_ACTIVE_SECTION,
    activeNavKey: ActiveNavKey.home,
    hoveringHeaderNavKey: "",
    sidebarToggle: false,
    expandSidebar: false,
};

const reducers = {
    setActiveSection(state, action) {
        if (state.activeSection !== action.payload) {
            state.activeSection = action.payload;
        }
    },
    setActiveNavKey(state, action) {
        if (state.activeNavKey !== action.payload) {
            state.activeNavKey = action.payload;
        }
    },
    setHoveringHeaderNavKey(state, action) {
        if (state.hoveringHeaderNavKey !== action.payload) {
            state.hoveringHeaderNavKey = action.payload;
        }
    },
    setSidebarToggle(state, action) {
        if (state.sidebarToggle !== action.payload) {
            state.sidebarToggle = action.payload;
        }
    },
    toggleSidebar(state) {
        state.sidebarToggle = !state.sidebarToggle;
    },
    closeSidebar(state) {
        if (state.sidebarToggle) {
            state.sidebarToggle = false;
        }
    },
    setExpandSidebar(state, action) {
        if (state.expandSidebar !== action.payload) {
            state.expandSidebar = action.payload;
        }
    },
} satisfies LayoutReducer;

const layoutSlice = createSlice({
    name: "layout",
    initialState,
    reducers,
});

export default layoutSlice;
