import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ConversationItem = ({ props, isActive }) => {
  const navigate = useNavigate();
  const lightTheme = useSelector((state) => state.themeKey);
  const userData = JSON.parse(localStorage.getItem("userData"));

  const handleNavigateToChat = () => {
    if (props._id && props.users) {
      const otherUser = props.users.find(u => u._id !== userData?.data?._id);
      const displayName = props.isGroupChat ? props.chatName : (otherUser?.username || 'Chat');
      navigate(`/app/chat/${props._id}&${displayName}`);
    }
  };

  const initial = props.isGroupChat 
    ? props.chatName?.[0]?.toUpperCase() 
    : props.users?.find(u => u._id !== userData?.data?._id)?.username?.[0]?.toUpperCase() || '?';

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * oneDay) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={'conversation-item-content' + (lightTheme ? '' : ' dark') + (isActive ? ' active' : '')}
      onClick={handleNavigateToChat}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}
    >
      <div className={'con-icon' + (lightTheme ? '' : ' dark')}>
        {initial}
      </div>
      <div className="conversation-info">
        <div className="con-info-header">
          <p className={'con-title' + (lightTheme ? '' : ' dark')}>
            {props.isGroupChat ? props.chatName : props.users?.find(u => u._id !== userData?.data?._id)?.username || 'Chat'}
          </p>
          <span className={'con-timestamp' + (lightTheme ? '' : ' dark')}>
            {formatTime(props.latestMessage?.createdAt || props.updatedAt)}
          </span>
        </div>
        <p className={'con-lastMessage' + (lightTheme ? '' : ' dark-last-message')}>
          {props.latestMessage?.content || 'No messages yet'}
        </p>
      </div>
    </motion.div>
  );
};

export default ConversationItem;
