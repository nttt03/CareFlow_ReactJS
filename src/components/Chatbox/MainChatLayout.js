import React, { useState, useRef, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
  CloseOutlined,
  LoadingOutlined,
  SendOutlined,
  MenuOutlined,
  PlusCircleOutlined
} from "@ant-design/icons";
import { Alert, Button } from 'antd';
import { useSelector } from "react-redux";
import { chatWithDatabase, getConversations, getConversationDetail } from "../../services/userService";
import iconChatbot from "../../assets/images/iconChatbot.png";
import logoCareflow from "../../assets/careFlow_logo.png";
import ChatBubble from "./ChatBubble";
import "./index.scss";

const defaultUser = {
  id: 0,
  fullName: "Khách",
  avatar: null,
};

export default function CenteredChatModal({ onClose }) {
  let history = useHistory();
    const userInfor = useSelector((state) => state.user.userInfo) || defaultUser;
    const language = useSelector((state) => state.app.language) || "vi";
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!userInfor?.id);

    const [messages, setMessages] = useState([
        { from: "bot", text: "Xin chào, tôi có thể giúp gì cho bạn ngày hôm nay? 💫😊" },
    ]);
    
    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
    const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadConversationList = useCallback(async () => {
        try {
            if (!userInfor?.id) return; 

            const res = await getConversations(userInfor.id);
            if (res?.data) {
                setConversations(res?.data);
                console.log("setConversations", res?.data);
            }
        } catch (err) {
            console.error("Failed to load conversations", err);
        }
    }, [userInfor.id]);

    useEffect(() => {
        const loggedIn = !!userInfor?.id;
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
            loadConversationList();
        } else {
            setShowLoginPrompt(true);
        }
    }, [userInfor?.id, loadConversationList]);

    const handleSelectConversation = async (id) => {
        setSelectedConversation(id);
        setCurrentConversationId(id);
        setMessages([]); // xóa tin nhắn cũ trong khi chờ load
        try {
            const res = await getConversationDetail(id);
            const conv = res?.data;

            if (conv?.messages) {
                const loadedMessages = conv.messages.map((m) => ({
                    from: m.role === "user" ? "user" : "bot",
                    text: m.content
                }));
                setMessages(loadedMessages);
            }
        } catch (err) {
            console.error("Failed to load conversation detail", err);
            setMessages([
                { from: "bot", text: "Lỗi: Không thể tải chi tiết cuộc trò chuyện này." }
            ]);
        }
    };


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [messages, isLoading]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Hàm xử lý gửi tin nhắn
    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        // Lấy ID cuộc trò chuyện hiện tại (chỉ có giá trị nếu đã đăng nhập)
        let conversationId = currentConversationId;
        let userIdToSend = userInfor?.id;

        if (!isLoggedIn) {
            conversationId = null;
            userIdToSend = null;
        }
        
        const userMessage = { from: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        inputRef.current?.focus();
        setIsLoading(true);

        try {
            const response = await chatWithDatabase(
                input,
                conversationId,
                messages,
                userIdToSend,
                userInfor?.fullName,
                language
            );
            
            const botMessage = { from: "bot", text: response.text };
            setMessages((prev) => [...prev, botMessage]);
            
            // XỬ LÝ CẬP NHẬT ID (CHỈ KHI ĐÃ ĐĂNG NHẬP)
            if (isLoggedIn && response.conversationId && response.conversationId !== currentConversationId) {
                setCurrentConversationId(response.conversationId);
                setSelectedConversation(response.conversationId);
                
                // Cập nhật lại danh sách cuộc trò chuyện nếu là cuộc trò chuyện mới
                if (!conversations.some(c => c.id === response.conversationId)) {
                    loadConversationList(); 
                }
            }
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

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedMessageIndex(index);
            setTimeout(() => setCopiedMessageIndex(null), 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    };

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-container" onClick={(e) => e.stopPropagation()}>
        
        {/* SIDEBAR */}
        <div className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <MenuOutlined
              onClick={toggleSidebar}
              className={`menu-toggle ${!isSidebarOpen ? 'rotated' : ''}`}
            />
          </div>

          <div className="sidebar-content">
            <div className="sidebar-menu">
              {/* New Chat */}
              <div
                className={`new-chat-item ${selectedConversation === null ? 'active' : ''}`}
                onClick={() => {
                  setSelectedConversation(null);
                  setCurrentConversationId(null);
                  setMessages([{ from: "bot", text: "Xin chào, tôi có thể giúp gì cho bạn ngày hôm nay? 💫😊" }]);
                }}
              >
                <div className="dot" style={{ backgroundColor: selectedConversation === null ? '#1890ff' : '#aaa' }} />
                <PlusCircleOutlined className="plus-icon" />
              </div>

              {/* Conversation List */}
              <div className="conversation-list">
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`conversation-item ${selectedConversation === c.id ? 'active' : ''}`}
                    title={c.title || "Cuộc trò chuyện không tên"}
                  >
                    <div className="dot" />
                    <span>{c.title || "Cuộc trò chuyện không tên"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="user-info">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={userInfor?.avatar || "/defaultImg.png"} alt="Avatar" className="user-avatar" />
                <div>
                  <div className="welcome-text">Welcome back,</div>
                  <div className="user-name">{userInfor.fullName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">
          <div className="chat-header">
            <img className="logo" src={logoCareflow} alt="logo" style={{ height: "50px" }} />
            <CloseOutlined onClick={onClose} className="close-btn" />
          </div>

          <div className="messages-area no-scrollbar">
            {messages.map((msg, i) => (
              <ChatBubble key={i} msg={msg} i={i} userInfor={userInfor}
                handleCopy={handleCopy}
                copiedMessageIndex={copiedMessageIndex}
                hoveredMessageIndex={hoveredMessageIndex}
                setHoveredMessageIndex={setHoveredMessageIndex}
              />
            ))}
            {isLoading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
                <img src={iconChatbot} alt="AI" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "contain", border: "2.5px solid #fff" }} />
                <div style={{ backgroundColor: "#fff", padding: "11px 15px", borderRadius: "20px", border: "1px solid #e1e5e9", display: "flex", alignItems: "center", gap: "8px" }}>
                  <LoadingOutlined spin style={{ fontSize: 15, color: "#1890ff" }} />
                  <span>Chatbot đang nhập...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showLoginPrompt && !isLoggedIn && (
            <div className="GlossLogin-prompt">
              <Alert
                message="Lưu trữ lịch sử trò chuyện"
                description="Bạn đang sử dụng chế độ Khách. Vui lòng đăng nhập để lưu trữ lịch sử và tiếp tục cuộc trò chuyện sau này."
                type="warning"
                showIcon
                closable
                onClose={() => setShowLoginPrompt(false)}
                action={
                  <Button className="my-2 my-lg-0" size="small" type="primary" onClick={() => { onClose(); history.push("/login"); }}>
                    Đăng nhập ngay
                  </Button>
                }
              />
            </div>
          )}

          <div className="input-area">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi..."
                disabled={isLoading}
                className="chat-input"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="send-button"
              >
                <SendOutlined className="send-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}