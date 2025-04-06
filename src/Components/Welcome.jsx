import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import './myStyles.css';

function Welcome() {
  const lightTheme = useSelector((state) => state.themeKey);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const username = userData?.data?.username || "User";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className={"welcome-container" + (lightTheme ? "" : " dark")}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="welcome-content">
        <motion.div className="welcome-header" variants={itemVariants}>
          <div className="chat-graphic">
            <div className="chat-bubble left">
              <i className="fas fa-comment-dots"></i>
            </div>
            <div className="welcome-avatar">
              {username[0]?.toUpperCase()}
            </div>
            <div className="chat-bubble right">
              <i className="fas fa-comments"></i>
            </div>
          </div>
          <h1 className="welcome-title">
            Welcome back, <span className="username-highlight">{username}</span>!
          </h1>
          <p className="welcome-subtitle">
            Ready to connect and chat? Start a conversation or create a group.
          </p>
        </motion.div>

        

        <motion.div className="chat-preview" variants={itemVariants}>
          <div className="message-bubbles">
            <div className="message-bubble incoming">
              <span>Hey! How are you?</span>
            </div>
            <div className="message-bubble outgoing">
              <span>I'm doing great! Let's catch up 😊</span>
            </div>
            <div className="message-bubble incoming">
              <span>Sure! What's new?</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="welcome-footer" variants={itemVariants}>
          <div className="connection-status">
            <div className="pulse-dot"></div>
            <span>Connected and ready to chat</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Welcome;