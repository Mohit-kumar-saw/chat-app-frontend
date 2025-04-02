import React from "react";
import "./myStyles.css";
import { useSelector } from "react-redux";
import moment from 'moment';

function MessageOthers({ props }) {
  const lightTheme = useSelector((state) => state.themeKey);
  
  if (!props || !props.sender) {
    console.warn('Invalid message props:', props);
    return null;
  }

  // Get sender name, ensuring we have a valid username
  const senderName = props.sender.username || "Unknown User";
  const messageContent = props.content || "";
  const firstLetter = senderName[0]?.toUpperCase() || "?";
  
  // Format timestamp
  const timestamp = props.createdAt ? moment(props.createdAt).format('h:mm A') : '';
  
  return (
    <div className={"other-message-container" + (lightTheme ? "" : " dark")}>
      <div className={"message-other-content" + (lightTheme ? "" : " dark")}>
        <div 
          className={"con-icon" + (lightTheme ? "" : " dark icon-dark")}
          title={senderName}
        >
          {firstLetter}
        </div>
        <div className={"other-text-content" + (lightTheme ? "" : " dark dark-message")}>
          <p className={"message-sender" + (lightTheme ? "" : " dark")}>
            {senderName}
          </p>
          <div className="message-content-wrapper">
            <p className={"message-content" + (lightTheme ? "" : " dark")}>
              {messageContent}
            </p>
            <div className="message-time-only">
              <span className="message-time">{timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageOthers;