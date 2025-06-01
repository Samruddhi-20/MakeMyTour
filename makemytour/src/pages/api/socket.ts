
import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatSession, LanguageType } from "../../types/chat";
import { getBotReply } from "../../lib/chat/chatbotLogic";
import { detectFrustration } from "../../lib/chat/sentiment";
import { translateMessage } from "../../lib/chat/translation";

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: {
    server: HTTPServer & {
      io?: Server;
    };
    _httpMessage: any;
  };
}

const chatSessions: Map<string, ChatSession> = new Map();

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO server...");
    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });

    io.on("connection", (socket: any) => {
      console.log("Client connected:", socket.id);

      const sessionId = uuidv4();
      const chatSession: ChatSession = {
        sessionId,
        messages: [],
        language: "en",
        escalated: false,
      };
      chatSessions.set(sessionId, chatSession);

      socket.emit("session", { sessionId });

      socket.on("setLanguage", (language: LanguageType) => {
        chatSession.language = language;
      });

      socket.on("message", async (msg: { content: string; language?: LanguageType }) => {
        const userMessage: Message = {
          id: uuidv4(),
          sender: "user",
          content: msg.content.trim(),
          timestamp: Date.now(),
          language: chatSession.language,
        };

        if (!userMessage.content) {
          socket.emit("error", { message: "Empty message not allowed." });
          return;
        }

        chatSession.messages.push(userMessage);

        let processedContent = userMessage.content;
        if (userMessage.language !== "en") {
          processedContent = await translateMessage(userMessage.content, userMessage.language, "en");
        }

        const frustrated = detectFrustration(processedContent);

        let botReplyContent = getBotReply(processedContent);

        if (frustrated || chatSession.escalated) {
          chatSession.escalated = true;
          botReplyContent = "You are being connected to a live agent. Please wait...";
          setTimeout(() => {
            const agentMessage: Message = {
              id: uuidv4(),
              sender: "agent",
              content: "Hello! How can I assist you further?",
              timestamp: Date.now(),
              language: chatSession.language,
            };
            chatSession.messages.push(agentMessage);
            translateMessage(agentMessage.content, "en", chatSession.language).then((translated: string) => {
              io.to(socket.id).emit("message", { ...agentMessage, content: translated });
            });
          }, 3000);
        }

        const translatedBotReply = await translateMessage(botReplyContent, "en", chatSession.language);

        const botMessage: Message = {
          id: uuidv4(),
          sender: chatSession.escalated ? "agent" : "bot",
          content: translatedBotReply,
          timestamp: Date.now(),
          language: chatSession.language,
        };

        chatSession.messages.push(botMessage);

        io.to(socket.id).emit("message", userMessage);
        io.to(socket.id).emit("message", botMessage);

        if (chatSession.escalated) {
          console.log(`Mock email sent to user with chat transcript for session ${sessionId}`);
        }
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        chatSessions.delete(sessionId);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("Socket.IO server already running.");
  }
  res.end();
}
