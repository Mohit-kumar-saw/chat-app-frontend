import React, { createContext, useState } from "react";
import "./myStyles.css";
import Sidebar from "./Sidebar";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Welcome from "./Welcome";

// Initialize the context with default values
export const myContext = createContext();

function MainContainer() {
  const [refresh, setRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState("conversations"); // "conversations" or "users"
  const lightTheme = useSelector((state) => state.themeKey);
  const location = useLocation();

  const getSearchPlaceholder = () => {
    return currentView === "users" ? "Search users..." : "Search conversations...";
  };

  // Show Welcome component when no chat is selected
  const shouldShowWelcome = location.pathname === "/app" || location.pathname === "/app/";

  return (
    <div className={"main-container" + (lightTheme ? "" : " dark")}>
      <myContext.Provider 
        value={{ 
          refresh, 
          setRefresh,
          searchQuery,
          setSearchQuery,
          currentView,
          setCurrentView,
          getSearchPlaceholder
        }}
      >
        <Sidebar />
        {shouldShowWelcome ? <Welcome /> : <Outlet />}
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