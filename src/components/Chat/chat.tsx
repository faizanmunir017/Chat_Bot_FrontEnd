import { useState, useEffect } from "react";
import BotMessageIcon from "assets/botMessageIcon";
import { motion } from "framer-motion"; // Correct import for motion

import "./chat.css";

interface Message {
  sender: "user" | "bot";
  text: string;
  isTyping?: boolean; // Optional property for typing indication
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");

  useEffect(() => {
    const initialBotMessage: Message = {
      sender: "bot",
      text: "Hello! How may I help you?",
    };
    setMessages([initialBotMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (userInput.trim() === "") return;

    const userMessage: Message = { sender: "user", text: userInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput("");

    const typingMessage: Message = { sender: "bot", text: "", isTyping: true };
    setMessages((prevMessages) => [...prevMessages, typingMessage]);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from backend");
      }

      const data = await response.json();
      const botMessage: Message = { sender: "bot", text: data.response };

      setMessages((prevMessages) =>
        prevMessages.map((msg, index) =>
          index === prevMessages.length - 1 && msg.isTyping ? botMessage : msg
        )
      );
    } catch (error) {
      console.error("Error:", error);

      const botMessage: Message = {
        sender: "bot",
        text: "Something went wrong. Please try again.",
      };

      setMessages((prevMessages) =>
        prevMessages.map((msg, index) =>
          index === prevMessages.length - 1 && msg.isTyping ? botMessage : msg
        )
      );
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((message, index) => (
          <div key={index} className="chat-message-container">
            {message.sender === "bot" && (
              <div className="bot-icon">
                <BotMessageIcon />
              </div>
            )}

            {message.isTyping ? (
              <motion.div
                className="typing-indicator"
                animate={{
                  opacity: [0, 1, 0],
                  x: [0, 10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  repeatType: "loop",
                }}
              >
                ...
              </motion.div>
            ) : (
              message.sender === "bot" && (
                <div className="chat-message bot-message">{message.text}</div>
              )
            )}

            {message.sender === "user" && (
              <div className="chat-message user-message">{message.text}</div>
            )}
          </div>
        ))}
      </div>
      <div className="input-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
