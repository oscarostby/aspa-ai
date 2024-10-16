import React, { useState, useEffect, useRef, useCallback } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import RobotIcon from "./images/staff.png";
import MenuIcon from "./images/openmenu.png";
import CloseIcon from "./images/closeicon.png";
import axios from "axios";


const GlobalStyle = createGlobalStyle`
  @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap');
  
  body {
    font-family: 'Satoshi', sans-serif;
    color: #E0E7FF; // Light text color for contrast
  }
`;

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;

  @media (max-width: 768px) {
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    top: 0;
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(64, 196, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(64, 196, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 196, 255, 0);
  }
`;

const ChatbotButton = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #64C4FF; // Deep space blue
  border: 2px solid #64C4FF; // Cosmic blue border
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(64, 196, 255, 0.3);

  animation: ${pulse} 1.5s ease-in-out 0s infinite;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(64, 196, 255, 0.4);
  }

  img {
    width: 52px;
    height: 52px;
    transition: transform 0.3s ease;
  }

  ${(props) =>
    props.isOpen &&
    `
    img {
      transform: rotate(90deg);
      width: 32px;
      height: 32px;
    }
    animation: none;
    background-color: #2C5282; // Darker blue when open
  `}

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    position: absolute;
    bottom: 20px;
    right: 20px;
  }
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 400px;
  height: 600px;
  background-color: #1A2233; // Dark space background
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  transform: ${(props) =>
    props.isOpen ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)"};
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  pointer-events: ${(props) => (props.isOpen ? "all" : "none")};

  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    bottom: 0;
    right: 0;
    left: 0;
    border-radius: 0;
    top: auto;
    transform: ${(props) =>
      props.isOpen ? "translateY(0)" : "translateY(100%)"};
  }
`;

const ChatHeader = styled.div`
  background-color: #2C5282; // Deep space blue
  color: #E0E7FF;
  padding: 16px 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  font-size: 18px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;

  @media (max-width: 768px) {
    border-radius: 0;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`;

const HeaderImage = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  margin-right: 12px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 10px;
    height: 10px;
    background-color: ${(props) => (props.isOnline ? "#4ADE80" : "#4ADE80")};
    border-radius: 50%;
  }
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
`;

const OnlineStatus = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: #A5B4FC;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #E0E7FF;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const ChatMessages = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  background-color: #0F172A; // Dark space background

  @media (max-width: 768px) {
    padding-bottom: 80px;
  }
`;

const Message = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: ${(props) => (props.isUser ? "row-reverse" : "row")};
  align-items: flex-start;

  .avatar {
    background: #2C5282;
    padding: 3px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin: ${(props) => (props.isUser ? "0 0 0 12px" : "0 12px 0 0")};
  }

  .content {
    background-color: ${(props) => (props.isUser ? "#4C51BF" : "#1E3A8A")};
    padding: 12px 16px;
    border-radius: ${(props) =>
      props.isUser ? "18px 18px 0 18px" : "0 18px 18px 18px"};
    max-width: 70%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-shadow: 0 1px 2px rgba(64, 196, 255, 0.1);
    font-size: 14px;
    line-height: 1.5;
    color: #E0E7FF;
  }
`;

const InputForm = styled.form`
  display: flex;
  padding: 20px 24px;
  background-color: #1A2233; // Dark space background
  border-top: 1px solid #2C5282;

  @media (max-width: 768px) {
    position: relative;
    padding: 12px;
  }
`;

const Input = styled.textarea`
  flex-grow: 1;
  border: none;
  padding: 12px 16px;
  border-radius: 9999px;
  margin-right: 12px;
  font-size: 14px;
  background-color: #2C5282;
  color: #E0E7FF;
  transition: all 0.2s ease;
  resize: none;
  height: 20px;
  overflow-y: auto;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #64C4FF;
    background-color: #1E3A8A;
  }
`;

const SendButton = styled.button`
  background-color: #4C51BF;
  color: #E0E7FF;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;

  &:hover {
    transform: scale(1.05);
    background-color: #5A67D8;
  }

  &:disabled {
    background-color: #4A5568;
    cursor: not-allowed;
  }
`;

const loadingAnimation = keyframes`
  0%, 100% { transform: scale(0); }
  50% { transform: scale(1); }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px 0;

  span {
    width: 8px;
    height: 8px;
    margin: 0 4px;
    background-color: #64C4FF;
    border-radius: 50%;
    display: inline-block;
    animation: ${loadingAnimation} 1s infinite ease-in-out both;
  }

  span:nth-child(1) {
    animation-delay: -0.32s;
  }

  span:nth-child(2) {
    animation-delay: -0.16s;
  }
`;


const TalkToHumanButton = styled.button`
  background-color: #4C51BF;
  color: #E0E7FF;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  align-self: center;

  &:hover {
    background-color: #5A67D8;
    transform: translateY(-2px);
  }
`;


const BoldText = styled.span`
  font-weight: bold;
  color: #64C4FF;
`;

const App = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [chatId, setChatId] = useState(null);
    const chatWindowRef = useRef(null);

  
    useEffect(() => {
      if (isOpen && !chatId) {
        initChat();
      }
    }, [isOpen]);
  
    useEffect(() => {
      if (chatId) {
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
      }
    }, [chatId]);
  
    useEffect(() => {
      scrollToBottom();
    }, [messages]);
  
    const initChat = async () => {
      try {
        const response = await axios.post('https://api2.asfaltios.com/api2/chats');
        setChatId(response.data.chatId);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };
  
    const loadMessages = async () => {
      if (!chatId) return;
      try {
        const response = await axios.get(`https://api2.asfaltios.com/api2/messages/${chatId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
  
    const toggleChat = () => {
      setIsOpen((prev) => !prev);
    };
  
    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!input.trim() || !chatId) return;
  
      try {
        await axios.post('https://api2.asfaltios.com/api2/messages', {
          chatId,
          sender: 'User',
          content: input
        });
        setInput("");
        loadMessages();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };
  
    const scrollToBottom = useCallback(() => {
      chatWindowRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);
  
    return (
      <>
        <GlobalStyle />
        <ChatbotContainer>
          <ChatbotButton onClick={toggleChat} isOpen={isOpen}>
            <img src={isOpen ? CloseIcon : MenuIcon} alt={isOpen ? "Close" : "Chat"} />
          </ChatbotButton>
          <ChatWindow isOpen={isOpen}>
            <ChatHeader>
              <HeaderContent>
                <HeaderImage>
                  <img src={RobotIcon} alt="Chat" />
                </HeaderImage>
                <HeaderText>Staff - support</HeaderText>
                
              </HeaderContent>
            </ChatHeader>
            <ChatMessages>
              {messages.map((message, index) => (
                <Message key={index} isUser={message.sender === "User"}>
                  <div className="content">{message.content}</div>
                </Message>
              ))}
              <div ref={chatWindowRef} />
            </ChatMessages>
            <InputForm onSubmit={handleSendMessage}>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <SendButton type="submit">➤</SendButton>
            </InputForm>
          </ChatWindow>
        </ChatbotContainer>
      </>
    );
  };
  
  export default App;