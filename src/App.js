import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Chatbot/Chatbot.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

// Export ChatbotWidget which is only the Home component
export function ChatbotWidget() {
  return <Home />;
}

export default App;
