import React, { useState, useContext, useEffect } from "react";
import "./myStyles.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../Features/themeSlice";
import axios from "axios";
import { BASE_URL } from "../Url";
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Chip, Avatar, CircularProgress } from "@mui/material";
import { myContext } from "./MainContainer";
import Users from "./Users";
import Conversations from "./Conversations";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";

// Modern Material Icons
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const { 
    refresh, 
    setRefresh, 
    searchQuery, 
    setSearchQuery, 
    currentView, 
    setCurrentView,
    getSearchPlaceholder 
  } = useContext(myContext);
  const [activeTab, setActiveTab] = useState("conversations");
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [updatedProfile, setUpdatedProfile] = useState({
    username: "",
    email: "",
    bio: ""
  });
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const userData = React.useMemo(() => {
    const data = localStorage.getItem("userData");
    if (!data) {
      navigate("/");
      return null;
    }
    return JSON.parse(data);
  }, [navigate]);

  React.useEffect(() => {
    if (userData?.data) {
      setUserProfile(userData.data);
      setUpdatedProfile({
        username: userData.data.username || "",
        email: userData.data.email || "",
        bio: userData.data.bio || ""
      });
    }
  }, [userData]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add new effect for handling visibility
  useEffect(() => {
    const sidebar = document.querySelector('.sidebar-container');
    const chatArea = document.querySelector('.chatArea-container');
    
    if (sidebar && chatArea) {
      sidebar.classList.remove('hidden');
      chatArea.classList.remove('visible');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleOpenGroupModal = () => {
    setOpenGroupModal(true);
    // Initial user search when modal opens
    handleSearchUsers("");
  };

  const handleCloseGroupModal = () => {
    setOpenGroupModal(false);
    setGroupName("");
    setSearchUser("");
    setSelectedUsers([]);
    setSearchResults([]);
  };

  const handleSearchUsers = async (query) => {
    if (!userData?.data?.token) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      console.log("Searching users with query:", query);
      const response = await axios.get(
        `${BASE_URL}/user?search=${query}`,
        config
      );

      console.log("Search response:", response.data);
      
      if (response.data?.success) {
        const filteredUsers = response.data.data.filter(
          user => user._id !== userData.data._id && 
          !selectedUsers.some(selected => selected._id === user._id)
        );
        setSearchResults(filteredUsers);
      } else {
        console.error("Invalid response format:", response.data);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error.response || error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchResults(searchResults.filter(u => u._id !== user._id));
    setSearchUser("");
  };

  const handleRemoveUser = (userId) => {
    const removedUser = selectedUsers.find(user => user._id === userId);
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
    if (removedUser) {
      setSearchResults([...searchResults, removedUser]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1 || !userData?.data?.token) return;

    try {
      setLoading(true);
    const config = {
      headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      const response = await axios.post(
        `${BASE_URL}/chat/group`,
        {
          name: groupName,
          users: JSON.stringify(selectedUsers.map(u => u._id))
        },
        config
      );

      if (response.data) {
        handleCloseGroupModal();
        setActiveTab("conversations");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfileModal = () => {
    setOpenProfileModal(true);
    setEditMode(false);
  };

  const handleCloseProfileModal = () => {
    setOpenProfileModal(false);
    setEditMode(false);
    if (userProfile) {
      setUpdatedProfile({
        username: userProfile.username || "",
        email: userProfile.email || "",
        bio: userProfile.bio || ""
      });
    }
  };

  const handleEditProfile = async () => {
    if (!userData?.data?.token) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      const response = await axios.put(
        `${BASE_URL}/user/profile`,
        updatedProfile,
        config
      );

      if (response.data) {
        const updatedUserData = {
          ...userData,
          data: {
            ...userData.data,
            ...response.data
          }
        };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        setUserProfile(response.data);
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleConversationClick = (conversationId, displayName) => {
    if (isMobileView) {
      const sidebar = document.querySelector('.sidebar-container');
      const chatArea = document.querySelector('.chatArea-container');
      
      if (sidebar && chatArea) {
        sidebar.classList.add('hidden');
        chatArea.classList.add('visible');
      }
    }
    navigate(`/app/chat/${conversationId}&${displayName}`);
  };

  return (
    <div className={"sidebar-container" + (lightTheme ? "" : " dark")}>
      <div className={"sb-header" + (lightTheme ? "" : " dark")}>
        <div className="other-icons"
        >
          <div className="logo" onClick={() => navigate("/app")} style={{ cursor: 'pointer' }}>
            <div className="logo-text" onClick={() => navigate("/app")}>
              <span>Chat</span><span className="logo-sphere">Sphere</span>
            </div>
          </div>

          <div className="navbar-icons ">
            <Tooltip title="Find Users" arrow>
          <IconButton
                className="icon-button"
                onClick={() => setActiveTab("users")}
          >
                <PeopleAltOutlinedIcon />
          </IconButton>
            </Tooltip>
            
            <Tooltip title="New Group" arrow>
              <IconButton
                className="icon-button"
                onClick={handleOpenGroupModal}
              >
                <GroupAddOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Profile" arrow>
          <IconButton
                className="icon-button"
                onClick={handleOpenProfileModal}
              >
                <PersonOutlineOutlinedIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className={"search-container" + (lightTheme ? "" : " dark")}>
        <div className="search-box-container">
          <div className="search-icon">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder={activeTab === "users" ? "Search users..." : "Search conversations..."}
            className={"search-box" + (lightTheme ? "" : " dark")}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        {activeTab === "users" && (
          <IconButton
            className={"refresh-button" + (lightTheme ? "" : " dark")}
            onClick={() => setRefresh(!refresh)}
          >
            <RefreshIcon />
          </IconButton>
        )}
      </div>

      <div className={"sb-content" + (lightTheme ? "" : " dark")}>
        {activeTab === "conversations" ? (
          <Conversations 
            searchQuery={searchQuery} 
            onConversationClick={handleConversationClick}
          />
        ) : (
          <Users 
            onSelectUser={(userId, username) => {
              handleConversationClick(userId, username);
              setActiveTab("conversations");
            }} 
            searchQuery={searchQuery} 
          />
        )}
      </div>

      {/* Profile Modal */}
      <Dialog 
        open={openProfileModal} 
        onClose={handleCloseProfileModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            backgroundColor: lightTheme ? '#fff' : '#1E2329',
            color: lightTheme ? '#000' : '#fff',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ 
          py: 1.5,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '1.1rem',
          fontWeight: 500,
          backgroundColor: lightTheme ? '#fff' : '#262B33',
          borderBottom: '1px solid',
          borderColor: lightTheme ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.08)'
        }}>
          My Profile
          <div>
            {!editMode ? (
          <IconButton
                onClick={() => setEditMode(true)}
                sx={{
                  color: '#6c5ce7',
                  padding: '4px',
                  marginRight: '4px',
                  '&:hover': {
                    backgroundColor: lightTheme ? 'rgba(108, 92, 231, 0.08)' : 'rgba(108, 92, 231, 0.15)'
                  }
                }}
              >
                <EditIcon fontSize="small" />
          </IconButton>
            ) : null}
          <IconButton
              onClick={handleCloseProfileModal}
              sx={{
                color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.7)',
                padding: '4px',
                '&:hover': {
                  backgroundColor: lightTheme ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
          </IconButton>
          </div>
        </DialogTitle>

        <DialogContent 
          sx={{ 
            px: 3, 
            py: 2,
            backgroundColor: lightTheme ? '#fff' : '#1E2329',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: lightTheme ? '#f1f1f1' : '#262B33',
            },
            '&::-webkit-scrollbar-thumb': {
              background: lightTheme ? '#888' : '#404854',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: lightTheme ? '#555' : '#4A525E',
            }
          }}
        >
          {!editMode ? (
            <>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '20px' 
              }}>
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    bgcolor: '#6c5ce7',
                    fontSize: '1.75rem',
                    fontWeight: 500,
                    border: '3px solid',
                    borderColor: lightTheme ? '#fff' : '#262B33'
                  }}
                >
                  {userProfile?.username?.[0]?.toUpperCase()}
                </Avatar>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '2px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: lightTheme ? 'transparent' : '#262B33'
                  }}>
                    <PersonOutlineOutlinedIcon 
                      sx={{ 
                        color: '#6c5ce7',
                        fontSize: '1.1rem'
                      }} 
                    />
                    <span style={{ 
                      fontSize: '0.8rem',
                      color: lightTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 500,
                      letterSpacing: '0.2px'
                    }}>
                      Username
                    </span>
                  </div>
                  <div style={{ 
                    marginLeft: '28px',
                    fontSize: '0.95rem',
                    color: lightTheme ? 'rgba(0, 0, 0, 0.87)' : '#fff',
                    fontWeight: 400,
                    padding: '4px 8px'
                  }}>
                    {userProfile?.username}
                  </div>
                </div>

                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '2px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: lightTheme ? 'transparent' : '#262B33'
                  }}>
                    <EmailIcon 
                      sx={{ 
                        color: '#6c5ce7',
                        fontSize: '1.1rem'
                      }} 
                    />
                    <span style={{ 
                      fontSize: '0.8rem',
                      color: lightTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 500,
                      letterSpacing: '0.2px'
                    }}>
                      Email
                    </span>
                  </div>
                  <div style={{ 
                    marginLeft: '28px',
                    fontSize: '0.95rem',
                    color: lightTheme ? 'rgba(0, 0, 0, 0.87)' : '#fff',
                    fontWeight: 400,
                    padding: '4px 8px'
                  }}>
                    {userProfile?.email}
                  </div>
                </div>

                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '2px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: lightTheme ? 'transparent' : '#262B33'
                  }}>
                    <span style={{ 
                      fontSize: '0.8rem',
                      color: lightTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 500,
                      letterSpacing: '0.2px'
                    }}>
                      Bio
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '0.95rem',
                    color: lightTheme ? 'rgba(0, 0, 0, 0.87)' : '#fff',
                    fontWeight: 400,
                    fontStyle: userProfile?.bio ? 'normal' : 'italic',
                    lineHeight: '1.4',
                    padding: '4px 8px'
                  }}>
                    {userProfile?.bio || "No bio added yet"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <TextField
                label="Username"
                variant="outlined"
                size="small"
                fullWidth
                value={updatedProfile.username}
                onChange={(e) => setUpdatedProfile({...updatedProfile, username: e.target.value})}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: lightTheme ? 'transparent' : '#262B33',
                    '& fieldset': {
                      borderColor: lightTheme ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.15)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#6c5ce7',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6c5ce7',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#6c5ce7',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: lightTheme ? '#000' : '#fff',
                  },
                }}
              />
              <TextField
                label="Email"
                variant="outlined"
                size="small"
                fullWidth
                value={updatedProfile.email}
                onChange={(e) => setUpdatedProfile({...updatedProfile, email: e.target.value})}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: lightTheme ? 'transparent' : '#262B33',
                    '& fieldset': {
                      borderColor: lightTheme ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.15)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#6c5ce7',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6c5ce7',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#6c5ce7',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: lightTheme ? '#000' : '#fff',
                  },
                }}
              />
              <TextField
                label="Bio"
                variant="outlined"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={updatedProfile.bio}
                onChange={(e) => setUpdatedProfile({...updatedProfile, bio: e.target.value})}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: lightTheme ? 'transparent' : '#262B33',
                    '& fieldset': {
                      borderColor: lightTheme ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.15)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#6c5ce7',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6c5ce7',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#6c5ce7',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: lightTheme ? '#000' : '#fff',
                  },
                }}
              />
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          px: 3, 
          py: 1.5,
          gap: '8px',
          backgroundColor: lightTheme ? '#fff' : '#262B33',
          borderTop: '1px solid',
          borderColor: lightTheme ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.08)'
        }}>
          {editMode ? (
            <>
              <Button 
                onClick={handleCloseProfileModal}
                size="small"
                sx={{
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  color: lightTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    backgroundColor: lightTheme ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditProfile}
                disabled={loading}
                variant="contained"
                size="small"
                sx={{
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  backgroundColor: '#6c5ce7',
                  '&:hover': {
                    backgroundColor: '#5849e6',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: lightTheme ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                  },
                }}
              >
                {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : "Save"}
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleCloseProfileModal}
              size="small"
              sx={{
                textTransform: 'none',
                fontSize: '0.875rem',
                color: lightTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  backgroundColor: lightTheme ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              CLOSE
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Group Creation Modal */}
      <Dialog 
        open={openGroupModal} 
        onClose={handleCloseGroupModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            backgroundColor: lightTheme ? '#fff' : '#2d3941',
            color: lightTheme ? '#000' : '#fff'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          borderBottom: '1px solid',
          borderColor: lightTheme ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'
        }}>
          Create New Group
          <IconButton
            aria-label="close"
            onClick={handleCloseGroupModal}
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
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
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
                onDelete={() => handleRemoveUser(user._id)}
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

          <TextField
            margin="dense"
            label="Search Users"
            type="text"
            fullWidth
            variant="outlined"
            value={searchUser}
            onChange={(e) => {
              setSearchUser(e.target.value);
              handleSearchUsers(e.target.value);
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

          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              padding: '1rem'
            }}>
              <CircularProgress size={24} sx={{ color: '#6c5ce7' }} />
      </div>
          ) : (
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              marginTop: '0.5rem',
              borderRadius: '8px',
              backgroundColor: lightTheme ? '#f5f5f5' : '#1a1d21',
              padding: '0.5rem'
            }}>
              {searchResults.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem',
                  color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
                }}>
                  No users found
      </div>
              ) : (
                searchResults.map((user) => (
                  <div
                    key={user._id}
                    style={{
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      marginBottom: '0.25rem',
                      backgroundColor: lightTheme ? '#fff' : '#2d3941',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: lightTheme ? '#f0f0f0' : '#3f4b52',
                      },
                    }}
                    onClick={() => handleAddUser(user)}
                  >
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      marginRight: 1,
                      bgcolor: '#6c5ce7'
                    }}>
                      {user.username[0].toUpperCase()}
                    </Avatar>
                    <div>
                      <div style={{ 
                        fontWeight: 500,
                        color: lightTheme ? '#000' : '#fff'
                      }}>
                        {user.username}
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem',
                        color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)'
                      }}>
                        {user.email}
                      </div>
                    </div>
    </div>
                ))
              )}
      </div>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          padding: '16px 24px',
          borderTop: '1px solid',
          borderColor: lightTheme ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'
        }}>
          <Button 
            onClick={handleCloseGroupModal}
            sx={{
              color: lightTheme ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)',
              '&:hover': {
                backgroundColor: lightTheme ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length < 1 || loading}
            variant="contained"
            sx={{
              backgroundColor: '#6c5ce7',
              '&:hover': {
                backgroundColor: '#5849e6',
              },
              '&.Mui-disabled': {
                backgroundColor: lightTheme ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : (
              'Create Group'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Sidebar;


