import React from "react";
import ReactMarkdown from "react-markdown";
import { CopyOutlined } from "@ant-design/icons";
import iconChatbot from "../../assets/images/iconChatbot.png";

const ChatBubble = ({ 
    msg, 
    i, 
    userInfor, 
    handleCopy, 
    copiedMessageIndex, 
    hoveredMessageIndex, 
    setHoveredMessageIndex 
}) => {
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

export default ChatBubble;