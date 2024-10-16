import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const API_URL = 'https://api2.asfaltios.com';

const ChatContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const MessagesContainer = styled.div`
  height: 300px;
  overflow-y: scroll;
  border: 1px solid #ccc;
  padding: 10px;
`;

const InputContainer = styled.div`
  margin-top: 10px;
  display: flex;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 5px;
`;

const Button = styled.button`
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
`;

const Message = styled.p`
  margin: 5px 0;
`;

function Chat() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Try to retrieve chatId from localStorage
    const storedChatId = localStorage.getItem('chatId');
    if (storedChatId) {
      setChatId(storedChatId);
    } else {
      initChat();
    }
  }, []);

  useEffect(() => {
    if (chatId) {
      loadMessages();
      // Set up auto-fetching every 5 seconds
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initChat = async () => {
    try {
      const response = await fetch(`${API_URL}/api2/chats`, { method: 'POST' });
      const data = await response.json();
      setChatId(data.chatId);
      // Store chatId in localStorage
      localStorage.setItem('chatId', data.chatId);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api2/messages/${chatId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await fetch(`${API_URL}/api2/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, sender: 'User', content: inputMessage }),
      });

      setInputMessage('');
      loadMessages(); // Immediately load messages after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <Message key={index}><strong>{msg.sender}:</strong> {msg.content}</Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <Button onClick={sendMessage}>Send</Button>
      </InputContainer>
    </ChatContainer>
  );
}

export default Chat;