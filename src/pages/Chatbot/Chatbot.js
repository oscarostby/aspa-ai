import React, { useState, useEffect, useRef, useCallback } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import RobotIcon from "./images/ai2.png";
import MenuIcon from "./images/openmenu.png";
import CloseIcon from "./images/closeicon.png";
import plop2 from "./sounds/plop3.mp3";
import plop1 from "./sounds/plop4.mp3";
import StaffIcon from "./images/staff.png";
import axios from "axios";
import { sendMessage } from "./AI";



const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
  
  body {
    color: #E0E7FF;

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
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
`;

const ChatbotButton = styled.button`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(145deg, #6366F1, #4F46E5);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);

  animation: ${pulse} 2s infinite;

  &:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
  }

  img {
    width: 40px;
    height: 40px;
    transition: transform 0.3s ease;
  }

  ${(props) =>
    props.isOpen &&
    `
    img {
      transform: rotate(90deg);
    }
    background: linear-gradient(145deg, #4F46E5, #4338CA);
    animation: none;
  `}

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    position: absolute;
    bottom: 20px;
    right: 20px;
  }
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 90px;
  right: 0;
  width: 380px;
  height: 600px;
  background: linear-gradient(180deg, #1E1E3F 0%, #2D3748 100%);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform: ${(props) =>
    props.isOpen ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)"};
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  pointer-events: ${(props) => (props.isOpen ? "all" : "none")};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

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
  background: linear-gradient(90deg, #4338CA 0%, #6366F1 100%);
  color: #E0E7FF;
  padding: 20px 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  font-size: 18px;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;

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
  width: 48px;
  height: 48px;
  margin-right: 16px;

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
    width: 12px;
    height: 12px;
    background-color: ${(props) => (props.isOnline ? "#4ADE80" : "#F87171")};
    border-radius: 50%;
    border: 2px solid #E0E7FF;
  }
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
`;

const OnlineStatus = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #A5B4FC;
`;

const ChatMessages = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1A1A35 0%, #2D3748 100%);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #4F46E5;
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    padding-bottom: 80px;
  }
`;

const Message = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: ${(props) => (props.isUser ? "row-reverse" : "row")};
  align-items: flex-start;

  .avatar {
    background: linear-gradient(145deg, #6366F1, #4F46E5);
    padding: 3px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: ${(props) => (props.isUser ? "0 0 0 16px" : "0 16px 0 0")};
  }

  .content {
    background: ${(props) =>
      props.isUser
        ? "linear-gradient(145deg, #6366F1, #4F46E5)"
        : "linear-gradient(145deg, #3730A3, #312E81)"};
    padding: 14px 18px;
    border-radius: ${(props) =>
      props.isUser ? "20px 20px 0 20px" : "0 20px 20px 20px"};
    max-width: 70%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-size: 15px;
    line-height: 1.6;
    color: #E0E7FF;
  }
`;

const InputForm = styled.form`
  display: flex;
  padding: 20px 24px;
  background: linear-gradient(0deg, #1E1E3F 0%, #2D3748 100%);
  border-top: 1px solid #4F46E5;

  @media (max-width: 768px) {
    position: relative;
    padding: 16px;
  }
`;

const Input = styled.textarea`
  flex-grow: 1;
  border: none;
  padding: 14px 18px;
  border-radius: 20px;
  margin-right: 16px;
  font-size: 15px;
  background: rgba(79, 70, 229, 0.1);
  color: #E0E7FF;
  transition: all 0.3s ease;
  resize: none;
  height: 24px;
  overflow-y: auto;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
    background: rgba(79, 70, 229, 0.2);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(145deg, #6366F1, #4F46E5);
  color: #E0E7FF;
  border: none;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  font-size: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background: linear-gradient(145deg, #4A5568, #2D3748);
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
  margin: 20px 0;

  span {
    width: 10px;
    height: 10px;
    margin: 0 5px;
    background-color: #6366F1;
    border-radius: 50%;
    display: inline-block;
    animation: ${loadingAnimation} 1.4s infinite ease-in-out both;
  }

  span:nth-child(1) {
    animation-delay: -0.32s;
  }

  span:nth-child(2) {
    animation-delay: -0.16s;
  }
`;

const TalkToHumanButton = styled.button`
  background: linear-gradient(145deg, #6366F1, #4F46E5);
  color: #E0E7FF;
  border: none;
  border-radius: 20px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  margin-top: 20px;
  align-self: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
`;

