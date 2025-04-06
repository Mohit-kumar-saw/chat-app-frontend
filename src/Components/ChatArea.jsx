import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Avatar,
  IconButton as MuiIconButton,
  InputAdornment,
  Divider
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import MessageSelf from "./MessageSelf";
import MessageOthers from "./MessageOthers";
import axios from "axios";
import { BASE_URL } from "../Url";
import { myContext } from "./MainContainer";
import "./myStyles.css";
import io from "socket.io-client";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import EmojiPicker from 'emoji-picker-react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SOCKET_URL = BASE_URL;

function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const navigate = useNavigate();
  const dyParams = useParams();
  const [chat_id, chat_user] = dyParams._id?.split("&") || [];
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refresh, setRefresh } = useContext(myContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [chatInfo, setChatInfo] = useState(null);
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [openMembersDialog, setOpenMembersDialog] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [chatInfoLoading, setChatInfoLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [messagesLoading, setMessagesLoading] = useState(true);

  const userData = React.useMemo(() => {
    const data = localStorage.getItem("userData");
    if (!data) return null;
    return JSON.parse(data);
  }, []);

  const isAdmin = chatInfo?.groupAdmin?._id === userData?.data?._id;
  const isGroupChat = chatInfo?.isGroupChat;

  // Fetch chat info first
  useEffect(() => {
    const fetchChatInfo = async () => {
      if (!chat_id || !userData?.data?.token) return;

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        };

        // Get chat info first
        const response = await axios.get(`${BASE_URL}/chat`, config);
        if (response.data) {
          const currentChat = response.data.find(chat => chat._id === chat_id);
          if (currentChat) {
            setChatInfo(currentChat);
            if (currentChat.users) {
              setGroupMembers(currentChat.users);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching chat info:", error);
      }
    };

    fetchChatInfo();
  }, [chat_id, userData?.data?.token, refresh]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chat_id || !userData?.data?.token) return;

      try {
        setMessagesLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        };

        const response = await axios.get(`${BASE_URL}/message/${chat_id}`, config);
        
        if (!response.data) {
          throw new Error("No messages received");
        }

        // Process messages in batches for better performance
        const processMessages = () => {
          const validMessages = response.data
            .filter(msg => msg && msg.content && msg.sender)
            .map(msg => ({
              ...msg,
              sender: {
                ...msg.sender,
                username: msg.sender.username || "Unknown User"
              }
            }));
          setAllMessages(validMessages);
          scrollToBottom();
        };

        // Use requestAnimationFrame for smoother UI updates
        requestAnimationFrame(processMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [chat_id, userData?.data?.token]);

  // Socket.IO setup
  useEffect(() => {
    if (!userData?.data) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL);

    // Setup event
    socketRef.current.emit("setup", userData);

    // Join chat room
    if (chat_id) {
      socketRef.current.emit("join chat", chat_id);
    }

    // Handle incoming messages
    socketRef.current.on("message received", (newMessage) => {
      console.log("New message received:", newMessage);
      
      if (newMessage.chat._id === chat_id) {
        setAllMessages(prevMessages => [...prevMessages, newMessage]);
        scrollToBottom();
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave chat", chat_id);
        socketRef.current.disconnect();
      }
    };
  }, [chat_id, userData]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Add or remove visible class based on chat_id
    const chatArea = document.querySelector('.chatArea-container');
    const sidebar = document.querySelector('.sidebar-container');
    
    if (chatArea && sidebar && isMobileView) {
      if (chat_id) {
        chatArea.classList.add('visible');
        sidebar.classList.add('hidden');
      } else {
        chatArea.classList.remove('visible');
        sidebar.classList.remove('hidden');
      }
    }
  }, [chat_id, isMobileView]);

  const scrollToBottom = () => {
    if (!messagesEndRef.current) return;
    
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const sendMessage = async () => {
    if (!messageContent.trim() || !chat_id || !userData?.data?.token) return;

    try {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

      const { data } = await axios.post(
        `${BASE_URL}/message`,
        {
          content: messageContent.trim(),
          chatId: chat_id,
        },
        config
      );

      setMessageContent("");

      // Add message to local state immediately
      const newMessage = {
        ...data,
        sender: {
          ...data.sender,
          username: data.sender?.username || userData.data.username
        }
      };

      setAllMessages(prev => [...prev, newMessage]);

      // Emit socket event
      if (socketRef.current) {
        socketRef.current.emit("new message", {
          ...newMessage,
          chat: { 
            _id: chat_id,
            users: data.chat.users.map(u => u._id)
          }
        });
      }

      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Handle specific error cases
      if (error.response?.data?.error === "NOT_MEMBER" || error.response?.data?.error === "NOT_GROUP_MEMBER") {
        // Redirect to main chat view
        navigate("/app");
        
        // Show error message
        alert(error.response.data.message);
      } else {
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenRenameDialog = () => {
    setNewGroupName(chatInfo?.chatName || "");
    setOpenRenameDialog(true);
    handleMenuClose();
  };

  const handleCloseRenameDialog = () => {
    setOpenRenameDialog(false);
    setNewGroupName("");
  };

  const handleRenameGroup = async () => {
    if (!newGroupName.trim() || !userData?.data?.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      await axios.put(
        `${BASE_URL}/chat/group/rename`,
        {
          chatId: chat_id,
          chatName: newGroupName
        },
        config
      );

      setRefresh(!refresh);
      handleCloseRenameDialog();
    } catch (error) {
      console.error("Error renaming group:", error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!userData?.data?.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      await axios.put(
        `${BASE_URL}/chat/group/remove`,
        {
          chatId: chat_id,
          userId: userData.data._id
        },
        config
      );

      navigate("/app/chats");
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const handleDeleteGroup = async () => {
    if (!userData?.data?.token) return;

    try {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

      await axios.delete(
        `${BASE_URL}/chat/group/delete`,
        {
          data: { chatId: chat_id },
          headers: config.headers
        }
      );

      navigate("/app/chats");
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleOpenMembersDialog = () => {
    setOpenMembersDialog(true);
    setSearchUser("");
    setSearchResults([]);
    setSelectedUsers([]);
    if (chatInfo?.users) {
      setGroupMembers(chatInfo.users);
    }
    handleMenuClose();
  };

  const handleCloseMembersDialog = () => {
    setOpenMembersDialog(false);
    setSearchUser("");
    setSearchResults([]);
    setSelectedUsers([]);
  };

  const handleSearchUsers = async (query) => {
    if (!query.trim() || !userData?.data?.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      const response = await axios.get(`${BASE_URL}/user?search=${query}`, config);
      
      // Check if response has the correct structure
      if (response.data?.success && Array.isArray(response.data.data)) {
        // Filter out users who are already in the group and the current user
        const filteredUsers = response.data.data.filter(
          user => !groupMembers.some(member => member._id === user._id) &&
                 user._id !== userData.data._id
        );
        
        setSearchResults(filteredUsers);
      } else {
        console.error("Invalid response format:", response.data);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    }
  };

  const handleAddMembers = async () => {
    if (!selectedUsers.length || !userData?.data?.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      await axios.put(
        `${BASE_URL}/chat/group/add`,
        {
          chatId: chat_id,
          userId: selectedUsers.map(u => u._id)
        },
        config
      );

      setRefresh(!refresh);
      handleCloseMembersDialog();
    } catch (error) {
      console.error("Error adding members:", error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!userData?.data?.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      await axios.put(
        `${BASE_URL}/chat/group/remove`,
        {
          chatId: chat_id,
          userId: userId
        },
        config
      );

      setGroupMembers(prev => prev.filter(member => member._id !== userId));
      setRefresh(!refresh);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const onEmojiClick = (emojiObject) => {
    const cursor = messageContent.length;
    const text = messageContent.slice(0, cursor) + emojiObject.emoji + messageContent.slice(cursor);
    setMessageContent(text);
  };

  const handleBack = () => {
    const sidebar = document.querySelector('.sidebar-container');
    const chatArea = document.querySelector('.chatArea-container');
    
    if (sidebar && chatArea) {
      sidebar.classList.remove('hidden');
      chatArea.classList.remove('visible');
    }
    
    navigate('/app');
  };

  if (!chat_id) {
    return (
      <div className={"welcome-container" + (lightTheme ? "" : " dark")}>
        <h1>Welcome to Chat App</h1>
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

    return (
      <div className={"chatArea-container" + (lightTheme ? "" : " dark")}>
      <div className={"chatArea-header" + (lightTheme ? "" : " dark")}>
        {isMobileView && (
          <IconButton 
            className="back-button" 
            onClick={handleBack}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <div className="chat-user-info">
          <div className={"con-icon" + (lightTheme ? "" : " dark")}>
            {chatInfo?.isGroupChat 
              ? chatInfo?.chatName?.[0]?.toUpperCase() 
              : chatInfo?.users?.find(u => u._id !== userData?.data?._id)?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="header-text">
            <p className={"con-title" + (lightTheme ? "" : " dark")}>
              {chatInfo?.isGroupChat 
                ? chatInfo?.chatName 
                : chatInfo?.users?.find(u => u._id !== userData?.data?._id)?.username || "Loading..."}
            </p>
            <p className={"con-timestamp" + (lightTheme ? "" : " dark")}>
              {chatInfo?.isGroupChat ? `${chatInfo?.users?.length || 0} members` : "Online"}
            </p>
          </div>
        </div>
        <div className="chat-actions">
          <Tooltip title="More options" arrow>
            <IconButton className="icon-button" onClick={handleMenuOpen}>
              <MoreVertRoundedIcon />
          </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                backgroundColor: lightTheme ? '#fff' : '#2d3941',
                color: lightTheme ? '#000' : '#fff',
                '& .MuiMenuItem-root:hover': {
                  backgroundColor: lightTheme ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                },
                '& .MuiDivider-root': {
                  borderColor: lightTheme ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                },
              },
            }}
          >
            {chatInfoLoading ? [
              <MenuItem key="loading" disabled>Loading...</MenuItem>
            ] : chatInfo?.isGroupChat ? (
              chatInfo.groupAdmin?._id === userData?.data?._id ? [
                <MenuItem key="manage-members" onClick={handleOpenMembersDialog}>
                  Manage Members
                </MenuItem>,
                <MenuItem key="rename" onClick={handleOpenRenameDialog}>
                  Rename Group
                </MenuItem>,
                <Divider key="divider" />,
                <MenuItem key="delete" onClick={handleDeleteGroup} sx={{ color: '#d32f2f' }}>
                  Delete Chat
                </MenuItem>
              ] : [
                <MenuItem key="leave" onClick={handleLeaveGroup} sx={{ color: '#d32f2f' }}>
                  Leave Group
                </MenuItem>
              ]
            ) : [
              <MenuItem key="delete" onClick={handleDeleteGroup} sx={{ color: '#d32f2f' }}>
                Delete Chat
              </MenuItem>
            ]}
          </Menu>
        </div>
      </div>

      <div className={"messages-container" + (lightTheme ? "" : " dark")}>
        {messagesLoading ? (
          <div className="message-skeleton-container">
            {[...Array(6)].map((_, index) => (
              <div key={index} className={`message-skeleton ${index % 2 === 0 ? 'received' : 'sent'}`}>
                {index % 2 === 0 && <div className="message-avatar-skeleton skeleton"></div>}
                <div className="message-content-skeleton">
                  <div className="message-text-skeleton skeleton"></div>
                  <div className="message-text-skeleton skeleton"></div>
                </div>
                {index % 2 !== 0 && <div className="message-avatar-skeleton skeleton"></div>}
              </div>
            ))}
          </div>
        ) : allMessages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet</p>
            <p className="sub-text">Start the conversation!</p>
          </div>
        ) : (
          allMessages.map((message, index) => {
            if (!message || !message.sender) return null;

            const isSelf = message.sender._id === userData?.data?._id;
            const MessageComponent = isSelf ? MessageSelf : MessageOthers;
            
            return (
              <MessageComponent 
                props={{
                  ...message,
                  sender: {
                    ...message.sender,
                    username: message.sender.username || (isSelf ? userData.data.username : "Unknown User")
                  }
                }} 
                key={message._id || `msg-${index}`} 
              />
            );
          }).filter(Boolean)
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={"text-input-area" + (lightTheme ? "" : " dark")}>
        <div className="emoji-picker-container">
          <IconButton 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={"emoji-button" + (lightTheme ? "" : " dark")}
          >
            <EmojiEmotionsIcon />
          </IconButton>
          {showEmojiPicker && (
            <div className="emoji-picker-wrapper">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={300}
                height={400}
              />
            </div>
          )}
        </div>
          <input
          type="text"
          className={"message-input" + (lightTheme ? "" : " input-dark")}
          placeholder="Type a message"
            value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
        />
        <IconButton onClick={sendMessage} style={{ color: lightTheme ? 'blue' : '#fff' }}>
          <SendRoundedIcon />
        </IconButton>
      </div>

      {/* Members Management Dialog */}
      <Dialog 
        open={openMembersDialog} 
        onClose={handleCloseMembersDialog}
        maxWidth="sm"
        fullWidth
        keepMounted={false}
        disablePortal
        PaperProps={{
          sx: {
            backgroundColor: lightTheme ? '#fff' : '#2d3941',
            color: lightTheme ? '#000' : '#fff',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: lightTheme ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
          mb: 2
        }}>
          Manage Group Members
          <IconButton
            aria-label="close"
            onClick={handleCloseMembersDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search users to add"
            type="text"
            fullWidth
            variant="outlined"
            value={searchUser}
            onChange={(e) => {
              setSearchUser(e.target.value);
              handleSearchUsers(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: lightTheme ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: '#6c5ce7',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6c5ce7',
                },
              },
              '& .MuiInputLabel-root': {
                color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)',
              },
              '& .MuiInputBase-input': {
                color: lightTheme ? '#000' : '#fff',
              },
            }}
          />

          {/* Selected Users */}
          <div style={{ 
            marginBottom: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            {selectedUsers.map((user) => (
              <Chip
                key={user._id}
                avatar={<Avatar sx={{ bgcolor: '#6c5ce7' }}>{user.username[0].toUpperCase()}</Avatar>}
                label={user.username}
                onDelete={() => setSelectedUsers(prev => prev.filter(u => u._id !== user._id))}
                sx={{
                  backgroundColor: lightTheme ? '#f0f0f0' : '#3f4b52',
                  color: lightTheme ? '#000' : '#fff',
                  '& .MuiChip-deleteIcon': {
                    color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)',
                    '&:hover': {
                      color: '#6c5ce7',
                    },
                  },
                }}
              />
            ))}
          </div>

          {/* Search Results */}
          {searchUser && (
            <List>
              {searchResults.map((user) => (
                <ListItem 
                  key={user._id}
                  button
            onClick={() => {
                    if (!selectedUsers.some(u => u._id === user._id)) {
                      setSelectedUsers(prev => [...prev, user]);
                    }
                    setSearchUser("");
                    setSearchResults([]);
                  }}
                  sx={{
                    '&:hover': {
                      backgroundColor: lightTheme ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  <Avatar sx={{ mr: 2, bgcolor: '#6c5ce7' }}>{user.username[0].toUpperCase()}</Avatar>
                  <ListItemText 
                    primary={user.username} 
                    secondary={user.email}
                    primaryTypographyProps={{
                      color: lightTheme ? 'inherit' : '#fff'
                    }}
                    secondaryTypographyProps={{
                      color: lightTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {/* Current Members */}
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', color: lightTheme ? 'inherit' : '#fff' }}>
              Current Members
            </h4>
            <List>
              {groupMembers.map((member) => (
                <ListItem 
                  key={member._id}
                  sx={{
                    backgroundColor: lightTheme ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    mb: 1,
                  }}
                >
                  <Avatar sx={{ mr: 2, bgcolor: '#6c5ce7' }}>{member.username[0].toUpperCase()}</Avatar>
                  <ListItemText 
                    primary={member.username} 
                    secondary={member._id === chatInfo?.groupAdmin?._id ? 'Admin' : 'Member'}
                    primaryTypographyProps={{
                      color: lightTheme ? 'inherit' : '#fff'
                    }}
                    secondaryTypographyProps={{
                      color: lightTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)'
                    }}
                  />
                  {member._id !== chatInfo?.groupAdmin?._id && (
                    <ListItemSecondaryAction>
                      <MuiIconButton 
                        edge="end" 
                        aria-label="remove"
                        onClick={() => handleRemoveMember(member._id)}
                        sx={{
                          color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)',
                          '&:hover': {
                            color: '#d32f2f',
                          },
                        }}
                      >
                        <PersonRemoveIcon />
                      </MuiIconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          </div>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid', borderColor: lightTheme ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)', p: 2 }}>
          <Button 
            onClick={handleCloseMembersDialog}
            sx={{
              color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddMembers}
            disabled={!selectedUsers.length}
            variant="contained"
            sx={{
              bgcolor: '#6c5ce7',
              '&:hover': {
                bgcolor: '#5849e6',
              },
              '&.Mui-disabled': {
                bgcolor: lightTheme ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
              },
            }}
          >
            Add Selected Users
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Group Dialog */}
      <Dialog 
        open={openRenameDialog} 
        onClose={handleCloseRenameDialog}
        maxWidth="xs"
        fullWidth
        keepMounted={false}
        disablePortal
      >
        <DialogTitle>Rename Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRenameDialog}>Cancel</Button>
          <Button 
            onClick={handleRenameGroup}
            disabled={!newGroupName.trim()}
            variant="contained"
            color="primary"
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
      </div>
    );
}

export default ChatArea;