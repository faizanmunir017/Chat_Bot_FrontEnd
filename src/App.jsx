import React, { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  // const botReplies = [
  //   "Hello! How can I help you?",
  //   "I'm here to assist you!",
  //   "Can you please elaborate?",
  //   "Interesting! Tell me more.",
  //   "That's great to hear!",
  //   "I'm just a bot, but I'm here for you!",
  // ];

  const handleSendMessage = async () => {
    if (userInput.trim() === "") return;
  
    const userMessage = { sender: "user", text: userInput };
    setMessages([...messages, userMessage]);
  
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
      const botMessage = { sender: "bot", text: data.response };
  
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const botMessage = { sender: "bot", text: "Something went wrong. Please try again." };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }
  
    setUserInput("");
  };
  

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.sender === "user" ? "user-message" : "bot-message"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
