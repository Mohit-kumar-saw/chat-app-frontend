import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../Features/themeSlice";

export const store = configureStore({
  reducer: {
    themeKey: themeReducer,
  },
});

export default store; 