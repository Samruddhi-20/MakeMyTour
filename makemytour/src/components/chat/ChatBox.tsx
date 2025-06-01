import React, { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { Message, LanguageType } from "../../types/chat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import LanguageSwitcher from "./LanguageSwitcher";

let socket: Socket;

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageType>("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) {
      socket = io("/api/socket");
      socket.on("connect", () => {
        console.log("Connected to chat server");
      });

      socket.on("session", (data: { sessionId: string }) => {
        setSessionId(data.sessionId);
      });

      socket.on("message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.on("error", (error: { message: string }) => {
        console.error("Chat error:", error.message);
      });
    }

    return () => {
      socket.disconnect();
      socket = null as any;
    };
  }, []);

  useEffect(() => {
    if (sessionId) {
      socket.emit("setLanguage", language);
    }
  }, [language, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (content: string) => {
    if (socket && content.trim()) {
      socket.emit("message", { content, language });
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md border rounded shadow-lg">
      <LanguageSwitcher currentLanguage={language} onChange={setLanguage} />
      <div className="flex-grow overflow-y-auto p-4 flex flex-col">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatBox;