const BoldText = styled.span`
  font-weight: bold;
  color: #A5B4FC;
`;

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAIOnline, setIsAIOnline] = useState(true);
  const [isBotUnsure, setIsBotUnsure] = useState(false);
  const [isHumanChat, setIsHumanChat] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const plop1SoundRef = useRef(new Audio(plop1));
  const plop2SoundRef = useRef(new Audio(plop2));

  const staffNames = [
    "Martin S"
  ];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const standardMessage = {
        role: "bot",
        content: "Hei! 👋 Hva kan jeg hjelpe deg med i dag? 😊",
      };
      setMessages([standardMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'toggleChat') {
        toggleChat();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const updateParentHeight = () => {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type:'resize', height }, '*');
    };
    updateParentHeight();
    window.addEventListener('resize', updateParentHeight);
    return () => window.removeEventListener('resize', updateParentHeight);
  }, [isOpen]);

  useEffect(() => {
    if (isHumanChat && !chatId) {
      initChat();
    }
  }, [isHumanChat]);

  useEffect(() => {
    if (chatId && isHumanChat) {
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatId, isHumanChat]);

  const updateParentSize = (isOpen) => {
    const height = isOpen ? '600' : '64';
    window.parent.postMessage({ type:'resize', height }, '*');
  };
  
  const toggleChat = () => {
    setIsOpen(prev => {
      updateParentSize(!prev);
      return !prev;
    });
  };

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    plop1SoundRef.current.play();
    const userMessage = input;
    setInput("");
  
    if (isHumanChat) {
      if (!chatId) {
        console.error('Chat not initialized');
        return;
      }
      try {
        await axios.post('https://api2.asfaltios.com/api2/messages', {
          chatId,
          sender: 'User',
          content: userMessage
        });
        loadMessages();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      await sendMessage(
        userMessage,
        messages,
        setMessages,
        setIsLoading,
        setIsAIOnline,
        setIsBotUnsure
      );
    }
  };

  const handleTalkToHuman = () => {
    const randomStaff = staffNames[Math.floor(Math.random() * staffNames.length)];
    setCurrentStaff(randomStaff);
    setIsHumanChat(true);
    setIsBotUnsure(false);
    initChat();
  };

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "bot") {
      plop2SoundRef.current.play();
    }
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) return;
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const processMessageContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|•.*?(?=\n|$))/g);
    
    return parts.map((part, index) => {
      const linkParts = part.split(urlRegex);
      
      return linkParts.map((linkPart, linkIndex) => {
        if (linkPart.match(urlRegex)) {
          return (
            <a href={linkPart} key={`${index}-${linkIndex}`} style={{ color: 'blue', textDecoration: 'underline' }}>
              {linkPart}
            </a>
          );
        } else if (linkPart.startsWith("**") && linkPart.endsWith("**")) {
          return <BoldText key={`${index}-${linkIndex}`}>{linkPart.slice(2, -2)}</BoldText>;
        } else if (linkPart.startsWith("*") && linkPart.endsWith("*")) {
          return <em key={`${index}-${linkIndex}`}>{linkPart.slice(1, -1)}</em>;
        } else if (linkPart.startsWith("•")) {
          return <li key={`${index}-${linkIndex}`}>{linkPart.slice(1).trim()}</li>;
        } else {
          return linkPart; 
        }
      });
    });
  };

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
              <HeaderImage isOnline={isAIOnline}>
                <img src={isHumanChat ? StaffIcon : RobotIcon} alt={isHumanChat ? "Staff" : "ASFALTIOS AI"} />
              </HeaderImage>
              <HeaderText>
                <span>{isHumanChat ? currentStaff : "ASFALTIOS AI"}</span>
                <OnlineStatus>{isAIOnline ? "Online" : "Offline"}</OnlineStatus>
              </HeaderText>
            </HeaderContent>
          </ChatHeader>
          <ChatMessages>
            {messages.map((message, index) => (
              <Message key={index} isUser={message.sender === "User" || message.role === "user"}>
                <div className="content">{processMessageContent(message.content)}</div>
              </Message>
            ))}
            {isLoading && (
              <LoadingSpinner>
                <span></span>
                <span></span>
                <span></span>
              </LoadingSpinner>
            )}
            {isBotUnsure && !isHumanChat && (
              <TalkToHumanButton onClick={handleTalkToHuman}>
                Talk to a Human
              </TalkToHumanButton>
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>
          <InputForm onSubmit={handleSendMessage}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
            />
            <SendButton type="submit" disabled={isLoading}>
              ➤
            </SendButton>
          </InputForm>
        </ChatWindow>
      </ChatbotContainer>
    </>
  );
};

export default App;
