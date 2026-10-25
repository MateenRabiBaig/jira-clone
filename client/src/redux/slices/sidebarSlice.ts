import { createSlice } from "@reduxjs/toolkit";
import { getSidebarCollapsed, setSidebarCollapsed } from "../../config/prefs";

interface SidebarState {
    collapsed: boolean;
}

const initialState: SidebarState = {
    collapsed: getSidebarCollapsed(),
}

const sidebarSlice = createSlice({
    name: "sidebar",
    initialState,
    reducers: {
        toggleSidebar(state) {
            state.collapsed = !state.collapsed;
            setSidebarCollapsed(state.collapsed);
        },

        closeSidebar(state) {
            state.collapsed = true;
            setSidebarCollapsed(true);
        },

        openSidebar(state) {
            state.collapsed = false;
            setSidebarCollapsed(false);
        },
    },
});

export const {
    toggleSidebar,
    closeSidebar,
    openSidebar,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
