import React, { useState, useRef, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
    CloseOutlined,
    LoadingOutlined,
    SendOutlined,
    MenuOutlined,
    PlusCircleOutlined
} from "@ant-design/icons";
import { Alert, Button, Space } from 'antd';
import { useSelector } from "react-redux";
import { chatWithDatabase, getConversations, getConversationDetail } from "../../services/userService"; 
import iconChatbot from "../../assets/images/iconChatbot.png";
import logoCareflow from "../../assets/careFlow_logo.png";
import ChatBubble from "./ChatBubble";

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
    
    // Custom styles cho Modal
    const PRIMARY_BLUE = "#1890ff";
    const LIGHT_BLUE_BACKGROUND = "#f0f8ff";
    const BORDER_LIGHT = "#e1e5e9";
    const FONT_DARK = "#333";
    const SIDEBAR_WIDTH = 250;
    const COLLAPSED_WIDTH = 60;


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
                                style={{
                                    ...styles.menuItem, 
                                    ...(selectedConversation === null ? styles.menuItemActive : {}),
                                    borderLeft: selectedConversation === null ? `3px solid ${PRIMARY_BLUE}` : 'none',
                                    color: selectedConversation === null ? PRIMARY_BLUE : FONT_DARK,
                                }}
                                onClick={() => {
                                    // Đảm bảo cả hai state đều reset về null
                                    setSelectedConversation(null);
                                    setCurrentConversationId(null); 
                                    setMessages([
                                        { from: "bot", text: "Xin chào, tôi có thể giúp gì cho bạn ngày hôm nay? 💫😊" },
                                    ]);
                                }}
                            >
                                <div 
                                    style={{
                                        width: '8px', 
                                        height: '8px', 
                                        backgroundColor: selectedConversation === null ? PRIMARY_BLUE : '#aaa', 
                                        borderRadius: '50%', 
                                        marginRight: '10px'
                                    }} 
                                />
                                 <PlusCircleOutlined style={{ fontSize: 25, color: "#52c41a" }} />
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
                                            backgroundColor: selectedConversation === c.id ? "#e6f7ff" : "transparent",
                                            fontWeight: selectedConversation === c.id ? 600 : 400,
                                            // Giới hạn hiển thị tiêu đề trong 1 dòng
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }}
                                    >
                                        <div 
                                            style={{
                                                width: '8px', 
                                                height: '8px', 
                                                backgroundColor: selectedConversation === c.id ? PRIMARY_BLUE : '#aaa', 
                                                borderRadius: '50%', 
                                                marginRight: '10px',
                                                display: 'inline-block'
                                            }} 
                                        />
                                        {/* Tiêu đề cuộc trò chuyện */}
                                        <span title={c.title || "Cuộc trò chuyện không tên"}>
                                            {c.title || "Cuộc trò chuyện không tên"}
                                        </span>
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

                    {showLoginPrompt && !isLoggedIn && (
                    <div style={{ margin: "10px" }}>
                        <Alert
                            message="Lưu trữ lịch sử trò chuyện"
                            description={
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <span>
                                        Bạn đang sử dụng chế độ Khách. Vui lòng đăng nhập để lưu trữ lịch sử và tiếp tục cuộc trò chuyện sau này.
                                    </span>
                                </Space>
                            }
                            type="warning"
                            showIcon
                            closable
                            onClose={() => setShowLoginPrompt(false)}
                            action={
                                <Button 
                                    size="small" 
                                    type="primary"
                                    style={{ backgroundColor: PRIMARY_BLUE }}
                                    onClick={() => {
                                        onClose(); 
                                        history.push("/login");
                                    }}
                                >
                                    Đăng nhập ngay
                                </Button>
                            }
                        />
                    </div>
                )}

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