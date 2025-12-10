import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  CloseOutlined,
  CustomerServiceOutlined,
  LoadingOutlined,
  CopyOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { chatWithDatabase } from "../../services/userService";
import iconChatbot from "../../assets/images/iconChatbot.png";
import { Buffer } from "buffer";

export default function ChatBox({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const language = useSelector((state) => state.app.language);
  const userInfor = useSelector((state) => state.user.userInfo);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    inputRef.current?.focus();
    setIsLoading(true);

    try {
      const response = await chatWithDatabase(
        input,
        messages,
        userInfor?.id,
        userInfor?.fullName,
        language
      );
      const botMessage = { from: "bot", text: response.text };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("API Gateway error:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Hàm xử lý sao chép
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000); // Reset trạng thái sau 2 giây
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      {/* Chat Container - ngăn click ngoài lan tỏa */}
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          height: "80vh",
          maxHeight: "700px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "10px 16px",
            background: "linear-gradient(135deg, #06a9e9, #74efff)",
            color: "white",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <span>
            <CustomerServiceOutlined
              style={{ fontSize: "18px", marginRight: "8px" }}
            />
            Trợ lý AI
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Messages Area */}
        <div
          className="no-scrollbar"
          style={{
            flex: 1,
            padding: "16px 12px",
            overflowY: "auto",
            backgroundColor: "#f8f9fa",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#aaa",
                fontSize: "15px",
                marginTop: "30px",
              }}
            >
              {language === "vi"
                ? "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?"
                : "Hello! How can I help you?"}
            </div>
          )}

          {messages.map((msg, i) => {
            let userAvatar = null;
            if (userInfor?.avatar) {
              userAvatar = Buffer.from(userInfor?.avatar, "base64").toString(
                "binary"
              );
            }

            // Xác định vị trí nút Copy (dựa vào người gửi)
            const isUser = msg.from === "user";
            // Logic hiển thị nút copy
            const showCopyButton = isUser ? 
              (hoveredMessageIndex === i || copiedMessageIndex === i) :
              true;

            const copyButtonPosition = isUser ? { top: "-8px", left: "-8px" } : { top: "-8px", right: "-8px" };

            return (
              <div
                key={i}
                style={{
                  margin: "12px 0",
                  display: "flex",
                  justifyContent:
                    isUser ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  gap: "10px",
                }}
                // Xử lý sự kiện hover cho tin nhắn User
                onMouseEnter={() => isUser && setHoveredMessageIndex(i)}
                onMouseLeave={() => isUser && setHoveredMessageIndex(null)}
              >
                {/* Avatar Bot */}
                {msg.from === "bot" && (
                  <img
                    src={iconChatbot}
                    alt="AI"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      objectFit: "contain",
                      border: "2.5px solid #fff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                )}

                {/* Bubble */}
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "11px 15px",
                    borderRadius: "20px",
                    backgroundColor:
                      isUser ? "#1890ff" : "#ffffff",
                    color: isUser ? "white" : "#333",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    border: msg.from === "bot" ? "1px solid #e1e5e9" : "none",
                    fontSize: "14.5px",
                    lineHeight: "1.5",
                    position: "relative",
                  }}
                >
                  {isUser ? (
                    <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
                  ) : (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  )}
                  
                  {/* Nút Copy */}
                  {(showCopyButton || !isUser) && (
                    <button
                      onClick={() => handleCopy(msg.text, i)}
                      style={{
                        position: "absolute",
                        ...copyButtonPosition,
                        background: isUser ? "#1890ff" : "#fff",
                        border: isUser ? "1px solid #1890ff" : "1px solid #d9d9d9",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: copiedMessageIndex === i ? (isUser ? "#f1ff00" : "#52c41a") : (isUser ? "white" : "#8c8c8c"),
                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                        transition: "all 0.2s",
                      }}
                      title={copiedMessageIndex === i ? "Đã sao chép!" : "Sao chép"}
                    >
                      <CopyOutlined style={{ fontSize: "12px" }} />
                    </button>
                  )}
                </div>

                {/* Avatar User */}
                {isUser && (
                  <img
                    src={userInfor?.avatar || "/defaultImg.png"}
                    alt="You"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2.5px solid white",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Loading */}
          {isLoading && (
            <div
              style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}
            >
              <img
                src={iconChatbot}
                alt="AI"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  objectFit: "contain",
                  border: "2.5px solid #fff",
                }}
              />
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "11px 15px",
                  borderRadius: "20px",
                  border: "1px solid #e1e5e9",
                  color: "#888",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <LoadingOutlined
                  className="text-primary"
                  spin
                  style={{ fontSize: "15px" }}
                />
                <span>Chatbot đang nhập...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #eee",
            backgroundColor: "#fff",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "11px 16px",
                border: "1.5px solid #d9d9d9",
                borderRadius: "24px",
                outline: "none",
                fontSize: "15px",
                backgroundColor: "#f9f9f9",
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              style={{
                padding: "10px 10px",
                backgroundColor: isLoading ? "#ccc" : "#1890ff",
                color: "white",
                border: "none",
                borderRadius: "24px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: "500",
                minWidth: "60px",
              }}
            >
              <SendOutlined className="rotate-45"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}