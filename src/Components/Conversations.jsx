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

function Conversations({ searchQuery, onConversationClick }) {
  const lightTheme = useSelector((state) => state.themeKey);
  const dispatch = useDispatch();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refresh, setRefresh } = useContext(myContext);
  const navigate = useNavigate();

  const userData = React.useMemo(() => {
    const data = localStorage.getItem("userData");
    if (!data) return null;
    return JSON.parse(data);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleConversationClick = (conversationId, displayName) => {
    if (onConversationClick) {
      onConversationClick(conversationId, displayName);
    } else {
      navigate(`/app/chat/${conversationId}&${displayName}`);
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userData?.data?.token) {
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

        const response = await axios.get(`${BASE_URL}/chat`, config);

        if (!response.data) {
          throw new Error("No data received from server");
        }

        if (Array.isArray(response.data)) {
          const sortedConversations = response.data
            .filter(chat => chat && chat.users)
            .sort((a, b) => {
              const timeA = a.latestMessage?.createdAt || a.createdAt;
              const timeB = b.latestMessage?.createdAt || b.createdAt;
              return new Date(timeB) - new Date(timeA);
            });
          setConversations(sortedConversations);
        } else {
          throw new Error("Invalid conversations data");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load conversations");
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

  // Memoize filtered conversations
  const filteredConversations = React.useMemo(() => {
    return conversations.filter((chat) => {
      if (!searchQuery) return true;
      const chatName = chat.isGroupChat 
        ? chat.chatName 
        : chat.users.find(u => u._id !== userData?.data?._id)?.username || "";
      return chatName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery, userData?.data?._id]);

  if (!userData) {
    return null;
  }

  if (loading) {
    return (
      <div className={"conversation-container" + (lightTheme ? "" : " dark")}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="conversation-skeleton">
            <div className="conversation-avatar-skeleton skeleton"></div>
            <div className="conversation-content-skeleton">
              <div className="conversation-title-skeleton skeleton"></div>
              <div className="conversation-message-skeleton skeleton"></div>
            </div>
          </div>
        ))}
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
          filteredConversations.map((chat) => {
            const otherUser = chat.users.find(u => u._id !== userData?.data?._id);
            const displayName = chat.isGroupChat ? chat.chatName : otherUser?.username;
            
            return (
              <div
                key={chat._id}
                className={"conversation-item" + (lightTheme ? "" : " dark")}
                onClick={() => handleConversationClick(chat._id, displayName)}
              >
                <ConversationItem
                  props={chat}
                  isActive={false}
                />
              </div>
            );
          })
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