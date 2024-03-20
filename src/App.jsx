import React, { createContext, useState } from "react";
import "./App.css";
import MainContainer from "./Components/MainContainer";
import Login from "./Components/Login";
import { Switch } from "@mui/material";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Welcome from "./Components/Welcome";
import ChatArea from "./Components/ChatArea";
import CreateGroups from "./Components/CreateGroups";
import Users from "./Components/Users";
import Groups from "./Components/Groups";
import SingUp from "./Components/SingUp";
  

const App = () => {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/register" element={<SingUp />} />
          <Route path="app" element={<MainContainer />}>
            <Route path="welcome" element={<Welcome />} />
            <Route path="chat/:_id" element={<ChatArea />} />
            <Route path="create-groups" element={<CreateGroups />} />
            <Route path="users" element={<Users />} />
            <Route path="groups" element={<Groups />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
