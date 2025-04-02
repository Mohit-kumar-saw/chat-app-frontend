import React, { useContext, useEffect, useState } from "react";
import "./myStyles.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../Url";
import { myContext } from "./MainContainer";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { motion, AnimatePresence } from "framer-motion";
import ConversationItem from "./ConversationItem";
import { toggleTheme } from "../Features/themeSlice";

function Conversations() {
  const lightTheme = useSelector((state) => state.themeKey);
  const dispatch = useDispatch();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { refresh, setRefresh } = useContext(myContext);
  const navigate = useNavigate();

  // Get user data once on component mount
  const userData = React.useMemo(() => {
    const data = localStorage.getItem("userData");
    if (!data) {
      navigate("/");
      return null;
    }
    try {
      return JSON.parse(data);
    } catch (err) {
      console.error("Error parsing userData:", err);
      localStorage.removeItem("userData");
      navigate("/");
      return null;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userData?.data?.token) {
        console.log("No user token found, redirecting to login");
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const config = {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        };

        console.log("Fetching conversations with config:", config);
        const response = await axios.get(`${BASE_URL}/chat`, config);
        console.log("Raw response:", response);

        if (!response.data) {
          throw new Error("No data received from server");
        }

        if (Array.isArray(response.data)) {
          const sortedConversations = response.data
            .filter(chat => chat && chat.users) // Filter out invalid chats
            .sort((a, b) => {
              const timeA = a.latestMessage?.createdAt || a.createdAt;
              const timeB = b.latestMessage?.createdAt || b.createdAt;
              return new Date(timeB) - new Date(timeA);
            });
          console.log("Processed conversations:", sortedConversations);
          setConversations(sortedConversations);
        } else {
          throw new Error("Invalid conversations data received");
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(err.response?.data?.message || "Failed to load conversations");
        
        // If token is invalid, redirect to login
        if (err.response?.status === 401) {
          localStorage.removeItem("userData");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [refresh, userData, navigate]);

  const filteredConversations = conversations.filter((chat) => {
    if (!searchQuery) return true;
    if (!chat || !chat.users) return false;
    
    const otherUser = chat.users.find(user => user?._id !== userData?.data?._id);
    if (!otherUser) return false;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      otherUser.username?.toLowerCase().includes(searchLower) ||
      otherUser.email?.toLowerCase().includes(searchLower) ||
      chat.latestMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  if (!userData) {
    return null;
  }

  if (loading) {
    return (
      <div className={"loading" + (lightTheme ? "" : " dark")}>
        Loading conversations...
      </div>
    );
  }

  if (error) {
    return (
      <div className={"error-container" + (lightTheme ? "" : " dark")}>
        <p>{error}</p>
        <IconButton onClick={() => setRefresh(!refresh)}>
          <RefreshIcon className={"icon" + (lightTheme ? "" : " dark")} />
        </IconButton>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="conversation-container"
      >
        {filteredConversations.length === 0 ? (
          <div className={"no-conversations" + (lightTheme ? "" : " dark")}>
            <p>{searchQuery ? "No matching conversations" : "No conversations yet"}</p>
            <p className={"sub-text" + (lightTheme ? "" : " dark")}>
              {searchQuery ? "Try a different search" : "Start chatting with someone!"}
            </p>
          </div>
        ) : (
          filteredConversations.map((chat) => (
            <ConversationItem
              key={chat._id}
              props={chat}
              isActive={false}
            />
          ))
        )}
      </motion.div>
      <div className={"bottom-bar" + (lightTheme ? "" : " dark")}>
       
        <IconButton 
          onClick={handleLogout}
          className={"logout-btn" + (lightTheme ? "" : " dark")}
          title="Logout"
        >
          <LogoutIcon />
        </IconButton>
        <IconButton 
          onClick={handleThemeToggle}
          className={"theme-toggle-btn" + (lightTheme ? "" : " dark")}
          title={lightTheme ? "Switch to dark mode" : "Switch to light mode"}
        >
          {lightTheme ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </div>
    </>
  );
}

export default Conversations; 