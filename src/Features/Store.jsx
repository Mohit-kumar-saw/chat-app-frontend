import { configureStore } from "@reduxjs/toolkit";
import themeSliceReducer from "./ThemeSlice";
import refreshSidebar from "./refreshSidebar";

export const store = configureStore({
  reducer: {
    themeKey: themeSliceReducer,
    refreshKey: refreshSidebar,
  },
});