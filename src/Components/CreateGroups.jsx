import React, { useState, useEffect } from "react";
import DoneOutlineRoundedIcon from "@mui/icons-material/DoneOutlineRounded";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../Url";

function CreateGroups() {
  const lightTheme = useSelector((state) => state.themeKey);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const nav = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  if (!userData) {
    console.log("User not Authenticated");
    nav("/");
    return null;
  }

  const user = userData.data;

  const handleClickOpen = () => {
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
  };

  const handleSearchUsers = async (query) => {
    if (!query.trim() || !user?.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.get(`${BASE_URL}/user?search=${query}`, config);
      
      // Check if response has the correct structure
      if (response.data?.success && Array.isArray(response.data.data)) {
        // Filter out the current user and already selected users
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
      console.error("Error searching users:", error);
      setSearchResults([]);
    }
  };

  const handleAddUser = (user) => {
    if (!selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert("Please enter a group name and select at least one user");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post(
        `${BASE_URL}/chat/createGroup`,
        {
          name: groupName,
          users: JSON.stringify(selectedUsers.map(u => u._id)),
        },
        config
      );

      handleClose();
      nav("/app/groups");
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  return (
    <>
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="alert-dialog-title">
            Create Group: {groupName}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Select users to add to the group
            </DialogContentText>
            
            <TextField
              autoFocus
              margin="dense"
              label="Search users"
              type="text"
              fullWidth
              variant="outlined"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearchUsers(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
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
                  onDelete={() => handleRemoveUser(user._id)}
                />
              ))}
            </div>

            {/* Search Results */}
            {searchQuery && (
              <List>
                {searchResults.map((user) => (
                  <ListItem 
                    key={user._id}
                    button
                    onClick={() => handleAddUser(user)}
                  >
                    <Avatar sx={{ mr: 2, bgcolor: '#6c5ce7' }}>{user.username[0].toUpperCase()}</Avatar>
                    <ListItemText 
                      primary={user.username} 
                      secondary={user.email}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              onClick={createGroup}
              disabled={selectedUsers.length === 0}
              variant="contained"
              color="primary"
            >
              Create Group
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div className={"createGroups-container" + (lightTheme ? "" : " dark dark-border")}>
        <input
          placeholder="Enter Group Name"
          className={"search-box" + (lightTheme ? "" : " dark")}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <IconButton
          className={"icon" + (lightTheme ? "" : " dark")}
          onClick={handleClickOpen}
          disabled={!groupName.trim()}
        >
          <DoneOutlineRoundedIcon />
        </IconButton>
      </div>
    </>
  );
}

export default CreateGroups;