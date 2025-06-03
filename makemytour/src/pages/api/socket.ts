import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatSession, LanguageType } from "../../types/chat";
import { getBotReply } from "../../lib/chat/chatbotLogic";
import { detectFrustration } from "../../lib/chat/sentiment";
import { translateMessage } from "../../lib/chat/translation";

// Type override to inject io into HTTP server
type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

// In-memory session storage
const chatSessions: Map<string, ChatSession> = new Map();

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log("Initializing new Socket.IO server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
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

            translateMessage(agentMessage.content, "en", chatSession.language).then((translated) => {
              socket.emit("message", { ...agentMessage, content: translated });
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

        socket.emit("message", userMessage);
        socket.emit("message", botMessage);

        if (chatSession.escalated) {
          console.log(`Mock email sent to user with chat transcript for session ${sessionId}`);
        }
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        chatSessions.delete(sessionId);
      });
    });
  } else {
    console.log("Socket.IO server already running.");
  }

  res.end();
}
