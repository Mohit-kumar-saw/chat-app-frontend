import React, { useContext, useEffect, useState } from "react";
import "./myStyles.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { myContext } from "./MainContainer";
import { BASE_URL } from "../Url";

function ConversationItems({ searchQuery }) {
  const { refresh } = useContext(myContext);
  const lightTheme = useSelector((state) => state.themeKey);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    if (!userData?.data?.token) {
      navigate("/");
      return;
    }

    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const config = {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        };

        const response = await axios.get(`${BASE_URL}/chat`, config);
        if (response.data) {
          setConversations(response.data);
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError(err.response?.data?.message || "Failed to fetch conversations");
        if (err.response?.status === 401) {
          localStorage.removeItem("userData");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [refresh, userData?.data?.token, navigate]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(chat => {
    if (!searchQuery) return true;
    const searchTerm = searchQuery.toLowerCase();
    
    // Search in chat name
    if (chat.chatName?.toLowerCase().includes(searchTerm)) return true;
    
    // Search in users' usernames and emails
    return chat.users?.some(user => 
      user.username?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm)
    );
  });

  if (loading) {
    return <div className="loading">Loading conversations...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="no-conversations">
        {searchQuery ? (
          <p>No conversations found matching "{searchQuery}"</p>
        ) : (
          <>
            <p>No conversations yet</p>
            <p className="sub-text">Start chatting by searching for users</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="conversation-container">
      {filteredConversations.map((chat) => {
        // Find the other user in the conversation
        const otherUser = chat.users.find(u => u._id !== userData.data._id);
        const displayName = chat.isGroupChat ? chat.chatName : otherUser?.username;
        const lastMessage = chat.latestMessage?.content || "No messages yet";
        
        return (
          <div
            key={chat._id}
            className={"conversation-item" + (lightTheme ? "" : " dark")}
            onClick={() => navigate(`/app/chat/${chat._id}&${displayName}`)}
          >
            <div className={"con-icon" + (lightTheme ? "" : " dark")}>
              {displayName?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="conversation-info">
              <div className="con-info-header">
                <h3 className="con-title">{displayName}</h3>
                {chat.latestMessage && (
                  <span className="con-timestamp">
                    {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
              <p className="con-lastMessage">{lastMessage}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ConversationItems; 