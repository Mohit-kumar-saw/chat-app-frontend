import React, { createContext, useState } from "react";
import "./myStyles.css";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

// Initialize the context with default values
export const myContext = createContext({
  refresh: false,
  setRefresh: () => {},
});

function MainContainer() {
  const [refresh, setRefresh] = useState(false);
  const lightTheme = useSelector((state) => state.themeKey);

  const contextValue = {
    refresh,
    setRefresh,
  };

  return (
    <div className={"main-container" + (lightTheme ? "" : " dark")}>
      <myContext.Provider value={contextValue}>
        <Sidebar />
        <Outlet />
      </myContext.Provider>
      {/* <Welcome /> */}
      {/* <CreateGroups /> */}
      {/* <ChatArea props={conversations[0]} /> */}
      {/* <Users /> */}
      {/* <Groups /> */}
    </div>
  );
}

export default MainContainer;