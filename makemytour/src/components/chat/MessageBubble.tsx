import React from "react";
import { Message, SenderType } from "../../types/chat";

interface MessageBubbleProps {
  message: Message;
}

const senderStyles: Record<SenderType, string> = {
  user: "bg-blue-500 text-white self-end",
  bot: "bg-gray-300 text-gray-900 self-start",
  agent: "bg-green-500 text-white self-start",
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={"max-w-xs px-4 py-2 rounded-lg my-1 " + senderStyles[message.sender]}>
      <p className="whitespace-pre-wrap break-words">{message.content}</p>
      <span className="text-xs text-gray-600 block text-right mt-1">
        {new Date(message.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
};

export default MessageBubble;
