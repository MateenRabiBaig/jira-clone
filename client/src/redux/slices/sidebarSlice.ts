import { createSlice } from "@reduxjs/toolkit";

interface SidebarState {
    collapsed: boolean;
}

const initialState: SidebarState = {
    collapsed: false,
}

const sidebarSlice = createSlice({
    name: "sidebar",
    initialState,
    reducers: {
        toggleSidebar(state) {
            state.collapsed = !state.collapsed;
        },
        
        closeSidebar(state) {
            state.collapsed = true;
        },

        openSidebar(state) {
            state.collapsed = false;
        },
    },
});

export const {
    toggleSidebar,
    closeSidebar,
    openSidebar,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;