import React, { useState, useRef, useEffect } from "react";
import "./WebAiChat.css";
import ForumIcon from '@mui/icons-material/Forum';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Avatar, IconButton, Paper, TextField, InputAdornment } from "@mui/material";

const SUGGESTIONS = [
  "What is my attendance today?",
  "Summarize my monthly stats",
  "How many holidays this month?",
  "Am I meeting the threshold?",
];

export default function WebAiChat({ userId, apiBase, isOpen, setIsOpen }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [{ id: "welcome", text: "Hi, I'm Onix. How can I help you today?", isAi: true }];
  });
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem("chatHistory", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAskAi = async (textOverride) => {
    const textToSend = typeof textOverride === "string" ? textOverride : query;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now().toString(), text: textToSend, isAi: false };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch(`${apiBase}/attendance/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, query: textToSend }),
      });
      
      const data = await response.json();
      const responseText = data.response || "I received an empty response from the server.";
      
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: responseText, isAi: true },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Sorry, I encountered an error: ${error.message}`,
          isAi: true,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button className="chat-trigger-btn shadow-lg" onClick={() => setIsOpen(true)}>
        <ForumIcon />
      </button>
    );
  }

  return (
    <Paper ref={chatRef} elevation={12} className="chat-container border border-white/10 bg-[#16161A]/80 backdrop-blur-xl text-white">
      <div className="chat-header bg-[#1c1c21] p-3 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <Avatar sx={{ width: 32, height: 32, bgcolor: "#7C3AED" }}>
             <SmartToyIcon fontSize="small" />
          </Avatar>
          <div>
            <h4 className="m-0 text-sm font-bold text-white">Onix Assistant</h4>
            <span className="text-[10px] text-green-400">Online</span>
          </div>
        </div>
        <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: "white" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      <div className="chat-messages p-4 overflow-y-auto grow flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.isAi ? "ai" : "user"}`}>
            {msg.isAi && <Avatar sx={{ width: 24, height: 24, bgcolor: "#7C3AED", fontSize: 12 }}>O</Avatar>}
            <div className={`message-bubble shadow-sm ${msg.isAi ? "ai-bubble" : "user-bubble"} ${msg.isError ? "error" : ""}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-wrapper ai">
            <Avatar sx={{ width: 24, height: 24, bgcolor: "#7C3AED", fontSize: 12 }}>O</Avatar>
            <div className="message-bubble ai-bubble typing shadow-sm">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length < 3 && !loading && (
        <div className="suggestions-bar px-4 py-2 flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => handleAskAi(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-area p-3 border-t border-white/5 bg-[#1c1c21]">
        <TextField
          fullWidth
          size="small"
          placeholder="Ask something..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAskAi()}
          disabled={loading}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "white",
              borderRadius: "20px",
              backgroundColor: "#2A2B2F",
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.1)" },
              "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={() => handleAskAi()} 
                  disabled={loading || !query.trim()}
                  sx={{ color: "#7C3AED" }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>
    </Paper>
  );
}
