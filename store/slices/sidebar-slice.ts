import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
}

const initialState: SidebarState = {
  isOpen: false,
  isCollapsed: false,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.isCollapsed = action.payload;
    },
    toggleCollapse(state) {
      state.isCollapsed = !state.isCollapsed;
    },
  },
});

export const { setSidebarOpen, setSidebarCollapsed, toggleCollapse } = sidebarSlice.actions;
export default sidebarSlice.reducer;
