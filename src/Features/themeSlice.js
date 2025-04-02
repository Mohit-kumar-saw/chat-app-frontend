import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "themeSlice",
  initialState: true, // true for light theme, false for dark theme
  reducers: {
    toggleTheme: (state) => !state,
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer; 