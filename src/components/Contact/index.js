import React, { useState } from "react";
import { PhoneOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "react-router-dom";
import ChatBox from "../Chatbox/ChatBox";

const Contact = () => {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isSystemPage = location.pathname.startsWith("/system");

  const handleCall = () => {
    window.location.href = `tel:${process.env.REACT_APP_PHONE || "0123456789"}`;
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  if (isSystemPage) {
    return null;
  }

  return (
    <>
      <button
        onClick={toggleChat}
        className="
        btn btn-primary
        d-flex align-items-center justify-content-center
        shadow-lg
        scroll-top-btn pulse-float
      "
        style={{
          position: "fixed",
          width: "50px",
          height: "50px",
          bottom: "160px",
          right: "18px",
          borderRadius: "50%",
          fontSize: "20px",
          zIndex: 9999,
        }}
        title="Lên đầu trang"
      >
        <CustomerServiceOutlined style={{ fontSize: "22px" }} />
      </button>
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
          position: "fixed",
          width: "50px",
          height: "50px",
          bottom: "90px",
          right: "18px",
          borderRadius: "50%",
          fontSize: "20px",
          zIndex: 9999,
          backgroundColor: "red",
          borderColor: "red",
        }}
        title="Lên đầu trang"
      >
        <PhoneOutlined style={{ fontSize: "22px" }} />
      </button>
    </>
  );
};

export default Contact;
