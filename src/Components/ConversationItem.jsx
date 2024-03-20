import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ConversationItem = ({props}) => {
  const navigate = useNavigate();
  const lightTheme = useSelector((state) => state.themeKey.themeKey);

  const handleNavigateToChat = () => {
    navigate("chat");
  };

  return (
    <div className='conversation-container'>
      <p className='con-icon' onClick={handleNavigateToChat}>{props.name[0]}</p>
      <p className={"con-title " + (lightTheme ? "" : "dark")}>{props.name}</p>
      <p className='con-lastMessage'>{props.lastMessage}</p>
      <p className='con-timeStamp'>{props.timeStamp}</p>
    </div>
  )
}

export default ConversationItem
