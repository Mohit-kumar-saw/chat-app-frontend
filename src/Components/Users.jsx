import React, { useContext, useEffect, useState } from "react";
import "./myStyles.css";
import { IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { refreshSidebarFun } from "../Features/refreshSidebar";
import { myContext } from "./MainContainer";
import { BASE_URL } from "../Url";

function Users({ searchQuery, onSelectUser }) {
  const { refresh, setRefresh } = useContext(myContext);
  const lightTheme = useSelector((state) => state.themeKey);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    return () => {
      isMounted = false;
    };
  }, [refresh, userData?.data?.token, userData?.data?._id, nav]);

  // Memoize filtered users
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      if (!searchQuery) return true;
      const searchTerm = searchQuery.toLowerCase();
      return (
        user.username?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm)
      );
    });
  }, [users, searchQuery]);

  const handleUserSelect = async (userId, username) => {
    if (!userData?.data?.token) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      const response = await axios.post(
        `${BASE_URL}/chat`,
        { userId },
        config
      );

      if (response.data) {
        const chatId = response.data._id;
        if (onSelectUser) {
          onSelectUser(chatId, username);
        } else {
          nav(`/app/chat/${chatId}&${username}`);
        }
      }
    } catch (error) {
      setError("Failed to create chat");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return null;
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
        <div className="user-list">
          {filteredUsers.length === 0 ? (
            <div className="no-results">
              {searchQuery ? "No users found" : "No users available"}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={"user-list-item" + (lightTheme ? "" : " dark")}
                key={user._id}
                onClick={() => handleUserSelect(user._id, user.username)}
              >
                <div className={"user-avatar" + (lightTheme ? "" : " dark")}>
                  {user.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="user-details">
                  <h3 className="user-name">{user.username}</h3>
                  <p className="user-email">{user.email}</p>
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