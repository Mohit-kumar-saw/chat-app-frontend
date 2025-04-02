import React, { useContext, useEffect, useState } from "react";
import "./myStyles.css";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import logo from "../image/img.png";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { refreshSidebarFun } from "../Features/refreshSidebar";
import { myContext } from "./MainContainer";
import { BASE_URL } from "../Url";

function Users() {
  const { refresh, setRefresh } = useContext(myContext);
  const lightTheme = useSelector((state) => state.themeKey);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const nav = useNavigate();
  const dispatch = useDispatch();

  // Get user data once on component mount
  const userData = React.useMemo(() => {
    const data = localStorage.getItem("userData");
    if (!data) {
      nav("/");
      return null;
    }
    return JSON.parse(data);
  }, [nav]);

  // Fetch users
  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      if (!userData?.data?.token) return;

      try {
        setLoading(true);
        setError(null);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        };
        
        console.log("Fetching users...");
        const response = await axios.get(`${BASE_URL}/user`, config);
        console.log("Users response:", response.data);
        
        if (!isMounted) return;

        if (response.data?.success) {
          const usersArray = response.data.data;
          if (Array.isArray(usersArray)) {
            // Filter out current user and sort by username
            const filteredUsers = usersArray
              .filter(user => user._id !== userData.data._id)
              .sort((a, b) => a.username.localeCompare(b.username));
            setUsers(filteredUsers);
          } else {
            throw new Error("Invalid users data format");
          }
        } else {
          throw new Error(response.data?.message || "Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        if (isMounted) {
          const errorMessage = err.response?.data?.message || err.message || "Failed to fetch users";
          setError(errorMessage);
          
          // If unauthorized, redirect to login
          if (err.response?.status === 401) {
            localStorage.removeItem("userData");
            nav("/");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [refresh, userData?.data?.token, userData?.data?._id, nav]);

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const searchTerm = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm)
    );
  });

  const createChat = async (userId) => {
    if (!userData?.data?.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };
      
      const response = await axios.post(
        `${BASE_URL}/chat`,
        { 
          userId,
          isGroupChat: false
        },
        config
      );
      
      console.log("Chat creation response:", response.data);
      
      if (response.data) {
        dispatch(refreshSidebarFun());
        const chatId = response.data._id;
        const otherUser = response.data.users.find(u => u._id !== userData.data._id);
        const chatName = otherUser?.username || 'Chat';
        nav(`/app/chat/${chatId}&${chatName}`);
      } else {
        throw new Error("Failed to create chat");
      }
    } catch (err) {
      console.error("Error creating chat:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to create chat. Please try again.");
    }
  };

  if (!userData) {
    return null; // Will redirect in useMemo
  }

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Error: {error}
        <IconButton
          className="refresh-button"
          onClick={() => setRefresh(!refresh)}
        >
          <RefreshIcon />
        </IconButton>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{
          duration: 0.3
        }}
        className="list-container"
      >
        <div className={"ug-header" + (lightTheme ? "" : " dark dark-border")}>
          <img
            src={logo}
            style={{ height: "2rem", width: "2rem", marginLeft: "10px" }}
            alt="Logo"
          />
          <p className={"ug-title" + (lightTheme ? "" : " dark")}>
            Available Users
          </p>
          <IconButton
            className={"icon" + (lightTheme ? "" : " dark")}
            onClick={() => setRefresh(!refresh)}
          >
            <RefreshIcon />
          </IconButton>
        </div>
        
        <div className={"sb-search" + (lightTheme ? "" : " dark dark-border")}>
          <IconButton className={"icon" + (lightTheme ? "" : " dark")}>
            <SearchIcon />
          </IconButton>
          <input
            placeholder="Search users..."
            className={"search-box" + (lightTheme ? "" : " dark")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="ug-list">
          {filteredUsers.length === 0 ? (
            <div className="no-results">
              {searchQuery ? "No users found" : "No users available"}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={"list-tem" + (lightTheme ? "" : " dark list dark-border")}
                key={user._id}
                onClick={() => createChat(user._id)}
              >
                <p className={"con-icon" + (lightTheme ? "" : " dark icon-dark")}>
                  {user.username?.[0]?.toUpperCase() || "U"}
                </p>
                <div className={"user-info" + (lightTheme ? "" : " dark title")}>
                  <p className="username">{user.username}</p>
                  <p className="email">{user.email}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Users;