import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
    CloseOutlined,
    LoadingOutlined,
    CopyOutlined,
    SendOutlined,
    MenuOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { chatWithDatabase, getConversations, getConversationDetail } from "../../services/userService"; 
import iconChatbot from "../../assets/images/iconChatbot.png";
import logoCareflow from "../../assets/careFlow_logo.png";


// Giả định dữ liệu người dùng (Nếu Redux state rỗng)
const defaultUser = {
    id: 1,
    fullName: "Bạn",
    avatar: null, // Sẽ dùng placeholder hoặc base64
};

// Component ChatBubble (Không thay đổi logic)
const ChatBubble = ({ msg, i, userInfor, handleCopy, copiedMessageIndex, hoveredMessageIndex, setHoveredMessageIndex }) => {
    const isUser = msg.from === "user";
    const renderCopyButton = (msg, i) => {
        const isMsgUser = isUser;
        const showCopy = isMsgUser ? (hoveredMessageIndex === i || copiedMessageIndex === i) : true;
        const position = isMsgUser ? { top: "-8px", left: "-8px" } : { top: "-8px", right: "-8px" };
    
        if (!showCopy) return null;
    
        return (
            <button
                onClick={() => handleCopy(msg.text, i)}
                style={{
                    position: "absolute",
                    ...position,
                    background: isMsgUser ? "#fff" : "#fff",
                    border: isMsgUser ? "1px solid #d9d9d9" : "1px solid #e1e5e9",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: copiedMessageIndex === i ? "#52c41a" : "#8c8c8c", 
                    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    transition: "all 0.2s",
                    zIndex: 10,
                }}
                title={copiedMessageIndex === i ? "Đã sao chép!" : "Sao chép"}
            >
                <CopyOutlined style={{ fontSize: "12px" }} />
            </button>
        );
      };

    return (
        <div
            key={i}
            style={{
                margin: "12px 0",
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: "10px",
            }}
            onMouseEnter={() => setHoveredMessageIndex(i)}
            onMouseLeave={() => setHoveredMessageIndex(null)}
        >
            {/* Avatar Bot */}
            {!isUser && (
                <img
                    src={iconChatbot}
                    alt="AI"
                    style={{
                        width: "38px", height: "38px", borderRadius: "50%",
                        objectFit: "contain", border: "2.5px solid #fff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                />
            )}

            {/* Bubble */}
            <div
                style={{
                    maxWidth: "75%", padding: "11px 15px", borderRadius: "20px",
                    backgroundColor: isUser ? "#cff5ffff" : "#ffffff", 
                    color: "#333", 
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    borderLeft: isUser ? "" : "3px solid #1987f5ff",
                    borderRight: isUser ? "3px solid #236df5ff" : "",
                    fontSize: "14.5px", lineHeight: "1.5", position: "relative",
                }}
            >
                {isUser ? (
                    <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
                ) : (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                )}
                
                {/* Nút Copy */}
                {renderCopyButton(msg, i)}
            </div>

            {/* Avatar User */}
            {isUser && (
                <img
                    src={userInfor?.avatar || "/defaultImg.png"}
                    alt="You"
                    style={{
                        width: "38px", height: "38px", borderRadius: "50%",
                        objectFit: "cover", border: "2.5px solid white",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                />
            )}
        </div>
    );
};


export default function CenteredChatModal({ onClose }) {
    const userInfor = useSelector((state) => state.user.userInfo) || defaultUser;
    const language = useSelector((state) => state.app.language) || "vi";
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);


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

    useEffect(() => {
        if (userInfor?.id) {
            loadConversationList();
        }
    }, []);

    const loadConversationList = async () => {
        try {
            const res = await getConversations(userInfor.id);
            if (res?.data?.data) {
                setConversations(res.data.data);
            }
        } catch (err) {
            console.error("Failed to load conversations", err);
        }
    };

    const handleSelectConversation = async (id) => {
        setSelectedConversation(id);

        try {
            const res = await getConversationDetail(id);
            const conv = res.data.data;

            if (conv?.messages) {
                const loadedMessages = conv.messages.map((m) => ({
                    from: m.sender === "user" ? "user" : "bot",
                    text: m.text
                }));
                setMessages(loadedMessages);
            }
        } catch (err) {
            console.error("Failed to load conversation detail", err);
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

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedMessageIndex(index);
            setTimeout(() => setCopiedMessageIndex(null), 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    };
    
    // Custom styles cho Modal
    const PRIMARY_BLUE = "#1890ff"; // Màu xanh chủ đạo
    const LIGHT_BLUE_BACKGROUND = "#f0f8ff"; // Nền chat nhạt
    const BORDER_LIGHT = "#e1e5e9";
    const FONT_DARK = "#333";
    const SIDEBAR_WIDTH = 250;
    const COLLAPSED_WIDTH = 60; // Chiều rộng khi sidebar đóng (chỉ đủ chỗ cho Menu icon)


    const styles = {
        // --- Modal Container ---
        overlay: { 
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
            backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 9999, 
            display: "flex", justifyContent: "center", alignItems: "center" 
        },
        chatContainer: { 
            width: "90%", maxWidth: "1000px", height: "90vh", maxHeight: "750px", 
            backgroundColor: LIGHT_BLUE_BACKGROUND, borderRadius: "16px", boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)", 
            display: "flex", overflow: "hidden", position: "relative" 
        },
        
        // --- Sidebar (CẬP NHẬT LOGIC ẨN/HIỆN) ---
        sidebar: { 
            // Chiều rộng động
            width: isSidebarOpen ? `${SIDEBAR_WIDTH}px` : `${COLLAPSED_WIDTH}px`, 
            minWidth: isSidebarOpen ? `${SIDEBAR_WIDTH}px` : `${COLLAPSED_WIDTH}px`,
            flexShrink: 0, 
            backgroundColor: "#ffffff", 
            // Border chỉ hiện khi mở
            borderRight: isSidebarOpen ? `1px solid ${BORDER_LIGHT}` : 'none', 
            display: "flex", 
            flexDirection: "column", 
            color: FONT_DARK,
            transition: 'width 0.3s ease-in-out, min-width 0.3s ease-in-out',
            overflow: 'hidden',
        },
        
        sidebarHeader: { 
            padding: "10px 15px", 
            height: "60px", 
            borderBottom: isSidebarOpen ? `1px solid ${BORDER_LIGHT}` : 'none', 
            display: "flex", 
            alignItems: "center", 
            justifyContent: isSidebarOpen ? 'space-between' : 'center',
            transition: 'border-bottom 0.3s, padding 0.3s'
        },

        // --- Sidebar Content Wrapper (Áp dụng logic ẩn/hiện) ---
        sidebarContent: {
            opacity: isSidebarOpen ? 1 : 0,
            pointerEvents: isSidebarOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflowY: isSidebarOpen ? 'auto' : 'hidden', 
            marginLeft: isSidebarOpen ? '0' : `-${SIDEBAR_WIDTH - COLLAPSED_WIDTH}px`,
        },

        // --- User Info ---
        userInfo: { padding: "10px", borderTop: `1px solid ${BORDER_LIGHT}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f0f0f0", borderRadius: "8px", margin: "10px" },
        sidebarMenu: { flexGrow: 1, padding: "10px 0" },
        menuItem: { padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", fontSize: "14px", color: FONT_DARK, transition: "background-color 0.2s" },
        menuItemActive: { backgroundColor: "#e6f7ff", color: PRIMARY_BLUE, borderLeft: `3px solid ${PRIMARY_BLUE}`, fontWeight: 600 },

        // --- Main Content ---
        mainContent: { flexGrow: 1, display: "flex", flexDirection: "column" },
        chatHeader: { padding: "10px 16px", background: "#ffffff", borderBottom: `1px solid ${BORDER_LIGHT}`, height: "60px", display: "flex", justifyContent: "space-between", alignItems: "center" },
        messagesArea: { flex: 1, padding: "16px 12px", overflowY: "auto", backgroundColor: LIGHT_BLUE_BACKGROUND },
        
        // --- Input Area ---
        inputArea: { padding: "12px 16px", borderTop: `1px solid ${BORDER_LIGHT}`, backgroundColor: "#ffffff" },
        inputField: { 
            flex: 1, padding: "11px 16px", border: `1.5px solid ${BORDER_LIGHT}`, borderRadius: "24px", 
            outline: "none", fontSize: "15px", backgroundColor: "#f9f9f9", color: FONT_DARK,
        },
        inputIcon: { background: 'none', border: 'none', color: '#8c8c8c', cursor: 'pointer', padding: '8px' },
        sendButton: (disabled) => ({
            padding: "10px 10px", backgroundColor: disabled ? "#ccc" : PRIMARY_BLUE, color: "white", 
            border: "none", borderRadius: "24px", cursor: disabled ? "not-allowed" : "pointer",
            minWidth: "40px", display: 'flex', alignItems: 'center', justifyContent: 'center'
        })
    };

    return (
        <div 
            style={styles.overlay} 
            onClick={onClose}
        >
            <div 
                style={styles.chatContainer}
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* 1. SIDEBAR */}
                <div style={styles.sidebar}>
                    
                    {/* Sidebar Header/Menu Icon - LUÔN HIỂN THỊ */}
                    <div style={styles.sidebarHeader}>
                        {/* Gắn toggleSidebar vào MenuOutlined */}
                        <MenuOutlined 
                            onClick={toggleSidebar} 
                            style={{ 
                                fontSize: '24px', 
                                color: PRIMARY_BLUE, 
                                cursor: 'pointer',
                                // Xoay Menu icon khi Sidebar đóng để dễ nhấn hơn
                                transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(90deg)', 
                                transition: 'transform 0.3s'
                            }} 
                        />
                    </div>
                    
                    {/* Sidebar Content Wrapper (Áp dụng logic ẩn/hiện) */}
                    <div style={styles.sidebarContent}>
                        {/* Sidebar Menu */}
                        <div style={styles.sidebarMenu}>
                            <div 
                                style={{ ...styles.menuItem, ...styles.menuItemActive }}
                                onClick={() => {
                                    setSelectedConversation(null);
                                    setMessages([
                                        { from: "bot", text: "Xin chào, tôi có thể giúp gì cho bạn ngày hôm nay? 💫😊" },
                                    ]);
                                }}
                            >
                                <div style={{width: '8px', height: '8px', backgroundColor: PRIMARY_BLUE, borderRadius: '50%', marginRight: '10px'}} />
                                New Chat
                            </div>
                            <div style={styles.menuItem}>
                                <div style={{width: '8px', height: '8px', backgroundColor: '#aaa', borderRadius: '50%', marginRight: '10px'}} />
                                Recent Chats
                            </div>

                            {/* List conversation */}
                            <div>
                                {conversations.map((c) => (
                                    <div 
                                        key={c.id}
                                        onClick={() => handleSelectConversation(c.id)}
                                        style={{
                                            padding: "10px 20px",
                                            fontSize: "14px",
                                            borderBottom: "1px solid #f0f0f0",
                                            cursor: "pointer",
                                            backgroundColor: selectedConversation === c.id ? "#e6f7ff" : "transparent"
                                        }}
                                    >
                                        {c.title || "Cuộc trò chuyện không tên"}
                                    </div>
                                ))}
                            </div>

                        </div>
                        
                        <div style={styles.userInfo}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                {/* USER TRONG SIDEBAR */}
                                <img 
                                    src={userInfor?.avatar || "/defaultImg.png"}
                                    alt="User Avatar"
                                    style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "2px solid #aaa" }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: "5px" }}>
                                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>Welcome back,</span>
                                    <span style={{ fontWeight: 600, fontSize: '15px', color: FONT_DARK }}>{userInfor.fullName}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2 & 3. MAIN CHAT */}
                <div style={styles.mainContent}>
                    
                    {/* CHAT HEADER (Top Right) */}
                    <div style={styles.chatHeader}>
                        <img src={logoCareflow} alt="logo" style={{height: "60px"}} />
                        <CloseOutlined onClick={onClose} style={{ fontSize: '20px', color: '#8c8c8c', cursor: 'pointer', marginLeft: 'auto' }} title="Close Chat"/>
                    </div>

                    {/* MESSAGES AREA */}
                    <div
                        className="no-scrollbar"
                        style={styles.messagesArea}
                    >
                        {messages.map((msg, i) => (
                            <ChatBubble 
                                key={i}
                                msg={msg}
                                i={i}
                                userInfor={userInfor}
                                handleCopy={handleCopy}
                                copiedMessageIndex={copiedMessageIndex}
                                hoveredMessageIndex={hoveredMessageIndex}
                                setHoveredMessageIndex={setHoveredMessageIndex}
                            />
                        ))}

                        {/* Loading */}
                        {isLoading && (
                            <div
                                style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}
                            >
                                <img
                                    src={iconChatbot}
                                    alt="AI"
                                    style={{
                                        width: "38px", height: "38px", borderRadius: "50%",
                                        objectFit: "contain", border: "2.5px solid #fff",
                                    }}
                                />
                                <div
                                    style={{
                                        backgroundColor: "#fff", padding: "11px 15px", borderRadius: "20px",
                                        border: `1px solid ${BORDER_LIGHT}`, color: "#888", fontSize: "14px",
                                        display: "flex", alignItems: "center", gap: "8px",
                                    }}
                                >
                                    <LoadingOutlined spin style={{ fontSize: "15px", color: PRIMARY_BLUE }} />
                                    <span>Chatbot đang nhập...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT AREA (Bottom Right) */}
                    <div style={styles.inputArea}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập câu hỏi..."
                                disabled={isLoading}
                                style={styles.inputField}
                            />

                            {/* Send Button */}
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                style={styles.sendButton(isLoading || !input.trim())}
                            >
                                <SendOutlined style={{ transform: 'rotate(-45deg)', fontSize: '18px' }}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}