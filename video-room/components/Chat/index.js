import React, { useState, useEffect, useRef } from "react";
import firebase from "@/utils/firebaseConfig"

const Chat = ({ roomId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Subscribe to the chat messages for the specific room
    const messagesRef = firebase.database().ref(`rooms/${roomId}/messages`);
    messagesRef.on('value', (snapshot) => {
      const messageData = snapshot.val();
      if (messageData) {
        const messageList = Object.keys(messageData).map((key) => ({
          ...messageData[key],
          id: key,
        }));
        setMessages(messageList);
      }
    });

    // Unsubscribe from the chat messages when the component is unmounted
    return () => {
      messagesRef.off();
    };
  }, [roomId]);

  // Send a chat message for the specific room
  const sendMessage = () => {
    if (message.trim() !== '') {
      const messagesRef = firebase.database().ref(`rooms/${roomId}/messages`);
      messagesRef.push({
        message,
        timestamp: Date.now(),
      });
      setMessage('');
    }
  };

  return (
    <div>
      <h3>Chat</h3>
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.username}: </strong>
            <span>{message.message}</span>
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          placeholder="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;