import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Chatbot/Chatbot.js';
import Staff from './pages/Chatbot/Staffchat.js';
import Test from './pages/Chatbot/testpanel.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

// Export ChatbotWidget which is only the Home component
export function ChatbotWidget() {
  return <Home />;
}

export default App;
