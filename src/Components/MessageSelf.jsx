import React from "react";
import "./myStyles.css";
import { useSelector } from "react-redux";
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';

function MessageSelf({ props }) {
  const lightTheme = useSelector((state) => state.themeKey);

  if (!props) {
    return null;
  }

  const messageContent = props.content || "";
  const timestamp = props.timestamp ? new Date(props.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
  const isRead = props.readBy?.length > 1; // More than 1 because sender is always included in readBy

  return (
    <div className="self-message-container">
      <div className="message-content-wrapper">
        <div className={"messageBox" + (lightTheme ? "" : " dark")}>
          <p className={"message-content" + (lightTheme ? "" : " dark")}>
            {messageContent}
          </p>
        </div>
        <div className={"message-status" + (lightTheme ? "" : " dark")}>
          <span className="message-time">{timestamp}</span>
          {isRead ? (
            <DoneAllIcon className="read-status-icon read" fontSize="small" />
          ) : (
            <DoneIcon className="read-status-icon" fontSize="small" />
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageSelf;