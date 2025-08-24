import React, { useState } from "react";
import axios from "axios";

export default function ChatBox() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { from: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);

        try {
            const res = await axios.post("/api/chat", {
                message: input,
            });

            const botMessage = { from: "bot", text: res.data.reply };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error:", error);
        }

        setInput("");
    };

    return (
        <div style={{ position: "fixed", bottom: 20, right: 20, width: 300, border: "1px solid #ccc", borderRadius: 8, padding: 10, backgroundColor: "white" }}>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ textAlign: msg.from === "user" ? "right" : "left", margin: "5px 0" }}>
                        <strong>{msg.from === "user" ? "You" : "Bot"}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: 10, display: "flex" }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ flex: 1, padding: 5 }}
                />
                <button onClick={handleSend} style={{ marginLeft: 5 }}>Send</button>
            </div>
        </div>
    );
}
