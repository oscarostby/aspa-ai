import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App, { ChatbotWidget } from './App'; // Import both the full app and the widget component
import reportWebVitals from './reportWebVitals';

// Render the full React app normally
const root = ReactDOM.createRoot(document.getElementById('bas-ai'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Expose a global function to render the chatbot widget in a specified container
window.MyReactApp = {
  renderWidget: function(container) {
    console.log('Rendering chatbot widget');  // Log when function is called
    const widgetRoot = ReactDOM.createRoot(container);
    widgetRoot.render(
      <React.StrictMode>
        <ChatbotWidget />
      </React.StrictMode>
    );
  }
};


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
