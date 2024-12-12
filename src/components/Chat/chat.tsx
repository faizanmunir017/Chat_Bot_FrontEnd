import { useState, useEffect } from "react";
import BotMessageIcon from "assets/botMessageIcon";
import { motion } from "framer-motion";
import "./chat.css";

const BaseUrl: string = import.meta.env.VITE_API_BASE_URL;

interface Message {
  sender: "user" | "bot";
  text: string;
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  useEffect(() => {
    const load_messages = async () => {
      try {
        const response = await fetch(`${BaseUrl}/chat`, {
          method: "GET",
        });

        if (!response.ok) {
          console.log("Error in fetching messages");
        }

        const data = await response.json();

        if (data.messages) {
          setMessages((prevMessages) => [...data.messages, ...prevMessages]);
        }
      } catch (error) {
        console.log("Error in loading messages");
      }
    };

    load_messages();
  }, []);

  const handleSendMessage = async () => {
    if (userInput.trim() === "") return;

    const userMessage: Message = { sender: "user", text: userInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput("");

    setIsTyping(true);
    try {
      const response = await fetch(`${BaseUrl}/chat`, {
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
      console.log("data is ", data);

      const botMessage: Message = { sender: "bot", text: data.response };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error:", error);

      const botMessage: Message = {
        sender: "bot",
        text: "Something went wrong. Please try again.",
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setIsTyping(false);
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

            {message.sender === "bot" && (
              <div className="chat-message bot-message">{message.text}</div>
            )}

            {message.sender === "user" && (
              <div className="chat-message user-message">{message.text}</div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="typing-container">
            <div className="bot-icon">
              <BotMessageIcon />
            </div>
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
          </div>
        )}
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
