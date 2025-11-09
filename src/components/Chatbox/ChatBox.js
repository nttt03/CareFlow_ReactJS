import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { CloseOutlined } from "@ant-design/icons";

export default function ChatBox({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("/api/chat", { message: input });
      const botMessage = {
        from: "bot",
        text: res.data.reply || "Xin lỗi, tôi chưa hiểu.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMsg = { from: "bot", text: "Lỗi kết nối. Vui lòng thử lại." };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        right: "18px",
        width: "400px",
        height: "480px",
        border: "1px solid #d9d9d9",
        borderRadius: "12px",
        backgroundColor: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "#1890ff",
          color: "white",
          borderRadius: "12px 12px 0 0",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Trợ lý ảo</span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
          }}
          aria-label="Đóng chat"
        >
          <CloseOutlined />
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "12px",
          overflowY: "auto",
          backgroundColor: "#f5f5f5",
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#999", fontSize: "14px" }}>
            Xin chào! Tôi có thể giúp gì cho bạn?
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              margin: "8px 0",
              textAlign: msg.from === "user" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                maxWidth: "80%",
                padding: "8px 12px",
                borderRadius: "18px",
                backgroundColor: msg.from === "user" ? "#1890ff" : "#fff",
                color: msg.from === "user" ? "white" : "black",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px", borderTop: "1px solid #eee" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #d9d9d9",
              borderRadius: "20px",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1890ff",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
