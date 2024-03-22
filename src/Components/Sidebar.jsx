import React, { useContext, useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { IconButton } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import NightlightIcon from "@mui/icons-material/Nightlight";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../Features/ThemeSlice";
import axios from "axios";
import { myContext } from "./MainContainer";
import { BASE_URL } from "../Url";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const { refresh, setRefresh } = useContext(myContext);
  const [conversations, setConversations] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const nav = useNavigate();

  if (!userData) {
    console.log("User not Authenticated");
    nav("/");
    return null; // Add a return statement here to prevent further execution
  }

  const user = userData.data;
  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    axios.get(`${BASE_URL}/chat/`, config).then((response) => {
      console.log("Data refresh in sidebar ", response.data);
      setConversations(response.data);
    });
  }, [refresh]);

  return (
    <div className="sidebar-container">
      <div className={"sb-header" + (lightTheme ? "" : " dark dark-border")}>
        <div className="other-icons">
          <IconButton
            onClick={() => {
              nav("/app/welcome");
            }}
          >
            <AccountCircleIcon
              className={"icon" + (lightTheme ? "" : " dark")}
            />
          </IconButton>

          <IconButton
            onClick={() => {
              navigate("users");
            }}
          >
            <PersonAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton
            onClick={() => {
              navigate("groups");
            }}
          >
            <GroupAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton
            onClick={() => {
              navigate("create-groups");
            }}
          >
            <AddCircleIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>

          <IconButton
            onClick={() => {
              dispatch(toggleTheme());
            }}
          >
            {lightTheme && (
              <NightlightIcon
                className={"icon" + (lightTheme ? "" : " dark")}
              />
            )}
            {!lightTheme && (
              <LightModeIcon className={"icon" + (lightTheme ? "" : " dark")} />
            )}
          </IconButton>
          <IconButton
            onClick={() => {
              localStorage.removeItem("userData");
              navigate("/");
            }}
          >
            <ExitToAppIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
        </div>
      </div>
      <div className={"sb-search" + (lightTheme ? "" : " dark dark-border")}>
        <IconButton className={"icon" + (lightTheme ? "" : " dark")}>
          <SearchIcon />
        </IconButton>
        <input
          placeholder="Search"
          className={"search-box" + (lightTheme ? "" : " dark ")}
        />
      </div>
      <div className={"sb-conversations" + (lightTheme ? "" : " dark dark-border")}>
      {conversations && conversations.map((conversation, index) => {
  const otherUser = conversation.users.find(user => user._id !== userData.data._id);
  const otherUserName = otherUser ? otherUser.name : 'Unknown User';
  return (
    <div
      key={index}
      className={"conversation-container" + (lightTheme ? "" : " dark list")}
      onClick={() => {
  navigate(
    "chat/" + conversation._id + "&" + (conversation.isGroupChat ? conversation.chatName : otherUserName)
  )

      }}
    >
      <p className={"con-icon" + (lightTheme ? "" : " dark icon-dark")}>
        {otherUserName[0]}
      </p>
      <p className={"con-title" + (lightTheme ? "" : " dark title")}>
  {conversation.isGroupChat ? conversation.chatName : otherUserName}
</p>
      <p className={"con-lastMessage" + (lightTheme ? "" : " dark-last-message ")}>
        {conversation.latestMessage ? conversation.latestMessage.content : "No previous Messages, click here to start a new chat"}
      </p>
    </div>
  );
})}


      </div>
    </div>
  );
}

export default Sidebar;

