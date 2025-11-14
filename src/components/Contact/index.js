import React, { useState } from "react";
import {
  PhoneOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import Lottie from "lottie-react";
import chatbot from "../../assets/lottie/chatbot.json";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "react-router-dom";
import ChatBox from "../Chatbox/ChatBox";

const Contact = () => {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const authPages = ["/login", "/register", "/forgot-password"];

  const isSystemPage =
    location.pathname.startsWith("/system") ||
    location.pathname.startsWith("/doctor") ||
    location.pathname.startsWith("/leader-hospital") ||
    authPages.includes(location.pathname);

  const handleCall = () => {
    window.location.href = `tel:${process.env.REACT_APP_PHONE || "0123456789"}`;
  };

  const handleZalo = () => {
    window.open(
      `https://zalo.me/${process.env.REACT_APP_PHONE || "0123456789"}`,
      "_blank"
    );
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  if (isSystemPage) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "fixed",
        bottom: "190px",
        right: "-30px",
        zIndex: 10,
      }}
    >
      <div style={{ width: 150 }}>
        <Lottie onClick={toggleChat} animationData={chatbot} loop />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "fixed",
          bottom: "90px",
          right: "18px",
          zIndex: 10,
        }}
      >
        {isChatOpen && <ChatBox onClose={() => setIsChatOpen(false)} />}
        <button
          onClick={handleCall}
          className="
        btn btn-danger
        d-flex align-items-center justify-content-center
        shadow-lg
        scroll-top-btn pulse-float
      "
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            fontSize: "20px",
            backgroundColor: "red",
            borderColor: "red",
            marginBottom: "12px",
          }}
          title="Lên đầu trang"
        >
          <PhoneOutlined style={{ fontSize: "22px" }} />
        </button>
        <button
          onClick={handleZalo}
          className="
        btn btn-primary
        d-flex align-items-center justify-content-center
        shadow-lg
        scroll-top-btn pulse-float
      "
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            fontSize: "20px",
          }}
          title="Lên đầu trang"
        >
          <MessageOutlined style={{ fontSize: "22px" }} />
        </button>
      </div>
    </div>
  );
};

export default Contact;
