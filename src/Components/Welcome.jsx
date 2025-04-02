import React from "react";
import logo from "../image/img.png";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();
  
  const userData = React.useMemo(() => {
    const data = localStorage.getItem("userData");
    if (!data) {
      navigate("/");
      return null;
    }
    return JSON.parse(data);
  }, [navigate]);

  if (!userData) {
    return null;
  }

  return (
    <div className={"welcome-container" + (lightTheme ? "" : " dark")}>
      <motion.img
        drag
        whileTap={{ scale: 1.05, rotate: 360 }}
        src={logo}
        alt="Logo"
        className="welcome-logo"
      />
      <b>Hi, {userData.data.username} 👋</b>
      <p>View and text directly to people present in the chat Rooms.</p>
    </div>
  );
}

export default Welcome;